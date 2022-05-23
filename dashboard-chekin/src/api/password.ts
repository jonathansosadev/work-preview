import {getAnonymousHeaders, resolver} from './index';

const ENDPOINTS = {
  reset: () => `password/reset/email/`,
};

function reset(email: string) {
  return resolver(ENDPOINTS.reset(), {
    method: 'POST',
    body: JSON.stringify({email}),
    headers: getAnonymousHeaders(),
  });
}

export {ENDPOINTS, reset};
