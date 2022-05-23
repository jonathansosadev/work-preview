var app = require('../../../server/server');
var contactsConfig = require('../../../common/lib/garagescore/data-campaign/contacts-config.js');
var async = require('async');
var CronRunner = require('../../../common/lib/cron/runner');
/**
 Send contacts
 Must be run every day
 */

var runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.DAILY,
  description:
    "Vérifie et traite les contacts (premiers contact, relance), en attente de création, qui doivent être envoyés aujourd'hui",
});

console.log('Checking if some datas have contacts to be sent...');
runner.execute = function (options, callback) {
  if (!options.executionStepNumber) {
    callback(new Error('option.executionStepNumber not found'));
    return;
  }
  async.eachSeries(
    contactsConfig.toArray,
    function (contactConfig, next) {
      if (contactConfig.isRecontact) {
        next();
        return;
      } // Skip recontacts
      app.models.Data.campaign_sendNextCampaignContactForDay(contactConfig.key, options.executionStepNumber)
        .then((count) => {
          // just to add some padding to format the logs
          const padding = contactConfig.key.length < 45 ? 45 - contactConfig.key.length : 0;
          console.log(`${contactConfig.key + new Array(padding).join(' ')} ${count} data processed`);
          next();
        })
        .catch((err) => {
          console.error(`${contactConfig.key}: sendNextCampaignContactForDay ERROR ${err}`);
          next(err);
        });
    },
    function (err) {
      if (!err) {
        console.log('processed for ' + runner._describeStepNumber(options.executionStepNumber));
      }
      callback(err);
    }
  );
};

runner.run(function (err) {
  if (err) {
    console.log(err);
  }
  process.exit(err ? -1 : 0);
});
