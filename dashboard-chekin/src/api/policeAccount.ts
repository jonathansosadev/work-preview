import {resolver} from './index';

const ENDPOINTS = {
  validation: (id = '') => `police-account-validation/${id ? `${id}/` : ''}`,
  all: (params = '') => `police-accounts/?${params}`,
  checkIsPoliceHasType: (policeType: string) => `police-accounts/has-type/${policeType}/`,
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

function getAll(params = '') {
  return resolver(ENDPOINTS.all(params));
}

export {ENDPOINTS, startValidation, checkValidationStatus, getAll};
