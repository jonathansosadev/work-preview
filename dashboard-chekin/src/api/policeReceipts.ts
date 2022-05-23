import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `police-receipts/?${params}`,
  type: (type = '') => `police-receipts/?police_type=${type}`,
  year: (accountId = '') => `police-receipts/?police_account=${accountId}`,
  availableYears: (accountId = '') => `police-receipts/available-years/${accountId}`,
  downloadAll: (accountId = '', year = '') =>
    `police-receipts/download-all/${accountId}/${year}`,
  oneReceipt: (id = '') => `police-receipts/${id}`,
  page: (page = 1) => `police-receipts/?page=${page}`,
};

function getDownloadAllLink(accountId: string, year: string) {
  return resolver(ENDPOINTS.downloadAll(accountId, year));
}

function getDownloadOneReceiptLink(receiptId: string) {
  return resolver(ENDPOINTS.oneReceipt(receiptId));
}

export {ENDPOINTS, getDownloadAllLink, getDownloadOneReceiptLink};
