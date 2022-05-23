'use strict';

var debug = require('debug')('garagescore:config:antique.local'); // eslint-disable-line max-len,no-unused-vars

/*
 * Environment config overrides for “antique.local” short_hostname
 */

var environmentConfig = {
  contact: {
    skip: {
      channel: {
        email: false,
        sms: true
      }
    },
    override: {
      to: {
        emailAddress: 'eredon+campaign-override@garagescore.com',
        mobilePhoneNumber: '+33 6 80 55 75 81' // Eric Redon
      }
    }
  },
  messageQueue: {
    prefix: 'antique_'
  },

  surveygizmo: {
    survey: {
      prefix: '[antique.local]'
    }
  }
};

module.exports = environmentConfig;
