import {resolver} from './index';

const ENDPOINTS = {
  validation: (id = '') => `stat-account-validation/${id ? `${id}/` : ''}`,
  types: (params = '') => `stat-types/?${params}`,
  locations: (params = '') => `stat-type-locations/?${params}`,
  hasType: (type: string) => `stat-accounts/has-type/${type}/`,
};

function startValidation(payload: any = {}) {
  return resolver(ENDPOINTS.validation(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function checkValidationStatus(id = '') {
  return resolver(ENDPOINTS.validation(id), {
    method: 'GET',
  });
}

function getTypes(params = '') {
  return resolver(ENDPOINTS.types(params));
}

function getLocations(params = '') {
  return resolver(ENDPOINTS.locations(params));
}

export {ENDPOINTS, startValidation, checkValidationStatus, getTypes, getLocations};
