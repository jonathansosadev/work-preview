const moment = require('moment-timezone');
const timeHelper = require('../../util/time-helper');

const absoluteMinimum = moment.utc('2016-01-01T00:00:00.000Z');

const KpiPeriods = {
  isValidMonthlyPeriod(kpiPeriod) {
    if (!Number.isInteger(kpiPeriod)) {
      return false;
    }
    if (kpiPeriod < 197001 || kpiPeriod > 999912) {
      return false;
    }
    const month = kpiPeriod % 100;
    if (month === 0 || month > 12) {
      return false;
    }
    return true;
  },
  getPeriodObjectFromKpiPeriodToken(inKpiPeriodToken) {
    // TODOAnass: comment
    const kpiPeriodToken = parseInt(inKpiPeriodToken, 10);
    const now = moment.utc();
    const minToken = parseInt(absoluteMinimum.format('YYYYMM'));
    const maxToken = parseInt(now.clone().add(1, 'month').format('YYYYMM'));
    if (isNaN(kpiPeriodToken)) return {};

    if (kpiPeriodToken === this.LAST_90_DAYS) {
      return {
        token: this.LAST_90_DAYS,
        min: now.clone().startOf('day').subtract(90, 'day').toDate(),
        max: now.clone().endOf('day').toDate(),
      };
    }

    if (
      kpiPeriodToken < minToken ||
      kpiPeriodToken > maxToken || // Out of boundaries
      kpiPeriodToken % 100 > 12 ||
      kpiPeriodToken % 100 === 0 // Invalid month
    ) {
      return {};
    }
    return {
      token: kpiPeriodToken,
      min: moment.utc(inKpiPeriodToken, 'YYYYMM').startOf('month').toDate(),
      max: moment.utc(inKpiPeriodToken, 'YYYYMM').endOf('month').toDate(),
      isMonthly: true,
    };
  },
  getAllPastPeriods(referenceDate = null) {
    const now = referenceDate ? moment.utc(referenceDate) : moment.utc();
    const periods = [];
    if (moment().diff(now, 'days') < 90) {
      periods.push({
        token: this.LAST_90_DAYS,
        min: now.clone().startOf('day').subtract(90, 'day').toDate(),
        max: now.clone().endOf('day').toDate(),
      });
    }
    for (const date = now; date.isSameOrAfter(absoluteMinimum); date.subtract(1, 'month')) {
      const token = parseInt(`${date.year()}${date.month() + 1 < 10 ? `0${date.month() + 1}` : date.month() + 1}`, 10);
      periods.push({
        token,
        min: date.clone().startOf('month').toDate(),
        max: date.clone().endOf('month').toDate(),
        isMonthly: true,
      });
    }
    return periods;
  },
  getPeriodsAffectedByGivenDate(rawDate) {
    // Let's do some verification
    if (!(rawDate instanceof Date)) {
      throw new Error('The rawDate argument must be an instance of Date');
    }
    // Let's declare what we will need
    const date = moment.utc(rawDate);
    const periods = [];

    // The month
    periods.push({
      token: parseInt(`${date.year()}${date.month() + 1 < 10 ? `0${date.month() + 1}` : date.month() + 1}`, 10),
      min: date.clone().startOf('month').toDate(),
      max: date.clone().endOf('month').toDate(),
      isMonthly: true,
    }); // eslint-disable-line max-len
    // Then the last quarter if it's not too old (90 days)

    const elapsedDays = timeHelper.dayNumber(new Date()) - timeHelper.dayNumber(rawDate);
    if (elapsedDays < 90 && elapsedDays >= 0) {
      const now = moment.utc();
      periods.push({
        token: this.LAST_90_DAYS,
        min: now.clone().startOf('day').subtract(90, 'day').toDate(),
        max: now.clone().endOf('day').toDate(),
      });
    }
    return periods;
  },
  //Migration GarageHistory
  fromKpiPeriodToGhPeriod(period) {
    if (period.isMonthly) {
      const token = `${period.token}`;
      return `${token.substr(0, 4)}-month${token.substr(-2)}`;
    } else if (period.token === this.LAST_90_DAYS) {
      return this.GH_LAST_QUARTER;
    } else if (period.token === this.ALL_HISTORY) {
      return this.GH_ALL_HISTORY;
    }

    return null;
  },
  // transform a string received generally in graphql to one or many values corresponding to the period in DB
  // convertToMonthlyList if true, then year o quarter are converted to a months list
  fromGhPeriodToKpiPeriod(ghPeriod, { convertToMonthlyList } = {}) {
    if (ghPeriod === this.GH_CURRENT_YEAR) {
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
    } else if (ghPeriod === this.GH_LAST_QUARTER) {
      return this.LAST_90_DAYS;
    } else if (ghPeriod === this.GH_LAST_12MONTH) {
      return this.getLast12Months(new Date());
    } else if (ghPeriod.match(this.GH_YEARLY_REGEX)) {
      const year = parseInt(ghPeriod, 10);
      if (convertToMonthlyList) {
        const my = [];
        for (let m = 1; m < 13; m++) {
          my.push(year * 100 + m);
        }
        return my;
      }
      return year;
    } else if (ghPeriod.match(this.GH_QUARTER_REGEX)) {
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
    } else if (ghPeriod.match(this.GH_MONTHLY_REGEX)) {
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
    return this.ALL_HISTORY;
  },
  getPeriodIntervalPeriodList(startPeriod, endPeriod) {
    // If start or end are not monthly periods => return []
    if (!this.isValidMonthlyPeriod(startPeriod) || !this.isValidMonthlyPeriod(endPeriod)) {
      return [];
    }
    const getMonthYearFromPeriodInt = (periodInt) => {
      const month = periodInt % 100;
      const year = Math.floor(periodInt / 100);
      return [month, year];
    };
    if (startPeriod === endPeriod) {
      return [startPeriod];
    }
    if (startPeriod > endPeriod) {
      return this.getPeriodIntervalPeriodList(endPeriod, startPeriod);
    }

    const periodList = [];
    const [startMonth, startYear] = getMonthYearFromPeriodInt(startPeriod);
    const [endMonth, endYear] = getMonthYearFromPeriodInt(endPeriod);
    let [currentMonth, currentYear] = [startMonth, startYear];
    while (true) {
      periodList.push(100 * currentYear + currentMonth);
      if (currentMonth === endMonth && currentYear === endYear) {
        return periodList;
      }
      currentMonth++;
      if (currentMonth > 12) {
        currentYear++;
        currentMonth = 1;
      }
    }
  },
  getMinDayNumberForCurrentLastQuarter() {
    return timeHelper.dayNumber(moment.utc().startOf('day').subtract(90, 'days').toDate());
  },

  getLast12Months(refDate) {
    const now = moment(refDate);
    const getPastPeriod = (offset) => {
      const d = now.clone().subtract(offset, 'month');
      return d.year() * 100 + (d.month() + 1);
    };
    return [...Array(12)].map((e, i) => getPastPeriod(i));
  },

  getLastQuarterMonthlyPeriods() {
    const [start, end] = [moment.utc().startOf('day').subtract(90, 'day'), moment.utc().endOf('day')];
    const result = [];
    const tmp = start.clone();
    while (tmp.isSameOrBefore(end, 'month')) {
      result.push(Number(tmp.format('YYYYMM')));
      tmp.add(1, 'month');
    }
    return result;
  },
  /**
   * Convert a UTC date into a timezoned date
   * @param {{token: String, min: Date, max: Date, isMonthly: boolean}} period
   * @param {String} timezone
   * @returns {{token: String, min: Date, max: Date, isMonthly: boolean}} converted period dates
   */
  convertToTimezonePeriod(period, timezone = 'Europe/Paris') {
    const convertedMin = moment(period.min).tz(timezone);
    const convertedMax = moment(period.max).tz(timezone);

    return {
      ...period,
      min: convertedMin.subtract(convertedMin.utcOffset(), 'minutes').toDate(),
      max: convertedMax.subtract(convertedMax.utcOffset(), 'minutes').toDate(),
    };
  },

  // Legacy periods
  GH_YEARLY_REGEX: /^\d\d\d\d$/,
  GH_QUARTER_REGEX: /^\d\d\d\d-quarter\d$/,
  GH_MONTHLY_REGEX: /^\d\d\d\d-month\d\d$/, // values will be like 2016-month08
  GH_WEEKLY_REGEX: /^\d\d\d\d-week\d{1,2}$/, // values will be like 2016-week26
  GH_DAILY_REGEX: /^\d\d\d\d-\d\d-\d\d$/, // values will be like 2016-05-14
  GH_LAST_QUARTER: 'lastQuarter',
  GH_LAST_12MONTH: 'last12Month',
  GH_CURRENT_YEAR: 'CURRENT_YEAR',
  GH_ALL_HISTORY: 'ALL_HISTORY',
  GH_LEAD_ALL_HISTORY: 'LEAD_ALL_HISTORY',
  GH_UNSATISFIED_ALL_HISTORY: 'UNSATISFIED_ALL_HISTORY',
  // Rolling periods, not frozen in time
  LAST_90_DAYS: 10,
  ALL_HISTORY: 0,
};

module.exports = KpiPeriods;
