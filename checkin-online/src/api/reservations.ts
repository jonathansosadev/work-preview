import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `reservations/?${params}`,
  getOne: (id = '') => `reservations/${id}/`,
};

function create(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function getAll(params?: string) {
  return resolver(ENDPOINTS.all(params));
}

function getOne(id: string) {
  return resolver(ENDPOINTS.getOne(id));
}

function patch(id: string, payload: any = {}) {
  return resolver(ENDPOINTS.getOne(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, create, getOne, getAll, patch};
