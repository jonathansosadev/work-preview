import React from 'react';
import {useQuery} from 'react-query';
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useLocation} from 'react-router-dom';
import api from '../../../api';
import {useSubscription} from '../../../context/subscription';
import {
  CURRENCIES,
  CURRENCIES_LABELS,
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_TYPES,
} from '../../../utils/constants';
import type {SelectOption} from '../../../utils/types';
import {CurrentItemsInCurrency} from '../../../utils/types';
import {toastResponseError} from '../../../utils/common';
import {useComputedDetails} from '../../../context/computedDetails';
import {useErrorToast} from '../../../utils/hooks';
import {useUser} from '../../../context/user';
import {usePaymentMethod} from '../../../hooks/usePaymentMethod';
import Loader from '../../common/Loader';
import ModalButton from '../ModalButton';
import {ContentWrapper} from '../../../styled/common';
import {
  CancelButtonWrapper,
  CurrencyContainer,
  CurrencyLabel,
  CurrencySelect,
  LoaderWrapper,
  PlanTile,
  PlanTileBestValue,
  PlanTileMonth,
  PlanTilePriceDescriptionInfo,
  PlanTilePriceDescriptionTip,
  PlanTilePriceInfo,
  PlanTilePriceValue,
  SubHeader,
  SubscribeButton,
  SubscriptionHeading,
} from './styled';

function fetchPrice(
  currency: CURRENCIES,
  interval: SUBSCRIPTION_INTERVALS,
  chekinQuantity = '0',
  isFree: '0' | '1' = '0',
) {
  return api.payments.fetchCurrentItemsInCurrency({
    currency,
    interval,
    chekinQuantity: Number(chekinQuantity),
    isFree,
  });
}

type LocationState = {
  accommodationsNumber?: string;
  currency: CURRENCIES;
};

