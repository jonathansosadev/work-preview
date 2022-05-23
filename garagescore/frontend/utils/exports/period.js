import moment from 'moment';
import { GarageHistoryPeriod } from '../models/garage-history.period';
import { ExportPeriods } from '../enumV2';

/**
 * Convert a date into a periodId in monthly format
 * @param {Date | Object} referenceDate
 * @returns {String} periodId
 */
function _tokenizeToMonthFormat(referenceDate) {
  return moment(referenceDate).format(GarageHistoryPeriod.MONTHLY_FORMAT);
}

/**
 * Convert a single periodId to a Start and End period
 * @param {String} periodId
 * @returns {{ startPeriod: String | null, endPeriod : String | null}} customPeriods
 */
function _periodIdToCustomPeriod(periodId) {
  return {
    startPeriod: _tokenizeToMonthFormat(GarageHistoryPeriod.getPeriodMinDate(periodId)),
    endPeriod: _tokenizeToMonthFormat(GarageHistoryPeriod.getPeriodMaxDate(periodId)),
  };
}

/**
 * Setup the periodId, startPeriod and endPeriod to prefill the requester
 * @param {String} periodId
 * @returns {{ periodId: String | null, startPeriodId: String | null, endPeriodId : String | null}} periods
 */
function setupPeriodsForPrefill(periodId) {
  const { MONTHLY_REGEX, YEARLY_REGEX, QUARTER_REGEX, LAST_QUARTER, CURRENT_YEAR, ALL_HISTORY } = GarageHistoryPeriod;
  // detects last month according to the current day of the month
  const date = moment();
  const lastDisplayedMonth = date.date() > 9 ? date.subtract(1, 'month') : date.subtract(2, 'month');
  if (periodId === _tokenizeToMonthFormat(lastDisplayedMonth)) {
    return {
      periodId: ExportPeriods.LAST_MONTH,
      startPeriodId: null,
      endPeriodId: null,
    };
  }
  // custom periods
  if ([MONTHLY_REGEX, YEARLY_REGEX, QUARTER_REGEX].some((regex) => regex.test(periodId))) {
    const { startPeriod, endPeriod } = _periodIdToCustomPeriod(periodId);
    return {
      periodId: 'CustomPeriod',
      startPeriodId: startPeriod,
      endPeriodId: endPeriod,
    };
  }
  // rolling periods
  if ([LAST_QUARTER, CURRENT_YEAR, ALL_HISTORY].includes(periodId)) {
    return {
      periodId: periodId === LAST_QUARTER ? ExportPeriods.LAST_QUARTER : periodId,
      startPeriodId: null,
      endPeriodId: null,
    };
  }

  return {
    periodId: null,
    startPeriodId: null,
    endPeriodId: null,
  };
}

export { setupPeriodsForPrefill };
