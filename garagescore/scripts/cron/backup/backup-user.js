/* Check the latest updated users and store them in another collection */

const app = require('../../../server/server');

const CronRunner = require('../../../common/lib/cron/runner');
const { backup } = require('../../../common/lib/backup/backup-updated-users');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.HOURLY,
  description: 'Backup locale des utilisateurs dernièrement modifiés',
  forceExecution: process.argv.includes('--force'),
});

app.on('booted', async () => {
  runner.execute = async (options, callback) => {
    try {
      callback(null, await backup());
    } catch (e) {
      callback(e);
    }
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
