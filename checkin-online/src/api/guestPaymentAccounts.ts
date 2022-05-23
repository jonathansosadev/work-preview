import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `guest-payment-accounts/${params}`,
  byId: (id: string, params = '') => `guest-payment-accounts/${id}/${params}`,
};

function post(payload: any = {}, params?: string) {
  return resolver(ENDPOINTS.all(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patch(id: string, payload: any = {}, params?: string) {
  return resolver(ENDPOINTS.byId(id, params), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, post, patch};
