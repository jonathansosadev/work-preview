const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');
log.debug(JS, 'Loading publicapi config');

var environmentConfig = {
  server: {
    startup: {
    },
    web: {
      app: false,
      survey: false,
      www: false,
      publicapi: true
    }
  },
  messageQueue: {
    prefix: typeof process.env.MESSAGEQUEUE_MAILGUN_PREFIX !== 'undefined'
      ? process.env.MESSAGEQUEUE_MAILGUN_PREFIX : 'review_',
    rate: {
      mailgun: typeof process.env.MESSAGEQUEUE_MAILGUN_REQUESTS_PER_MINUTE !== 'undefined'
        ? parseInt(process.env.MESSAGEQUEUE_MAILGUN_REQUESTS_PER_MINUTE, 10) : 60
    },
    useLocalServer: false
  },
};
module.exports = environmentConfig;
