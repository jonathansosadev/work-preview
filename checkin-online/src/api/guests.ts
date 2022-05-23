import {resolver} from './index';
import {Guest} from '../utils/types';

const ENDPOINTS = {
  all: (id = '') => `guests/${id ? `${id}/` : ``}`,
  one: (id: string, params = '') => `guests/${id}/${params}`,
};

function post(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type PatchGuestPayload = Partial<Omit<Guest, 'id'>> & {
  reservation_id?: string;
  front_side_scan?: string;
  back_side_scan?: string;
};

function patch(id: string, payload: PatchGuestPayload = {}) {
  return resolver(ENDPOINTS.all(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, post, patch};
