import {resolver, queryFetcher} from './index';

const ENDPOINTS = {
  me: () => 'users/me/',
  lockUsers: (params = '') => `lock-users/?${params}`,
  collaborators: (params = '') => `users/me/collaborators/?${params}`,
  integrationUser: (integrationUrl = '', id = '') => `${integrationUrl}/users/${id}/`,
  businessInformation: () => `user-business-information/`,
  propertyPermission: (id:any = '') => `property-permission/${id}/`,
  reservationPermission: (id:any = '') => `reservation-permission/${id}/`,
};

function getMe() {
  return resolver(ENDPOINTS.me());
}

function getLockUsers() {
  return resolver(ENDPOINTS.lockUsers());
}

function patchMe(payload = {}) {
  return resolver(ENDPOINTS.me(), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function deleteMe() {
  return resolver(ENDPOINTS.me(), {
    method: 'DELETE',
  });
}

function fetchUser() {
  return queryFetcher(ENDPOINTS.me());
}

function getIntegrationUser(integrationUrl = '', id = '') {
  return resolver(ENDPOINTS.integrationUser(integrationUrl, id));
}

function businessInformationMutation<T>(payload: T) {
  return queryFetcher(ENDPOINTS.businessInformation(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export {
  ENDPOINTS,
  patchMe,
  getMe,
  deleteMe,
  getLockUsers,
  fetchUser,
  getIntegrationUser,
  businessInformationMutation,
};
