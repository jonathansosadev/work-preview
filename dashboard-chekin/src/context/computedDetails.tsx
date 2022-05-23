import React from 'react';
import {useUser} from './user';
import {
  getIsAccountCollaborator,
  getIsAccountOriginSiteMinder,
  getIsAccountOwner,
} from '../utils/user';
import {useSubscription} from './subscription';
import {CURRENCIES, CURRENCIES_LABELS, DEFAULT_CURRENCY} from '../utils/constants';

type ContextProps = {
  isAccountOwner: boolean;
  isAccountCollaborator: boolean;
  isAccountManager: boolean;
  isAccountWithSiteMinderOrigin: boolean;
  isNeedToAskForSubscription: boolean;
  hasAnyPayments: boolean;
  currencyLabel: string;
  currency: CURRENCIES;
};

const ComputedDetailsContext = React.createContext<ContextProps>({
  isAccountOwner: false,
  isAccountCollaborator: false,
  isAccountManager: false,
  isAccountWithSiteMinderOrigin: false,
  isNeedToAskForSubscription: false,
  hasAnyPayments: false,
  currencyLabel: '',
  currency: DEFAULT_CURRENCY,
});

function ComputedDetailsProvider(props: any) {
  const user = useUser();
  const {
    isSubscriptionRequired,
    isSubscriptionCanceled,
    isTrialEnded,
  } = useSubscription();

  const isAccountOwner = getIsAccountOwner(user);
  const isAccountCollaborator = getIsAccountCollaborator(user);

  const isAccountWithSiteMinderOrigin = getIsAccountOriginSiteMinder(user);

  const isAccountManager = !isAccountOwner && !isAccountCollaborator;
  const isNeedToAskForSubscription =
    isSubscriptionRequired && (isSubscriptionCanceled || isTrialEnded);

  const hasAnyPayments = Boolean(user?.are_any_payments_activated);

  const currency = user?.currency || DEFAULT_CURRENCY;
  const currencyLabel = CURRENCIES_LABELS[currency];

  return (
    <ComputedDetailsContext.Provider
      value={{
        currencyLabel,
        isAccountOwner,
        isAccountCollaborator,
        isAccountManager,
        isAccountWithSiteMinderOrigin,
        isNeedToAskForSubscription,
        currency,
        hasAnyPayments,
      }}
      {...props}
    />
  );
}

function useComputedDetails() {
  const context = React.useContext(ComputedDetailsContext);
  if (context === undefined) {
    throw new Error('useComputedDetails must be used within a ComputedDetailsProvider');
  }
  return context;
}

export {ComputedDetailsProvider, useComputedDetails, ComputedDetailsContext};
