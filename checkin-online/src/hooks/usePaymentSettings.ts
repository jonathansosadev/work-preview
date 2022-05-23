import useSWR from 'swr';
import api, {getURL} from '../api';
import {PaymentsSettings} from '../utils/types';
import {PAYMENT_PROVIDERS, CURRENCIES_LABELS, CURRENCIES_SIGNS} from '../utils/constants';
import {useAuth} from '../context/auth';

const DEFAULT_PROVIDER = PAYMENT_PROVIDERS.paycomet;

function usePaymentSettings() {
  const {isTokenValid} = useAuth();
  const {data: paymentSettings, isValidating: isLoading, ...swrProps} = useSWR<
    PaymentsSettings
  >(isTokenValid ? getURL(api.paymentsSettings.ENDPOINTS.all()) : null);

  let paymentProvider = paymentSettings?.provider || DEFAULT_PROVIDER;

  const isStripePaymentProvider = paymentProvider === PAYMENT_PROVIDERS.stripe;
  const isPaycometPaymentProvider = paymentProvider === PAYMENT_PROVIDERS.paycomet;

  const hasPaymentSettings = Boolean(paymentSettings?.id);

  const getArePaymentProviderValid = () => {
    if (isStripePaymentProvider) {
      return paymentSettings?.status === 'VALID';
    }

    return true;
  };

  const arePaymentSettingsValid = getArePaymentProviderValid();

  const paymentSettingsCurrency = paymentSettings?.currency;
  const paymentSettingsCurrencyLabel = paymentSettingsCurrency
    ? CURRENCIES_LABELS[paymentSettingsCurrency]
    : '';
  const paymentSettingsCurrencySign = paymentSettingsCurrency
    ? CURRENCIES_SIGNS[paymentSettingsCurrency]
    : '';

  return {
    arePaymentSettingsValid,
    paymentSettings,
    isLoading,
    paymentProvider,
    isStripePaymentProvider,
    isPaycometPaymentProvider,
    hasPaymentSettings,
    paymentSettingsCurrencyLabel,
    paymentSettingsCurrencySign,
    ...swrProps,
  };
}

export {usePaymentSettings};
