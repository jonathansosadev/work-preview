const timeHelper = require('../../../util/time-helper');

const _automationTargetNullPipeline = () => {
  return [
    {
      $match: {
        eventDay: { $gte: timeHelper.dayNumber(new Date()) - 1 },
        $or: [{ target: null }, { target: { $exists: false } }],
      },
    },
    {
      $count: 'countTargetNull',
    },
  ];
};

module.exports = {
  enabled: true,
  model: 'AutomationCampaignsEvents',
  pipeline: _automationTargetNullPipeline(),
  shouldSendMessage: async (res) => {
    const { countTargetNull } = res[0];
    return countTargetNull > 0;
  },
  message: async (res) => {
    const { countTargetNull } = res[0];
    return `*[Automation]* il y a \`${countTargetNull}\` documents sans target dans \`AutomationCampaignsEvents\``;
  },
  slackChannel: 'çavapastrop',
};
