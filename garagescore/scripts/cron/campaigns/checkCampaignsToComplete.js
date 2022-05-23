var app = require('../../../server/server');
var CronRunner = require('../../../common/lib/cron/runner');
/**
Complete campaigns
Must be run every day
*/

var runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.DAILY,
});
console.log('Checking if some campaigns had contacts to be complete...');
runner.execute = function (options, callback) {
  if (!options.executionStepNumber) {
    callback(new Error('option.executionStepNumber not found'));
    return;
  }
  app.models.Campaign.checkCampaignsToComplete(options.executionStepNumber, function (err, count) {
    if (!err) {
      console.log('processed campaigns ' + count + ' for ' + runner._describeStepNumber(options.executionStepNumber));
    }
    callback(err, count);
  });
};

runner.run(function (err) {
  if (err) {
    console.log(err);
  }
  process.exit(err ? -1 : 0);
});
