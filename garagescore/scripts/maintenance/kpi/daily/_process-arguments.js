const ArgParser = require('minimist');
const Logger = require('../utils/_logger');
const KPI_DAILY_PERIODS = require('../../../../frontend/utils/models/kpi-daily-periods');
const moment = require('moment');
const KPI_PERIODS = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const { uniqBy } = require('lodash');
const { ObjectId } = require('mongodb');

/**
 * the aim is to convert a KpiPeriod or a KpiDailyPeriod to a KpiPeriod object {toke, min , max}
 * if the periodId is a KpiPeriod => we convert it to a list of KpiDailyPeriod
 * @param {string[]} periodIds can be either a kpiDailyPeriod or a kpiPeriod
 * @returns {{token: number, min: Date, max: Date}[]} a list of KpiPeriod object
 */

function processPeriodIds(periodIds = []) {
  const periods = [];
  const periodsTokenInLastQuarter = KPI_DAILY_PERIODS.getPeriodsFromKpiPeriodToken(10).map((p) => p.token);

  for (const period of periodIds) {
    //lastQuarter
    if (period === 10) {
      periods.push(...periodsTokenInLastQuarter.map(KPI_DAILY_PERIODS.buildPeriodObject));
      continue;
    }
    // kpi monthly period
    if (KPI_PERIODS.isValidMonthlyPeriod(Number(period))) {
      const dailyPeriods = KPI_DAILY_PERIODS.getPeriodsFromKpiPeriodToken(period);
      periods.push(...dailyPeriods);
      // if the kpi period affect the lastQuarter
      const dailyPeriodsToken = dailyPeriods.map((p) => p.token);
      if (dailyPeriodsToken.some((p) => periodsTokenInLastQuarter.includes(p))) {
        periods.push(...periodsTokenInLastQuarter.map(KPI_DAILY_PERIODS.buildPeriodObject));
      }

      continue;
    }
    // kpi daily period
    if (KPI_DAILY_PERIODS.isValidPeriodId(period)) {
      periods.push(KPI_DAILY_PERIODS.buildPeriodObject(period));

      // if the kpi daily period affect the lastQuarter
      if (periodsTokenInLastQuarter.includes(Number(period))) {
        periods.push(...periodsTokenInLastQuarter.map(KPI_DAILY_PERIODS.buildPeriodObject));
      }
      continue;
    }

    // the period is not valid
    throw Error(`Invalid period detected ${period}`);
  }

  // remove overlapping periods
  return uniqBy(periods, 'token');
}

/**
 * Generate all periods since 2016
 * @returns {{token: number, min: Date, max: Date}[]} a list of KpiPeriod object
 */
function generateAllPeriods() {
  const minDate = moment.utc('201601', 'YYYYMM').toDate();
  const maxDate = moment.utc().endOf('day').toDate();

  return KPI_DAILY_PERIODS.getPeriodsBetweenDates(minDate, maxDate);
}

function help() {
  Logger.info(`
    Usage: node scripts/maintenance/kpi/daily/reset-and-generate-all-kpi-by-day.js [options]
    Options:
      --garageIds=<garageIds>        : comma separated list of garage ids to process
      --periodIds=<periodId | All>   : the periodIds to process with format (YYYYMM or YYYYMMDD) (example : periodIds="20220228,202201" or periodIds="all")
      --mode=<mode>                  : The mode can be "daily" (will generate only daily periods) or "monthly" (will generate only monthly) or "all" (default: "all")
      --today                        : Will generate all periods by today (example : --today)
      --help                         : display this help
  `);
}

module.exports = function _processArguments(argv = []) {
  const processedArgs = ArgParser(argv, {
    string: ['periodIds', 'garageIds', 'mode'],
    boolean: ['today', 'help', 'mep', 'endMep'],
    default: {
      mode: 'all',
      today: false,
      mep: false,
      endMep: false,
    },
    unknown: (arg) => {
      Logger.error(`The argument "${arg}" is not recognized, use --help for more information`);
      process.exit(1);
    },
  });

  if (processedArgs.help) {
    help();
    process.exit(0);
  }

  if (!['all', 'daily', 'monthly'].includes(processedArgs.mode)) {
    Logger.error(`The mode "${processedArgs.mode}" is not recognized`);
    help();
    process.exit(1);
  }

  if ('garageIds' in processedArgs) {
    processedArgs.garageIds = processedArgs.garageIds.split(',').map((gId) => gId.trim());
    if (!processedArgs.garageIds.every(ObjectId.isValid)) {
      Logger.error('Invalid garageIds detected');
      help();
      process.exit(1);
    }
  }

  //must specifiy a period or the argument "today"
  if (!('periodIds' in processedArgs) && !processedArgs.today) {
    Logger.error(`You must specify a periodIds or the argument "today"`);
    help();
    process.exit(1);
  }

  // cannot use "periodIds" argument along with "today"
  if ('periodIds' in processedArgs && processedArgs.today) {
    Logger.error('Cannot use --periodIds and --today at the same time');
    help();
    process.exit(1);
  }

  // periodIds cannot be empty
  if ('periodIds' in processedArgs && !processedArgs.periodIds.length) {
    Logger.error('Cannot use --periodIds without any period');
    help();
    process.exit(1);
  }

  // log arguments used
  Logger.info(`Arguments used: `);
  Logger.info(`\t - mode : ${processedArgs.mode}`);
  if (processedArgs.today) {
    Logger.info(`\t - today : ${processedArgs.today}`);
  }

  // if periodIds are provided, process them
  if ('periodIds' in processedArgs) {
    if (processedArgs.periodIds.includes('all')) {
      processedArgs.periodIds = generateAllPeriods();
      Logger.info(`\t - periodIds: all`);
    } else {
      const periodIds = processedArgs.periodIds.split(',').map((id) => id.trim());
      processedArgs.periodIds = processPeriodIds(periodIds);
      Logger.info(
        `\t - periodIds: ${processedArgs.periodIds
          .map((p) => Number(p.token))
          .sort((a, b) => a - b)
          .join(', ')}`
      );
    }
  }

  // generate all period affected by today
  if (processedArgs.today) {
    processedArgs.periodIds = processPeriodIds([moment.utc().startOf('day').format('YYYYMMDD')]);
    Logger.info(
      `\t - periodIds: ${processedArgs.periodIds
        .map((p) => Number(p.token))
        .sort((a, b) => a - b)
        .join(', ')}`
    );
  }

  return processedArgs;
};
