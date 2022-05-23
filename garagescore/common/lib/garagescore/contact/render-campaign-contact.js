const { promisify } = require('util');
const crypto = require('crypto');
const path = require('path');
const nunjucks = require('nunjucks');
const { htmlToText } = require('../../util/html-to-text.js');
const app = require('../../../../server/server');
const s = require('underscore.string');
const contactsConfigs = require('../data-campaign/contacts-config');
const encrypt = require('../../util/public-link-encrypted-id').encrypt;
const config = require('config');
const stringUtil = require('../../string/util');
const gsClient = require('../client');
const render = require('./render');
const SurveyTypes = require('../../../../common/models/data/type/survey-types.js');
const CampaignTrackingTokens = require('../../../models/data/type/campaign-tracking-tokens');
const SourceTypes = require('../../../../common/models/data/type/source-types.js');
const { GarageTypes, DataTypes } = require('../../../../frontend/utils/enumV2');

// will remove equivalent language duplication to only have fr,
const generateUniqueLocales = (garageLocale = 'fr_FR', additionalLocales = []) => {
  const onlyMainLocales = additionalLocales.map((locale = 'fr_FR') => {
    const languages = {
      fr: 'fr_FR',
      en: 'en_US',
      ca: 'ca_ES',
      es: 'es_ES',
      nl: 'nl_BE',
    };

    return languages[locale.slice(0, 2)] || 'fr_FR';
  });

  return Array.from(new Set([garageLocale, ...onlyMainLocales]));
};

const nunjucksTemplatesDirectory = path.resolve(path.join(__dirname, '../../..'));
// configure nunjucks first for the html
const nunjucksEnvHtml = nunjucks.configure(nunjucksTemplatesDirectory, {
  autoescape: true,
  watch: false, // If not set in Nunjucks 1.2, prevents the process from exiting :( https://github.com/mozilla/nunjucks/issues/369
});
nunjucksEnvHtml.addFilter('removeDiacritics', stringUtil.removeDiacritics);
nunjucksEnvHtml.addGlobal('lib', { client: gsClient });

// configure nunjucks for the txt
const nunjucksEnvTxt = nunjucks.configure(nunjucksTemplatesDirectory, {
  autoescape: false,
  watch: false, // If not set in Nunjucks 1.2, prevents the process from exiting :( https://github.com/mozilla/nunjucks/issues/369
});
nunjucksEnvTxt.addFilter('removeDiacritics', stringUtil.removeDiacritics);
nunjucksEnvTxt.addGlobal('lib', { client: gsClient });

// render sms
async function _renderSmsBody(contact, templates, templateParameters) {
  try {
    if (!templates.smsText) {
      return null;
    }
    if (templates.type === 'nuxtTemplate') {
      templateParameters.locale = templateParameters.garage.locale;
      templateParameters.timezone = templateParameters.garage.timezone;
      templateParameters.contact = contact;
      return await render.txt(templates.smsText, templateParameters);
    }
    const nunj = nunjucksEnvTxt;
    let renderedContent = nunj.render(templates.smsText, templateParameters);
    // use a shorter version if needed
    if (renderedContent.length > 140) {
      for (let i = 3; renderedContent.length > 140 && i >= 0; i--) {
        try {
          renderedContent = nunj.render(templates.smsText.replace('.nunjucks', `-${i}.nunjucks`), templateParameters);
        } catch (e) {
          console.error(e.message);
        }
      }
    }
    return renderedContent;
  } catch (e) {
    console.error('IN _renderSmsBody', e);
    return null;
  }
}

// render email body
async function _renderEmailBody(contact, templates, templateParameters = {}) {
  try {
    if (!templates.emailBody) {
      return null;
    }

    const locales = generateUniqueLocales(
      templateParameters.garage.locale,
      templateParameters.garage.additionalLocales
    );
    templateParameters.timezone = templateParameters.garage.timezone;
    templateParameters.contact = contact;

    const emailLocalizedBody = await generateLocalizedBodyPart(locales, templates.emailBody, templateParameters);
    if (templates.emailFooter) {
      const emailFooter = await generateLocalizedBodyPart(locales, templates.emailFooter, templateParameters);
      return [emailLocalizedBody, emailFooter].join('\n');
    }

    return emailLocalizedBody;
  } catch (e) {
    console.error('IN _renderEmailBody', e);
    return null;
  }
}

