const KPI_PERIODS = require('../../kpi/KpiPeriods');
const KPI_DAILY_PERIODS = require('../../../../../frontend/utils/models/kpi-daily-periods');
const moment = require('moment');
const { uniqBy } = require('lodash');

/**
 * @param {Date[] | string[]} requestedPeriods list of periods to process either a date or a dailyPeriod (YYYYMMDD)
 * @returns {{token: number, min: Date, max: Date}[]} a list of dailyPeriods
 */

module.exports = function _getDailyPeriodsToProcess(requestedPeriods = []) {
  const isValidDate = (date) => date && Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date);

  const periods = [];

  for (const period of requestedPeriods) {
    // checks if the period is not valid
    if (!isValidDate(period) && !KPI_DAILY_PERIODS.isValidPeriodId(period)) {
      throw Error(`Invalid period detected ${period}`);
    }

    const date = isValidDate(period) ? period : moment.utc(period, 'YYYYMMDD').toDate();

    // get all KpiMonthlyPeriod that affect the period
    const kpiMonthlyPeriods = KPI_PERIODS.getPeriodsAffectedByGivenDate(date).map((p) => p.token);

    // convert the KpiMonthlyPeriod to KpiDailyPeriods
    kpiMonthlyPeriods.forEach((kpiPeriodToken) => {
      periods.push(...KPI_DAILY_PERIODS.getPeriodsFromKpiPeriodToken(kpiPeriodToken));
    });
  }

  // remove overlapping periods
  return uniqBy(periods, 'token');
};
