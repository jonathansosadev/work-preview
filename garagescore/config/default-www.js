const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');
log.debug(JS, 'Loading web config');

var environmentConfig = {
  server: {
    startup: {
    },
    web: {
      app: false,
      survey: false,
      www: true
    }
  },
  mapbox: {
    apiToken: env.require('MAPBOX_API_TOKEN')
  },
  google: {
    captchaSiteKey: env.require('GOOGLE_CAPTCHA_SITE_KEY'),
    captchaSecretKey: env.require('GOOGLE_CAPTCHA_SECRET_KEY')
  }
};
module.exports = environmentConfig;
