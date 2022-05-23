import {useQuery} from 'react-query';
import api from 'api';
import {PaymentsSettings} from 'utils/types';
import {useErrorToast} from 'utils/hooks';
import {
  CURRENCIES_LABELS,
  CURRENCIES_SYMBOL,
  PAYMENT_PROVIDERS,
} from '../utils/constants';

function usePaymentSettings() {
  const queryResult = useQuery<PaymentsSettings, string>(
    'paymentsSettings',
    api.paymentsSettings.fetchPaymentSettings,
    {
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(queryResult.error, {notFoundMessage: 'Payments settings not found.'});

  const hasPaymentSettings = Boolean(queryResult.data?.id);
  const isLoadingPaymentSettings = queryResult.status === 'loading';

  const paymentSettingsCurrency = queryResult.data?.currency;
  const paymentSettingsCurrencyLabel = paymentSettingsCurrency
    ? CURRENCIES_LABELS[paymentSettingsCurrency]
    : CURRENCIES_LABELS.eur;

  const paymentSettingsCurrencyOnlySymbol = paymentSettingsCurrency
    ? CURRENCIES_SYMBOL[paymentSettingsCurrency]
    : '';

  const isStripeProvider = queryResult.data?.provider === PAYMENT_PROVIDERS.stripe;
  const isStripeProviderInvalid =
    isStripeProvider && queryResult.data?.status !== 'VALID';

  return {
    hasPaymentSettings,
    isLoadingPaymentSettings,
    paymentSettingsCurrency,
    paymentSettingsCurrencyOnlySymbol,
    paymentSettingsCurrencyLabel,
    isStripeProvider,
    isStripeProviderInvalid,
    paymentSettings: queryResult.data,
    ...queryResult,
  };
}

export {usePaymentSettings};
