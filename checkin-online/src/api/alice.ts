import {resolver} from './index';

const ENDPOINTS = {
  users: () => `alice/users/`,
  aliceUserReport: () => `https://apis.alicebiometrics.com/onboarding/user/report`,
  mediaDownload: (id: string) =>
    `https://apis.alicebiometrics.com/onboarding/media/${id}/download`,
  report: () => `alice/reports/`,
};

function authenticate(email = '') {
  return resolver(ENDPOINTS.users(), {
    method: 'POST',
    body: JSON.stringify({email}),
  });
}

function getReport(userId: string) {
  return resolver(ENDPOINTS.report(), {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
    }),
  });
}

export {ENDPOINTS, authenticate, getReport};
