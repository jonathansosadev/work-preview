import {getAnonymousHeaders, queryFetcher, resolver} from './index';
import {CURRENCIES, SUBSCRIPTION_INTERVALS} from '../utils/constants';

const ENDPOINTS = {
  subscriptions: (params = '') => `payments/user/subscriptions/?${params}`,
  oneSubscription: (id = '') => `payments/user/subscriptions/${id}/`,
  plans: (params = '') => `payments/plans/?${params}`,
  invoices: (params = '') => `payments/user/invoices/?${params}`,
  billingDetails: (params = '') => `payments/user/billing-details/?${params}`,
  resumeSubscription: (id = '') => `payments/user/subscriptions/${id}/resume/`,
  secret: () => `payments/secret/`,
  paymentMethod: () => `payments/user/payment-method/`,
  onePlan: (id: string) => `payments/plans/${id}/`,
  oneCoupon: (id: string) => `payments/coupons/${id}/`,
  planTotalPrice: (id: string, params = '') =>
    `payments/plans/${id}/total-price/?${params}`,
  upcomingInvoices: () => `payments/user/invoices/upcoming/`,
  currentItemsInCurrency: (params = '') =>
    `payments/plans/current-items-in-currency/?${params}`,
};

function getSubscriptions(params = '') {
  return resolver(ENDPOINTS.subscriptions(params));
}

function createSubscription(payload = {}) {
  return resolver(ENDPOINTS.subscriptions(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function patchOneSubscription(id = '', payload = {}) {
  return resolver(ENDPOINTS.oneSubscription(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function deleteOneSubscription(id = '') {
  return resolver(ENDPOINTS.oneSubscription(id), {
    method: 'DELETE',
  });
}

function patchBillingDetails(payload = {}) {
  return resolver(ENDPOINTS.billingDetails(), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function getPlans(params = '') {
  return resolver(ENDPOINTS.plans(params), {
    headers: getAnonymousHeaders(),
  });
}

function getOnePlan(id = '') {
  return resolver(ENDPOINTS.onePlan(id));
}

function getInvoices(params = '') {
  return resolver(ENDPOINTS.invoices(params));
}

function getUserBillingDetails(params = '') {
  return resolver(ENDPOINTS.billingDetails(params));
}

function getSecret() {
  return resolver(ENDPOINTS.secret());
}

function restartSubscription(id = '') {
  return resolver(ENDPOINTS.resumeSubscription(id), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

function bindUserCard(payload = {}) {
  return resolver(ENDPOINTS.paymentMethod(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteUserCard() {
  return resolver(ENDPOINTS.paymentMethod(), {
    method: 'DELETE',
  });
}

function getUserCard() {
  return resolver(ENDPOINTS.paymentMethod());
}

function getOneCoupon(id = '') {
  return resolver(ENDPOINTS.oneCoupon(id));
}

function getUpcomingInvoices() {
  return resolver(ENDPOINTS.upcomingInvoices());
}

function getPlanTotalPrice(id: string, params = '') {
  return resolver(ENDPOINTS.planTotalPrice(id, params));
}

function fetchCurrentItemsInCurrency({
  currency,
  chekinQuantity,
  interval,
  isFree,
}: {
  currency: CURRENCIES;
  interval: SUBSCRIPTION_INTERVALS;
  chekinQuantity: number;
  isFree: '0' | '1';
}) {
  const params = `currency=${currency}&interval=${interval}&chekin_quantity=${chekinQuantity}&is_free=${isFree}`;
  return queryFetcher(ENDPOINTS.currentItemsInCurrency(params));
}

function fetchPaymentMethod() {
  return queryFetcher(ENDPOINTS.paymentMethod());
}

function fetchPlan(params = '') {
  return queryFetcher(ENDPOINTS.plans(params));
}

export {
  ENDPOINTS,
  fetchPlan,
  getUpcomingInvoices,
  getSubscriptions,
  createSubscription,
  patchOneSubscription,
  getPlans,
  getOnePlan,
  getInvoices,
  getUserBillingDetails,
  restartSubscription,
  getSecret,
  bindUserCard,
  patchBillingDetails,
  getUserCard,
  deleteUserCard,
  getOneCoupon,
  deleteOneSubscription,
  getPlanTotalPrice,
  fetchCurrentItemsInCurrency,
  fetchPaymentMethod,
};
