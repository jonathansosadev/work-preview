import {queryFetcher} from '.';
import {CheckinOnlineSendingSettingsPayload} from 'components/dashboard/OnlineSendingSettings';

const ENDPOINT = 'email-sending-settings';
const ENDPOINTS = {
  all: () => `${ENDPOINT}/`,
  one: (id: string) => `${ENDPOINT}/${id}/`,
};

function get(id: string) {
  return queryFetcher(ENDPOINTS.one(id));
}

function post(payload: CheckinOnlineSendingSettingsPayload) {
  return queryFetcher(ENDPOINTS.all(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patch(id: string, payload: CheckinOnlineSendingSettingsPayload) {
  return queryFetcher(ENDPOINTS.one(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export {ENDPOINTS, get, post, patch};
