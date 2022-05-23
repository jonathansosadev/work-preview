import {getAnonymousHeaders, resolver} from './index';

const ENDPOINTS = {
  get: (params = '') => `locations/?${params}`,
};

function get(params = '') {
  return resolver(ENDPOINTS.get(params), {
    headers: getAnonymousHeaders(),
  });
}

export {ENDPOINTS, get};
