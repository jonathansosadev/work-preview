const ContactType = require('../../../models/contact.type.js');

const getAutomationCampaignPayload = async function getAutomationCampaignPayload(contact) {
  const payload = {};

  payload.locale = (contact.payload && contact.payload.garageLocale) || 'fr_FR';
  if (contact.payload.garageTimezone) {
    payload.timezone = contact.payload.garageTimezone;
  }
  if (contact.payload.customerName) {
    payload.customerName = contact.payload.customerName;
  }
  if (contact.type === ContactType.AUTOMATION_CAMPAIGN_SMS) {
    payload.shortUrl = contact.payload.shortUrl;
  }
  if (contact.payload.customContent) {
    payload.customContent = {
      _id: contact.payload.customContent._id,
      promotionalMessage: contact.payload.customContent.promotionalMessage,
      themeColor: contact.payload.customContent.themeColor,
      customUrl: contact.payload.customContent.customUrl,
      customButtonText: contact.payload.customContent.customButtonText,
    };
  }
  payload.target = contact.payload.target;

  if (contact.payload.brandName) {
    payload.brandName = contact.payload.brandName;
  }
  if (contact.payload.logoUrl) {
    payload.logoUrl = contact.payload.logoUrl;
  }
  if (contact.payload.isMotorbikeDealership) {
    payload.isMotorbikeDealership = contact.payload.isMotorbikeDealership;
  }
  payload.customerId = contact.payload.customerId;
  payload.campaignId = contact.payload.campaignId;
  payload.garageId = contact.payload.garageId;
  payload.garagePublicDisplayName = contact.payload.garagePublicDisplayName;

  for (const key of Object.keys(payload)) {
    if (!payload[key]) {
      throw Error(`automation campaign contact rendering failed : No ${key} in payload`);
    }
  }

  return payload;
};

module.exports = {
  getAutomationCampaignPayload,
};
