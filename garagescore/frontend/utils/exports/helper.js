const { ExportTypes, DataTypes, ExportPeriods } = require('../enumV2');
const moment = require('moment');
require('moment-timezone');

/**
 * @typedef {('GARAGES' | 'FRONT_DESK_USERS_DMS'  | 'FRONT_DESK_USERS_CUSTEED' | 'SATISFACTION' | 'CONTACTS' | 'CONTACTS_MODIFIED' | 'LEADS' | 'FORWARDED_LEADS' | 'UNSATISFIED' | 'EREPUTATION' | 'AUTOMATION_RGPD' | 'AUTOMATION_CAMPAIGN')} Enum_ExportType
 */

/**
 * @typedef {('LAST_MONTH' | 'LAST_QUARTER' | 'CURRENT_YEAR' | 'ALL_HISTORY' )} Enum_ExportPeriods
 */

const ExportHelper = {
  eligibleDataTypes: [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE, 'All'],
  /**
   * @param {Enum_ExportType} selectedExportType ExportType selected in the requester
   * @returns {String[]} default fields based on the selected exportType
   */
  getDefaultFields: function (selectedExportType = null) {
    const defaultFields = [
      'BD_COM__GARAGE',
      'BD_COM__FRONT_DESK_USER',
      'BD_COM__INTERNAL_REFERENCE',
      'BD_CON__EMAIL',
      'BD_CON__PHONE',
      'BD_CON__GENDER',
      'BD_CON__FIRST_NAME',
      'BD_CON__LAST_NAME',
      'BD_CON__FULLNAME',
      'BD_CON__ADDRESS',
      'BD_CON__CITY',
      'BD_CON__POSTAL_CODE',
      'BD_COM__VEHICLE_BRAND',
      'BD_COM__VEHICLE_MODEL',
      'BD_COM__PLATE',
      'BD_COM__MILEAGE',
      'BD_COM__REGISTRATION_DATE',
      'BD_COM__DATA_TYPE',
      'BD_COM__BILLING_DATE',
    ];

    const unsatisfiedCriterias = [
      'BD_UNS__MAINTENANCE_CRITERIA_1',
      'BD_UNS__MAINTENANCE_CRITERIA_2',
      'BD_UNS__MAINTENANCE_CRITERIA_3',
      'BD_UNS__MAINTENANCE_CRITERIA_4',
      'BD_UNS__MAINTENANCE_CRITERIA_5',
      'BD_UNS__SALE_NEW_CRITERIA_1',
      'BD_UNS__SALE_NEW_CRITERIA_2',
      'BD_UNS__SALE_NEW_CRITERIA_3',
      'BD_UNS__SALE_NEW_CRITERIA_4',
      'BD_UNS__SALE_NEW_CRITERIA_5',
      'BD_UNS__SALE_USED_CRITERIA_1',
      'BD_UNS__SALE_USED_CRITERIA_3',
      'BD_UNS__SALE_USED_CRITERIA_4',
      'BD_UNS__SALE_USED_CRITERIA_5',
      'BD_UNS__SALE_USED_CRITERIA_6',
    ];

    const automationRgpd = [
      'BA_RGPD__STATUS',
      'BA_RGPD__DATE_OPT_OUT',
    ];

    const automationCampaign = [
      'BA_CAMPAIGN__NAME',
      'BA_CAMPAIGN__DATE',
      'BA_CAMPAIGN__TYPE',
      'BA_CAMPAIGN__STATUS',
    ];

    const automationCommon = [
      'BA_COM__PUBLIC_DISPLAY_NAME',
      'BA_COM__GENDER',
      'BA_COM__FULLNAME',
      'BA_COM__EMAIL',
      'BA_COM__PHONE',
      'BA_COM__CITY',
      'BA_COM__VEHICLE_PLATE',
    ];

    const defaultFieldsByExportType = {
      [ExportTypes.GARAGES] : ['BG_COM__GARAGE'],
      [ExportTypes.FRONT_DESK_USERS_DMS] : ['BF_COM__GARAGE', 'BF_COM__FRONT_DESK_USER'],
      [ExportTypes.FRONT_DESK_USERS_CUSTEED] : ['BF_COM__GARAGE', 'BF_COM__FRONT_DESK_USER'],
      [ExportTypes.LEADS] : [...defaultFields, 'BD_LEA__CONVERSION_DATE'],
      [ExportTypes.SATISFACTION] : [...defaultFields, ...unsatisfiedCriterias],
      [ExportTypes.UNSATISFIED] : [...defaultFields, ...unsatisfiedCriterias, 'BD_UNS__CLOSING_SUB_REASON'],
      [ExportTypes.EREPUTATION] : [...defaultFields.filter((field) => field !== 'BD_COM__BILLING_DATE')],
      [ExportTypes.AUTOMATION_RGPD] : [...automationRgpd, ...automationCommon],
      [ExportTypes.AUTOMATION_CAMPAIGN] : [...automationCampaign, ...automationCommon],
    };

    if (selectedExportType in defaultFieldsByExportType) {
      return [...defaultFieldsByExportType[selectedExportType]];
    }

    return [...defaultFields];
  },
  /**
   * @param {Enum_ExportType} exportType ExportType selected in the requester
   * @returns {Boolean} the exportType is either FRONT_DESK_USERS_DMS or FRONT_DESK_USERS_CUSTEED
   */
  exportTypeIsFrontDeskUsers: function (exportType) {
    return [ExportTypes.FRONT_DESK_USERS_DMS, ExportTypes.FRONT_DESK_USERS_CUSTEED].includes(exportType);
  },
  /**
   * @param {String} id frontDeskUser id
   * @param {String} garageId frontDeskUser garageId
   * @returns {String} the trackId
   */
  buildTrackId: function (id = null, garageId = null) {
    return `${id}/-/${garageId}`;
  },
  /**
   * @param {Enum_ExportType} exportType ExportType selected in the requester
   * @returns {Boolean} if the exportType is using leadSaleType instead of DataType
   */
  exportTypeIsUsingLeadSaleTypes: function (exportType) {
    const leadSaleTypesExports = [ExportTypes.LEADS, ExportTypes.FORWARDED_LEADS, ExportTypes.FRONT_DESK_USERS_CUSTEED];
    return leadSaleTypesExports.includes(exportType);
  },

  /**
   * Convert an exportPeriod to an object with a valid GH period
   * @param {Enum_ExportPeriods} periodId exportPeriod
   * @returns {{periodId : String | null, startPeriodId: String | null, endPeriodId : String | null}}
   */

  fromExportPeriodsToGhCustomPeriods: function (periodId) {
    if (!periodId || !ExportPeriods.hasValue(periodId)) {
      return {};
    }

    // if we are before the 10, the computed month will be 2month before otherwise 1month
    const currentDate = moment();
    const monthsToSubstract = +currentDate.format('D') < 10 ? 2 : 1;
    const lastMonth = currentDate.subtract(monthsToSubstract, 'months').format('YYYY-[month]MM');

    const convert = {
      [ExportPeriods.LAST_MONTH]: {
        periodId: null,
        startPeriodId: lastMonth,
        endPeriodId: lastMonth,
      },
      [ExportPeriods.LAST_QUARTER]: {
        periodId: 'lastQuarter',
        startPeriodId: null,
        endPeriodId: null,
      },
      [ExportPeriods.CURRENT_YEAR]: {
        periodId: 'CURRENT_YEAR',
        startPeriodId: null,
        endPeriodId: null,
      },
      [ExportPeriods.ALL_HISTORY]: {
        periodId: 'ALL_HISTORY',
        startPeriodId: null,
        endPeriodId: null,
      },
    };

    return convert[periodId];
  },
  /**
   * Convert a UTC date into a timezoned date
   * @param {Date} date 
   * @param {String} timezone 
   * @returns {String} converted date on format DD/MM/YYYY
   */
  convertToTimezoneDate(date, timezone = 'Europe/Paris') {
    if (!date) {
      return '';
    }
    return new Date(Date.parse(moment.tz(date, timezone).format('YYYY-MM-DD')));
  },
/**
 * @param {Enum_ExportType} exportType ExportType selected in the requester
 * @returns {Boolean} if the exportType is for automation
 */
  exportTypeIsAutomation(exportType)  {
    return [ExportTypes.AUTOMATION_CAMPAIGN, ExportTypes.AUTOMATION_RGPD].includes(exportType);
  }
};

module.exports = ExportHelper;
