import {resolver} from './index';

const ENDPOINTS = {
  all: () => `write-offs/`,
};

function post(payload = {}) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, post};
