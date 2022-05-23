import {getURL, resolver} from './index';

const ENDPOINTS = {
  byId: (id: string, params = '') => `housing-exemptions/${id}/?${params}`,
};

function getById(id: string, params = '') {
  return resolver(ENDPOINTS.byId(id, params));
}

function fetchHousingExemptions(housingId: string) {
  return getURL(ENDPOINTS.byId(housingId));
}

export {ENDPOINTS, getById, fetchHousingExemptions};
