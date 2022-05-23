import {resolver, queryFetcher} from './index';

const ENDPOINTS = {
  all: (id = '') => `payments-settings/${id ? `${id}/` : ''}`,
  movementsPreview: () => `payments-settings/movements-preview/`,
  fullMovements: (params = '') => `payments-settings/movements-full/?${params}`,
  refresh: () => `payments-settings/refresh-link/`,
};

function get() {
  return resolver(ENDPOINTS.all());
}

function patch(id: string, payload: any) {
  return resolver(ENDPOINTS.all(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function post(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function refresh() {
  return resolver(ENDPOINTS.refresh(), {
    method: 'POST',
  });
}

function fetchPaymentSettings() {
  return queryFetcher(ENDPOINTS.all());
}

function mutatePaymentSettings({payload, id}: {payload: any; id?: string}) {
  return queryFetcher(ENDPOINTS.all(id), {
    method: id ? 'PATCH' : 'POST',
    body: JSON.stringify(payload),
  });
}

export {
  ENDPOINTS,
  patch,
  get,
  post,
  refresh,
  fetchPaymentSettings,
  mutatePaymentSettings,
};
