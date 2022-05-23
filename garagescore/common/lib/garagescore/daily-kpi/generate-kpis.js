const AsyncPool = require('../../../../scripts/migration/scopes/asyncPool');
const _prepareEntities = require('./utils/_prepare-entities');
const { _calculateKpiForGivenPeriod } = require('./utils/_aggregators');
const _prepareFinalKpis = require('./utils/_prepare-final-kpis');
const _buildBulkwriteFromKpis = require('./utils/_build-bulkwrite-from-kpis');
const _generateMonthlyKpiFromDaily = require('./utils/_generate-monthly-kpi-from-daily');
const _getDailyPeriodsToProcess = require('./utils/_get-daily-periods-to-process');
const { chunkify } = require('./utils/_misc.js');
const KPI_DAILY_PERIODS = require('../../../../frontend/utils/models/kpi-daily-periods');
const { MOMO, time, timeEnd } = require('../../util/log');
const moment = require('moment');
const Logger = require('../../../../scripts/maintenance/kpi/utils/_logger');

async function _generateDailyKpis(app, { periodsToProcess = [], garageIds = [] } = {}) {
  try {
    time(MOMO, '\x1b[32m Done Generating Daily KPIs In \x1b[0m');

    // retrieve the garages and users
    const [garageEntities, userEntities] = await _prepareEntities(app, garageIds);

    // calculate the kpi for each period
    let count = 0;
    let insertedDocuments = 0;
    let updatedDocuments = 0;

    await AsyncPool(10, periodsToProcess, async (period) => {
      const aggregateOutputs = await _calculateKpiForGivenPeriod(
        app,
        period,
        garageIds.map((gId) => gId.toString())
      );
      const toUpsert = _prepareFinalKpis({ period, aggregateOutputs, garageEntities, userEntities });

      if (!toUpsert.length) {
        count++;
        return Logger.info(`Processed period : ${period.token} (${count} / ${periodsToProcess.length})`);
      }
      for (const chunk of chunkify(toUpsert, 1000)) {
        const { nUpserted = 0, nModified = 0 } = await app.models.KpiByDailyPeriod.getMongoConnector().bulkWrite(
          _buildBulkwriteFromKpis(chunk),
          {
            ordered: false,
          }
        );
        insertedDocuments += nUpserted;
        updatedDocuments += nModified;
      }
      count++;
      return Logger.info(`Processed period : ${period.token} (${count} / ${periodsToProcess.length})`);
    });

    Logger.success(`----------- Collection : kpiByDailyPeriod -----------`);
    Logger.success(`\t - Inserted : ${insertedDocuments}`);
    Logger.success(`\t - Updated : ${updatedDocuments}`);
    Logger.success(`-----------------------------------------------------`);

    timeEnd(MOMO, '\x1b[32m Done Generating Daily KPIs In \x1b[0m');

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error };
  }
}

async function _generateMonthlyKpis(app, { periodsToProcess = [], garageIds = [] } = {}, mep, endMep) {
  try {
    time(MOMO, '\x1b[32m Done Generating Monthly KPIs In \x1b[0m');

    Logger.info(`Converting daily Kpi's to monthly Kpi's ...`);

    Logger.success(`------------- Collection : kpiByPeriod --------------`);
    await _generateMonthlyKpiFromDaily(
      app,
      periodsToProcess.map((periodId) => periodId.token),
      garageIds,
      mep,
      endMep
    );
    Logger.success(`-----------------------------------------------------`);
    timeEnd(MOMO, '\x1b[32m Done Generating Monthly KPIs In \x1b[0m');

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error };
  }
}

/**
 * since we use a $merge with replace when converting daily to monthly, we need to make sure that we compute the full month
 * @param {{token : number, min : Date, max : Date}[]} periods
 * @returns {{token : number, min : Date, max : Date}[]} - the periods with full months
 */

function addDailyPeriodsToGetFullMonths(periods = []) {
  const uniqueMonths = [...new Set(periods.map((p) => `${p.token}`.slice(0, 6)))];
  const today = moment.utc().format('YYYYMMDD');
  return uniqueMonths
    .map(KPI_DAILY_PERIODS.getPeriodsFromKpiPeriodToken)
    .flat()
    .filter((period) => Number(period.token) <= Number(today));
}

/**
 * @param {object} app - the app instance
 * @param {periods: number[] | string[] | Date[], garageIds?: string[], mode? : "all" | "monthly" | "daily"} - periods : either a Date or a KpiDailyPeriod (YYYYMMDD). garageIds:  the list of garage ids to process. mode: default to 'all'. 'monthly' will generate only monthly kpi's, 'daily' will generate only daily kpi's.
 * @returns { success: boolean, error: Error | null}
 */

module.exports = async function generateKpis(app, { periods = [], garageIds = [], mode = 'all', mep, endMep } = {}) {
  const MODES = {
    all: 'all',
    daily: 'daily',
    monthly: 'monthly',
  };

  try {
    time(MOMO, '\x1b[32m Done Generating KPIs In \x1b[0m');

    if (!periods || !periods.length || !Array.isArray(periods)) {
      throw Error('periods must be an non empty array');
    }

    if (!(mode in MODES)) {
      throw Error(`mode must be one of ${Object.values(MODES)}`);
    }

    let periodsToProcess = _getDailyPeriodsToProcess(periods);

    if (mode === MODES.all || mode === MODES.daily) {
      const { success, error } = await _generateDailyKpis(app, { periodsToProcess, garageIds });

      if (!success) {
        throw error;
      }
    }

    if (mode === MODES.all || mode === MODES.monthly) {
      if (mode === MODES.monthly) {
        Logger.warn(
          "*** Generating only monthly KPIs, this assume that all the daily's KPIs are already generated ***"
        );
      }
      periodsToProcess = addDailyPeriodsToGetFullMonths(periodsToProcess);

      const { success: successMonthly, error: errorMonthly } = await _generateMonthlyKpis(
        app,
        {
          periodsToProcess,
          garageIds,
        },
        mep,
        endMep
      );

      if (!successMonthly) {
        throw errorMonthly;
      }
    }

    timeEnd(MOMO, '\x1b[32m Done Generating KPIs In \x1b[0m');

    return { success: true, error: null };
  } catch (error) {
    Logger.error(`[generateKpis] error while generating KPIs : ${error}`);
    return { success: false, error: error };
  }
};
