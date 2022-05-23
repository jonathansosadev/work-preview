const { JS, log } = require('../common/lib/util/log');
log.debug(JS, 'Loading contacts config');

var env = require('require-env');

var environmentConfig = {
  cloudamp: {
    url: env.require('CLOUDAMQP_URL')
  },
  server: {
    web: {
      app: false,
      survey: false,
      www: false
    }
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  contact: {
    sender: false
  },
  messageQueue: {
    prefix: env.require('MESSAGEQUEUE_MAILGUN_PREFIX') || '',
    rate: {
      mailgun: typeof process.env.MESSAGEQUEUE_MAILGUN_REQUESTS_PER_MINUTE !== 'undefined'
        ? parseInt(process.env.MESSAGEQUEUE_MAILGUN_REQUESTS_PER_MINUTE, 10) : 60
    },
    useLocalServer: false
  },
  smsfactor: {
    sfusername: env.require('SMSFACTOR_API_USERNAME'),
    sfpassword: env.require('SMSFACTOR_API_PASSWORD'),
    sfhost: env.require('SMSFACTOR_API_HOST')
  }
};
module.exports = environmentConfig;