async function generateLocalizedBodyPart(locales, templatePath, templateParameters) {
  const emailLocalizedBodies = [];
  for await (let [localeIndex, locale] of locales.entries()) {
    const localeTemplateParameters = {
      ...templateParameters,
      locale,
      localeIndex,
      totalLocales: locales.length,
    };
    emailLocalizedBodies.push(await render.html(templatePath, localeTemplateParameters));
  }
  return emailLocalizedBodies.join('\n');
}

// render email subject
async function _renderEmailSubject(contact, templates, templateParameters = {}) {
  try {
    if (!templates.emailSubject) {
      return null;
    }
    if (templates.type === 'nuxtTemplate') {
      templateParameters.locale = templateParameters.garage.locale;
      templateParameters.timezone = templateParameters.garage.timezone;
      templateParameters.contact = contact;
      return await render.txt(templates.emailSubject, templateParameters);
    }
    const nunj = nunjucksEnvHtml;
    let renderedContent = null;
    /** Some Subjects don't need templating files, so we just render the string instead */
    if (templates.emailSubject.indexOf('.nunjucks') === -1)
      renderedContent = nunj.renderString(templates.emailSubject, templateParameters);
    else renderedContent = nunj.render(templates.emailSubject, templateParameters);
    return renderedContent;
  } catch (e) {
    console.error('IN _renderEmailSubject', e);
    return null;
  }
}

const renderContentParts = async (contact, templates, params) => {
  const content = {};
  try {
    content.body = await _renderSmsBody(contact, templates, params);
    content.subject = await _renderEmailSubject(contact, templates, params);
    content.htmlBody = await _renderEmailBody(contact, templates, params);
    content.textBody = content.htmlBody && htmlToText(content.htmlBody);
  } catch (e) {
    console.error(e);
  }
  return content;
};

