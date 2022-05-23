import {queryFetcher, resolver} from './index';
import {Guest, Paginated} from '../utils/types';

const ENDPOINTS = {
  all: (id = '', params = '') => `guests/${id ? `${id}/?${params}` : `?${params}`}`,
  guestLeaders: (params = '') => `guest-leaders/?${params}`,
};

function patchById(id: string, payload: any, params = '') {
  return resolver(ENDPOINTS.all(id, params), {
    body: JSON.stringify(payload),
    method: 'PATCH',
  });
}

function patchByIdQuery(id: string, payload: Partial<Omit<Guest, 'id'>>, params = '') {
  return queryFetcher<Guest>(ENDPOINTS.all(id, params), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function post(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteById(id: string) {
  return resolver(ENDPOINTS.all(id), {
    method: 'DELETE',
  });
}

function getGuestLeaders(params: string) {
  return resolver(ENDPOINTS.guestLeaders(params));
}

function fetchGuestLeaders(key: string, params = '') {
  return queryFetcher(ENDPOINTS.guestLeaders(params)).then(
    (res: Paginated<{full_name: string}>) => {
      return {
        ...res,
        results: res.results.map((option) => {
          return {
            value: option.full_name,
            label: option.full_name,
          };
        }),
      };
    },
  );
}

export {
  ENDPOINTS,
  patchById,
  post,
  deleteById,
  getGuestLeaders,
  fetchGuestLeaders,
  patchByIdQuery,
};
