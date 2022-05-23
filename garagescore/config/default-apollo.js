const { JS, log } = require('../common/lib/util/log');
const env = require('require-env');

log.debug(JS, 'Loading default apollo config');

var environmentConfig = {
  server: {
    web: {
      app: false,
      api: true,
      survey: false,
      www: false
    }
  },
  messageQueue: {
    prefix: env.require('MESSAGEQUEUE_MAILGUN_PREFIX') || '',
    useLocalServer: false
  },
  google: {
    apiKey: env.require('GOOGLE_API_KEY'),
    backendApiKey: env.require('GOOGLE_BACKEND_API_KEY'),
    captchaSiteKey: env.require('GOOGLE_CAPTCHA_SITE_KEY'),
    captchaSecretKey: env.require('GOOGLE_CAPTCHA_SECRET_KEY')
  },
  ovh: {
    endpoint: env.require('CROSS_LEAD_OVH_ENDPOINT'),
    appKey: env.require('CROSS_LEAD_OVH_APP_KEY'),
    appSecret: env.require('CROSS_LEAD_OVH_APP_SECRET'),
    consumerKey: env.require('CROSS_LEAD_OVH_CONSUMER_KEY'),
    account: env.require('CROSS_LEAD_OVH_ACCOUNT')
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  slack: {
    incomingWebhookUrl: env.require('GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL')
  },
};

module.exports = environmentConfig;
