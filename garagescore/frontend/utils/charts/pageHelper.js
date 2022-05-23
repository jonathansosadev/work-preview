import { cloneDeep } from 'lodash';
import { watchersFactory } from '~/mixins/utils';
import { makeApolloQueries } from '~/util/graphql';
import ChartConfig from '~/utils/charts/configuration';
import ChartHelper from '~/utils/charts/helper';
import LocalStorageHelper from '~/utils/charts/localStorage';
import { ChartConfigFormats, ChartConfigPages } from '~/utils/enumV2';
import { getPageKpiData, kpiMethod } from '~/utils/kpi/pageHelper';

const { fetchKpi } = kpiMethod;

const defaultChartConfig = {
  ...ChartConfig,
};

// methods Charts
async function mixinChartKpiOnViewChange(componentName, viewType) {
  this.chartByName[componentName].viewType = viewType;
  const chartData = {
    componentName, routeName: this.$route.name, viewType,
  };
  const localStorageComponents = LocalStorageHelper.getConfigFromLocalStorage();
  ChartHelper.updateLocalStorageChartConfig({ components: localStorageComponents }, chartData);

  const { shouldRefreshData } = this.chart;
  if (viewType === 'chart' && shouldRefreshData) {
    await this.fetchKPIDataForChart();
  }
}

async function fetchKPIDataForChart() {
  const doesPageHasActiveChart = Object.values(this.chartByName).some((chartData) => chartData.viewType === 'chart');
  if (!doesPageHasActiveChart) {
    this.chart.shouldRefreshData = true;
    return;
  }
  this.chart.isLoading = true;
  try {
    const navigationData = {
      cockpitType: this.navigationDataProvider.cockpitType,
      dataTypeId: this.navigationDataProvider.dataTypeId,
      garageIds: this.navigationDataProvider.garageIds,
      periodId: this.navigationDataProvider.periodId,
      frontDeskUserName: this.navigationDataProvider.frontDeskUserName,
      leadSaleType: this.navigationDataProvider.leadSaleType,
      campaignType: this.navigationDataProvider.automationCampaignType,
    };
    const request = ChartHelper[ChartConfigPages.getProperty(
      this.configChartName, 'graphqlBuilderFunction')](
      ChartConfigPages[this.configChartName], navigationData);
    const { data } = await makeApolloQueries([request]);
    const { kpiByPeriodGetChartData } = data || {};
    const {
      [ChartConfigPages.getProperty(this.configChartName,
        'graphqlPath')]: datas,
    } = kpiByPeriodGetChartData || {};
    const { data: kpiData } = datas || {};

    this.chart.kpiData = kpiData;
  } catch (error) {
    console.error(error);
  } finally {
    this.chart.isLoading = false;
    this.chart.shouldRefreshData = false;
  }
}

function getGeneralStatsDatatype(routeName, navigationDataProvider) {
  if (routeName.includes('automation')) {
    return navigationDataProvider.automationCampaignType || 'ALL';
  } else if (routeName.includes('leads')) {
    return navigationDataProvider.leadSaleType || 'ALL';
  }
  return navigationDataProvider.dataTypeId || 'ALL';
}

function updateChartData() {
  const {
    cockpitType, dataTypeId, leadSaleType, periodId,
  } = this.navigationDataProvider;
  const { pageName, kpiData: data } = this.chart;
  const generalStatsDataType = getGeneralStatsDatatype(this.$route.name, this.navigationDataProvider);

  function translateChartLabel(label) {
    return this.$t(label.split('-')[1]) || label;
  }

  const {
    periods, queryData, translatedPeriods,
  } = ChartHelper.getFormattedChartData(data, periodId,
    translateChartLabel.bind(this));
  this.$set(this.chart.config, 'labels', translatedPeriods);
  const labelsColors = ChartHelper.getChartColors(periods, periodId);
  this.$set(this.chart.config, 'labelsColors', labelsColors);

  const pageComponentNames = ChartConfigPages.getProperty(this.configChartName, 'components');
  const pageData = { pageName, pageComponentNames };
  const navigationData = { cockpitType, dataTypeId, leadSaleType };
  const datasetByChartName = ChartHelper.getChartsDatasets(pageData, navigationData, queryData);
  const generalStatsData = { generalStats: this.generalStats, generalStatsDataType };
  const referenceLinesDatasetByChartName = ChartHelper.getChartsReferenceLineDatasets(pageData, navigationData, generalStatsData, periods);

  if (referenceLinesDatasetByChartName) {
    Object.keys(datasetByChartName).forEach((chartName) => {
      const { dataset } = datasetByChartName[chartName];
      this.$set(this.chartByName[chartName].target, 'dataSet', dataset);
      this.$set(this.chartByName[chartName].target, 'backgroundColor',
        [...labelsColors]);

      if (referenceLinesDatasetByChartName[chartName]) {
        const {
          globalDataSet, top200DataSet,
        } = referenceLinesDatasetByChartName[chartName];
        this.$set(this.chartByName[chartName], 'global', { dataSet: globalDataSet });
        this.$set(this.chartByName[chartName], 'top200', { dataSet: top200DataSet });
      }

    });
  }
  this.chart.isLoading = false;
}

