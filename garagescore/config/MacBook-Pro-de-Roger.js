'use strict';


var env = require('require-env');

/*
 * Environment config overrides for “antique.local” short_hostname
 */

var environmentConfig = {
  debug: {
    autoCheckSurveyUpdates: true,
    autoSendWaitingContacts: false,
    autoSendWaitingReContacts: false,
    autoFetchAndSendAlerts: false,
    runSchedulerWorkers: true
  },
  publicUrl: {
    app_url: env.require('APP_URL'),
    www_url: env.require('WWW_URL'),
    survey_url: env.require('SURVEY_URL')
  },
  billing: {
    overrideBuyerEmail: 'rgonzales@garagescore.com'
  },
  contact: {
    skip: {
      channel: {
        email: false,
        sms: false
      }
    },
    resendAlreadySent: true
  },
  campaign: {
    contact: {
      skip: {
        channel: {
          email: false,
          sms: true
        }
      },
      resendAlreadySent: true
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
    prefix: env.require('CLOUDAMQP_PREFIX'),
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
      prefix: '[Roger]'
    }
  }
};

module.exports = environmentConfig;
