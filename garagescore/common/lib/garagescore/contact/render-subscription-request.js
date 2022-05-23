/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const nunjucks = require('nunjucks');
const path = require('path');
const juice = require('juice');
const moment = require('moment');
require('moment-timezone');
const gsClient = require('../../../../common/lib/garagescore/client.js');
const stringUtil = require('../../../../common/lib/string/util');
const configs = require('../subscription-form/configs');
const config = require('config');

let watch = false;

if (process.env.NODE_APP_INSTANCE === 'review' && typeof process.env.LOADED_MOCHA_OPTS === 'undefined') {
  watch = true;
}

const nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../../../../common/')), {
  autoescape: true,
  watch,
});
const formatDates = (date, format) => {
  if (!date || !moment(date).isValid()) {
    return '--';
  }
  return moment.tz(date, 'Europe/Paris').format(format || 'DD MMMM YYYY');
};

const getGroup = (groups, garage) => {
  let type = 'Individuelle';
  groups.forEach((group) => {
    if (group.garages.includes(garage)) {
      type = group.name;
    }
  });
  return type;
};

nunjucksEnv.addFilter('addPreposition', stringUtil.addPreposition);
nunjucksEnv.addFilter('encodeUrl', encodeURI);
nunjucksEnv.addGlobal('lib', { client: gsClient });
nunjucksEnv.addGlobal('getLogo', (conf) => {
  if (conf.logo_tg) {
    return 'logo-tg.png';
  } else if (conf.logo_gp) {
    return 'logo-gp.png';
  } else if (conf.logo_ea) {
    return 'logo-ea.png';
  }

  return null;
});
nunjucksEnv.addGlobal('formatDates', formatDates);
nunjucksEnv.addGlobal('getGroup', getGroup);

const nunjucksEnvText = nunjucks.configure(path.normalize(path.join(__dirname, '../../../../common/')), {
  autoescape: false,
  watch,
});
nunjucksEnvText.addFilter('addPreposition', stringUtil.addPreposition);
nunjucksEnvText.addGlobal('lib', { client: gsClient });
nunjucksEnvText.addGlobal('getGroup', getGroup);

const getSubscriptionRequestPayload = async (contact) => {
  const payload = contact.payload;
  const frInvoice = { individual: 'Individuelle', centralized: 'Centralisée', customized: 'Personnalisée' };

  const totalMarks = (type) => {
    let total = 0;
    if (payload.garages) {
      payload.garages.forEach((e) => {
        if (Array.isArray(e[type])) total += e[type].length;
        else total++;
      });
    }
    return total;
  };
  payload.totalPrimary = totalMarks('primaryMake');
  payload.totalSecondary = totalMarks('secondaryMakes');
  payload.frInvoice = frInvoice;

  const conf = configs[payload.slug || 'la-centrale'];

  const services = payload.services;
  let plansFinalPrice = 0;
  if (conf.plans.maintenance && services.maintenance) {
    plansFinalPrice += conf.plans.maintenance.finalPrice;
  }
  if (conf.plans.sales && services.sales) {
    plansFinalPrice += conf.plans.sales.finalPrice;
  }
  if (conf.plans.leads && services.leads) {
    plansFinalPrice += conf.plans.leads.finalPrice;
  }
  if (conf.plans.analytics && services.analytics) {
    plansFinalPrice += conf.plans.analytics.finalPrice;
  }
  if (conf.plans.data && services.data) {
    plansFinalPrice += conf.plans.data.finalPrice;
  }
  if (conf.plans.eReputation && services.eReputation) {
    plansFinalPrice += conf.plans.eReputation.finalPrice;
  }

  let plansPublicPrice = 0;
  if (conf.plans.maintenance && services.maintenance) {
    plansPublicPrice += conf.plans.maintenance.publicPrice;
  }
  if (conf.plans.sales && services.sales) {
    plansPublicPrice += conf.plans.sales.publicPrice;
  }
  if (conf.plans.leads && services.leads) {
    plansPublicPrice += conf.plans.leads.publicPrice;
  }
  if (conf.plans.analytics && services.analytics) {
    plansPublicPrice += conf.plans.analytics.publicPrice;
  }
  if (conf.plans.data && services.data) {
    plansPublicPrice += conf.plans.data.publicPrice;
  }
  if (conf.plans.eReputation && services.eReputation) {
    plansPublicPrice += conf.plans.eReputation.publicPrice;
  }

  payload.plansPublicPrice = plansPublicPrice;
  payload.plansFinalPrice = plansFinalPrice;
  payload.now = new Date();
  payload.config = conf;
  return {
    subject: nunjucksEnvText.render('./templates/email/subscription-form/subject.nunjucks', payload),
    textBody: nunjucksEnvText.render('./templates/email/subscription-form/text-body.nunjucks', payload),
    htmlBody: juice(nunjucksEnv.render('./templates/email/subscription-form/html-body.nunjucks', payload), {
      preserveMediaQueries: true,
    }),
  };
};

const getSubscriptionConfirmationPayload = async (contact) => ({
  ...contact.payload,
  vuePath: 'notifications/subscription-confirmation',
});

const getSubscriptionFeatureRequestPayload = async (contact) => ({
  ...contact.payload,
  vuePath: 'notifications/subscription-feature-request',
}); // eslint-disable-line

const getUserAccessRequestPayload = async (contact) => ({
  ...contact.payload,
  vuePath: 'notifications/user-access-request',
});

module.exports = {
  getSubscriptionFeatureRequestPayload,
  getSubscriptionConfirmationPayload,
  getSubscriptionRequestPayload,
  getUserAccessRequestPayload,
};
