import React from 'react';
import {useQuery} from 'react-query';
import api, {queryFetcher, ResolverTypes} from '../api';
import type {Subscription} from '../utils/types';
import {useUser} from './user';
import {toastResponseError} from '../utils/common';
import {useWebsocket} from './websocket';
import {getIsProductActive} from '../utils/subscription';
import {
  SUBSCRIPTION_PRODUCT_TYPES,
  SUBSCRIPTION_TYPES,
  WS_EVENT_TYPES,
} from '../utils/constants';

const CUSTOM_TRIAL_SUBSCRIPTION_ID = 'sub_trial';

type ContextProps = {
  subscription?: Subscription;
  subscribeAndSetSubscription: (payload: object) => Promise<ResolverTypes>;
  fetchAndSetActiveSubscription: () => void;
  updateAndSetSubscription: (id: string, payload: object) => Promise<ResolverTypes>;
  isSubscriptionCanceled: boolean;
  isSubscriptionActive: boolean;
  hasSubscriptionPlan: boolean;
  isSubscriptionScheduledToCancel: boolean;
  isTrialMode: boolean;
  isSubscriptionRequired: boolean;
  isLoading: boolean;
  restartSubscription: () => void;
  refreshSubscription: () => void;
  isTrialEnded: boolean;
  hasSubscribedWithFreeCheckinsLeft: boolean;
  inactiveSubscriptions: Array<any>;
  isHotelSubscription: boolean;
  checkIsProductActive: (productType: SUBSCRIPTION_PRODUCT_TYPES) => boolean;
  isHousingSubscription: boolean;
  isIdentityVerificationActive: boolean;
  isSelfCheckinActive: boolean;
  isRemoteAccessActive: boolean;
  isDepositActive: boolean;
  isTaxActive: boolean;
  isCustomTrial: boolean;
};

const SubscriptionContext = React.createContext<ContextProps>({
  subscribeAndSetSubscription: () => Promise.resolve({data: null, error: null}),
  fetchAndSetActiveSubscription: () => {},
  updateAndSetSubscription: () => Promise.resolve({data: null, error: null}),
  isSubscriptionCanceled: false,
  isSubscriptionActive: false,
  hasSubscriptionPlan: false,
  isSubscriptionScheduledToCancel: false,
  isTrialMode: false,
  isSubscriptionRequired: false,
  isLoading: false,
  restartSubscription: () => {},
  refreshSubscription: () => {},
  isTrialEnded: false,
  hasSubscribedWithFreeCheckinsLeft: false,
  inactiveSubscriptions: [],
  isHotelSubscription: false,
  checkIsProductActive: (_) => true,
  isHousingSubscription: false,
  isIdentityVerificationActive: false,
  isSelfCheckinActive: false,
  isRemoteAccessActive: false,
  isDepositActive: false,
  isTaxActive: false,
  isCustomTrial: false,
});

function fetchInactiveSubscriptions() {
  return queryFetcher(api.payments.ENDPOINTS.subscriptions('active=false'));
}

function getActiveSubscription(subscriptions: Array<any> = []) {
  if (!subscriptions.length) {
    return {};
  }
  return subscriptions[0];
}

