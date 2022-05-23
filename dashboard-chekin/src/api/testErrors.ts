import {resolver} from './index';

const ENDPOINTS = {
  testError: (code: number) => `test-error/raise-${code}`,
};

function raise(code: number = 500, payload?: any) {
  return resolver(
    ENDPOINTS.testError(code),
    {
      method: payload ? 'POST' : 'GET',
      body: payload ? JSON.stringify(payload) : undefined,
    },
    {customURL: `https://api-ng.chekintest.xyz/test-error/raise-${code}`},
  );
}

export {ENDPOINTS, raise};
