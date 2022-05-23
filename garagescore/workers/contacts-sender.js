/* Queue contacts to be sent and allo to start a worker to consume the queue */
const { printFormattedHeapSizeLimit } = require('../common/lib/garagescore/v8/heap-size-info');

printFormattedHeapSizeLimit();

if (require.main === module) {
  process.env.DISABLE_WEBHOOK = true;
}
const { log, JS } = require('../common/lib/util/log');
const app = require('../server/server');
const { ObjectId } = require('mongodb');
const { promisify } = require('util');
const lruCache = require('lru-cache');

const Scheduler = require('../common/lib/garagescore/scheduler/scheduler.js');

const { ContactTypes, AutomationCampaignsEventsType, JobTypes } = require('../frontend/utils/enumV2.js');
const AutomationCampaignChannelTypes = require('../common/models/automation-campaign-channel.type.js');
const ContactStatus = require('../common/models/contact.status');
const EmailContact = require('../common/lib/garagescore/contact/email');
const SmsContact = require('../common/lib/garagescore/contact/sms');
const { getAllExampleGarageIds } = require('../common/lib/util/app-config');

const localesCache = lruCache(50);

async function createAddLog(payload, contactType, eventType) {
  await app.models.AutomationCampaignsEvents.addLog(
    {
      garageId: payload.garageId,
      campaignId: payload.campaignId,
      customerId: payload.customerId,
      eventType: eventType,
      contactType: contactType,
      target: payload.target,
      campaignType: payload.campaignType,
      campaignRunDay: payload.campaignRunDay,
    },
    {
      customContentId: payload.customContent && payload.customContent._id,
    }
  );
}

const _getGarageLocale = async (garageId) => {
  let locale = localesCache.get(garageId);
  if (!locale) {
    ({ locale } = await app.models.Garage.getMongoConnector().findOne(
      { _id: ObjectId(garageId) },
      { projection: { locale: true } }
    ));
    localesCache.set(garageId, locale);
  }

  return locale || 'fr_FR';
};

const getContactTypeConstraints = async (contactType, garageId) => {
  switch (contactType) {
    case ContactTypes.MONTHLY_SUMMARY_SMS:
    case ContactTypes.AUTOMATION_CAMPAIGN_SMS:
    case ContactTypes.AUTOMATION_GDPR_SMS:
    case ContactTypes.CAMPAIGN_SMS:
      let garageLocale = 'fr_FR';
      if (garageId) {
        garageLocale = await _getGarageLocale(garageId);
      }
      return {
        noPublicHolyday: true,
        noSunday: true,
        smsHours: true,
        locale: garageLocale,
      };
    case ContactTypes.AUTOMATION_GDPR_EMAIL:
    case ContactTypes.AUTOMATION_GDPR_SMS:
      return {};
    case ContactTypes.COCKPIT_EXPORT_EMAIL:
      return { immediate: true };
    default:
      return {};
  }
};

/* push a contact to a message queue to be processed */
async function queueContact(contactId, type, sendAt, garageId = null) {
  let jobType = ContactTypes.getProperty(type, 'jobType');
  // Set high priority if test garage
  if (garageId !== null && getAllExampleGarageIds().includes(garageId)) {
    jobType = JobTypes.SEND_CONTACT_HIGH_PRIORITY;
  }
  const constraints = await getContactTypeConstraints(type, garageId);
  await Scheduler.upsertJob(jobType, { contactId }, sendAt, constraints);
}
/** Create a sent event if its an automation campaign */
async function _createAutomationSendEvent(contact) {
  const { type, payload = {} } = contact;
  const isGDPR = type === ContactTypes.AUTOMATION_GDPR_EMAIL || type === ContactTypes.AUTOMATION_GDPR_SMS;
  const contactType =
    type !== ContactTypes.AUTOMATION_CAMPAIGN_SMS && type !== ContactTypes.AUTOMATION_GDPR_SMS
      ? AutomationCampaignChannelTypes.EMAIL
      : AutomationCampaignChannelTypes.MOBILE;
  const { garageId, campaignId, customerId, campaignType, campaignRunDay } = payload;
  if (
    type !== ContactTypes.AUTOMATION_CAMPAIGN_EMAIL &&
    type !== ContactTypes.AUTOMATION_CAMPAIGN_SMS &&
    type !== ContactTypes.AUTOMATION_GDPR_EMAIL &&
    type !== ContactTypes.AUTOMATION_GDPR_SMS
  ) {
    return;
  }
  if (!garageId || !campaignId || !customerId || !campaignType || !campaignRunDay) {
    log.error(JS, `_createAutomationSendEvent not enough payload ${JSON.stringify(contact)}`);
    return;
  }
  const eventType = isGDPR ? AutomationCampaignsEventsType.GDPR_SENT : AutomationCampaignsEventsType.SENT;
  await createAddLog(payload, contactType, eventType);
  if (contactType === AutomationCampaignChannelTypes.MOBILE) {
    // because there is no GDPR_RECEIVED event
    if (!isGDPR) {
      await createAddLog(payload, contactType, AutomationCampaignsEventsType.RECEIVED);
    }
    const eventTypeOpened = isGDPR ? AutomationCampaignsEventsType.GDPR_OPENED : AutomationCampaignsEventsType.OPENED;
    await createAddLog(payload, contactType, eventTypeOpened);
  }
}

const _printError = (text, contact) => {
  log.error(JS, `Cannot send contact ${text} contactId: ${contact.getId()} / contactType: ${contact.type}`);
};
/**
 * Send a contact with the status WAITING
 * @credentialsSms optionnal parameter, override config sfusername, sfpassword
 */
const sendContact = async (contact, { credentialsSms } = {}) => {
  if (contact.status !== ContactStatus.WAITING) {
    _printError(`wrong status ${JSON.stringify(contact)}`, contact);
    return;
  }
  if (!contact.getId() || !contact.type) {
    _printError('sendContact: contact have no id or no type', contact);
    return;
  }
  if (process.env.NODE_APP_INSTANCE === 'review' && contact.app_url !== process.env.APP_URL) {
    _printError(`sendContact: contact skipped : '${contact.app_url}' !== '${process.env.APP_URL}'`, contact);
    return;
  }
  const startTime = Date.now();

  try {
    const renderedContact = await contact.render();
    const renderEndTime = Date.now();
    console.log(`#2705 ${contact.isSms() ? 'sms' : 'email'} contact rendered in: ${renderEndTime - startTime}ms`);

    await _createAutomationSendEvent(contact);
    const render = (c, cb) => cb(null, renderedContact);
    if (contact.isSms()) {
      await promisify(SmsContact.sendSms)(contact, render, credentialsSms);
    } else {
      await promisify(EmailContact.sendEmail)(contact, render);
    }
  } catch (e) {
    _printError(e.message, contact);
  }
  const endTime = Date.now();
  console.log(`#2705 ${contact.isSms() ? 'sms' : 'email'} contact sent in: ${endTime - startTime}ms`);
};

if (require.main === module) {
  app.on('booted', async () => {
    const { Nuxt, Builder } = require('nuxt'); // eslint-disable-line global-require
    const nuxtConfig = require('../nuxt.config.js'); // eslint-disable-line global-require
    const nuxt = new Nuxt(nuxtConfig);
    if (nuxtConfig.dev) {
      console.log('[NUXT/BUILD] NODE_ENV is not production, starting building Nuxt.');
      await new Builder(nuxt).build();
    }
    app.nuxt = nuxt;
    app.use(nuxt.render);
  });
} else {
  module.exports = { queueContact, sendContact };
}
