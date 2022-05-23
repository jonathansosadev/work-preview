/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const config = require('config');
const app = require('../../../../server/server');
const gsClient = require('../client.js');
const nuxtRender = require('./render.js');
const garageSubscriptions = require('../../../models/garage.subscription.type.js');
const { getUserGarages } = require('../../../models/user/user-mongo');
const { isSubscribed } = require('../../../models/garage/garage-methods');

const generateEmail = async (data, sub, body) => ({
  subject: await nuxtRender.txt(sub, data),
  textBody: await nuxtRender.txt(body, data),
  htmlBody: await nuxtRender.html(body, data),
});

const getWelcomePayload = async (contact) => {
  const { payload } = contact;
  payload.vuePath = 'notifications/welcome';
  payload.user = await app.models.User.findById(contact.payload.userId);
  if (!payload.user) {
    throw new Error(`getWelcomePayload user ${contact.payload.userId} does not exist`);
  }

  const garages = await getUserGarages(app, payload.user.getId(), {
    locale: true,
    timezone: true,
    subscriptions: true,
  });
  const garage = garages && garages[0];

  payload.locale = (garage && garage.locale) || null;
  payload.timezone = (garage && garage.timezone) || null;
  if (garage && isSubscribed(garage.subscriptions, 'Lead') && garages.length === 1) {
    const isLeadOnly = !garageSubscriptions
      .values()
      .some((subs) => isSubscribed(garage.subscriptions, subs) && subs !== 'Lead');
    if (isLeadOnly) payload.vuePath = 'notifications/welcome-R1-R2';
  }
  return payload;
};
const getWelcomeEmailContent = async (contact, callback) => {
  const data = { ...contact.payload, config, gsClient };
  try {
    data.user = await app.models.User.findById(contact.payload.userId);
    if (!data.user) {
      callback(new Error('user not found !'));
      return;
    }
    const garages = await getUserGarages(app, data.user.getId(), { locale: true, subscriptions: true });
    const garage = garages && garages[0];

    data.locale = (garage && garage.locale) || null;
    if (garage && isSubscribed(garage.subscriptions, 'Lead') && garages.length === 1) {
      const isLeadOnly = !garageSubscriptions
        .values()
        .some((subs) => isSubscribed(garage.subscriptions, subs) && subs !== 'Lead');
      if (isLeadOnly) {
        callback(
          null,
          await generateEmail(
            data,
            'emails/notifications/welcome-R1-R2/subject',
            'emails/notifications/welcome-R1-R2/body'
          )
        );
        return;
      }
    }
    callback(null, generateEmail(data, 'emails/notifications/welcome/subject', 'emails/notifications/welcome/body'));
  } catch (error) {
    callback(error);
  }
};

module.exports = {
  getWelcomeEmailContent,
  getWelcomePayload,
};
