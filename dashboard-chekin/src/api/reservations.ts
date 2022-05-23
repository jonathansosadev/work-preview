import {queryFetcher, resolver} from './index';
import {LANGUAGES_ISO_3} from '../utils/constants';

const ENDPOINTS = {
  all: (params = '') => `reservations/?${params}`,
  one: (id = '', params = '') => `reservations/${id}/?${params}`,
  sendSync: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/users/${userId}/sync-user-reservations/`,
  syncTasks: (integrationUrl = '', userId = '') =>
    `${integrationUrl}/reservations-syncronize-tasks/?user_id=${userId}`,
  email: () => `reservation-emails/`,
  emailStatistics: (id: string) => `reservation-emails/statistics/${id}/`,
  reservationEmails: (id: string) => `reservations/mails/sent/?reservation=${id}`,
  defaulReservationsEmails: (id: string) => `reservation-feature-activated/?reservation=${id}`,
  emailStatisticsSmartLock: (id: string) =>
    `reservation-emails/statistics-smartlock/${id}/`,
  emailLanguage: (id: string) => `reservation-emails/language/${id}/`,
  sendToRegistration: (id = '') => `reservations/${id}/resend-reservation-to-stat/`,
  forceSendToRegistration: (id = '') =>
    `reservations/${id}/force-start-stat-registration/`,
  sendGuestToPoliceCheckIn: (id = '') =>
    `reservations/${id}/hard-restart-police-registration/`,
  sendGuestToPoliceCheckOut: (id = '') =>
    `reservations/${id}/send-reservation-to-police-check-out/`,
  sendGuestToRegistration: (id = '', guest_id = '') =>
    `reservations/${id}/restart-police-registration/?guest=${guest_id}`,
  light: (params = '') => `light/reservations/?${params}`,
  oneLight: (id = '', params = '') => `light/reservations/${id}/?${params}`,
  sendPaymentsRequestEmail: (id: string) =>
    `reservations/${id}/send-payments-request-email/`,
  sendUpsellingDealsListEmail: (id: string) =>
    `reservations/${id}/send-upselling-deals-list-email/`,
  sendVerificationRetryEmail: (id: string) =>
    `reservations/${id}/send-id-verification-retry-email/`,
  reservationsFeaturesStatuses: (params = '') => `status/reservations/?${params}`,
};

function get(params = '') {
  return resolver(ENDPOINTS.all(params), {
    mode: 'no-cors',
  });
}

function getOne(id: string, params = '') {
  return resolver(ENDPOINTS.one(id, params));
}

function deleteOne(id: string) {
  return resolver(ENDPOINTS.one(id), {
    method: 'DELETE',
  });
}

function create(payload: any) {
  return resolver(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function sendSyncTask(integrationUrl = '', userId = '') {
  return resolver(ENDPOINTS.sendSync(integrationUrl, userId), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

function getSyncTasks(integrationUrl = '', userId = '') {
  return resolver(ENDPOINTS.syncTasks(integrationUrl, userId));
}

function sendReservationEmail(payload: any) {
  return resolver(ENDPOINTS.email(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patch(id: string, payload: any) {
  return resolver(ENDPOINTS.one(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function put(id: string, payload: any) {
  return resolver(ENDPOINTS.one(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

function sendToRegistration(id: string) {
  return resolver(ENDPOINTS.sendToRegistration(id), {
    method: 'POST',
  });
}

function forceSendToRegistration(id: string) {
  return resolver(ENDPOINTS.forceSendToRegistration(id), {
    method: 'POST',
  });
}

function forceSendToPoliceCheckIn(id: string) {
  return resolver(ENDPOINTS.sendGuestToPoliceCheckIn(id), {
    method: 'POST',
  });
}

function forceSendToPoliceCheckOut(id: string) {
  return resolver(ENDPOINTS.sendGuestToPoliceCheckOut(id), {
    method: 'POST',
  });
}

function sendGuestToRegistration(id: string, guest_id: string) {
  return resolver(ENDPOINTS.sendGuestToRegistration(id, guest_id), {
    method: 'POST',
  });
}

function getEmailStatistics(id: string) {
  return resolver(ENDPOINTS.emailStatistics(id));
}

function getReservationEmails(id:string) {
  return resolver(ENDPOINTS.reservationEmails(id));
}

function getDefaultReservationEmails(id:string) {
  return resolver(ENDPOINTS.defaulReservationsEmails(id));
}


function getLight(params: string) {
  return resolver(ENDPOINTS.light(params), {
    mode: 'no-cors',
  });
}

function getOneLight(id: string, params = '') {
  return resolver(ENDPOINTS.one(id, params));
}

function putLight(id: string, payload: any) {
  return resolver(ENDPOINTS.oneLight(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

function sendPaymentsRequestEmail(id: string) {
  return queryFetcher(ENDPOINTS.sendPaymentsRequestEmail(id), {
    method: 'POST',
  });
}

type KeysLanguages = keyof typeof LANGUAGES_ISO_3;
type Languages = typeof LANGUAGES_ISO_3[KeysLanguages];
function sendVerificationRetryEmail(id: string, payload: {language: Languages}) {
  return queryFetcher(ENDPOINTS.sendVerificationRetryEmail(id), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function sendUpsellingDealsListEmailMutation(reservationId: string) {
  return queryFetcher(ENDPOINTS.sendUpsellingDealsListEmail(reservationId), {
    method: 'POST',
  });
}

export {
  ENDPOINTS,
  getOneLight,
  get,
  getOne,
  deleteOne,
  create,
  patch,
  put,
  putLight,
  sendReservationEmail,
  sendSyncTask,
  getSyncTasks,
  sendToRegistration,
  forceSendToRegistration,
  sendGuestToRegistration,
  getEmailStatistics,
  getReservationEmails,
  getDefaultReservationEmails,
  getLight,
  forceSendToPoliceCheckIn,
  forceSendToPoliceCheckOut,
  sendPaymentsRequestEmail,
  sendUpsellingDealsListEmailMutation,
  sendVerificationRetryEmail,
};
