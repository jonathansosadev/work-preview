import {queryFetcher, resolver} from './index';
import {CustomField} from '../utils/types';

const ENDPOINTS = {
  oneField: (id: string, params = '') => `guest-custom-form/fields/${id}/?${params}`,
  fields: (params = '') => `guest-custom-form/fields/?${params}`,
  customForm: (params = '') => `guest-custom-form/form/?${params}`,
  customFormById: (id: string, params = '') => `guest-custom-form/form/${id}/?${params}`,
  customValues: (params = '') => `guest-custom-form/custom-values/?${params}`,
  customValuesById: (guestId: string, params = '') =>
    `guest-custom-form/custom-values/${guestId}/?${params}`,
};

function customFieldMutation(payload: Partial<CustomField>, id?: string, params = '') {
  return queryFetcher<CustomField>(
    id ? ENDPOINTS.oneField(id, params) : ENDPOINTS.fields(params),
    {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    },
  );
}

function postCustomFields(payload: any, params = '') {
  return resolver(ENDPOINTS.fields(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteCustomField(id: string, params = '') {
  return resolver(ENDPOINTS.customFormById(id, params), {
    method: 'DELETE',
  });
}

function postCustomForm(payload: any, params = '') {
  return resolver(ENDPOINTS.customForm(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patchCustomForm(id: string, payload: any, params = '') {
  return resolver(ENDPOINTS.customFormById(id, params), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function createFields(formId: string, payload: any, params = '') {
  return resolver(ENDPOINTS.customValues(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patchFields(guestId: string, payload: any, params = '') {
  return resolver(ENDPOINTS.customValuesById(guestId, params), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export {
  ENDPOINTS,
  customFieldMutation,
  postCustomFields,
  deleteCustomField,
  postCustomForm,
  patchCustomForm,
  createFields,
  patchFields,
};
