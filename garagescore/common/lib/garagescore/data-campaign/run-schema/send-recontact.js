const sendRecontact = require('../run/send-recontact');
const CampaignStatus = require('../../../../models/data/type/campaign-status');

function ensureValid(data) {
  if (!data.campaign) {
    throw new Error('Undefined campaign');
  } else if (!data.campaign.status) {
    throw new Error('Undefined campaign.status');
  } else if ([CampaignStatus.WITHOUTCAMPAIGN, CampaignStatus.CANCELLED].includes(data.campaign.status)) {
    throw new Error(`data.campaign.status is ${data.campaign.status}`);
  }
}

module.exports = async (data) => {
  ensureValid(data);
  return sendRecontact(data);
};
