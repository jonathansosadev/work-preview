const debug = require('debug')('garagescore:common:lib:mailgun:api'); // eslint-disable-line max-len,no-unused-vars
const config = require('config');
const Mailgun = require('mailgun-js');

const ContactTypes = require('../../models/contact.type');

const _getDomainKeyFromContactType = (contactType) => {
  switch (contactType) {
    case ContactTypes.AUTOMATION_CAMPAIGN_EMAIL:
      return 'am';
    case ContactTypes.AUTOMATION_GDPR_EMAIL:
      return 'oo';
    default:
      return 'default';
  }
};

const smellsLikeProdSpirit = () => {
  // Found that in common/lib/garagescore/contact/email.js which makes decision between send & sendMime
  if (
    config.util.getEnv('NODE_APP_INSTANCE') === 'review' &&
    config.has('mailgun.endpoint') &&
    config.get('mailgun.endpoint')
  ) {
    if (config.has('mailgun.default.host') && config.get('mailgun.default.host').includes('http')) {
      console.warn('BE CAREFUL ! ENV mailgun.host should not include http !');
    }
    return false;
  }
  return true;
};

const getDomainKeyFromDomain = (domain) => {
  const availableDomainKeys = ['am', 'oo', 'mg'];
  for (const domainKey of availableDomainKeys) {
    if (config.has(`mailgun.${domainKey}.domain`) && domain === config.get(`mailgun.${domainKey}.domain`))
      return domainKey;
  }
  return 'default';
};

const mailgunApis = {}; // used to keep same instance by domainKey

const initFromDomainKey = (domainKey) => {
  if (mailgunApis[domainKey]) return mailgunApis[domainKey];
  const domain = config.has(`mailgun.${domainKey}.domain`)
    ? config.get(`mailgun.${domainKey}.domain`)
    : config.get('mailgun.default.domain');
  const host = config.has(`mailgun.${domainKey}.host`)
    ? config.get(`mailgun.${domainKey}.host`)
    : config.get('mailgun.default.host');
  const mailgunApiCredentials = {
    apiKey: config.get('mailgun.apiKey'),
    publicApiKey: config.get('mailgun.publicApiKey'),
    port: config.has('mailgun.port') && config.get('mailgun.port'),
    protocol: config.has('mailgun.protocol') && config.get('mailgun.protocol'),
    domain,
    host,
  };

  if (
    config.util.getEnv('NODE_APP_INSTANCE') === 'review' &&
    config.has('mailgun.endpoint') &&
    config.get('mailgun.endpoint')
  ) {
    mailgunApiCredentials.endpoint = config.has('mailgun.endpoint') && config.get('mailgun.endpoint');
  }

  const mailgunApi = Mailgun(mailgunApiCredentials); // eslint-disable-line new-cap
  if (config.util.getEnv('NODE_APP_INSTANCE') === 'review') mailgunApi.isLocalUse = true; // Skip the email validator (MailgunApi.validate)
  mailgunApis[domainKey] = mailgunApi;
  return mailgunApis[domainKey];
};

const initFromContactType = (contactType) => {
  const domainKey = _getDomainKeyFromContactType(contactType);
  return initFromDomainKey(domainKey);
};

const addEmailToWhitelist = async (email, domainKey = 'default') => {
  try {
    const MailgunApi = initFromDomainKey(domainKey);
    if (!MailgunApi.isLocalUse) {
      await MailgunApi.post(`/${MailgunApi.domain}/whitelists`, { address: email })
    }
  } catch (e) {
     // Do nothing on errors
     console.log(e);
  }
};

const getUnsubscribedUsers = async (domainKey = 'default') => {
  try {
    const MailgunApi = initFromDomainKey(domainKey);
    return MailgunApi.get(`/${MailgunApi.domain}/unsubscribes`);
  } catch (e) {
     // Do nothing on errors
     console.log(e);
  }
};

module.exports = {
  initFromContactType,
  initFromDomainKey,
  getDomainKeyFromDomain,
  smellsLikeProdSpirit,
  addEmailToWhitelist,
  getUnsubscribedUsers,
};
