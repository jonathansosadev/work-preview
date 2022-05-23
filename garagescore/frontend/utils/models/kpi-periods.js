const moment = require('moment');

const KpiPeriods = {
  fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList }) {
    if (ghPeriod === KpiPeriods.GH_CURRENT_YEAR) {
      const year = moment.utc().year();
      const month = moment.utc().month() + 1; // moment starts at 0 while we start at 1
      if (convertToMonthlyList) {
        const my = [];
        for (let m = 1; m <= month; m++) {
          my.push(year * 100 + m);
        }
        return my;
      }
      return moment.utc().year();
    } else if (ghPeriod === KpiPeriods.GH_LAST_QUARTER) {
      return KpiPeriods.LAST_90_DAYS;
    } else if (ghPeriod.match(KpiPeriods.GH_YEARLY_REGEX)) {
      const year = parseInt(ghPeriod, 10);
      if (convertToMonthlyList) {
        const my = [];
        for (let m = 1; m < 13; m++) {
          my.push(year * 100 + m);
        }
        return my;
      }
      return year;
    } else if (ghPeriod.match(KpiPeriods.GH_QUARTER_REGEX)) {
      const quarter = ghPeriod.replace('-quarter', '');
      const year = parseInt(quarter.substr(0, 4), 10);
      const q = parseInt(quarter[4], 10);
      if (convertToMonthlyList) {
        switch (q) {
          case 1:
            return [year * 100 + 1, year * 100 + 2, year * 100 + 3];
          case 2:
            return [year * 100 + 4, year * 100 + 5, year * 100 + 6];
          case 3:
            return [year * 100 + 7, year * 100 + 8, year * 100 + 9];
          case 4:
            return [year * 100 + 10, year * 100 + 11, year * 100 + 12];
          default:
            return [year * 100 + 10, year * 100 + 11, year * 100 + 12];
        }
      }
      return quarter;
    } else if (ghPeriod.match(KpiPeriods.GH_MONTHLY_REGEX)) {
      return parseInt(ghPeriod.replace('-month', ''), 10);
    }
    if (convertToMonthlyList) {
      let allMonths = [];
      for (let year = 2016; year <= new Date().getFullYear(); year++) {
        const my = [
          year * 100 + 1,
          year * 100 + 2,
          year * 100 + 3,
          year * 100 + 4,
          year * 100 + 5,
          year * 100 + 6,
          year * 100 + 7,
          year * 100 + 8,
          year * 100 + 9,
          year * 100 + 10,
          year * 100 + 11,
          year * 100 + 12,
        ];
        allMonths = [...allMonths, ...my];
      }
      return allMonths;
    }
    return KpiPeriods.ALL_HISTORY;
  },
  getLast12Months(refDate) {
    const now = moment(refDate);
    const getPastPeriod = (offset) => {
      const d = now.clone().subtract(offset, 'month');
      return d.year() * 100 + (d.month() + 1);
    };
    return [...Array(12)].map((e, i) => getPastPeriod(i));
  },
  fromGhPeriodToChartPeriods(ghPeriod, refDate = new Date().setMonth(new Date().getMonth())) {
    let periods = [];
    if (ghPeriod === this.GH_CURRENT_YEAR || ghPeriod === this.GH_ALL_HISTORY) {
      /* return last 12 months */
      periods = this.getLast12Months(moment(refDate).subtract(1, 'month'));
    } else if (ghPeriod === this.GH_LAST_QUARTER) {
      /* temporary : we hide the current month until GH is completely migrated */
      /* we also hide the n-1 month until the 10 of the month */
      let offset = 1;
      const currentDayOfTheMonth = moment(refDate).date();
      if (currentDayOfTheMonth < 10) {
        offset = 2;
      }
      periods = KpiPeriods.getLast12Months(moment(refDate).subtract(offset, 'month'));
      /* we need the current month (even unfinished) and the last 11 months */
      // periods = this.getLast12Months(refDate);
    } else if (ghPeriod.match(this.GH_YEARLY_REGEX)) {
      /* return the 12 months of the selected year */
      periods = this.fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList: true });
    } else if (ghPeriod.match(this.GH_MONTHLY_REGEX)) {
      const month = ghPeriod.split('-month').join('');
      periods = this.getLast12Months(moment(month, 'YYYYMM'));
    } else if (ghPeriod.match(this.GH_QUARTER_REGEX)) {
      const quarter = this.fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList: true });
      const lastMonth = quarter.pop();
      periods = this.getLast12Months(moment(lastMonth, 'YYYYMM'));
    }
    return periods.reverse();
  },
  // Legacy periods
  GH_YEARLY_REGEX: /^\d\d\d\d$/,
  GH_QUARTER_REGEX: /^\d\d\d\d-quarter\d$/,
  GH_MONTHLY_REGEX: /^\d\d\d\d-month\d\d$/, // values will be like 2016-month08
  GH_WEEKLY_REGEX: /^\d\d\d\d-week\d{1,2}$/, // values will be like 2016-week26
  GH_DAILY_REGEX: /^\d\d\d\d-\d\d-\d\d$/, // values will be like 2016-05-14
  GH_LAST_QUARTER: 'lastQuarter',
  GH_CURRENT_YEAR: 'CURRENT_YEAR',
  GH_ALL_HISTORY: 'ALL_HISTORY',
  GH_LEAD_ALL_HISTORY: 'LEAD_ALL_HISTORY',
  GH_UNSATISFIED_ALL_HISTORY: 'UNSATISFIED_ALL_HISTORY',
  // Rolling periods, not frozen in time
  LAST_90_DAYS: 10,
  ALL_HISTORY: 0,
  MONTHLY_FORMAT: 'YYYYMM',
};

export { KpiPeriods };
