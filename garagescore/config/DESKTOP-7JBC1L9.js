'use strict';

var debug = require('debug')('garagescore:config:oussama'); // eslint-disable-line max-len,no-unused-vars

/*
 * Environment config overrides for “antique.local” short_hostname
 */

var environmentConfig = {
  debug: {
    autoCheckSurveyUpdates: true,
    autoSendWaitingContacts: false,
    autoSendWaitingReContacts: false,
    autoFetchAndSendAlerts: false
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
        emailAddress: 'oabida@garagescore.com',
        mobilePhoneNumber: '+33 6 00 00 00 00'
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
      resendAlreadySent: true,
      override: {
        to: {
          emailAddress: 'oabida@garagescore.com',
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
    prefix: 'oussama',
    useLocalServer: false
  },
  nunjucks: {
    watchUdpates: true
  },
  server: {
    startup: {
    }
  },
  survey: {
    disableGeneration: false,
    useFakeApi: typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ? typeof process.env.LOADED_MOCHA_OPTS : false
  },
  surveygizmo: {
    survey: {
      prefix: '[oussama]'
    }
  }
};

module.exports = environmentConfig;
