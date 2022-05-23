//--------------------------------------------------------------------------------------//
//                                    FrontDeskUsers                                    //
//--------------------------------------------------------------------------------------//

const KpiPeriods = require('../../kpi/KpiPeriods');
const { ExportPeriods } = require('../../../../../frontend/utils/enumV2');
const { dayNumber, todayDayNumber } = require('../../../util/time-helper');

const periodsHelper = {
  /**
   * Returns a list of monthly periods in kpiPeriods format, corresponding to the periodId if specified (predefined periods : lastQuarter, CURRENT_YEAR ...)
   * otherwise between startPeriodId and endPeriodId params (custom periods)
   * @param {{periodId?: string, startPeriodId? : string, endPeriodId? : string }} params garage history periods
   * @returns {number | number[]} list of kpiPeriods
   * @example getPeriodsList({ periodId : "lastQuarter"}) // returns 10
   * @example getPeriodsList({ startPeriodId: '2021-month05', endPeriodId: '2021-month09' }) // [202105, 202106, 202107, 202108, 202109]
   */
  getPeriodsList({ periodId, startPeriodId, endPeriodId }) {
    if (periodId) {
      return KpiPeriods.fromGhPeriodToKpiPeriod(periodId, { convertToMonthlyList: true });
    }
    const startKpiPeriod = KpiPeriods.fromGhPeriodToKpiPeriod(startPeriodId);
    const endKpiPeriod = KpiPeriods.fromGhPeriodToKpiPeriod(endPeriodId);
    return KpiPeriods.getPeriodIntervalPeriodList(startKpiPeriod, endKpiPeriod);
  },
  /**
   * Convert period to day number
   * @param { String } periodId enum like LAST_QUARTER
   * @param { Array } periods array of period like [202105, 202106]
   * @returns { Object }
   */
  convertPeriodToDayNumber: function (periodId, periods) {
    const runDayNumber = { gt: 0, lt: todayDayNumber() + 1 };
    const today = new Date();
    const getYearAndMonth = (period) => {
      return {
        year: `${period}`.slice(0, 4),
        month: `${period}`.slice(4) - 1,
      };
    };

    switch (periodId) {
      case ExportPeriods.LAST_MONTH:
        const firstDayLastMonth = new Date(new Date(today.getFullYear(), today.getMonth(), 0).setDate(1));
        const lastDayLastMonth = new Date(new Date(today.getFullYear(), today.getMonth() + 1, 0).setDate(1));
        runDayNumber.gt = dayNumber(firstDayLastMonth);
        runDayNumber.lt = dayNumber(lastDayLastMonth);
        break;
      case ExportPeriods.LAST_QUARTER:
        runDayNumber.gt = todayDayNumber() - 90;
        break;
      case ExportPeriods.CURRENT_YEAR:
        const firstDayOfCurrentYear = new Date(today.getFullYear(), 0, 1);
        runDayNumber.gt = dayNumber(firstDayOfCurrentYear);
        break;
      case ExportPeriods.ALL_HISTORY:
        runDayNumber.gt = 0;
        break;
      default:
        const startPeriod = getYearAndMonth(periods[0]);
        const endPeriod = getYearAndMonth(periods[periods.length - 1]);
        runDayNumber.gt = dayNumber(new Date(startPeriod.year, startPeriod.month));
        runDayNumber.lt = dayNumber(new Date(endPeriod.year, endPeriod.month + 1));
    }

    return runDayNumber;
  },
};

const frontDeskUsersHelper = {
  /**
   * Check if the frontDeskUserName is valid
   * @param {string} frontDeskUserName
   * @returns {boolean}
   */
  isValidFrontDeskUserName: function (frontDeskUserName = null) {
    return frontDeskUserName && typeof frontDeskUserName === 'string';
  },
  /**
   * Check if the requested garageIds in the export contains 'All'
   * if so, the user has requested all the garageIds in his export
   * @param {string[]} requestedGarageIds
   * @returns {boolean}
   */
  areAllGarageIdsRequested: function (requestedGarageIds = []) {
    return requestedGarageIds.includes('All');
  },

  /**
   * Check if the requested dataTypes in the export contains 'All'
   * if so, the user has requested all the dataTypes in his export
   * @param {string[]} requestedDataTypes
   * @returns {boolean}
   */
  areAllDataTypesRequested: function (requestedDataTypes = []) {
    return requestedDataTypes.includes('All');
  },

  /**
   * Check if the requested FrontDeskUsers in the export contains 'All'
   * if so, the user has requested all the FrontDeskUsers in his export
   * @param {{ id: string, frontDeskUserName: string, garageId: string | null }[]} requestedFrontDeskUsers
   * @returns {boolean}
   */
  areAllFrontDeskUsersRequested: function (requestedFrontDeskUsers = []) {
    return !!requestedFrontDeskUsers.find(({ id }) => id === 'All');
  },

  /**
   * Returns the list of garageIds in string format requested by the user for his export
   * @param {string[]} userAvailableGarageIds - user's garageIds from context.scope converted to strings
   * @param {string[]} requestedGarageIds - garageIds requested by the user for his export
   * @param {{ id: string, frontDeskUserName: string, garageId: string | null }[]} requestedFrontDeskUsers - FrontDeskUsers requested by the user for his export
   * @param {boolean} allGarageIdsRequested - whether the user asked for 'All' garageIds (return value of helper function areAllGarageIdsRequested)
   * @param {boolean} allFrontDeskUsersRequested - whether the user asked for 'All' frontDeskUsers (return value of helper function areAllFrontDeskUsersRequested)
   * @returns {string[]}
   */
  getGarageIdsToQuery: function (
    userAvailableGarageIds = [],
    requestedGarageIds = [],
    requestedFrontDeskUsers = [],
    allGarageIdsRequested = false,
    allFrontDeskUsersRequested = false
  ) {
    if (allGarageIdsRequested) {
      // case 1 : the user requested all the garageIds and frontDeskUsers, use userAvailableGarageIds
      if (allFrontDeskUsersRequested) {
        return userAvailableGarageIds;
      }
      // case 2 : the user requested all the garageIds but specific frontDeskUsers.
      // Keep only the requested frontDeskUsers that are available for the user
      return userAvailableGarageIds.filter((gId) => requestedFrontDeskUsers.find((e) => e.garageId === gId));
    }

    // default : the user request specific garageIds. Keep only the garageIds that are available for the user
    return userAvailableGarageIds.filter((gId) => requestedGarageIds.includes(gId));
  },
};

module.exports = {
  periodsHelper,
  frontDeskUsersHelper,
};
