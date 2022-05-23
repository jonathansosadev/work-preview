const app = require('../../../server/server');
const { MOMO, log } = require('../../../common/lib/util/log');
const CronRunner = require('../../../common/lib/cron/runner');
const recurringExport = require('../../../common/lib/garagescore/cockpit-exports/cron/recurringExport');
const ArgParser = require('minimist');
const { ExportFrequencies } = require('../../../frontend/utils/enumV2');
const timeHelper = require('../../../common/lib/util/time-helper');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: "Récupère les export récurrents à envoyer aujourd'hui et les envois",
  forceExecution: process.argv.includes('--force'),
});

const frequencies = [
  { name: ExportFrequencies.EVERY_DAY, shouldSendExport: () => true },
  { name: ExportFrequencies.EVERY_WEEK_ON_MONDAY, shouldSendExport: (date) => date.getDay() === 1 },
  { name: ExportFrequencies.EVERY_MONTH_ON_10, shouldSendExport: (date) => date.getDate() === 10 },
];

app.on('booted', async () => {
  runner.execute = async (options, finalCallback) => {
    const args = ArgParser(process.argv.slice(2), {
      string: ['stepNumber'],
      default: { stepNumber: timeHelper.dayNumber(new Date()) },
    });
    //check if it's a valid number
    args.stepNumber = +args.stepNumber;
    if (Number.isNaN(args.stepNumber)) {
      return finalCallback(new Error('Invalid stepNumber'));
    }
    //if (process.argv.slice(2).find((arg) => arg.startsWith('--stepNumber'))) {
    //  console.log('\x1b[31m', 'Forced stepNumber is not supported for the moment', '\x1b[0m');
    //}

    //const args = {
    //  stepNumber: timeHelper.dayNumber(new Date()),
    //};

    log.info(MOMO, `Running CRON with day number : ${args.stepNumber}`);
    const frequenciesToSend = frequencies
      .filter((frequency) => frequency.shouldSendExport(timeHelper.dayNumberToDate(+args.stepNumber)))
      .map((frequency) => frequency.name);

    return recurringExport(app, frequenciesToSend).then(finalCallback).catch(finalCallback);
  };

  runner.run((err) => {
    if (err) {
      log.error(MOMO, `[CRON-RECURRENT-EXPORT]: ${err}`);
      console.log(err);
    }
    console.log('bye');
    process.exit(err ? -1 : 0);
  });
});
