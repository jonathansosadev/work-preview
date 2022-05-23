const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Ferme les tickets qui ont été convertis automatiquement.',
  forceExecution: process.argv[2] === '--force',
});

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    try {
      await app.models.Data.leadTicket_closeTicketsConvertedToSale();
      callback();
    } catch (err) {
      callback(err);
    }
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
