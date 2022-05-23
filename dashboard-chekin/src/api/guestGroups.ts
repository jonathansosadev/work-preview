import {queryFetcher, resolver} from './index';

const ENDPOINTS = {
  all: (id = '', params = '') => `guest-groups/${id ? `${id}/?${params}` : `?${params}`}`,
};

function patchById(id: string, payload: any, params = '') {
  return resolver(ENDPOINTS.all(id, params), {
    body: JSON.stringify(payload),
    method: 'PUT',
  });
}

function fetchGuestGroup(id: string) {
  return queryFetcher(ENDPOINTS.all(id));
}

export {ENDPOINTS, patchById, fetchGuestGroup};
