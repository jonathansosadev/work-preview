'use strict';

const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');

log.debug(JS, 'Loading reviewapp config');

var debug = {
  autoCheckSurveyUpdates: process.env.DEBUG_autoCheckSurveyUpdates === 'true',
  autoSendWaitingContacts: process.env.DEBUG_autoSendWaitingContacts === 'true',
  autoSendWaitingReContacts: process.env.DEBUG_autoSendWaitingReContacts === 'true',
  autoFetchAndSendAlerts: process.env.DEBUG_autoFetchAndSendAlerts === 'true',
  runSchedulerWorkers: process.env.DEBUG_runSchedulerWorkers === 'true',
};

var environmentConfig = {
  api: {
    open: true,
  },
  billing: {
    overrideBuyerEmail: 'factures@garagescore.com',
  },
  debug,
  contact: {
    sender: false,
    skip: {
      channel: {
        email: false,
        sms: false,
      },
    },
    resendAlreadySent: true,
    override: {
      to: {
        emailAddress: 'next@garagescore.com',
        // mobilePhoneNumber: '+5199172456'
      },
    },
  },
  campaign: {
    datafile: {
      filePath: {
        unique: false,
      },
    },
    item: {
      run: {
        skipEnsureValid: false,
      },
    },
    run: {
      skipEnsureValid: false,
    },
  },
  client: {
    www: {
      useCache: false,
    },
  },
  cloudamp: {
    url: env.require('CLOUDAMQP_URL'),
  },
  google: {
    apiKey: env.require('GOOGLE_API_KEY'),
    backendApiKey: env.require('GOOGLE_BACKEND_API_KEY'),
    captchaSiteKey: env.require('GOOGLE_CAPTCHA_SITE_KEY'),
    captchaSecretKey: env.require('GOOGLE_CAPTCHA_SECRET_KEY'),
  },
  messageQueue: {
    prefix:
      (process.env.CLOUDAMQP_PREFIX && env.require('CLOUDAMQP_PREFIX')) ||
      'review_',
    rate: {
      survey:
        typeof process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE !==
        'undefined'
          ? parseInt(process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE, 10)
          : 10,
      mailgun: 60,
    },
    useLocalServer: false,
  },
  nunjucks: {
    watchUdpates: true,
  },
  newrelic: {
    enable: true,
    appName: env.require('NEW_RELIC_APP_NAME'),
    licenseKey: env.require('NEW_RELIC_LICENSE_KEY'),
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL'),
  },

  shortUrl: {
    baseUrl: env.require('APP_URL').replace(/\/$/, '') + '/'
  },

  shortUrlCatcher: {
    hostname: env
      .require('APP_URL')
      .replace(/\/$/, '')
      .replace(/^https:\/\//, '')
      .replace(/^http:\/\//, ''),
    hostnameBeta: 'bsco.re'
  },
  server: {
    startup: {},
    web: {
      app: true,
      survey: true,
      www: true,
      mailguM: true,
      publicapi: true,
    },
    queryLimits: {
      exports: 10000,
      list: 10,
    },
  },
  slack: {
    incomingWebhookUrl: env.require('GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL'),
  },
  smsfactor: {
    sfusername: env.require('SMSFACTOR_API_USERNAME'),
    sfpassword: env.require('SMSFACTOR_API_PASSWORD'),
    sfhost: env.require('SMSFACTOR_API_HOST'),
  },
  github: {
    apiToken: env.require('GITHUB_API_TOKEN'),
  },
  selectup: {
    cryptoKey: env.require('SELECTUP_CRYPTOKEY'),
    algo: env.require('SELECTUP_ALG'),
  },
  salesforce: {
    cryptoAlgo: env.require('SALESFORCE_CRYPTO_ALGO'),
  },
  mapbox: {
    apiToken: env.require('MAPBOX_API_TOKEN'),
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName:
      typeof process.env.S3BUCKET !== 'undefined'
        ? process.env.S3BUCKET
        : 'dmsupload.tests',
  },
  mailgun: {
    endpoint: env.contains('MAILGUN_ENDPOINT') ? env.require('MAILGUN_ENDPOINT') : '',
    port: env.require('MAILGUN_PORT') || process.env.PORT,
  },
  simulators: {
    activated: true,
  },
  ovh: {
    endpoint: env.require('CROSS_LEAD_OVH_ENDPOINT'),
    appKey: env.require('CROSS_LEAD_OVH_APP_KEY'),
    appSecret: env.require('CROSS_LEAD_OVH_APP_SECRET'),
    consumerKey: env.require('CROSS_LEAD_OVH_CONSUMER_KEY'),
    account: env.require('CROSS_LEAD_OVH_ACCOUNT'),
  },
};
log.debug(JS, 'Using POSTGRES ENV: ' + process.env.POSTGRES_ENV);
environmentConfig.postgres = {
  uri: env.require('POSTGRES_' + process.env.POSTGRES_ENV + '_URI'),
};
module.exports = environmentConfig;
