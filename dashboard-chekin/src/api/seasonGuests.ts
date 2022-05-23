import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `season-guests/?${params}`,
  one: (id = '', params = '') => `season-guests/${id}/?${params}`,
};

function post(payload: any = {}, params?: string) {
  return resolver(ENDPOINTS.all(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patch(id: string, payload: any = {}, params?: string) {
  return resolver(ENDPOINTS.one(id, params), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function get(params?: string) {
  return resolver(ENDPOINTS.all(params));
}

export {ENDPOINTS, post, get, patch};