function renderContactForData(data, garage, contactKey, contactTo, callback) {
  const contactConfig = contactsConfigs[contactKey];
  if (!contactConfig) {
    callback(new Error(`contactKey : ${contactKey} is not in the contactsConfigs list.`));
    return;
  }
  try {
    let surveyUrls = {
      base: '/',
      unsatisfiedLanding: '/m/',
      baseShort: '[survey_url]',
      recommendYes: '/',
      recommendNo: '/',
      followupNonApplicable: '/',
    };
    // check surveys
    if (data.type) {
      const field = contactConfig.followupType || SurveyTypes.SURVEY;
      if (!field || !data.get(field)) {
        console.error(`${contactConfig.name} No ${field} found for dataId ${data.getId()} type=${data.type}`);
        // maybe the email has already been send and we are in DataRecordFollowUp instead of DataRecord
      } else {
        surveyUrls = JSON.parse(JSON.stringify(data.get(`${field}.urls`)));
        if (surveyUrls.base) {
          surveyUrls.score = [
            /** Generic scores */
            ...[...Array(7).keys()].map((i) => `${surveyUrls.unsatisfiedLanding}?score=${i}`), // From 0 to 6 => unsatisfied landing
            ...[...Array(4).keys()].map((i) => `${surveyUrls.base}?score=${i + 7}`), // From 7 to 10 => actual survey
          ];
        }
      }
    }
    // check manager
    let manager = {};
    if (garage.surveySignature && garage.surveySignature.defaultSignature) {
      manager = garage.surveySignature.defaultSignature;
      if (!('name' in manager)) {
        manager = null;
      } else {
        if (!('firstName' in manager)) manager.firstName = '';
        if (!('phone' in manager)) manager.phone = null;
      }
    } else {
      console.error('Render email/sms - No manager found');
      manager = null;
    }
    // check addressee
    const addressee = {
      abbreviatedTitle: data.customer_getAbbreviatedTitle(),
      title: data.get('customer.title.value'),
      fullName: data.get('customer.fullName'),
      lastName: data.get('customer.lastName'),
      gender: data.get('customer.gender'),
    };
    // check dataRecord
    const completedAt = data.get('service.providedAt') || new Date();

    // time to render
    // we split the display name with ()
    const publicDisplayName = garage.publicDisplayName;
    const splits = publicDisplayName.replace(')', '').split('(');
    const garageNamePart1 = s.trim(splits[0]);
    const garageNamePart2 = splits.length > 1 ? splits[1] : null;

    // days since the dataRecord finished
    const fromXDaysAgo = Math.round((new Date() - completedAt) / (1000 * 60 * 60 * 24));
    const templateParameters = {
      addressee,
      garage,
      garageNamePart1,
      garageNamePart2,
      garageURL: app.models.Garage.directoryURL(
        garage,
        { source: 'email-remerciement-apv', medium: 'email' },
        contactConfig.isThank
      ),
      // ps: we only have a link in the 'thank you' emails
      dataType: data.type,
      isVehicleSale: data.type === DataTypes.VEHICLE_SALE,
      isMotorbikeDealership: data.garageType === GarageTypes.MOTORBIKE_DEALERSHIP,
      sourceTypeCategory: SourceTypes.getCategory(data.get('source.type')),
      adTitle: data.get('leadTicket.brandModel'), // The ad title is in the brandModel most of the time for now.
      adUrl: data.get('leadTicket.adUrl'),
      reply: data.get('review.reply.text'),
      saleType: data.get('leadTicket.saleType'),
      comment: data.get('review.comment.text'),
      reviewRating: data.get('review.rating.value'),
      isGoogleRecontact: /google/.test(contactKey),
      redirectUrl: `${config.get('publicUrl').app_url}/public/writereview/google/${data.getId()}/${
        garage.googlePlaceId
      }`,
      online: !!(data.get('review.comment.status') === 'Approved'),
      surveyUrls,
      fullyear: new Date().getFullYear(),
      fromXDaysAgo,
      completedAt,
      customerTitle: data.get('customer.title.value') === 'F' ? 'F' : 'M',
    };

    if (garage.campaignTrackingUrl && data.get('type') && contactTo) {
      const dataType = data.get('type');
      const emailMd5 = crypto.createHash('md5').update(contactTo.toLowerCase()).digest('hex');

      templateParameters.campaignTrackingUrl = garage.campaignTrackingUrl
        .replace(new RegExp(CampaignTrackingTokens.DATA_TYPE, 'g'), dataType)
        .replace(new RegExp(CampaignTrackingTokens.RECIPIENT_EMAIL_MD5, 'g'), emailMd5)
        .replace(new RegExp(CampaignTrackingTokens.UTM_SOURCE, 'g'), contactKey);
    }

    const comment = data.get('review.comment.text');
    if (garage.shareReviews === true && comment) {
      const encryptedId = encrypt(data.id);
      templateParameters.shareReviewsUrl = `${
        config.get('publicUrl').app_url
      }/public/share-on-yellow-pages/${encryptedId}`;
      templateParameters.shareReviews = true;
    } else {
      templateParameters.shareReviews = false;
    }

    // display the correct make with multimake garages
    const dataMake = data.get('vehicle.make');
    if (dataMake && garage.brandNames && garage.brandNames.indexOf(dataMake) > -1) {
      templateParameters.vehicleMake = dataMake;
    }
    // start rendering
    renderContentParts(contactConfig, contactConfig.templates, templateParameters).then((content) => {
      callback(null, content);
    });
  } catch (e) {
    callback(e);
  }
}

async function renderContactPayload(contact) {
  const data = await app.models.Data.findById(contact.payload.dataId);
  const garage = await app.models.Garage.findById(data.garageId);
  return promisify(renderContactForData)(data, garage, contact.payload.key, contact.to);
}

module.exports = {
  renderContactPayload,
  renderContactForData,
  renderEmailSubjectForUnitTest: _renderEmailSubject,
};
