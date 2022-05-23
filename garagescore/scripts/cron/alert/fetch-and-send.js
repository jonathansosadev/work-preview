var app = require('../../../server/server');
var CronRunner = require('../../../common/lib/cron/runner');
/**
 fetch and send alert in the last hour updated surveys
 */

var runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.HOURLY,
  description:
    'Vérifie si les enquêtes récement modifiées contiennent des alertes (insatisfaits, leads ...) + envoi des alertes en attente ',
  forceExecution: process.argv.includes('--force'),
});

runner.execute = function (options, callback) {
  if (!options.executionStepNumber) {
    callback(new Error('option.executionStepNumber not found'));
    return;
  }
  app.models.Alert.fetchAndSend(options.executionStepNumber, callback);
};

runner.run(function (err) {
  if (err) {
    console.log(err);
  }
  process.exit(err ? -1 : 0);
});
