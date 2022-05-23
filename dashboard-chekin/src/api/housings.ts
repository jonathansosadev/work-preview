import api, {queryFetcher, resolver} from './index';
import {Paginated} from '../utils/types';

const ENDPOINTS = {
  all: (params = '') => `housings/?${params}`,
  allLight: () => `housings-light/`,
  one: (id = '', params = '') => `housings/${id}/?${params}`,
  sendSync: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/users/${userId}/sync-user-housings/`,
  syncTasks: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/housings-syncronize-tasks/?user_id=${userId}`,
  mapTask: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/users/${userId}/send-map-housings-tasks/`,
  unmapped: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/housings/unmapped/?user_id=${userId}`,
  connectAutomatically: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/users/${userId}/send-connect-housings-automatically-task/`,
  contracts: () => `contract-sample-generation/`,
  ajpesMonthlyReport: () => `ajpes-monthly-report/report/`,
  deactivateSelfCheckin: () => `housings/deactivate-self-online-check-in/`,
  housingFromCode: (origin: string, userId: string) =>
    `${origin}/users/${userId}/add-shortnames/`,
  activeState: (id = '', event = '') => `housings/${id}/${event}/`,
};

function fetchHousings(params = '') {
  return queryFetcher(api.housings.ENDPOINTS.all(params));
}

function createHousingFromCode(origin: string, userId: string, payload: any = {}) {
  return resolver(ENDPOINTS.housingFromCode(origin, userId), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function get(params = '') {
  return resolver(ENDPOINTS.all(params));
}

function getOne(id: string, params = '') {
  return resolver(ENDPOINTS.one(id, params));
}

function deleteById(id: string) {
  return resolver(ENDPOINTS.one(id), {
    method: 'DELETE',
  });
}

function post(payload: any = {}) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function createContractSample(payload: any = {}) {
  return resolver(ENDPOINTS.contracts(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patchById(id: string, payload: any = {}) {
  return resolver(ENDPOINTS.one(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function toggleActiveStateById(id: string, event: string, payload: any = {}) {
  return resolver(ENDPOINTS.activeState(id, event), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function sendSyncTask(integrationUrl = '', userId = '') {
  return resolver(ENDPOINTS.sendSync(integrationUrl, userId), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

function getSyncTasks(integrationUrl = '', userId = '') {
  return resolver(ENDPOINTS.syncTasks(integrationUrl, userId));
}

function sendMapTask(integrationUrl = '', userId = '', data = {}) {
  return resolver(ENDPOINTS.mapTask(integrationUrl, userId), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function sendConnectHousingsAutomaticallyTask(
  integrationUrl = '',
  userId = '',
  data = {},
) {
  return resolver(ENDPOINTS.connectAutomatically(integrationUrl, userId), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

function getUnmapped(integrationUrl = '', userId = '') {
  return resolver(ENDPOINTS.unmapped(integrationUrl, userId));
}

function sendAjpesMonthlyReportTask(payload: any = {}) {
  return resolver(ENDPOINTS.ajpesMonthlyReport(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deactivateSelfCheckin() {
  return resolver(ENDPOINTS.deactivateSelfCheckin(), {
    method: 'POST',
  });
}

function fetchPaginatedList(key: string, page = 1, name = '', extraParams = '') {
  return queryFetcher(
    ENDPOINTS.all(
      `field_set=id,name&page=${page}&name=${encodeURIComponent(name)}&${extraParams}`,
    ),
  ).then((res: Paginated<{id: string; name: string}>) => {
    return {
      ...res,
      results: res.results.map((option) => {
        return {
          value: option.id,
          label: option.name,
        };
      }),
    };
  });
}

function fetchOne(id: string, params = '') {
  return queryFetcher(ENDPOINTS.one(id, params));
}

export {
  ENDPOINTS,
  get,
  post,
  getOne,
  deleteById,
  patchById,
  createContractSample,
  sendSyncTask,
  getSyncTasks,
  getUnmapped,
  sendMapTask,
  sendConnectHousingsAutomaticallyTask,
  sendAjpesMonthlyReportTask,
  deactivateSelfCheckin,
  createHousingFromCode,
  fetchPaginatedList,
  fetchOne,
  fetchHousings,
  toggleActiveStateById,
};