function SubscriptionSelectPlanStep() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const user = useUser();
  const {isLoading: isLoadingSubscription, isSubscriptionCanceled} = useSubscription();
  const {currency: userCurrency} = useComputedDetails();
  const {status: paymentMethodStatus, hasPaymentMethod} = usePaymentMethod();

  const [subscriptionType, setSubscriptionType] = React.useState<string | undefined>('');
  const [selectedCurrencyOption, setSelectedCurrencyOption] = React.useState(() => {
    const currency = location.state?.currency || userCurrency;

    return {
      value: currency,
      label: currency.toUpperCase(),
    };
  });

  const canChangeCurrency =
    !isSubscriptionCanceled && paymentMethodStatus !== 'loading' && !hasPaymentMethod;
  const currency = selectedCurrencyOption.value;
  const currencyLabel = CURRENCIES_LABELS[currency];
  const currencyOptions = Object.values(CURRENCIES).map((currency) => {
    return {
      value: currency,
      label: currency.toUpperCase(),
    };
  });
  const accommodationsNumber = location.state?.accommodationsNumber;
  const isFree = user?.is_police_registration_free ? '1' : '0';

  const {
    data: yearlyPrice,
    status: yearlyPriceStatus,
    error: yearlyPriceError,
  } = useQuery<
    CurrentItemsInCurrency,
    [string, CURRENCIES, SUBSCRIPTION_INTERVALS, string?, ('0' | '1')?]
  >(
    [
      'yearlyCurrentItems',
      currency,
      SUBSCRIPTION_INTERVALS.year,
      accommodationsNumber,
      isFree,
    ],
    () => fetchPrice(currency, SUBSCRIPTION_INTERVALS.year, accommodationsNumber, isFree),
    {
      enabled: Boolean(currency),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(yearlyPriceError, {
    notFoundMessage: 'Requested yearly price could not be found. Please contact support.',
  });

  const {
    data: monthlyPrice,
    status: monthlyPriceStatus,
    error: monthlyPriceError,
  } = useQuery<
    CurrentItemsInCurrency,
    [string, CURRENCIES, SUBSCRIPTION_INTERVALS, string?, ('0' | '1')?]
  >(
    [
      'monthlyCurrentItems',
      currency,
      SUBSCRIPTION_INTERVALS.month,
      accommodationsNumber,
      isFree,
    ],
    () =>
      fetchPrice(currency, SUBSCRIPTION_INTERVALS.month, accommodationsNumber, isFree),
    {
      enabled: Boolean(currency),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(monthlyPriceError, {
    notFoundMessage: 'Requested price could not be found. Please contact support.',
  });

  const isLoading =
    isLoadingSubscription ||
    monthlyPriceStatus === 'loading' ||
    yearlyPriceStatus === 'loading';

  React.useEffect(() => {
    if (!accommodationsNumber) {
      history.replace('/subscription/number');
    }
  }, [location.state, history, accommodationsNumber]);

  React.useEffect(() => {
    setSubscriptionType(user?.subscription_type);
  }, [user]);

  const goNext = (persistedState: any) => {
    history.push('/subscription/payment', persistedState);
  };

  const getPrice = (price = 0) => {
    if (!price) {
      return 0;
    }

    return (price / 100).toFixed(2);
  };

  const getMonthlyPriceFromYearly = (price = 0) => {
    if (!price) {
      return 0;
    }

    return getPrice(price / 12);
  };

  const selectPlan = (
    interval: SUBSCRIPTION_INTERVALS,
    currentItemsInCurrency?: CurrentItemsInCurrency,
  ) => {
    if (!currentItemsInCurrency) {
      toastResponseError(t('plan_not_found'));
      return;
    }

    const newState = {
      ...location.state,
      currency,
      currentItemsInCurrency,
      interval,
    };
    goNext(newState);
  };

  const handleCurrencyOptionChange = (option: SelectOption) => {
    setSelectedCurrencyOption(
      option as {
        value: CURRENCIES;
        label: string;
      },
    );
  };

  return (
    <ContentWrapper>
      <SubscriptionHeading
        linkToBack={{pathname: '/subscription/number', state: location.state}}
        title={t('subscription')}
      />
      <SubHeader>{t('select_plan')}</SubHeader>
      {canChangeCurrency && (
        <CurrencyContainer>
          <CurrencySelect
            label={t('currency')}
            isSearchable={false}
            options={currencyOptions}
            onChange={handleCurrencyOptionChange}
            value={selectedCurrencyOption}
            disabled={isLoading}
          />
        </CurrencyContainer>
      )}
      {isLoading && (
        <LoaderWrapper>
          <Loader width={50} height={50} label={t('loading')} />
        </LoaderWrapper>
      )}
      {!isLoading && (
        <>
          <PlanTile>
            <PlanTileBestValue>{t('best_value')}</PlanTileBestValue>
            <PlanTileMonth>12 {t('months')}</PlanTileMonth>
            <PlanTilePriceInfo>
              <PlanTilePriceValue>
                {getMonthlyPriceFromYearly(yearlyPrice?.total_price_in_currency)}
                {` `} <CurrencyLabel>{currencyLabel}</CurrencyLabel>
              </PlanTilePriceValue>
              /
              {subscriptionType === SUBSCRIPTION_TYPES.hotel
                ? t('month_per_number_rooms', {number: accommodationsNumber})
                : t('month_per_number_properties', {number: accommodationsNumber})}
            </PlanTilePriceInfo>
            <PlanTilePriceDescriptionInfo>
              {getPrice(yearlyPrice?.total_price_in_currency)}
              {` `} <CurrencyLabel>{currencyLabel}</CurrencyLabel>
              <PlanTilePriceDescriptionTip>
                {t('every_12_months')}
              </PlanTilePriceDescriptionTip>
            </PlanTilePriceDescriptionInfo>
            <SubscribeButton
              onClick={() => selectPlan(SUBSCRIPTION_INTERVALS.year, yearlyPrice)}
              label={t('subscribe_yearly')}
              secondary
            />
          </PlanTile>
          <PlanTile>
            <PlanTileMonth>1 {t('month').toLowerCase()}</PlanTileMonth>
            <PlanTilePriceInfo>
              <PlanTilePriceValue>
                {getPrice(monthlyPrice?.total_price_in_currency)}
                {` `} <CurrencyLabel>{currencyLabel}</CurrencyLabel>
              </PlanTilePriceValue>
              {` `}/{' '}
              {subscriptionType === SUBSCRIPTION_TYPES.hotel
                ? t('month_per_number_rooms', {number: accommodationsNumber})
                : t('month_per_number_properties', {number: accommodationsNumber})}
            </PlanTilePriceInfo>
            <SubscribeButton
              onClick={() => selectPlan(SUBSCRIPTION_INTERVALS.month, monthlyPrice)}
              label={t('subscribe_monthly')}
              secondary
            />
          </PlanTile>
          <Link to="/properties">
            <CancelButtonWrapper>
              <ModalButton secondary label={t('cancel')} />
            </CancelButtonWrapper>
          </Link>
        </>
      )}
    </ContentWrapper>
  );
}

export {SubscriptionSelectPlanStep};
