import {resolver} from './index';

const ENDPOINTS = {
  searchReservation: (id: string) => `housings/${id}/search-existing-reservation/`,
};

function searchReservation(id: string, payload: any) {
  return resolver(ENDPOINTS.searchReservation(id), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, searchReservation};
