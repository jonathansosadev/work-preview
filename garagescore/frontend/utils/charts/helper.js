import moment from 'moment';
import { formatPercent, formatGrade_10, formatGrade_5, formatRound } from '~/util/filters';
//@ts-ignore
import { ChartConfigFormats, ChartConfigViews, ChartConfigPages } from '~/utils/enumV2';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import DataTypes from '~/utils/models/data/type/data-types';
import { getDeepFieldValue as deep } from '~/utils/object';
import CHART_CONFIGURATION from './configuration';
import { KpiPeriods } from '~/utils/models/kpi-periods.js';
import { GarageHistoryPeriod } from '~/utils/models/garage-history.period';
//@ts-ignore
import { Blue, CusteedBrandColor } from '~/assets/style/global.scss';
import KpiTypes from '~/utils/models/kpi.type.js';
import LocalStorageHelper from './localStorage';
import GarageTypes from '~/utils/models/garage.type.js';
import ChartConfig from '~/utils/charts/configuration';


const ChartHelper = {
  /**
   * Apply a predefined format to a number
   * @param {number}  value  the number to process
   * @param {Enum_ChartConfigFormats}  format the name of predefined format
   * @returns {number} the componentName is valid or not
   */
  formatValue: function (value, format) {
    if (!value) {
      return 0;
    }
    if (format === ChartConfigFormats.PERCENT) {
      return formatPercent(value, false);
    } else if (format === ChartConfigFormats.PERCENT_ROUND) {
      return formatPercent(value, true);
    } else if (format === ChartConfigFormats.GRADE_5) {
      return formatGrade_5(value);
    } else if (format === ChartConfigFormats.GRADE_10) {
      return formatGrade_10(value);
    } else if (format === ChartConfigFormats.ROUND) {
      return formatRound(value);
    }
    return value;
  },

    /**
   * Suffix a field with it's dataType and Percent
   * @example
   * suffixedField(cockpit-leads-garages, countLeadsUntouched, null, Maintenance);
   * returns countLeadsUntouchedPercent
   * @param {Enum_ChartConfigPages}  pageName  route.name
   * @param {string} field the field to process
   * @param {Enum_LeadSaleTypes=} leadSaleType used for leads fields
   * @param {Enum_DataTypes=} dataType
   * @returns {string} the processed field
   */
  suffixedField: function (pageName = null, field = null, leadSaleType = null, dataType = null) {
    const leadSaleTypeSuffix = leadSaleType ? LeadSaleTypes.getAcronym(leadSaleType) : '';
    const dataTypeSuffix = dataType ?DataTypes.getAcronymPartial(dataType) : '';

    if (pageName.startsWith('cockpit-leads')) {
      return `${field}Percent${leadSaleTypeSuffix}`;
    } else if (pageName.startsWith('cockpit-unsatisfied')) {
      return `${field}Percent${dataTypeSuffix}`;
    } else if (pageName.startsWith('cockpit-satisfaction')) {
      /* no Percent for NPS */
      if (field === 'satisfactionNPS') {
        return `${field}${dataTypeSuffix}`;
      }
      return `${field}Percent${dataTypeSuffix}`;
    } else if (pageName.startsWith('cockpit-contacts')) {
      return `${field}Percent${dataTypeSuffix}`;
    } else if (pageName.startsWith('cockpit-automation')) {
      return field;
    } else if (pageName.startsWith('cockpit-e-reputation')) {
      return field;
    }
  },

  /**
   * Check if the page name provided exists in the original CHART_CONFIGURATION
   * @param {Enum_ChartConfigPages}  pageName  route.name
   * @returns {Boolean} the pageName is valid or not
   */
  isPageNameValid: function (pageName) {
    return !!deep(CHART_CONFIGURATION.components, pageName);
  },

  /**
   * Check if the component name provided exists in the original CHART_CONFIGURATION
   * @param {Enum_ChartConfigPages}  pageName  route.name
   * @param {String}  componentName state.chart
   * @returns {Boolean} the componentName is valid or not
   */
  isPageComponentNameValid: function (pageName = null, componentName = null) {
    if (!pageName || !componentName) {
      return false;
    }

    /* check if the component exists in the chart configuration */
    return !!deep(CHART_CONFIGURATION.components, `${pageName}.${componentName}`);
  },

  /**
   * Returns the page configuration for the asked pageName
   * @param {Enum_ChartConfigPages}  pageName  route.name
   * @param {CHART_CONFIGURATION=} currentChartConfig Optionnal: state.chart, default to original chart configuration
   * @returns {Object} The page chart configuration
   */
  getPageConfig: function (pageName = null, currentChartConfig = null) {
    const chartConfig = currentChartConfig || CHART_CONFIGURATION;
    return deep(chartConfig.components, pageName);
  },
  /**
   * Returns an array of all field suffixed for the asked page
   * @param {Enum_ChartConfigPages}  pageName  route.name
   * @param {Enum_LeadSaleTypes=} leadSaleType
   * @param {Enum_DataTypes=} dataType
   * @returns {string[]} array of suffixed fields
   */
  pageSuffixedFields: function (pageName, leadSaleType, dataType) {
    const res = [];
    const pageConfig = this.getPageConfig(pageName);
    for (const componentName in pageConfig) {
      const fieldName = pageConfig[componentName]['field'];
      res.push(this.suffixedField(pageName, fieldName, leadSaleType, dataType));
    }
    return res;
  },

  /**
   * we compare the expected periods against the received periods from the query.
   * if there is a missing period we add it.
   * the aim is to always display 12months in the chart.
   * @param {Object[]}  chartQueryResult  the result of the chart query
   * @param {GHPeriod}  cockpitSelectedPeriod  current cokcpit selected period
   * @returns {chartQueryResult} chartQueryResult with missing periods
   */
  addMissingPeriod: function (chartQueryResult = [], cockpitSelectedPeriod) {
    if (chartQueryResult && chartQueryResult.length === 12) {
      return chartQueryResult;
    }

    const data = [...chartQueryResult];
    /* the periods to display on the chart in KpiPeriods format : YYYYMM */
    const expectedPeriods = KpiPeriods.fromGhPeriodToChartPeriods(cockpitSelectedPeriod) || [];
    /* add missing period */
    expectedPeriods.forEach((period) => {
      if (!data.find((el) => el.period === period)) {
        data.push({ period });
      }
    });
    /* sort */
    data.sort((a, b) => a.period - b.period);

    return data;
  },

  /**
   * Extract and convert all the periods from the query result to GH format
   * @param {Object[]}  chartQueryResult  the result of the chart query
   * @returns {Array} Array of periods in the query converted to GH format
   */
  getPeriodsInGHFormat: function (chartQueryResult = []) {
    return chartQueryResult.map((monthData) => GarageHistoryPeriod.fromKpiMonthPeriodToGhMonthPeriod(monthData.period));
  },

  /**
   * Compute colors for the chart labels (Blue for periods within the cockpit selected period)
   * Garage history period
   * @param {GHPeriod[]}  periods  all the periods in GH format
   * @param {GHPeriod}  selectedPeriod  cockpit selected period in GH format
   * @returns {HexColor[]} Array of Hex colors
   */
  getChartColors: function (periods = [], selectedPeriod) {
    const periodMinDate = moment(GarageHistoryPeriod.getPeriodMinDate(selectedPeriod));
    const periodMaxDate = moment(GarageHistoryPeriod.getPeriodMaxDate(selectedPeriod));
    const labelsColors = periods.map((period) => {
      const isBetween = moment(period, GarageHistoryPeriod.MONTHLY_FORMAT).isBetween(
        periodMinDate,
        periodMaxDate,
        'months',
        '[]'
      );
      return isBetween ? Blue : CusteedBrandColor;
    });

    return labelsColors;
  },

  /**
   * Count the number of charts currently displayed on the page (used for monitoring)
   * @param {Enum_ChartConfigPages}  pageName  route.name
   * @param {CHART_CONFIGURATION} currentChartConfig state.chart
   * @returns {Number} The number of charts currently displayed in the page
   */
  countChartsDisplayed: function (pageName, currentChartConfig = null) {
    if (!pageName || !currentChartConfig || !this.isPageNameValid(pageName)) {
      return 0;
    }
    let count = 0;
    const pageConfig = this.getPageConfig(pageName, currentChartConfig);
    for (const componentName in pageConfig) {
      if (pageConfig[componentName]['view'] === ChartConfigViews.CHART) {
        count++;
      }
    }

    return count;
  },

  //--------------------------------------------------------------------------------------//
  //                                       Requests                                       //
  //--------------------------------------------------------------------------------------//
  /**
   * Build base request that is shared between all queries
   * @param  {GHPeriod} periodId
   * @param  {String} garageId
   * @param  {String} cockpitType
   * @returns {Object} The base request
   */
  baseRequest: function (periodId, garageIds = null, cockpitType = null) {
    const request = {
      name: 'kpiByPeriodGetChartData',
      args: {
        periodId,
        garageId: garageIds,
        cockpitType,
      },
    };

    return request;
  },

  buildRequestSatisfaction: function (
    pageName = null,
    { periodId = null, garageIds = null, cockpitType = null, dataTypeId = null },
    frontDeskUserName = null
  ) {
    const request = this.baseRequest(periodId, garageIds, cockpitType);

    request.args = {
      ...request.args,
      dataType: dataTypeId,
      kpiType: KpiTypes.FRONT_DESK_USER_KPI,
      ...(pageName === ChartConfigPages.COCKPIT_SATISFACTION_GARAGES && {}),
      ...(pageName === ChartConfigPages.COCKPIT_SATISFACTION_TEAM && {
        frontDeskUserName: frontDeskUserName,
      }),
      ...(pageName === ChartConfigPages.COCKPIT_SATISFACTION_REVIEWS && {
        frontDeskUserName: frontDeskUserName,
      }),
    };

    const fields = this.pageSuffixedFields(pageName, null, dataTypeId);
    request.fields = `
      satisfaction {
          data {
            period
            ${fields.join('\n')}
          }
        }
    `;

    return request;
  },

  buildRequestUnsatisfied: function (
    pageName = null,
    { periodId = null, garageIds = null, cockpitType = null, dataTypeId = null, user = null }
  ) {
    const request = this.baseRequest(periodId, garageIds, cockpitType);

    request.args = {
      ...request.args,
      dataType: dataTypeId,
      kpiType: KpiTypes.USER_KPI,
      ...(pageName === ChartConfigPages.COCKPIT_UNSATISFIED_GARAGES && {}),
      ...(pageName === ChartConfigPages.COCKPIT_UNSATISFIED_TEAM && {
        userId: user,
      }),
    };

    const fields = this.pageSuffixedFields(pageName, null, dataTypeId);
    request.fields = `
      unsatisfied {
        data {
          period
          ${fields.join('\n')}
        }
      }
    `;

    return request;
  },

  buildRequestLeads: function (
    pageName = null,
    { periodId = null, garageIds = null, cockpitType = null, leadSaleType = null, user = null }
  ) {
    const request = this.baseRequest(periodId, garageIds, cockpitType);
    request.args = {
      ...request.args,
      dataType: leadSaleType,
      ...(pageName === ChartConfigPages.COCKPIT_LEADS_GARAGES && {
        kpiType: KpiTypes.GARAGE_KPI,
      }),
      ...(pageName === ChartConfigPages.COCKPIT_LEADS_TEAM && {
        kpiType: KpiTypes.USER_KPI,
        userId: user,
      }),
      ...(pageName === ChartConfigPages.COCKPIT_LEADS_SOURCES && {
        kpiType: KpiTypes.GARAGE_KPI,
      }),
      ...(pageName === ChartConfigPages.COCKPIT_LEADS_FOLLOWED && {
        kpiType: KpiTypes.GARAGE_KPI,
        userId: user,
      }),
    };

    const fields = this.pageSuffixedFields(pageName, leadSaleType);
    request.fields = `
      lead {
        data {
          period
          ${fields.join('\n')}
        }
      }
    `;

    return request;
  },

  buildRequestAutomation: function (
    pageName = null,
    { periodId = null, garageIds = null, cockpitType = null, automationCampaignType = null }
  ) {
    const request = this.baseRequest(periodId, garageIds, cockpitType);

    request.args = {
      ...request.args,
      campaignType: automationCampaignType,
      kpiType: KpiTypes.GARAGE_KPI,
      ...(pageName === ChartConfigPages.COCKPIT_AUTOMATION_GARAGES && {}),
      ...(pageName === ChartConfigPages.COCKPIT_AUTOMATION_CAMPAIGNS && {}),
    };

    request.fields = `
      automation {
        data {
          period
          countSent
          countOpened
          countConverted
          countLeadSales
        }
      }
    `;

    return request;
  },

  buildRequestContact: function (
    pageName = null,
    { periodId = null, garageIds = null, cockpitType = null, dataTypeId = null },
    frontDeskUserName = null
  ) {
    const request = this.baseRequest(periodId, garageIds, cockpitType);

    request.args = {
      ...request.args,
      dataType: dataTypeId,
      kpiType: KpiTypes.FRONT_DESK_USER_KPI,
      ...(pageName === ChartConfigPages.COCKPIT_CONTACTS_GARAGES && {}),
      ...(pageName === ChartConfigPages.COCKPIT_CONTACTS_TEAM && {
        frontDeskUserName: frontDeskUserName,
      }),
      ...(pageName === ChartConfigPages.COCKPIT_CONTACTS_REVIEWS && {
        frontDeskUserName: frontDeskUserName,
      }),
    };

    const fields = this.pageSuffixedFields(pageName, null, dataTypeId);
    request.fields = `
      contacts {
          data {
            period
            ${fields.join('\n')}
          }
        }
    `;

    return request;
  },

  buildRequestEreputation: function (pageName = null, { periodId = null, garageIds = null, cockpitType = null }) {
    const request = this.baseRequest(periodId, garageIds, cockpitType);

    request.args = {
      ...request.args,
      kpiType: KpiTypes.GARAGE_KPI,
      ...(pageName === ChartConfigPages.COCKPIT_E_REPUTATION_GARAGES && {}),
      ...(pageName === ChartConfigPages.COCKPIT_E_REPUTATION_REVIEWS && {}),
    };

    request.fields = `
      ereputation {
          data {
            period
            erepRatingGaragescore
            erepRatingGoogle
            erepRatingPagesJaunes
            erepRatingFacebook
          }
        }
    `;

    return request;
  },
  //  CHART REFACTORING
  getGeneralDataTypeName(routeName) {
    if (!routeName) {
      return 'ALL';
    }
    if (routeName?.includes('automation')) {
      return 'automationCampaignType';
    } else if (routeName?.includes('leads')) {
      return 'leadSaleType';
    }
    return 'dataTypeId';
  },
  updateLocalStorageChartConfig(globalChartData, chartData) {
    const isLocalStorageDisabled = !(LocalStorageHelper.isEnabled());
    if (isLocalStorageDisabled) {
      return;
    }
    const {
      routeName,
      componentName,
      viewType
    } = chartData;
    const updatedCharts = {
      ...globalChartData,
      ...{
        components: {
          ...globalChartData.components,
          [routeName]: {
            ...globalChartData.components[routeName],
            [componentName]: {
              ...globalChartData.components[routeName][componentName],
              view: viewType,
            }
          },
        },
      }
    };
    LocalStorageHelper.setChartConfigInLocalStorage({ ...updatedCharts });
  },
  getQueryData(data, selectedPeriod) {
    return this.addMissingPeriod(data, selectedPeriod);
  },
  getFormattedPeriods(queryData) {
    return this.getPeriodsInGHFormat(queryData);
  },
  getFormattedChartData(data, selectedPeriod, translationCallback) {
    const queryData = this.getQueryData(data, selectedPeriod);
    const periods = this.getFormattedPeriods(queryData);
    const translatedPeriods = periods.map(translationCallback);
    return {
      periods,
      queryData,
      translatedPeriods,
    };
  },
  getComponentFields(pageInfo, navigationData) {
    const {
      dataTypeId,
      leadSaleType,
    } = navigationData;
    const {
      pageComponentNames,
      pageName,
    } = pageInfo;
    const pageChartsData = ChartConfig.components[pageName];
    const fieldNames = pageComponentNames.map((component) => {
      return {
        component,
        field: this.suffixedField(
          pageName,
          pageChartsData[component].field,
          leadSaleType,
          dataTypeId,
        ),
      };
    });
    return fieldNames;
  },
  getChartDataset(queryData, field, componentChartData) {
    const dataset = queryData.map(periodData => {
      const format = componentChartData['format'];
      return this.formatValue(periodData[field], format);
    });
    return dataset;
  },
  getReferenceLineDatasets(
    periods,
    cockpitType,
    generalStatsData,
  ) {
    const {
      generalStats,
      generalStatsLabel,
      generalStatsDataType,
    } = generalStatsData;
    const globalDataSet = [];
    const top200DataSet = [];
    for (const period of periods) {
      const cockpitTypePeriod = (
        deep(generalStats, `${period}.${cockpitType}`)
        || {}
      );
      const isVehiculeInspectionCockpitType = (
        cockpitType === GarageTypes.VEHICLE_INSPECTION
      );
      const deepLabel = isVehiculeInspectionCockpitType
        ? `${generalStatsLabel}`
        : `${generalStatsDataType}.${generalStatsLabel}`;
      const {
        allGarages = {},
        top = {},
      } = deep(cockpitTypePeriod, deepLabel) || {};
      globalDataSet.push(Math.round(allGarages.rate || 0));
      top200DataSet.push(Math.round(top.rate || 0));
    }
    return {
      globalDataSet,
      top200DataSet,
    };
  },
  getChartsDatasets(pageData, navData, queryData) {
    const fieldNames = this.getComponentFields(pageData, navData);
    const { pageName } = pageData;
    const chartByName = {};
    for (const { component, field } of fieldNames) {
      const componentChartData = ChartConfig.components[pageName][component];
      chartByName[component] = {
        dataset: this.getChartDataset(
          queryData,
          field,
          componentChartData,
        ),
      }
    }
    return chartByName;
  },
  getChartsReferenceLineDatasets(pageData, navData, generalStatsData, periods) {
    const fieldNames = this.getComponentFields(pageData, navData);
    const { pageName } = pageData;
    const { cockpitType } = navData;
    const chartByName = {};
    for (const { component } of fieldNames) {
      const componentChartData = ChartConfig.components[pageName][component];
      const generalStatsLabel = componentChartData['generalStatsLabel'];
      if (generalStatsLabel) {
        const localGeneralStatsData = {
          ...generalStatsData,
          generalStatsLabel,
        };
        const {
          globalDataSet,
          top200DataSet,
        } = this.getReferenceLineDatasets(
          periods,
          cockpitType,
          localGeneralStatsData,
        );
        chartByName[component] = {
          globalDataSet,
          top200DataSet,
        };
      }
    }
    return chartByName;
  },
};

export default ChartHelper;
