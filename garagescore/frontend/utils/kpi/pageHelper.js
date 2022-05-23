import {
  getGqlString,
  graphQlQuery,
} from '~/util/graphql';
import { watchersFactory } from '~/mixins/utils';

function getPageKpiData(kpiQuery, data = {}) {
  return {
    kpi: {
      data: data,
      loading: false,
      query: kpiQuery,
    },
  };
}

function mixinKpiData() {
  return {
    isLoading: this.kpi.loading,
    data: this.kpi.data,
  };
}

const kpiComputed = {
  mixinKpiData,
};

async function fetchKpi() {
  const {
    cockpitType,
    dataTypeId,
    dms,
    garageIds,
    periodId,
    user,
  } = this.navigationDataProvider;

  this.kpi.loading = true;

  const query = getGqlString(this.kpi.query);
  const variables = {
    periodId,
    garageId: garageIds || dms.garageId,
    type: dataTypeId,
    cockpitType,
    frontDesk: dms.frontDeskUserName,
    userId: user,
  };
  const resp = await graphQlQuery(query, variables, { requestKey: 'fetchKpiMixin' });

  const data = resp?.data ?? {};
  this.kpi.data = data;
  this.kpi.loading = false;
}

const kpiMethod = {
  fetchKpi,
};

function generatedWatcherObject(fields) {
  const finalWatcherObject = {};
  fields.map(function (key) {
    finalWatcherObject[key] = ['fetchKpi'];
  });
  return finalWatcherObject;
}

function getKpiWatcher(watcherFields) {
  const defaultFields = [
    'navigationDataProvider.garageIds',
    'navigationDataProvider.periodId',
    'navigationDataProvider.dataTypeId',
    'navigationDataProvider.cockpitType',
    'navigationDataProvider.dms.frontDeskUserName',
    'navigationDataProvider.user',
  ];
  return watchersFactory(generatedWatcherObject(watcherFields ?? defaultFields));
}

const kpiWatcher = {};



export {
  getPageKpiData,
  kpiComputed,
  kpiMethod,
  kpiWatcher,
  getKpiWatcher,
};
