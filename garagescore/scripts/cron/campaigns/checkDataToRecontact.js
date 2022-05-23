var app = require('../../../server/server');
var CronRunner = require('../../../common/lib/cron/runner');
/**
 Send recontacts
 Must be run every day
 */

var runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.DAILY,
  description:
    "Vérifie et traite les RE-contacts (emails et sms), en attente de création, qui doivent être envoyés aujourd'hui",
});
console.log('Checking if some campaignItems had recontacts to be send...');

app.on('booted', () => {
  runner.execute = async function (options, callback) {
    if (!options.executionStepNumber) {
      callback(new Error('option.executionStepNumber not found'));
      return;
    }
    
    try {
      const count = await app.models.Data.campaign_sendReContactForDay(options.executionStepNumber);
      console.log(
        'processed ' + count + ' campaignItems for ' + runner._describeStepNumber(options.executionStepNumber)
      );
      callback();
    } catch (err) {
      callback(err);
    };
  };

  runner.run(function (err) {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
