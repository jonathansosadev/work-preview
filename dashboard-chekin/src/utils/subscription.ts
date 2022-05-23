import {Subscription} from './types';
import {
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_INTERVALS_OPTIONS,
  SUBSCRIPTION_PRODUCT_TYPES,
} from './constants';
import moment, {Moment} from 'moment';
import {getMomentTZDate} from './common';

function getSubscriptionPeriodItem(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const currentPeriodItems = subscription?.current_period_items;

  if (!currentPeriodItems?.length) {
    return null;
  }

  return currentPeriodItems.find((period) => {
    return period.product === planType;
  });
}

function getNextSubscriptionPeriodItem(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const currentPeriodItems = subscription?.next_period_items;

  if (!currentPeriodItems?.length) {
    return null;
  }

  return currentPeriodItems.find((period) => {
    return period.product === planType;
  });
}

function getSubscriptionInterval(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return null;
  }

  return periodItem.interval;
}

function getNextSubscriptionInterval(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getNextSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return null;
  }

  return periodItem.interval;
}

function getSubscriptionProduct(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return null;
  }

  return periodItem.plan;
}

function getSubscriptionQuantity(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return 0;
  }

  return periodItem.quantity;
}

function getNextSubscriptionQuantity(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getNextSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return 0;
  }

  return periodItem.quantity;
}

function getIsProductActive(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return false;
  }

  return Boolean(periodItem.plan);
}

function getSubscriptionPlan(
  subscription?: Subscription,
  planType: string = SUBSCRIPTION_PRODUCT_TYPES.chekin,
) {
  const periodItem = getSubscriptionPeriodItem(subscription, planType);
  if (!periodItem) {
    return '';
  }

  return periodItem.plan;
}

function getStripeDate(date: Moment | Date | string | number) {
  const stripeTimeZone = 'Europe/Madrid';
  return getMomentTZDate(date, stripeTimeZone);
}

function getSubscriptionIntervalOption(interval: string | null) {
  if (interval === SUBSCRIPTION_INTERVALS_OPTIONS[SUBSCRIPTION_INTERVALS.year].value) {
    return SUBSCRIPTION_INTERVALS_OPTIONS[SUBSCRIPTION_INTERVALS.year];
  }

  return SUBSCRIPTION_INTERVALS_OPTIONS[SUBSCRIPTION_INTERVALS.month];
}

function getTrialDaysLeft(date?: string) {
  if (!date) {
    return '..';
  }

  const today = moment();
  const trialEndDate = getStripeDate(Number(date) * 1000);
  const daysLeft = trialEndDate.diff(today, 'days') + 1;

  return daysLeft < 0 ? 0 : daysLeft;
}

export {
  getTrialDaysLeft,
  getSubscriptionIntervalOption,
  getStripeDate,
  getSubscriptionInterval,
  getSubscriptionProduct,
  getIsProductActive,
  getSubscriptionQuantity,
  getNextSubscriptionInterval,
  getSubscriptionPlan,
  getNextSubscriptionQuantity,
};
