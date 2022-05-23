import {queryFetcher} from './index';

const ENDPOINTS = {
  byId: (id: string, params = '') => `housing-exemptions/${id}/?${params}`,
};

function fetchHousingExemptions(housingId: string, sourceName = '') {
  return queryFetcher(ENDPOINTS.byId(housingId));
}

export {fetchHousingExemptions};
