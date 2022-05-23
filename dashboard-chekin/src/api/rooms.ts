import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `rooms/?${params}`,
  one: (id = '') => `rooms/${id}/`,
};

function get(params = '') {
  return resolver(ENDPOINTS.all(params));
}

function post(payload: any = {}) {
  return resolver(ENDPOINTS.all(), {
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

function deleteOne(id: string) {
  return resolver(ENDPOINTS.one(id), {
    method: 'DELETE',
  });
}

export {ENDPOINTS, get, post, patchById, deleteOne};
