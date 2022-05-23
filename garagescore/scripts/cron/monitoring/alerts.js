/** Send alerts if our database contains */
const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');

const alerts = require('../../../common/lib/garagescore/monitoring/alerts');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Vérifie les données en BDD et envoie des alertes sur Slack',
  forceExecution: process.argv.includes('--force'),
});

let batch = 'NIGHT';

process.argv.forEach((arg) => {
  if (arg.includes('--batch=')) {
    batch = arg.replace('--batch=', '');
  }
});

runner.execute = async (options, finalCallback) => {
  alerts(app, batch).then(finalCallback).catch(finalCallback);
};

runner.run((err) => {
  if (err) {
    console.log(err);
  }
  console.log('bye');
  process.exit(err ? -1 : 0);
});
