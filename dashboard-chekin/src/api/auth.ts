import {resolver, getAnonymousHeaders} from './index';

const ENDPOINTS = {
  refresh: () => `api-token-refresh/`,
  auth: () => `api-token-auth/`,
  registration: () => `auth/registration/?umt_source=UserRegistered`,
  integrationRegistration: (integrationUrl = '') => `${integrationUrl}/users/`,
  createCollaborator: () => `auth/registration/create-collaborator/`,
  allCollaborators: (params = '') => `users/me/collaborators/?${params}`,
  integrationValidation: (integrationUrl = '') =>
    `${integrationUrl}/users/validate-credentials/`,
};

function refreshToken({token = ''}: {token: string | null}) {
  return resolver(ENDPOINTS.refresh(), {
    method: 'POST',
    body: JSON.stringify({token}),
  });
}

function login(payload = {}) {
  return resolver(ENDPOINTS.auth(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

type CollaboratorPayload = {
  accountType: undefined;
  groups: (string | number)[];
  email: string;
};

function createCollaborator(payload: CollaboratorPayload) {
  return resolver(ENDPOINTS.createCollaborator(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function removeCollaborator(email: string) {
  const encodedEmail = encodeURIComponent(email);

  return resolver(ENDPOINTS.allCollaborators(`email=${encodedEmail}`), {
    method: 'DELETE',
    body: JSON.stringify({email: encodedEmail}),
  });
}

function updateCollaborator(payload:any) {
  return resolver(ENDPOINTS.allCollaborators(), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function register(payload: any) {
  return resolver(ENDPOINTS.registration(), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: getAnonymousHeaders(),
  });
}

function integrationRegister(integrationUrl = '', payload: any) {
  return resolver(ENDPOINTS.integrationRegistration(integrationUrl), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: getAnonymousHeaders(),
  });
}

function validateIntegrationCredentials(integrationUrl = '', payload: any) {
  return resolver(ENDPOINTS.integrationValidation(integrationUrl), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: getAnonymousHeaders(),
  });
}

export {
  ENDPOINTS,
  refreshToken,
  login,
  createCollaborator,
  removeCollaborator,
  updateCollaborator,
  register,
  integrationRegister,
  validateIntegrationCredentials,
};
