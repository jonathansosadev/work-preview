const { JS, log } = require('../common/lib/util/log');

const env = require('require-env');
const url = require('url');


/*
 * Environment config overrides for “production” deployment
 */

var productionEnvironmentConfig = {};

// skipping production env for app-reviews
// because it is based on NODE_ENV='production' and this parameter is unchangeable in the appReview mode
if (process.env.NODE_APP_INSTANCE !== 'review') {
  log.debug(JS, 'Loading production config');
  // I can default with APP_URL because, apart from the prod, all our apps use the regular APP_URL for their shortUrls
  // So the env var is specifically designed for the prod, even though we can change it for a given PR (e.g. to use the beta one)
  const shortUrlBase = process.env.SHORT_URL_BASE ? env.require('SHORT_URL_BASE') : env.require('APP_URL');
  const shortUrlHostname = url.parse(shortUrlBase).host;
  productionEnvironmentConfig = {
    apiExplorer: {
      mangleUrl: true
    },
    cloudamp: {
      url: env.require('CLOUDAMQP_URL')
    },
    dmsupload: {
      awsS3BucketRegion: env.require('AWS_BUCKET_REGION'),
      awsS3BucketName: env.require('AWS_BUCKET_NAME')
    },
    cockpitExportsUpload: {
      awsS3BucketRegion: 'eu-central-1', // Frankfurt
      awsS3BucketName: 'cockpit-exports',
      ttlInDays: 7,
    },
    newrelic: {
      enable: true
    },
    nunjucks: {
      watchUdpates: false
    },

    shortUrl: {
      baseUrl: shortUrlBase,
    },
    shortUrlCatcher: {
      hostname: shortUrlHostname,
    },

    survey: {
      postResponseProgressToSlack: false
    }
  };
}

module.exports = productionEnvironmentConfig;
