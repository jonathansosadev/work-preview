import {resolver} from './index';

const ENDPOINTS = {
  customForm: (params = '') => `guest-custom-form/form/?${params}`,
  customFormById: (id: string, params = '') => `guest-custom-form/form/${id}/?${params}`,
  createFields: (params = '') => `guest-custom-form/custom-values/?${params}`,
};

function createFields(payload: any, params = '') {
  return resolver(ENDPOINTS.createFields(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, createFields};
