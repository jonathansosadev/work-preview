// dotenv says: “As early as possible in your application, require and configure dotenv.”
require('dotenv').config({ silent: true });

var env = require('require-env');
var URI = require('urijs');
const { JS, log } = require('../common/lib/util/log');


function envGet(key, fallback= "") {
  return env.contains(key) ? env.require(key) : fallback
}
/*
 * Default environment config
 */

/*
 * Note about AWS environment:
 * AWS environment is not declared in this config,
 * because AWS SDK makes direct use of the following standard variables:
 *  - AWS_ACCESS_KEY_ID
 *  - AWS_SECRET_ACCESS_KEY
 */
log.debug(JS, 'Loading default config');

var defaultEnvironmentConfig = {
  debug: {
    autoCheckSurveyUpdates: false,
    autoSendWaitingContacts: false,
    autoSendWaitingReContacts: false,
  },
  contact: {
    skip: {
      channel: {
        email: false,
        sms: false,
      },
    },
    resendAlreadySent: false,
    sender: false,
    ignored: env.contains('CONTACT_IGNORED') && env.require('CONTACT_IGNORED').split(','),
    only: env.contains('CONTACT_ONLY') && env.require('CONTACT_ONLY').split(','),
  },
  campaign: {
    datafile: {
      filePath: {
        unique: true,
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
    app: {
      serveLocally: true,
    },
    www: {
      url: env.require('WWW_URL'),
      useCache: true,
    },
  },
  cookies: {
    secret: envGet('GARAGESCORE_COOKIES_SECRET'),
  },
  humanupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: 'humanupload',
  },
  mailgun: {
    apiKey: envGet('MAILGUN_SECRET_API_KEY'),
    publicApiKey: envGet('MAILGUN_PUBLIC_API_KEY'),
    port: envGet('MAILGUN_PORT'),
    protocol: envGet('MAILGUN_PROTOCOL'),
    default: {
      domain: envGet('MAILGUN_DOMAIN'),
      host: envGet('MAILGUN_HOST'),
    },
    mg: {
      domain: env.contains('MAILGUN_DOMAIN_MG') ? envGet('MAILGUN_DOMAIN_MG') : envGet('MAILGUN_DOMAIN'),
      host: env.contains('MAILGUN_DOMAIN_MG') ? envGet('MAILGUN_HOST_US') : envGet('MAILGUN_HOST'),
    },
    am: {
      domain: env.contains('MAILGUN_DOMAIN_AM') ? envGet('MAILGUN_DOMAIN_AM') : envGet('MAILGUN_DOMAIN'),
      host: env.contains('MAILGUN_DOMAIN_AM') ? envGet('MAILGUN_HOST_EU') : envGet('MAILGUN_HOST'),
    },
    oo: {
      domain: env.contains('MAILGUN_DOMAIN_OO') ? envGet('MAILGUN_DOMAIN_OO') : envGet('MAILGUN_DOMAIN'),
      host: env.contains('MAILGUN_DOMAIN_OO') ? envGet('MAILGUN_HOST_EU') : envGet('MAILGUN_HOST'),
    }
  },
  profiler: {
    enable: process.env.PROFILER === 'true',
    namespace: process.env.PROFILER_NAMESPACE,
    printSlowQueries: process.env.PROFILER_PRINT_SLOW_QUERIES === 'true',
  },
  newrelic: {
    enable: false,
    appName: envGet('NEW_RELIC_APP_NAME'),
    licenseKey: envGet('NEW_RELIC_LICENSE_KEY'),
  },
  nunjucks: {
    watchUdpates: false,
  },
  proxy: {
    ip: '52.57.80.173',
  },
  server: {
    startup: {},
  },
  session: {
    cookieName: 'connect.sid',
    secret: envGet('GARAGESCORE_SESSION_SECRET'),
  },
  shortUrl: {
    baseUrl: 'http://0.0.0.0:3000/',
  },
  simMode: false,
  publicUrl: {},
  shortUrlCatcher: {
    hostname: '0.0.0.0',
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: 'dmsupload.tests',
  },
  cockpitExportsUpload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: 'cockpit-exports.tests',
    ttlInDays: 7,
  },
  // For unit tests using OVH api
  ovh: {
    endpoint: envGet('CROSS_LEAD_OVH_ENDPOINT'),
    appKey: envGet('CROSS_LEAD_OVH_APP_KEY'),
    appSecret: envGet('CROSS_LEAD_OVH_APP_SECRET'),
    consumerKey: envGet('CROSS_LEAD_OVH_CONSUMER_KEY'),
    account: envGet('CROSS_LEAD_OVH_ACCOUNT'),
  },

  slack: {
    incomingWebhookUrl: envGet('GARAGESCORE_SLACK_INCOMING_WEBHOOK_URL'),
  },
  // workers monitoring
  workerbeats: {
    enabled: envGet('WORKERBEATS_ENABLED', false),
    url: envGet('WORKERBEATS_URL'),
    heartBeatMs: env.contains('WORKERBEATS_HEARTBEAT_MS') ? parseInt(env.require('WORKERBEATS_HEARTBEAT_MS'), 10) : 300000,
  }
};

log.debug(JS, 'Using DB ENV: ' + process.env.DB_ENV);
defaultEnvironmentConfig.mongo = {
  // warning conf doesnt allow vars viwth `,`
  // in production, we use `::` instead of `,`and replace it after in the code
  uri: new URI(env.require('DB_ENV_' + process.env.DB_ENV + '_URI')).addSearch({ connectTimeoutMS: 100000, authMode: 'scram-sha1', socketTimeoutMS: 1800000 }).toString(),
  db_name: process.env.DB_NAME || 'heroku_6jk0qvwj'
};

defaultEnvironmentConfig.publicUrl.www_url = env.require('WWW_URL');
defaultEnvironmentConfig.publicUrl.app_url = env.require('APP_URL');
defaultEnvironmentConfig.session.redisUrl = envGet('REDIS_URL');

defaultEnvironmentConfig.session.redisPrefix = envGet('REDIS_PREFIX', envGet('NODE_APP_INSTANCE'));

module.exports = defaultEnvironmentConfig;
