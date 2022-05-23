import {getAnonymousHeaders, queryFetcher, resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `locations/?${params}`,
};

function getLocations(params = '') {
  return resolver(ENDPOINTS.all(params), {
    method: 'GET',
    headers: getAnonymousHeaders(),
  });
}

function fetchCountries(options?: any) {
  return queryFetcher(ENDPOINTS.all(`ordering=name`), options);
}

export {ENDPOINTS, getLocations, fetchCountries};
