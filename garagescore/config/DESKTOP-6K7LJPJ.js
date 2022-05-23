'use strict';


const { JS, log } = require('../common/lib/util/log');
var env = require('require-env');

/*
 * PC Anass @home
 */

log.debug(JS, 'Loading bwh config');

var environmentConfig = {
  api: {
    open: true
  },
  debug: {
    autoCheckSurveyUpdates: true,
    autoSendWaitingContacts: false,
    autoSendWaitingReContacts: false,
    autoFetchAndSendAlerts: true,
    runSchedulerWorkers: true
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  billing: {
    overrideBuyerEmail: 'aseddiki@garagescore.com'
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: 'dmsupload-review'
  },
  contact: {
    skip: {
      channel: {
        email: false,
        sms: false
      }
    },
    resendAlreadySent: true,
    override: {
      to: {
        emailAddress: 'aseddiki@garagescore.com'
      }
    },
    sender: false
  },
  cloudamp: {
    url: ''
  },
  campaign: {
    contact: {
      skip: {
        channel: {
          email: false,
          sms: true
        }
      },
      resendAlreadySent: true,
      override: {
        to: {
          emailAddress: 'aseddiki@garagescore.com'
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
    prefix: 'anass_',
    useLocalServer: false
  },
  nunjucks: {
    watchUdpates: true
  },
  shortUrlCatcher: {
    hostname: 'localhost'
  },
  server: {
    startup: {}
  },
  survey: {
    disableGeneration: false,
    useFakeApi: typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ? typeof process.env.LOADED_MOCHA_OPTS : false
  },
  surveygizmo: {
    survey: {
      prefix: '[anass]'
    }
  }
};

module.exports = environmentConfig;
