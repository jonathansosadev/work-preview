const debug = require('debug')('garagescore:common:lib:garagescore:contact:render-campaign-contact'); // eslint-disable-line max-len,no-unused-vars

const getAutomationGdprPayload = async function getAutomationGdprPayload(contact) {
  const payload = {};

  payload.locale = (contact.payload && contact.payload.garageLocale) || 'fr_FR';
  if (contact.payload.shortUrl) {
    payload.shortUrl = contact.payload.shortUrl;
  }
  if (contact.payload.garageTimezone) {
    payload.timezone = contact.payload.garageTimezone;
  }
  if (contact.payload.customerName) {
    payload.customerName = contact.payload.customerName;
  }
  if (contact.payload.logoUrl) {
    payload.logoUrl = contact.payload.logoUrl;
  }
  payload.customerId = contact.payload.customerId;
  payload.garageId = contact.payload.garageId;
  payload.garagePublicDisplayName = contact.payload.garagePublicDisplayName;
  payload.unsubscribeUrl = contact.payload.unsubscribeUrl;

  for (const key of Object.keys(payload)) {
    if (!payload[key]) {
      throw Error(`automation campaign contact rendering failed : No ${key} in payload`);
    }
  }

  return payload;
};

module.exports = {
  getAutomationGdprPayload,
};
