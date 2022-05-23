import {resolver} from './index';

const ENDPOINTS = {
  refresh: () => 'checkin-online-token/refresh/',
};

function refreshToken({token = ''}: {token: string | null}) {
  return resolver(ENDPOINTS.refresh(), {
    method: 'POST',
    body: JSON.stringify({token}),
  });
}

export {ENDPOINTS, refreshToken};
