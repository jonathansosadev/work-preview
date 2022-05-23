const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');

log.debug(JS, 'Loading default http2ftp config');

var environmentConfig = {
  server: {
    web: {
    }
  },
  github: {
    apiToken: env.require('GITHUB_API_TOKEN')
  }
};
module.exports = environmentConfig;
