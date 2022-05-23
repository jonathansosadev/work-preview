const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const commonTicket = require('../../../common/models/data/_common-ticket.js');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Envoie les rappels pour les reminders des dossiers Leads et Mécontents.',
  forceExecution: process.argv[2] === '--force',
});

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    try {
      await commonTicket.sendRemindersForGivenDay('lead', options.executionStepNumber);
      await commonTicket.sendRemindersForGivenDay('unsatisfied', options.executionStepNumber);
      callback();
    } catch (err) {
      callback(err);
    }
  };

  runner.run(function (err) {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
