'use strict';


var env = require('require-env');

/* PC de Fed : feduru@garagescore.com */
/*
 * Environment config overrides for “antique.local” short_hostname
 */

var environmentConfig = {
  debug: {
    autoCheckSurveyUpdates: false,
    autoSendWaitingContacts: false,
    autoSendWaitingReContacts: false,
    autoFetchAndSendAlerts: false,
    runContactWorker: false,
    runSchedulerWorkers: false
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  contact: {
    skip: {
      channel: {
        email: false,
        sms: false
      }
    },
    resendAlreadySent: false,
    override: {
      to: {
        emailAddress: 'feduru@garagescore.com',
        mobilePhoneNumber: '+33 6 21 98 29 35'
      }
    }
  },
  campaign: {
    contact: {
      skip: {
        channel: {
          email: false,
          sms: true
        }
      },
      resendAlreadySent: false,
      override: {
        to: {
          emailAddress: 'feduru@garagescore.com',
          mobilePhoneNumber: '+33 6 00 00 00 00'
        }
      }
    },
    item: {
      run: {
        skipEnsureValid: false
      }
    },
    run: {
      skipEnsureValid: false
    }
  },
  messageQueue: {
    prefix: 'feduru',
    useLocalServer: false
  },
  nunjucks: {
    watchUdpates: true
  },
  server: {
    startup: {
    }
  },
  cloudamp: {
    url: env.require('CLOUDAMQP_URL')
  },
  survey: {
    disableGeneration: false,
    useFakeApi: typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ? typeof process.env.LOADED_MOCHA_OPTS : false
  },
  surveygizmo: {
    survey: {
      prefix: '[feduru]'
    }
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: typeof process.env.S3BUCKET !== 'undefined' ? process.env.S3BUCKET : 'dmsupload.tests'
  },
  profiler: {
    printSlowQueries: false
  },
  google: {
    backendApiKey: env.require('GOOGLE_BACKEND_API_KEY')
  }
};

module.exports = environmentConfig;
