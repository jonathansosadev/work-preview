const moment = require('moment');
const KpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');

module.exports = {
  fromGhPeriodToChartKpiPeriods(ghPeriod, refDate = new Date().setMonth(new Date().getMonth())) {
    let periods = [];
    /* return last 12 months */
    if (ghPeriod === KpiPeriods.GH_CURRENT_YEAR || ghPeriod === KpiPeriods.GH_ALL_HISTORY) {
      periods = KpiPeriods.getLast12Months(moment(refDate).subtract(1, 'month'));
    } else if (ghPeriod === KpiPeriods.GH_LAST_QUARTER) {
      /* temporary : we hide the current month until GH is completely migrated */
      /* we also hide the n-1 month until the 10 of the month */
      let offset = 1;
      const currentDayOfTheMonth = moment(refDate).date();
      if (currentDayOfTheMonth < 10) {
        offset = 2;
      }
      periods = KpiPeriods.getLast12Months(moment(refDate).subtract(offset, 'month'));

      /* we need the current month (even unfinished) and the last 11 months */
      // periods = KpiPeriods.getLast12Months(refDate);
    } else if (ghPeriod.match(KpiPeriods.GH_YEARLY_REGEX)) {
      periods = KpiPeriods.fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList: true });
    } else if (ghPeriod.match(KpiPeriods.GH_MONTHLY_REGEX)) {
      const month = ghPeriod.split('-month').join('');
      periods = KpiPeriods.getLast12Months(moment(month, 'YYYYMM'));
    } else if (ghPeriod.match(KpiPeriods.GH_QUARTER_REGEX)) {
      const quarter = KpiPeriods.fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList: true });
      const lastMonth = quarter.pop();
      periods = KpiPeriods.getLast12Months(moment(lastMonth, 'YYYYMM'));
    }

    const res = periods.reverse();
    return res;
  },
  fromGhPeriodToChartGhPeriods(ghPeriod, refDate = new Date().setMonth(new Date().getMonth())) {
    let periods = [];
    /* return last 12 months */
    if (ghPeriod === GarageHistoryPeriod.CURRENT_YEAR || ghPeriod === GarageHistoryPeriod.ALL_HISTORY) {
      periods = GarageHistoryPeriod.getLast12Months(moment(refDate).subtract(1, 'month'));
    } else if (ghPeriod === GarageHistoryPeriod.LAST_QUARTER) {
      /* temporary : we hide the current month until GH is completely migrated */
      /* we also hide the n-1 month until the 10 of the month */
      let offset = 1;
      const currentDayOfTheMonth = moment(refDate).date();
      if (currentDayOfTheMonth < 10) {
        offset = 2;
      }
      periods = GarageHistoryPeriod.getLast12Months(moment(refDate).subtract(offset, 'month'));
      /* we need the current month (even unfinished) and the last 11 months */
      // periods = GarageHistoryPeriod.getLast12Months(refDate);
    } else if (ghPeriod.match(GarageHistoryPeriod.YEARLY_REGEX)) {
      periods = KpiPeriods.fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList: true }).map((p) =>
        moment(p, 'YYYYMM').format(GarageHistoryPeriod.MONTHLY_FORMAT)
      );
    } else if (ghPeriod.match(GarageHistoryPeriod.MONTHLY_REGEX)) {
      const month = ghPeriod.split('-month').join('');
      periods = GarageHistoryPeriod.getLast12Months(moment(month, GarageHistoryPeriod.MONTHLY_FORMAT));
    } else if (ghPeriod.match(GarageHistoryPeriod.QUARTER_REGEX)) {
      const quarter = KpiPeriods.fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList: true });
      const lastMonth = quarter.pop();
      periods = GarageHistoryPeriod.getLast12Months(moment(lastMonth, GarageHistoryPeriod.MONTHLY_FORMAT));
    }
    return periods.reverse();
  },
};
