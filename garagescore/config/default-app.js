
const { JS, log } = require('../common/lib/util/log');

log.debug(JS, 'Loading app config');

var env = require('require-env');

var environmentConfig = {
  server: {
    web: {
      app: true,
      survey: false,
      www: false
    },
    queryLimits: {
      exports: 10000,
      list: 10
    }
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  contact: {
    sender: true
  },
  datadog: {
    apiKey: env.contains('DATADOG_API_KEY') && env.require('DATADOG_API_KEY'),
    applicationKey: env.contains('DATADOG_APP_KEY') && env.require('DATADOG_APP_KEY')
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: 'dmsupload.tests'
  },
  google: {
    apiKey: env.require('GOOGLE_API_KEY'),
    backendApiKey: env.require('GOOGLE_BACKEND_API_KEY'),
    captchaSiteKey: env.require('GOOGLE_CAPTCHA_SITE_KEY'),
    captchaSecretKey: env.require('GOOGLE_CAPTCHA_SECRET_KEY')
  },
  messageQueue: {
    prefix: env.require('CLOUDAMQP_PREFIX') || '',
    rate: {
      survey: typeof process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE !== 'undefined'
        ? parseInt(process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE, 10) : 10
    },
    useLocalServer: false
  },
  rest: {
    baseURL: env.require('GARAGESCORE_REST_ENDPOINT')
  },
  slack: {
    incomingWebhookUrl: env.require('GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL')
  },
  smsfactor: {
    sfusername: env.require('SMSFACTOR_API_USERNAME'),
    sfpassword: env.require('SMSFACTOR_API_PASSWORD'),
    sfhost: env.require('SMSFACTOR_API_HOST')
  },
  survey: {
    postResponseProgressToSlack: false,
    disableGeneration: false
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
  ovh: {
    endpoint: env.require('CROSS_LEAD_OVH_ENDPOINT'),
    appKey: env.require('CROSS_LEAD_OVH_APP_KEY'),
    appSecret: env.require('CROSS_LEAD_OVH_APP_SECRET'),
    consumerKey: env.require('CROSS_LEAD_OVH_CONSUMER_KEY'),
    account: env.require('CROSS_LEAD_OVH_ACCOUNT')
  }
};
log.debug(JS, 'Using POSTGRES ENV: ' + process.env.POSTGRES_ENV);
environmentConfig.postgres = {
  uri: env.require('POSTGRES_' + process.env.POSTGRES_ENV + '_URI')
};
module.exports = environmentConfig;
