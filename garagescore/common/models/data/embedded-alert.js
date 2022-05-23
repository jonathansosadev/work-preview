const model = () => ({
  properties: {
    /* this flag is for alert fetchAndSend cron that will be lunched every hour */
    checkAlertHour: {
      type: 'number',
    },
    alertsSent: [{ type: 'string' }],
  },
});

const prototypeMethods = {};
module.exports = { model, prototypeMethods };
