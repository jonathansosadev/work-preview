/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const config = require('config');
const { promisify } = require('util');
const app = require('../../../../server/server');
const gsClient = require('../client.js');
const nuxtRender = require('./render.js');
const { getUserGarages } = require('../../../models/user/user-mongo');

const generateEmail = async (data, sub, body) => ({
  subject: await nuxtRender.txt(sub, data),
  textBody: await nuxtRender.txt(body, data),
  htmlBody: await nuxtRender.html(body, data),
});

const getCampaignsReadyPayload = async (contact) => {
  const { payload } = contact;
  payload.vuePath = 'notifications/campaigns-ready';
  payload.user = await app.models.User.findById(contact.payload.userId);
  if (!payload.user) return {};

  const garages = await getUserGarages(app, payload.user.getId(), { locale: true, timezone: true }, [{ $limit: 1 }]);
  const garage = garages && garages[0];
  payload.locale = (garage && garage.locale) || null;
  payload.timezone = (garage && garage.timezone) || null;
  return payload;
};
const getCampaignsReadyContent = async (contact, callback) => {
  const data = { ...contact.payload, config, gsClient };
  try {
    data.user = await app.models.User.findById(contact.payload.userId);
    if (!data.user) {
      callback(new Error('user not found !'));
      return;
    }

    const garages = await getUserGarages(app, data.user.getId(), { locale: true }, [{ $limit: 1 }]);
    const garage = garages && garages[0];
    data.locale = (garage && garage.locale) || null;
    callback(
      null,
      generateEmail(data, 'emails/notifications/campaigns-ready/subject', 'emails/notifications/campaigns-ready/body')
    );
  } catch (error) {
    callback(error);
  }
};

module.exports = {
  getCampaignsReadyContent,
  getCampaignsReadyPayload,
};
