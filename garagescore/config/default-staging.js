const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');

log.debug(JS, 'Loading staging config');
var environmentConfig = {
  api: {
    open: true
  },
  contact: {
    sender: false
  },
  client: {
    www: {
      useCache: true
    }
  },
  cloudamp: {
    url: '-'
  },
  google: {
    apiKey: env.require('GOOGLE_API_KEY'),
    backendApiKey: env.require('GOOGLE_BACKEND_API_KEY'),
    captchaSiteKey: env.require('GOOGLE_CAPTCHA_SITE_KEY'),
    captchaSecretKey: env.require('GOOGLE_CAPTCHA_SECRET_KEY')
  },
  messageQueue: {
    prefix: 'staging',
    rate: {
      survey: 0,
      mailgun: 0
    },
    useLocalServer: true
  },
  nunjucks: {
    watchUdpates: true
  },
  newrelic: {
    enable: false
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  shortUrl: {
    baseUrl: env.require('APP_URL').replace(/\/$/, '') + '/'
  },
  shortUrlCatcher: {
    hostname: env.require('APP_URL').replace(/\/$/, '').replace(/^https:\/\//, '').replace(/^http:\/\//, '')
  },
  server: {
    startup: {
    },
    web: {
      app: true,
      survey: true,
      www: true,
      mailguM: false
    },
    queryLimits: {
      exports: 10000,
      list: 10
    }
  },
  slack: {
    incomingWebhookUrl: env.require('GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL')
  },
  smsfactor: {
    sfusername: '-',
    sfpassword: '-',
    sfhost: '-'
  },
  github: {
    apiToken: env.require('GITHUB_API_TOKEN')
  },
  selectup: {
    cryptoKey: env.require('SELECTUP_CRYPTOKEY'),
    algo: env.require('SELECTUP_ALG')
  },
  salesforce: {
    cryptoAlgo: env.require('SALESFORCE_CRYPTO_ALGO'),
  },
  mapbox: {
    apiToken: env.require('MAPBOX_API_TOKEN')
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: 'dmsupload'
  },
  mailgun: {
    endpoint: env.require('MAILGUN_ENDPOINT')
  },
  simulators: {
    activated: true
  }
};
log.debug(JS, 'Using POSTGRES ENV: ' + process.env.POSTGRES_ENV);
environmentConfig.postgres = {
  uri: env.require('POSTGRES_' + process.env.POSTGRES_ENV + '_URI')
};
module.exports = environmentConfig;
