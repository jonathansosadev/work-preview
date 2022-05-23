import {resolver} from './index';

const ENDPOINTS = {
  all: (params = '') => `stat-receipts/?${params}`,
  type: (type = '') => `stat-receipts/?stat_type=${type}`,
  year: (accountId = '') => `stat-receipts/?stat_account=${accountId}`,
  availableYears: (accountId = '') => `stat-receipts/available-years/${accountId}`,
  downloadAll: (accountId = '', year = '') =>
    `stat-receipts/download-all/${accountId}/${year}`,
  oneReceipt: (id = '') => `stat-receipts/${id}`,
  page: (page = 1) => `stat-receipts/?page=${page}`,
};

function getDownloadAllLink(accountId: string, year: string) {
  return resolver(ENDPOINTS.downloadAll(accountId, year));
}

function getDownloadOneReceiptLink(receiptId: string) {
  return resolver(ENDPOINTS.oneReceipt(receiptId));
}

export {ENDPOINTS, getDownloadAllLink, getDownloadOneReceiptLink};
