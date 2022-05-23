import {queryFetcher, resolver} from './index';
import {Lock, TempLock} from '../utils/types';

const ENDPOINTS = {
  lockUsers: () => `lock-users/`,
  lockUserById: (id: string) => `lock-users/${id}/`,
  externalLocks: (userId: string) => `lock-users/${userId}/external-locks/`,
  locks: (id?: string | null, params = '') =>
    `locks/${id ? `${id}/?${params}` : `?${params}`}`,
  updateLock: (id: string) => `locks/${id}/`,
  unlockLinks: (params = '') => `unlock-links/?${params}`,
  unlock: (token: string) => `locks/unlock/?token=${token}`,
  sendingHour: () => `user-lock-settings/`,
};

function createLockUser(payload: any) {
  return resolver(ENDPOINTS.lockUsers(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function updateLockUser(id: string, payload: any) {
  return resolver(ENDPOINTS.lockUserById(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function deleteLockUser(id: string) {
  return resolver(ENDPOINTS.lockUserById(id), {
    method: 'DELETE',
  });
}

function deleteLockUserFetcher(id: string) {
  return queryFetcher(ENDPOINTS.lockUserById(id), {
    method: 'DELETE',
  });
}

function createLock(payload: any) {
  return resolver(ENDPOINTS.locks(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function createLockMutation(payload: TempLock) {
  return queryFetcher<Lock>(ENDPOINTS.locks(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function updateLock(id: string, payload: any) {
  return resolver(ENDPOINTS.updateLock(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function deleteLock(id: string) {
  return resolver(ENDPOINTS.locks(id), {
    method: 'DELETE',
  });
}

function getSendingHours() {
  return resolver(ENDPOINTS.sendingHour(), {
    method: 'GET',
  });
}

export {
  ENDPOINTS,
  createLockUser,
  createLockMutation,
  updateLockUser,
  createLock,
  updateLock,
  deleteLock,
  deleteLockUser,
  deleteLockUserFetcher,
  getSendingHours,
};
