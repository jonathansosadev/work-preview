import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `payment-refunds/?${params}`,
};

function post(payload: any, params = '') {
  return resolver(ENDPOINTS.all(params), {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export {ENDPOINTS, post};
