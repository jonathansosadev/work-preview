import {resolver} from './index';

const ENDPOINTS = {
  offers: (params = '') => `upselling/offers/?${params}`,
  oneOffer: (id: string, params = '') => `upselling/offers/${id}/?${params}`,
  oneSupplier: (id: string, params = '') => `upselling/suppliers/${id}/?${params}`,
  deals: (params = '') => `upselling/deals/?${params}`,
  oneDeal: (id: string) => `upselling/deals/${id}/`,
  bulkDeals: (params = '') => `upselling/deals/bulk-create/?${params}`,
};

function getDeals(params = '') {
  return resolver(ENDPOINTS.deals(params));
}

function createDeal(payload: any, params = '') {
  return resolver(ENDPOINTS.deals(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function bulkCreateDeals(payload: any, params = '') {
  return resolver(ENDPOINTS.bulkDeals(params), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteDeal(id: string) {
  return resolver(ENDPOINTS.oneDeal(id), {
    method: 'DELETE',
  });
}

export {ENDPOINTS, createDeal, bulkCreateDeals, deleteDeal, getDeals};
