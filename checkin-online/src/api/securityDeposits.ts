import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `security-deposits/?${params}`,
  byId: (id: string, params = '') => `security-deposits/${id}/${params}`,
};

function post(payload: any = {}, params = '') {
  return resolver(ENDPOINTS.all(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patch(id: string, payload: any = {}, params = '') {
  return resolver(ENDPOINTS.byId(id, params), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function get(params = '') {
  return resolver(ENDPOINTS.all(params));
}

function getById(id: string, params = '') {
  return resolver(ENDPOINTS.byId(id, params));
}

export {ENDPOINTS, post, get, patch, getById};