function getChartDataAndConfig(component) {
  const unifiedConfig = {
    ...(this.defaultChartData.config || {}), ...(this.chart?.config || {}),
  };
  const componentConfig = this.defaultChartData.components[this.$route.name][component];

  const defaultLabels = [
    'min', 'max', 'suggestedMin', 'suggestedMax', 'stepSize', 'format'];
  const componentChartConfig = defaultLabels.reduce((obj, key) => {
    if (componentConfig[key] !== undefined) {
      if (key === 'format') {
        /* suffix the value with "%" if it's a percent value */
        obj['suffix'] = ChartConfigFormats.getPropertyFromValue(
          componentConfig[key], 'suffix') || '';
      } else {
        obj[key] = componentConfig[key];
      }
    }
    return obj;
  }, { ...unifiedConfig });

  const { viewType, global, target, top200 } = this.chartByName[component];
  const { isLoading } = this.chart;

  return {
    isLoading,
    viewType,
    global, // dataSet: Array(12).fill(0), default
    target, // dataSet: Array(12).fill(0), default
    top200, // dataSet: Array(12).fill(0), default
    componentChartConfig,
  };
}

const chartsMethod = {
  mixinChartKpiOnViewChange,
  fetchKPIDataForChart,
  updateChartData,
  getChartDataAndConfig,
  fetchKpi,
};

// computed Charts
function defaultChartData() {
  const defaultChartData = cloneDeep(defaultChartConfig);
  return {
    ...defaultChartData, config: {
      ...defaultChartData?.config,
      labels: defaultChartData?.config?.labels?.map(
        (label) => this.$t(label.split('-')[1]) || label),
    },
  };
}

function generalStats() {
  return this.$store.getters['cockpit/generalStats'];
}

function currentView() {
  return function (componentName) {
    return this.chartByName[componentName]['viewType'];
  };
}

function mixinChartKpiDataAndConf() {
  const generated = {
    kpi: {
      loading: this.kpi.loading,
      data: this.kpi.data,
    },
  };
  const components = ChartConfigPages.getProperty(this.configChartName,
    'components');
  if (components) {
    components.forEach((component) => {
      generated[component] = this.getChartDataAndConfig(component);
      const labels = generated[component].componentChartConfig?.labels.map(label=>this.$t_locale('utils/charts/pageHelper')(label));
      generated[component].componentChartConfig.labels = labels;
    });
  }
  return generated;
}

function mixinChartKpiInfoFilters() {
  return {
    dataType: getGeneralStatsDatatype(this.$route.name, this.navigationDataProvider),
    automationCampaignType: this.navigationDataProvider.automationCampaignType,
    leadSaleType: this.navigationDataProvider.leadSaleType,
    cockpitType: this.navigationDataProvider.cockpitType,
    dataTypeId: this.navigationDataProvider.dataTypeId,
    periodId: this.navigationDataProvider.periodId,
    leadSaleTypeSuffix: this.navigationDataProvider.currentLeadSaleTypeSuffix,
  };
}

const chartsComputed = {
  defaultChartData,
  generalStats,
  currentView,
  mixinChartKpiInfoFilters,
  mixinChartKpiDataAndConf,
};

// data generation
function generateChartByName(configChartName, routeName) {
  const localStorageContent = LocalStorageHelper.getConfigFromLocalStorage();
  const routeLocalStorage = localStorageContent[routeName || ''];

  const finalChartByName = {};
  const components = ChartConfigPages.getProperty(configChartName,
    'components');
  if (components) {
    components.forEach((component) => {
      const viewFromLocalStorage = routeLocalStorage[component];
      if (viewFromLocalStorage) {
        finalChartByName[component] = {
          initialViewType: viewFromLocalStorage.view,
          viewType: viewFromLocalStorage.view,
          wasDisplayed: false,
          target: {},
          global: {},
          top200: {},
        };
      }
    });
  }
  return finalChartByName;
}

function getPageConfigCharts(
  configChartName, kpiQuery, routeName, navigationProvider, kpiDataObject = {}) {
  const chartsByName = generateChartByName(configChartName, routeName);

  const generatedKpiData = getPageKpiData(kpiQuery, {
    ...kpiDataObject,
  });

  return {
    configChartName,
    chart: {
      config: {},
      isLoading: false,
      shouldRefreshData: false,
      pageName: ChartConfigPages[configChartName],
      kpiData: [],
    },
    chartByName: {
      ...chartsByName,
    },
    ...generatedKpiData,
  };
}

function generatedWatcherObject(fields) {
  const finalWatcherObject = {};
  fields.map(function (key) {
    finalWatcherObject[key] = [
      'fetchKPIDataForChart',
      'fetchKpi',
    ];
  });
  return finalWatcherObject;
}

const chartsWatcher = {
  'chart.shouldRefreshData': function () {
    this.updateChartData();
  },
  'chart.kpiData': {
    handler() {
      this.updateChartData();
    }, deep: true,
  },
  ...watchersFactory(
    generatedWatcherObject(
      [
        'navigationDataProvider.garageIds',
        'navigationDataProvider.periodId',
        'navigationDataProvider.dataTypeId',
        'navigationDataProvider.cockpitType',
        'navigationDataProvider.dms.frontDeskUserName',
        'navigationDataProvider.user',
        'navigationDataProvider.leadSaleType',
        'navigationDataProvider.automationCampaignType',
      ],
    ),
  ),
};

export { getPageConfigCharts, chartsComputed, chartsMethod, chartsWatcher };
