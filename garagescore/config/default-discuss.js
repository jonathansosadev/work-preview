const { JS, log } = require('../common/lib/util/log');
const env = require('require-env');

log.debug(JS, 'Loading default discuss config');

var environmentConfig = {
  messageQueue: {
    prefix: '',
    rate: {
      survey: typeof process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE !== 'undefined'
        ? parseInt(process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE, 10) : 10
    },
    useLocalServer: false
  },
  slack: {
    incomingWebhookUrl: env.require('GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL')
  },
};
module.exports = environmentConfig;
