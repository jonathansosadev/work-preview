const _automationEventPipeline = require('./_automation-event-pipeline');
const { AutomationCampaignsEventsType } = require('../../../../../frontend/utils/enumV2');

const period = 1;

module.exports = {
  enabled: true,
  model: 'AutomationCampaignsEvents',
  pipeline: _automationEventPipeline(period, AutomationCampaignsEventsType.TARGETED),
  shouldSendMessage: async (res) => {
    const { countMobile, countDesktop } = (res && res.length > 0 && res[0]) || { countMobile: 0, countDesktop: 0 };
    return countMobile <= 0 || countDesktop <= 0;
  },
  message: async (res) => {
    const { countMobile, countDesktop } = (res && res.length > 0 && res[0]) || { countMobile: 0, countDesktop: 0 };
    return `Nombre anormal de ciblés Automation sur le dernier jours (Mobile: ${countMobile}, Email: ${countDesktop})`;
  },
  slackChannel: 'çavapastrop',
};