function SubscriptionProvider(props: any) {
  const ws = useWebsocket();
  const user = useUser();
  const [isLoading, setIsLoading] = React.useState(true);
  const [subscription, setSubscription] = React.useState<Subscription>();
  const {data: inactiveSubscriptions, status: inactiveSubscriptionsStatus} = useQuery(
    'inactiveSubscriptions',
    fetchInactiveSubscriptions,
    {
      enabled: Boolean(user),
    },
  );

  const stripeId = subscription?.stripe_id;

  const isSubscriptionRequired = user?.is_subscription_required;
  const isSubscriptionActive =
    isSubscriptionRequired && !user?.is_trial && user?.has_paid;
  const isSubscriptionScheduledToCancel = subscription?.scheduled_to_cancel;
  const isSubscriptionCanceled = isSubscriptionRequired && !user?.has_paid;

  const isTrialMode = isSubscriptionRequired && user?.is_trial && user?.has_paid;
  const isTrialEnded = isSubscriptionRequired && user?.is_trial && !user?.has_paid;
  const isCustomTrial = subscription?.stripe_id === CUSTOM_TRIAL_SUBSCRIPTION_ID;
  const hasSubscriptionPlan = getIsProductActive(
    subscription,
    SUBSCRIPTION_PRODUCT_TYPES.chekin,
  );
  const hasSubscribedWithFreeCheckinsLeft = hasSubscriptionPlan && isTrialMode;

  const isHotelSubscription = user?.subscription_type === SUBSCRIPTION_TYPES.hotel;
  const isHousingSubscription = user?.subscription_type === SUBSCRIPTION_TYPES.housing;

  const checkIsProductActive = (productType: SUBSCRIPTION_PRODUCT_TYPES) => {
    return (
      subscription?.current_accommodations_qty?.[productType] &&
      subscription?.current_accommodations_qty?.[productType] !== 0
    );
  };

  const isSelfCheckinActive = checkIsProductActive(
    SUBSCRIPTION_PRODUCT_TYPES.selfCheckin,
  );
  const isIdentityVerificationActive = checkIsProductActive(
    SUBSCRIPTION_PRODUCT_TYPES.idVerification,
  );
  const isRemoteAccessActive = checkIsProductActive(
    SUBSCRIPTION_PRODUCT_TYPES.remoteAccess,
  );
  const isDepositActive = checkIsProductActive(SUBSCRIPTION_PRODUCT_TYPES.deposit);
  const isTaxActive = checkIsProductActive(SUBSCRIPTION_PRODUCT_TYPES.tax);

  const fetchAndSetActiveSubscription = React.useCallback(async () => {
    if (!user) {
      return {data: null, error: null};
    }

    setIsLoading(true);
    const {data, error} = await api.payments.getSubscriptions('active=true');
    if (data) {
      const activeSubscription = getActiveSubscription(data);
      setSubscription(activeSubscription);
    }
    setIsLoading(false);
    return {data, error};
  }, [user]);

  React.useEffect(() => {
    if (ws.message?.event_type === WS_EVENT_TYPES.subscriptionUpdated) {
      fetchAndSetActiveSubscription();
    }

    return () => ws.clearMessage();
  }, [ws, fetchAndSetActiveSubscription]);

  React.useEffect(() => {
    if (user) {
      fetchAndSetActiveSubscription();
    }
  }, [fetchAndSetActiveSubscription, user]);

  const refreshSubscription = React.useCallback(async () => {
    if (!user) {
      return {data: null, error: null};
    }

    const {data} = await api.payments.getSubscriptions('active=true');

    if (data) {
      const activeSubscription = getActiveSubscription(data);
      setSubscription(activeSubscription);
    }
  }, [user]);

  const restartSubscription = React.useCallback(async () => {
    if (!stripeId) {
      return;
    }

    setIsLoading(true);
    const {error} = await api.payments.restartSubscription(stripeId);

    if (error) {
      toastResponseError(error);
    }
    setIsLoading(false);
  }, [stripeId]);

  const updateAndSetSubscription = React.useCallback(async (id = '', payload = {}) => {
    const {data, error} = await api.payments.patchOneSubscription(id, payload);

    if (data) {
      setSubscription(data);
    }
    return {data, error};
  }, []);

  const subscribeAndSetSubscription = React.useCallback(async (payload = {}) => {
    const {data, error} = await api.payments.createSubscription(payload);

    if (data) {
      setSubscription(data);
    }
    return {data, error};
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        isLoading: isLoading || inactiveSubscriptionsStatus === 'loading',
        subscription,
        fetchAndSetActiveSubscription,
        updateAndSetSubscription,
        subscribeAndSetSubscription,
        isSubscriptionCanceled,
        isSubscriptionActive,
        hasSubscriptionPlan,
        isSubscriptionScheduledToCancel,
        isTrialMode,
        isSubscriptionRequired,
        restartSubscription,
        isTrialEnded,
        inactiveSubscriptions,
        hasSubscribedWithFreeCheckinsLeft,
        isHotelSubscription,
        checkIsProductActive,
        isHousingSubscription,
        refreshSubscription,
        isIdentityVerificationActive,
        isRemoteAccessActive,
        isSelfCheckinActive,
        isDepositActive,
        isTaxActive,
        isCustomTrial,
      }}
      {...props}
    />
  );
}

function useSubscription() {
  const context = React.useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export {SubscriptionProvider, useSubscription, SubscriptionContext};
