import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `stat-tax-exemptions/?${params}`,
};

function get(params = '') {
  return resolver(ENDPOINTS.all(params));
}

export {ENDPOINTS, get};
