const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');
log.debug(JS, 'Loading survey config');
var environmentConfig = {
  server: {
    startup: {
    },
    web: {
      app: false,
      survey: true,
      www: false
    }
  },
  cloudamp: {
    url: env.require('CLOUDAMQP_URL')
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  messageQueue: {
    prefix: env.require('MESSAGEQUEUE_MAILGUN_PREFIX') || '',
    useLocalServer: false
  }
};
module.exports = environmentConfig;
