import {resolver} from './index';

const ENDPOINTS = {
  contracts: (params = '') => `documents/contracts/?${params}`,
};

function getContracts(params = '') {
  return resolver(ENDPOINTS.contracts(params));
}

export {ENDPOINTS, getContracts};
