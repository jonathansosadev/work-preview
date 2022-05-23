import {getAnonymousHeaders, resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `purposes-of-stay/?${params}`,
};

function get(params = '') {
  return resolver(ENDPOINTS.all(params), {
    headers: getAnonymousHeaders(),
  });
}

export {ENDPOINTS, get};
