import {queryFetcher, resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `reservation-sources/?${params}`,
};

function post(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function fetchReservationSources(params = '') {
  return queryFetcher(ENDPOINTS.all(params));
}

export {ENDPOINTS, post, fetchReservationSources};