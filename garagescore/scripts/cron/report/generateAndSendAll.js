const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const { ANASS, log } = require('../../../common/lib/util/log');
const ReportConfigTypes = require('../../../common/models/report-config.type');

const runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Génère et envoie les rapports clients journaliers, hebdomadaires et mensuels.',
  forceExecution: process.argv.includes('--force'),
});

/**
 * This CRON does not compute anything, it just send reports
 * Without any argument it will try send to send every report, Daily, Weekly and Monthly
 * You can launch this CRON from the 11th of each month
 * If you launch it several time within a month it will only send the reports the first time
 */
const _parseArgs = (args) => {
  const monthlySummaryOnly = args.includes('--monthlySummary');
  const erratum = args.includes('--erratum');

  let usersList = null;
  const forcedUserArg = args.find((arg) => arg.indexOf('--user=') === 0);
  if (forcedUserArg) {
    const usersListStr = forcedUserArg.split('=').pop();
    usersList = usersListStr.split(',').filter((uId) => uId.length === 24);
  }

  const forcedDayNumber = args.includes('--dayNumber') && args[args.indexOf('--dayNumber') + 1];
  // lead / leadVo / leadVn / unsatisfiedApv / unsatisfiedVo / unsatisfiedVn / UnsatisfiedVI
  let specificReport = args.includes('--specificReport') && args[args.indexOf('--specificReport') + 1];
  if (!ReportConfigTypes.values().includes(specificReport)){
    specificReport = null;
  }

  return {
    monthlySummaryOnly,
    erratum,
    usersList,
    forcedDayNumber,
    specificReport,
  };
};

const hasMontlhySummaryBeenValidated = async (app, date) => {
  // Not so clean but...
  const monthToCheck = (12 + date.getMonth() - 1) % 12;
  const yearToCheck = date.getMonth() > 0 ? date.getFullYear() : date.getFullYear() - 1;
  return new Promise((res) => {
    app.models.Configuration.getMonthlySummaryValidations((err, monthlySummaryValidations) => {
      if (err || !monthlySummaryValidations) {
        log.error(ANASS, err || 'No validations found in config');
        res(false);
        return;
      }
      const isValidated = monthlySummaryValidations.find(
        ({ year, month }) => year === yearToCheck && month === monthToCheck
      );
      res(!!isValidated);
    });
  });
};

runner.execute = async (options, callback) => {
  const { monthlySummaryOnly, erratum, usersList, forcedDayNumber, specificReport } = _parseArgs(process.argv);

  const dayNumberToRun = forcedDayNumber || options.executionStepNumber;
  if (forcedDayNumber) {
    console.log(
      `LISTEN TO ME !!!!!!!! forcedDayNumber is on, we used ${dayNumberToRun} step number instead of ${options.executionStepNumber}. Don't worry.`
    );
  }
  if (!dayNumberToRun) {
    callback(new Error('option.executionStepNumber not found'));
    return;
  }
  try {
    const date = timeHelper.dayNumberToDate(dayNumberToRun);
    const monthlySummaryGo = await hasMontlhySummaryBeenValidated(app, date);

    await app.models.Report.generateAndSendAllReports({
      monthlySummaryOnly,
      erratum,
      usersList,
      date,
      monthlySummaryGo,
      specificReport,
    });

    callback();
    if (forcedDayNumber) process.exit(0);
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
