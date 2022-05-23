import {resolver} from './index';

const ENDPOINTS = {
  availableYears: (housingId = '') =>
    `italian-police-receipts/available-years/${housingId}/`,
  downloadAll: (policeAccountId: string, year: string) =>
    `italian-police-receipts/download-all/${policeAccountId}/${year}/`,
  one: (id: string) => `italian-police-receipts/${id}/`,
  all: (params = '') => `italian-police-receipts/?${params}`,
};

function getAvailableYears(housingId: string) {
  return resolver(ENDPOINTS.availableYears(housingId));
}

type DownloadAllLinkTypes = {
  policeAccountId: string;
  year: string;
};
function getDownloadAllLink({policeAccountId, year}: DownloadAllLinkTypes) {
  return resolver(ENDPOINTS.downloadAll(policeAccountId, year));
}

function getDownloadOneLink(id: string) {
  return resolver(ENDPOINTS.one(id));
}

function getAll(params = '') {
  return resolver(ENDPOINTS.all(params));
}

export {ENDPOINTS, getAvailableYears, getDownloadAllLink, getDownloadOneLink, getAll};
