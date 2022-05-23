import {resolver} from './index';

const ENDPOINTS = {
  get: (params = '') => `stat-tax-exemptions/?${params}`,
};

function get(params = '') {
  return resolver(ENDPOINTS.get(params));
}

export {ENDPOINTS, get};
