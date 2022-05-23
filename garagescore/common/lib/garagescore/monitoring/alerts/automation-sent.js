const _automationEventPipeline = require('./_automation-event-pipeline');
const { AutomationCampaignsEventsType } = require('../../../../../frontend/utils/enumV2');

const period = 1;

module.exports = {
  enabled: true,
  model: 'AutomationCampaignsEvents',
  pipeline: _automationEventPipeline(period, AutomationCampaignsEventsType.SENT),
  shouldSendMessage: async (res) => {
    const today = new Date();
    const isWeekEnd = (today.getDay() - period + 7) % 7 === 0 || (today.getDay() - period + 7) % 7 === 6;
    const { countMobile, countDesktop } = (res && res.length > 0 && res[0]) || { countMobile: 0, countDesktop: 0 };
    // We do not send anything during the week-end, so the conditions arent the same. We expect 0 sent during the week end, and more than 0 sent during the week
    if (isWeekEnd) {
      return countMobile !== 0 || countDesktop !== 0;
    } else {
      return countMobile <= 0 || countDesktop <= 0;
    }
  },
  message: async (res) => {
    const today = new Date();
    const isWeekEnd = (today.getDay() - period + 7) % 7 === 0 || (today.getDay() - period + 7) % 7 === 6;
    const { countMobile, countDesktop } = (res && res.length > 0 && res[0]) || { countMobile: 0, countDesktop: 0 };
    if (isWeekEnd) {
      return `Nombre anormal d'envois Automation sur le dernier jour (Week-end, pas d'envoi normalement) (Mobile: ${countMobile}, Email: ${countDesktop})`;
    } else {
      return `Nombre anormal d'envois Automation sur le dernier jour (Mobile: ${countMobile}, Email: ${countDesktop})`;
    }
  },
  slackChannel: 'çavapastrop',
};
