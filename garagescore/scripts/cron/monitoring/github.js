/** Send alerts if our database contains */
const CronRunner = require('../../../common/lib/cron/runner');
const githubMonitoring = require('../../../common/lib/github/monitoring');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Check issues and pr status on github, and send reports on Slack',
  forceExecution: process.argv.includes('--force'),
});

runner.execute = async (options, finalCallback) => {
  githubMonitoring().then(finalCallback).catch(finalCallback);
};

runner.run((err) => {
  if (err) {
    console.log(err);
  }
  console.log('bye');
  process.exit(err ? -1 : 0);
});
