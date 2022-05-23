const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const { FED, log } = require('../../../common/lib/util/log');
const automationCrossedLeadsHandler = require('../../../common/lib/garagescore/automation/automation-crossed-leads-handler');

const intro = '[Automation CRON - Find converted & Crossed Leads] :';

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Croise les leads et les ventes pour Automation.',
  forceExecution: process.argv.includes('--force'),
});

process.on('unhandledRejection', (error) => {
  log.error(FED, 'unhandledRejection', error);
  if (!error.toString().includes('MongoError: ns not found')) {
    process.exit(-1);
  }
});

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    try {
      const forcedDayNumber =
        process.argv.includes('--dayNumber') && process.argv[process.argv.indexOf('--dayNumber') + 1];
      const dayNumber = forcedDayNumber || options.executionStepNumber;

      if (isNaN(dayNumber)) {
        throw new Error(`${dayNumber} is not a valid value for dayNumber.`);
      }

      log.info(FED, `${intro} Running For DayNumber ${dayNumber}`);
      await automationCrossedLeadsHandler.generateConvertedAndCrossedEvents(process.argv.includes('--reset'));
      callback();
    } catch (e) {
      log.error(FED, `${intro} ERROR : ${e}`);
      callback();
    }
  };

  runner.run((err) => {
    if (err) {
      log.error(FED, err);
    }
    process.exit(err ? -1 : 0);
  });
});
