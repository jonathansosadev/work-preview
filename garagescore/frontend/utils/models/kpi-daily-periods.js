/*
  This file is used in the backend, DO NOT USE IMPORT/EXPORT STATEMENTS
*/

const moment = require('moment');

const KpiDailyPeriods = {
  KPI_DAILY_PERIOD_REGEX: /^\d{8}$/,
  KPI_DAILY_PERIOD_FORMAT: 'YYYYMMDD',

  /**
   * The period id is a string of 8 digits, representing the date in the format YYYYMMDD
   * @param {number} periodId format YYYYMMDD
   * @returns {boolean} is valid period token
   */
  isValidPeriodId(periodId = null) {
    if (!periodId) {
      return false;
    }
    const str = `${periodId}`;
    return Boolean(KpiDailyPeriods.KPI_DAILY_PERIOD_REGEX.test(str) && moment.utc(str, 'YYYYMMDD').isValid());
  },

  /**
   * The period token is saved in db as a number
   * @param {number} periodId format YYYYMMDD
   * @returns {boolean} is valid period token
   */
  isValidPeriodToken(periodToken = null) {
    if (!periodToken || !Number.isInteger(periodToken)) {
      return false;
    }

    return KpiDailyPeriods.isValidPeriodId(periodToken.toString());
  },

  /**
   * The period token is saved in db as a number
   * @param {string|number} periodId format YYYYMMDD
   * @returns {{token : number, min : Date, max : Date} | null} the period object
   */
  buildPeriodObject(periodId = null) {
    if (!periodId || !KpiDailyPeriods.isValidPeriodId(periodId.toString())) {
      return null;
    }

    const date = moment.utc(periodId, KpiDailyPeriods.KPI_DAILY_PERIOD_FORMAT);

    return {
      token: Number(periodId),
      min: date.startOf('day').toDate(),
      max: date.endOf('day').toDate(),
    };
  },

  /**
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {{token : number, min : Date, max : Date}[] | null} periods between startDate and endDate
   */
  getPeriodsBetweenDates(startDate = null, endDate = null) {
    if (!startDate || !endDate) {
      return null;
    }

    const now = moment.utc(startDate).clone();
    const periodIds = [];
    while (now.isSameOrBefore(endDate)) {
      periodIds.push(now.format(KpiDailyPeriods.KPI_DAILY_PERIOD_FORMAT));
      now.add(1, 'days');
    }

    return periodIds.map(KpiDailyPeriods.buildPeriodObject);
  },

  /**
   * @param {string} periodToken a KpiPeriod token (YYYYMM or 10 for lastQuarter)
   * @returns {{token : number, min : Date, max : Date}[] | null} periods between startDate and endDate
   */

  getPeriodsFromKpiPeriodToken(periodToken = null) {
    if (!periodToken) {
      return null;
    }

    if (periodToken === 10) {
      const [start, end] = [
        moment.utc().startOf('day').subtract(90, 'day').toDate(),
        moment.utc().endOf('day').toDate(),
      ];
      return KpiDailyPeriods.getPeriodsBetweenDates(start, end);
    }

    const date = moment.utc(`${periodToken}`, 'YYYYMM');
    const startOfMonth = date.startOf('month').toDate();
    const endOfMonth = date.endOf('month').toDate();

    return KpiDailyPeriods.getPeriodsBetweenDates(startOfMonth, endOfMonth);
  },

  /**
   * compute the min/max kpiDailyPeriods for the given report period token
   * @param {string} periodToken a Report period token (for monthly : YYYY-monthMM, for weekly : YYYY-weekNN, for daily : YYYY-MM-DD)
   * @param {monthly | weekly | daily} type either monthly or weekly or daily
   * @returns {{min : Number, max : Number} | null}  min/max kpiDailyPeriods
   */

  getMinMaxFromReportPeriodToken(periodToken = null, type = null) {
    if (!periodToken || !type) {
      console.error('Missing required parameter periodToken or type');
      return null;
    }

    if(!/^\d{4}-month\d{2}$/g.test(periodToken) && !/^\d{4}-week\d{1,2}$/g.test(periodToken) && !/^\d{4}-\d{2}-\d{2}$/g.test(periodToken)) {
      console.error('Invalid periodToken format');
      return null;
    }

    if (type === 'monthly') {
      const date = moment.utc(`${periodToken}`, 'YYYY-[month]MM');
      const startOfMonth = date.startOf('month').format('YYYYMMDD');
      const endOfMonth = date.endOf('month').format('YYYYMMDD');
      return { min: Number(startOfMonth), max: Number(endOfMonth) };
    }

    if (type === 'weekly') {
      const date = moment.utc(`${periodToken}`, 'YYYY-[week]w');
      const startOfWeek = date.startOf('week').format('YYYYMMDD');
      const endOfWeek = date.endOf('week').format('YYYYMMDD');

      return { min: Number(startOfWeek), max: Number(endOfWeek) };
    }

    if (type === 'daily') {
      const date = moment.utc(`${periodToken}`, 'YYYY-MM-DD').format('YYYYMMDD');

      return { min: Number(date), max: Number(date) };
    }
  },
};

module.exports = KpiDailyPeriods;
