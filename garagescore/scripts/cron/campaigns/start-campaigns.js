'use strict';

/** Run waiting campaign(s),
If no args is provided only campaign with 'New' status will be run
else with the status = first arg
 with a 'New' Status
Add --force as a second arg to run it outside the cronRunner
 */

var app = require('../../../server/server');
var Campaign = app.models.Campaign;
var gsCampaignStatus = require('../../../common/models/campaign.status');
var CronRunner = require('../../../common/lib/cron/runner');

function main(status, callback) {
  Campaign.count({ status: status }, function (countErr, count) {
    if (countErr) {
      console.error(countErr);
      callback(countErr);
      return;
    }
    console.log('[Campaigns start] Start (' + count + " campaign(s) with status = '" + status + "')");
    var task = '[Campaigns start] Time to start ' + count + ' campaign(s)';
    console.time(task);
    Campaign.startAll(status, function (err, ok, ko) {
      console.timeEnd(task);
      if (err) {
        console.error('[Campaigns start] Error');
        console.error(err);
        callback(err);
        return;
      }
      console.log('[Campaigns start] Done');
      console.log('[Campaigns start] Campaigns OK ' + ok);
      console.log('[Campaigns start] Campaigns KO ' + ko);
      callback();
    });
  });
}

app.on('booted', function () {
  if (process.argv.length >= 4 && process.argv[3] === '--force') {
    // running outside of cron
    console.log('[Start Campaigns] Running without cronRunner');
    var s = process.argv.length >= 3 ? process.argv[2] : gsCampaignStatus.NEW;
    main(s, function (err) {
      if (err) {
        console.log(err);
      }
      process.exit(err ? -1 : 0);
    });
  } else {
    console.log('[Start Campaigns] Running inside cronRunner');
    var status = process.argv.length >= 3 ? process.argv[2] : gsCampaignStatus.NEW;
    var runner = new CronRunner({
      frequency:
        status === gsCampaignStatus.NEW
          ? CronRunner.supportedFrequencies.DAILY
          : CronRunner.supportedFrequencies.HOURLY,
      description: 'Lancement des campagnes en status ' + status,
    });
    runner.execute = function (options, callback) {
      main(status, callback);
    };
    runner.run(function (err) {
      if (err) {
        console.log(err);
      }
      process.exit(err ? -1 : 0);
    });
  }
});
