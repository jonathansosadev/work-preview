/*
  Script updating the cockpit top filters interdependencies
*/

const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const { resetAndInit } = require('../../../common/lib/garagescore/api/cockpit-top-filters.js');

app.on('booted', () => {
  console.log('[Cockpit Top Filters] Running inside cronRunner');
  const runner = new CronRunner({
    frequency: CronRunner.supportedFrequencies.DAILY,
    description: 'Actualisation des filtres Cockpits',
    forceExecution: process.argv.includes('--force'),
  });
  runner.execute = (options, callback) => {
    resetAndInit(app, callback);
  };
  runner.run((err) => {
    err ? console.log(err) : console.log('Actualisation des filtres Cockpits terminé sans un pépin'); // eslint-disable-line
    process.exit(err ? -1 : 0);
  });
});
