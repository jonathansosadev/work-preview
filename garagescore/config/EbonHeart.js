const env = require('require-env');
const debug = require('debug')('garagescore:config:thibaud'); // eslint-disable-line max-len,no-unused-vars

const environmentConfig = {
  debug: {
    autoCheckSurveyUpdates: false,
    autoSendWaitingContacts: false,
    autoSendWaitingReContacts: false,
    autoFetchAndSendAlerts: false,
    runSchedulerWorkers: false,
  },
  contact: {
    sender: true,
    skip: {
      channel: {
        email: false,
        sms: false
      }
    },
    resendAlreadySent: true,
    override: {
      to: {
        emailAddress: 'thibaud.auzou@gmail.com',
        mobilePhoneNumber: '+33 6 09 92 12 12'
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
  messageQueue: {
    prefix: 'thibaud',
    rate: {
      survey: typeof process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE !== 'undefined'
        ? parseInt(process.env.MESSAGEQUEUE_SURVEY_REQUESTS_PER_MINUTE, 10) : 10,
      mailgun: 60
    },
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
      prefix: '[thibaud]'
    }
  },
  dmsupload: {
    awsS3BucketRegion: 'eu-central-1', // Frankfurt
    awsS3BucketName: typeof process.env.S3BUCKET !== 'undefined' ? process.env.S3BUCKET : 'dmsupload.tests'
  },
  cloudamp: {
    url: env.require('CLOUDAMQP_URL')
  },
  api: {
    open: true
  }
};

module.exports = environmentConfig;
