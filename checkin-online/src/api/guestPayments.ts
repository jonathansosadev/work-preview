import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `guest-payments/${params}`,
  one: (id: string, params = '') => `guest-payments/${id}/?${params}`,
  forTaxes: (params = '') => `guest-payments/for-taxes/?${params}`,
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

export {ENDPOINTS, post, patch};
