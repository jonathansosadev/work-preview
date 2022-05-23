const _automationEventPipeline = require('./_automation-event-pipeline');
const { AutomationCampaignsEventsType } = require('../../../../../frontend/utils/enumV2');

const period = 3;

module.exports = {
  enabled: true,
  model: 'AutomationCampaignsEvents',
  pipeline: _automationEventPipeline(period, AutomationCampaignsEventsType.LEAD),
  shouldSendMessage: async (res) => {
    const { countMobile, countDesktop } = (res && res.length > 0 && res[0]) || { countMobile: 0, countDesktop: 0 };
    return countMobile <= 0 || countDesktop <= 0;
  },
  message: async (res) => {
    const { countMobile, countDesktop } = (res && res.length > 0 && res[0]) || { countMobile: 0, countDesktop: 0 };
    return `Nombre anormal de leads Automation sur les 3 derniers jours (Mobile: ${countMobile}, Email: ${countDesktop})`;
  },
  slackChannel: 'çavapastrop',
};
