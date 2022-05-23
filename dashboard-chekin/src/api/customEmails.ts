import {resolver, queryFetcher} from './index';
import {CustomEmailsPayload} from '../components/dashboard/CustomEmail';

const ENDPOINTS = {
  customEmails: (id?: string) => `custom-emails/${id ? `${id}/` : ''}`,
};

function getCustomEmails() {
  return resolver(ENDPOINTS.customEmails());
}

function createCustomEmails(payload: CustomEmailsPayload) {
  return resolver(ENDPOINTS.customEmails(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function updateCustomEmails(id: string, payload: CustomEmailsPayload) {
  return resolver(ENDPOINTS.customEmails(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function deleteCustomEmail(id: string) {
  return resolver(ENDPOINTS.customEmails(id), {
    method: 'DELETE',
  });
}

function fetchCustomEmails() {
  return queryFetcher(ENDPOINTS.customEmails());
}

function fetchCustomEmail(id: string) {
  return queryFetcher(ENDPOINTS.customEmails(id));
}

export {
  getCustomEmails,
  createCustomEmails,
  updateCustomEmails,
  deleteCustomEmail,
  fetchCustomEmails,
  fetchCustomEmail,
};
