const { JS, log } = require('../common/lib/util/log');

/*
 * Environment config overrides for “antique.local” short_hostname
 */
log.debug(JS, 'Loading lenovo config');

var environmentConfig = {
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
        emailAddress: 'jscarinos+campaign-override@garagescore.com',
        mobilePhoneNumber: '+51 99 17 244 56'
      }
    }
  },
  campaign: {
    datafile: {
      filePath: {
        unique: false
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
  client: {
    www: {
      useCache: false
    }
  },
  messageQueue: {
    prefix: 'lenovo_',
    useLocalServer: true
  },
  nunjucks: {
    watchUdpates: true
  },
  survey: {
    disableGeneration: false,
    useFakeApi: true
  },
  surveygizmo: {
    survey: {
      prefix: '[lenovo]'
    }
  }
};

module.exports = environmentConfig;
