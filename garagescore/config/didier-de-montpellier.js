'use strict';

var env = require('require-env');

/* PC de ddemoniere : ddemoniere@garagescore.com */
/*
* Environment config overrides for “antique.local” short_hostname
*/

var environmentConfig = {
	api: {
		open: true
	},
    debug: {
        autoCheckSurveyUpdates: false,
        autoSendWaitingContacts: false,
        autoSendWaitingReContacts: false,
        autoFetchAndSendAlerts: false,
        runContactWorker: false
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
                emailAddress: 'ddemoniere@garagescore.com',
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
            resendAlreadySent: false,
            override: {
                to: {
                    emailAddress: 'ddemoniere@garagescore.com',
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
        prefix: 'ddemoniere',
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
            prefix: '[ddemoniere]'
        }
    },
    dmsupload: {
        awsS3BucketRegion: 'eu-central-1', // Frankfurt
        awsS3BucketName: typeof process.env.S3BUCKET !== 'undefined' ? process.env.S3BUCKET : 'dmsupload.tests'
    }
};

module.exports = environmentConfig;
