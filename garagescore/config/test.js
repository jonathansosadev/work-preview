var env = require('require-env');

/**
 * Unit test environment
 */
module.exports = {
  messageQueue: {
    prefix: 'TEST_',
  },
  publicUrl: {
    survey_url: env.require('SURVEY_URL')
  },
};
