import React from 'react';
import Loader from '../../common/Loader';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {CardElement, Elements, injectStripe, IbanElement} from 'react-stripe-elements';
import * as Sentry from '@sentry/browser';
import {useQuery} from 'react-query';
import {useUser} from '../../../context/user';
import api, {queryFetcher} from '../../../api';
import {useAuth} from '../../../context/auth';
import closeIcon from '../../../assets/close.svg';
import checkIcon from '../../../assets/green-check.svg';
import {useTranslation} from 'react-i18next';
import {useSubscription} from '../../../context/subscription';
import {useErrorToast, useIsMounted} from '../../../utils/hooks';
import {CurrentItemsInCurrency} from '../../../utils/types';
import {toastResponseError} from '../../../utils/common';
import type {Coupon, SelectOption} from '../../../utils/types';
import {
  CURRENCIES,
  CURRENCIES_LABELS,
  PERIODICITY,
  SUBSCRIPTION_TYPES,
  DEFAULT_CURRENCY,
  SUBSCRIPTION_INTERVALS,
  PAYMENT_METHOD,
  EUR_PAYMENT_METHOD,
} from '../../../utils/constants';
import CardPlaceholder from '../CardPlaceholder';
import ModalButton from '../ModalButton';
import Select from '../Select';
import IbanPlaceholder from '../IbanPlaceholder';
import Input from '../Input';
import {
  SubscriptionHeading,
  BoldText,
  ButtonWrapper,
  CancelChangingWrapper,
  CardForm,
  CardInfoWrapper,
  ChangeCardWrapper,
  CheckImg,
  Content,
  CouponAppliedText,
  CouponButton,
  CouponHeader,
  CouponHelper,
  CouponInput,
  CouponInputWrapper,
  CouponWrapper,
  DiscountText,
  Dot,
  DotsWrapper,
  GreyText,
  LoaderWrapper,
  PriceValue,
  ResetCouponImg,
  stripeInputStyle,
  SubHeader,
  TextWrapper,
  Tip,
  IbanLabel,
  ImportantInfo,
} from './styled';

const DEFAULT_PRICE = 0;

function fetchPaymentMethod() {
  return queryFetcher(api.payments.ENDPOINTS.paymentMethod());
}

type LocationState = {
  accommodationsNumber?: string;
  currency?: CURRENCIES;
  interval?: SUBSCRIPTION_INTERVALS;
  currentItemsInCurrency?: CurrentItemsInCurrency;
};

const CARD_BINDING_SUCCESS_STATUS = 'ok';

function SubscriptionPaymentStep({stripe, elements}: any) {
  const {t} = useTranslation();
  const user = useUser();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {
    subscription,
    isSubscriptionCanceled,
    inactiveSubscriptions,
    subscribeAndSetSubscription,
    updateAndSetSubscription,
    hasSubscriptionPlan,
  } = useSubscription();
  const {updateAccount} = useAuth();
  const [stripeSecret, setStripeSecret] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCardComplete, setIsCardComplete] = React.useState(false);
  const [isCardReady, setIsCardReady] = React.useState(false);
  const [enteredCoupon, setEnteredCoupon] = React.useState('');
  const [coupon, setCoupon] = React.useState<Coupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = React.useState(false);
  const [subscriptionType, setSubscriptionType] = React.useState<string | undefined>('');
  const [isChangingCreditCard, setIsChangingCreditCard] = React.useState(false);
  const [paymentMethodSelected, setPaymentMethodSelected] = React.useState<SelectOption>();
  const [sepaName, setSepaName] = React.useState<string>('');
  const [sepaEmail, setSepaEmail] = React.useState<string>('');
  const [emptySepaName, setEmptySepaName] = React.useState<boolean>(true);
  const [emptySepaEmail, setEmptySepaEmail] = React.useState<boolean>(true);

  const {
    data: paymentMethod,
    error: paymentMethodError,
    status: paymentMethodStatus,
  } = useQuery<any, string>('paymentMethod', fetchPaymentMethod, {
    refetchOnWindowFocus: false,
  });
  useErrorToast(paymentMethodError);

  const hasCard = paymentMethodStatus !== 'loading' && paymentMethod?.card;
  const hasSepa = paymentMethodStatus !== 'loading' && Boolean(paymentMethod?.sepa_debit);
  const accommodationsNumber = location.state?.accommodationsNumber;
  const currency = location.state?.currency || DEFAULT_CURRENCY;
  const currencyLabel = CURRENCIES_LABELS[currency];
  const currentItemsInCurrency = location.state?.currentItemsInCurrency;
  const price = currentItemsInCurrency?.total_price_in_currency
    ? currentItemsInCurrency?.total_price_in_currency / 100
    : DEFAULT_PRICE;
  const subscriptionInterval = location.state?.interval;

  React.useEffect(() => {
    if (!accommodationsNumber) {
      history.replace('/subscription/number');
    }
    if (!location.state?.currentItemsInCurrency) {
      history.replace('/subscription/select-plan');
    }
  }, [location.state, history, accommodationsNumber]);

  React.useEffect(() => {
    if (Boolean(paymentMethod?.sepa_debit)) {
      setPaymentMethodSelected({label: t('sepa'), value: "SEPA_DEBIT"})
    } else {
      setPaymentMethodSelected({label: t('credit_debit_card'), value: "CARD"})
    }
  }, [paymentMethod, t]);

  React.useEffect(() => {
    if (sepaName?.length > 0) {
      setEmptySepaName(false);
    } else {
      setEmptySepaName(true);
    }
  }, [sepaName]);

  React.useEffect(() => {
    if (sepaEmail?.length > 0) {
      setEmptySepaEmail(false);
    } else {
      setEmptySepaEmail(true);
    }
  }, [sepaEmail]);

  React.useEffect(() => {
    if (hasCard) {
      setIsCardReady(false);
      setIsCardComplete(false);
    }
  }, [hasCard]);

  React.useEffect(() => {
    async function fetchStripeSecret() {
      setIsLoading(true);
      const {data, error} = await api.payments.getSecret();

      if (!isMounted.current) {
        return;
      }

      if (error) {
        toastResponseError(error);
      }
      if (data) {
        setStripeSecret(data.secret);
      }

      setIsLoading(false);
    }

    fetchStripeSecret();
  }, [isMounted]);

  React.useEffect(() => {
    setSubscriptionType(user?.subscription_type);
  }, [user]);

  const isCardSelected = () => {
    return paymentMethodSelected?.value === "CARD";
  };

  const isSepaSelected = () => {
    return paymentMethodSelected?.value === "SEPA_DEBIT";
  };

  const handleCardChange = (event: any) => {
    setIsCardComplete(event.complete);
  };

  const handleCardReady = (element: any) => {
    setIsCardReady(true);
    element.focus();
  };

  const getPersistedState = () => {
    return location.state;
  };

  const goNext = () => {
    const persistedState = getPersistedState();
    history.push('/subscription/payment-info', persistedState);
  };

  const toggleCardChanging = () => {
    setIsChangingCreditCard((prevState) => {
      if (prevState) {
        setIsCardReady(false);
        setIsCardComplete(false);
      }

      return !prevState;
    });
  };

  const getPrice = () => {
    const isYearlyInterval = subscriptionInterval === PERIODICITY.yearly;

    if (!price) {
      return 0;
    }

    if (isYearlyInterval) {
      return price / 12 / Number(accommodationsNumber)!;
    }

    return price / Number(accommodationsNumber)!;
  };

  const getFinishedPrice = () => {
    if (price) {
      if (coupon) {
        return (price * (1 - coupon.percent_off / 100)).toFixed(2);
      } else {
        return price.toFixed(2);
      }
    } else {
      return 0.0;
    }
  };

  const getMonthlyLabel = () => {
    return subscriptionType === SUBSCRIPTION_TYPES.hotel
      ? t('every_months_per_number_rooms', {number: accommodationsNumber})
      : t('every_months_per_number_properties', {number: accommodationsNumber});
  };

  const getYearlyLabel = () => {
    return subscriptionType === SUBSCRIPTION_TYPES.hotel
      ? t('every_12_months_per_number_rooms', {number: accommodationsNumber})
      : t('every_12_months_per_number_properties', {number: accommodationsNumber});
  };

  const handleCouponInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {target} = event;
    setEnteredCoupon(target.value);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    toastResponseError(error);
  };

  const validateCoupon = async () => {
    setValidatingCoupon(true);
    const {error, data} = await api.payments.getOneCoupon(enteredCoupon);
    if (data) {
      setCoupon(data);
    }
    if (error) {
      handleError(error);
    }
    setValidatingCoupon(false);
  };

  const resetCoupon = () => {
    setEnteredCoupon('');
    setCoupon(null);
  };

  const getCardElement = () => {
    let cardElement = null;
    try {
      cardElement = elements.getElement('card');
    } catch (error) {
      Sentry.captureException(error);
      handleError(error);
    }
    return cardElement;
  };

  const setupCard = async () => {
    if (isCardSelected()) {
      const cardElement = getCardElement();
      if (!cardElement) {
        return;
      }

      const {setupIntent, error} = await stripe.confirmCardSetup(stripeSecret, {
        payment_method: {
          card: cardElement,
        },
      });
      if (error) {
        handleError(error);
      }
      return {setupIntent, error};
    }

    if (isSepaSelected()) {
      const {error, source} = await stripe!.createSource({
        type: 'sepa_debit',
        currency: 'eur',
        owner: {
          name: sepaName,
          email: sepaEmail,
        },
        mandate: {
          notification_method: 'email',
        },
      })

      if (error) {
        handleError(error);
      }
      return {source, error};
    }
  };

  const bindCardToCustomer = async ({payment_method = {}}) => {
    let bindingStatus = '';
    const {data, error} = await api.payments.bindUserCard({payment_method});

    if (data) {
      bindingStatus = data.status;
    }
    if (error) {
      handleError(error);
    }
    return bindingStatus;
  };

  const setupAndBindCardToCustomer = async () => {
    setIsLoading(true);
    let bindingStatus = '';

    if (isCardSelected()) {
      const setupCardResult = await setupCard();

      if (setupCardResult) {
        if (!setupCardResult.error && isMounted.current) {
          bindingStatus = await bindCardToCustomer(setupCardResult.setupIntent);

          return bindingStatus;
        }
      }
      return bindingStatus;
    }

    if (isSepaSelected()) {
      const sourceResult = await setupCard();

      if (sourceResult) {
        if (!sourceResult.error && isMounted.current) {
          const {data, error} = await api.payments.bindUserCard({
            'payment_method': sourceResult.source.id,
            'payment_method_type': 'SEPA_DEBIT'
          });

          if (data) {
            bindingStatus = data.status;
          }
          if (error) {
            handleError(error);
          }

          return bindingStatus;
        }
      }
      return bindingStatus;
    }
  };

  const getPlanItems = () => {
    const itemsInCurrency = currentItemsInCurrency?.items_in_currency || [];

    return itemsInCurrency.map((item) => {
      if (item.product === 'CHEKIN') {
        return {
          plan: item.unique_id,
          quantity: Number(accommodationsNumber),
        };
      }

      return {
        plan: item.unique_id,
        quantity: item.quantity,
      };
    });
  };

  const getSubscriptionPayload = () => {
    let type = subscription?.type;

    if (!type || (isSubscriptionCanceled && inactiveSubscriptions.length)) {
      type = inactiveSubscriptions[0].type;
    }

    const planItems = getPlanItems();

    return {
      type,
      coupon: coupon?.coupon || undefined,
      items: planItems,
      force_update: true,
    };
  };

  const updateSubscription = async () => {
    setIsLoading(true);

    const payload = getSubscriptionPayload();
    const {error} = await updateAndSetSubscription(subscription!.stripe_id, payload);

    if (error) {
      handleError(error);
    }

    return error;
  };

  const createSubscription = async () => {
    setIsLoading(true);

    const subscriptionPayload = getSubscriptionPayload();
    const {error} = await subscribeAndSetSubscription(subscriptionPayload);

    if (error) {
      handleError(error);
    }

    return error;
  };

  const subscribe = async () => {
    let error;
    if (hasSubscriptionPlan) {
      error = await updateSubscription();
    } else {
      error = await createSubscription();
    }

    return error;
  };

  const updateAccountCurrency = async () => {
    const payload = {
      currency,
    };

    const {error} = await updateAccount(payload);
    if (error) {
      handleError(error);
    }

    return error;
  };

  const bindCardThenSubscribe = async () => {
    const cardBindingStatus = await setupAndBindCardToCustomer();

    if (cardBindingStatus !== CARD_BINDING_SUCCESS_STATUS) {
      return;
    }

    const subscriptionError = await subscribe();
    if (subscriptionError) {
      return;
    }

    const accountUpdateError = await updateAccountCurrency();
    if (!accountUpdateError) {
      goNext();
    }
  };

  const subscribeThenBindCard = async () => {
    const subscriptionError = await subscribe();
    if (subscriptionError) {
      return;
    }

    const accountUpdateError = await updateAccountCurrency();
    if (accountUpdateError) {
      return;
    }

    const cardBindingStatus = await setupAndBindCardToCustomer();

    if (cardBindingStatus === CARD_BINDING_SUCCESS_STATUS) {
      goNext();
    }
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubscriptionCanceled) {
      bindCardThenSubscribe();
    } else {
      subscribeThenBindCard();
    }
  };

  const handleExistingCardSubmit = async () => {
    const error = await subscribe();

    if (!error) {
      goNext();
    }
  };

  return (
    <Content>
      <SubscriptionHeading
        linkToBack={{pathname: '/subscription/select-plan', state: location.state}}
        title={t('subscription')}
      />
      <SubHeader>{t('payment')}</SubHeader>
      <Tip>{t('you_can_unsubscribe_at_any_moment')}</Tip>
      <SubHeader>{t('payment_card_details')}</SubHeader>
      <CardInfoWrapper>
        <Select
          disabled={isLoading}
          label={t('select_payment_method')}
          onChange={(type: any) => {setPaymentMethodSelected(type)}}
          value={paymentMethodSelected}
          options={Object.values(currency !== 'eur'? PAYMENT_METHOD : EUR_PAYMENT_METHOD)}
        />
      </CardInfoWrapper>
      {isCardSelected() && (
        <>
        {hasCard && !isChangingCreditCard && (
          <div>
            <CardPlaceholder />
            <ChangeCardWrapper>
              <ModalButton
                secondary
                disabled={isLoading}
                label={t('change_card')}
                onClick={toggleCardChanging}
              />
            </ChangeCardWrapper>
            {isLoading || paymentMethodStatus === 'loading' ? (
              <LoaderWrapper>
                <Loader width={45} height={45} />
              </LoaderWrapper>
            ) : (
              <div>
                <ButtonWrapper>
                  <ModalButton
                    onClick={handleExistingCardSubmit}
                    type="submit"
                    label={t('subscribe_now')}
                  />
                </ButtonWrapper>
                <ButtonWrapper>
                  <Link to="/properties">
                    <ModalButton secondary label={t('cancel')} />
                  </Link>
                </ButtonWrapper>
              </div>
            )}
          </div>
        )}
        {(!hasCard || isChangingCreditCard) && (
          <CardForm onSubmit={handleSubmit}>
            {paymentMethodStatus !== 'loading' && (
              <CardInfoWrapper>
                <CardElement
                  hideIcon
                  disabled={isLoading}
                  onChange={handleCardChange}
                  onReady={handleCardReady}
                  style={stripeInputStyle}
                />
              </CardInfoWrapper>
            )}
            {hasCard && (
              <CancelChangingWrapper>
                <ModalButton
                  secondary
                  disabled={isLoading}
                  label={t('cancel_changing')}
                  onClick={toggleCardChanging}
                />
              </CancelChangingWrapper>
            )}
            {isLoading || !isCardReady || paymentMethodStatus === 'loading' ? (
              <LoaderWrapper>
                <Loader width={45} height={45} />
              </LoaderWrapper>
            ) : (
              <div>
                <ButtonWrapper>
                  <ModalButton
                    disabled={!isCardComplete}
                    type="submit"
                    label={t('subscribe_now')}
                  />
                </ButtonWrapper>
                <ButtonWrapper>
                  <Link to="/properties">
                    <ModalButton secondary label={t('cancel')} />
                  </Link>
                </ButtonWrapper>
              </div>
            )}
          </CardForm>
        )}
      </>
      )}
      {isSepaSelected() && (
        <>
        {hasSepa && !isChangingCreditCard && (
          <div>
            <IbanPlaceholder />
            <ChangeCardWrapper>
              <ModalButton
                secondary
                disabled={isLoading}
                label={t('change_card')}
                onClick={toggleCardChanging}
              />
            </ChangeCardWrapper>
            {isLoading || paymentMethodStatus === 'loading' ? (
              <LoaderWrapper>
                <Loader width={45} height={45} />
              </LoaderWrapper>
            ) : (
              <div>
                <ButtonWrapper>
                  <ModalButton
                    onClick={handleExistingCardSubmit}
                    type="submit"
                    label={t('subscribe_now')}
                  />
                </ButtonWrapper>
                <ButtonWrapper>
                  <Link to="/properties">
                    <ModalButton secondary label={t('cancel')} />
                  </Link>
                </ButtonWrapper>
              </div>
            )}
          </div>
        )}
        {(!hasSepa || isChangingCreditCard) && (
          <CardForm onSubmit={handleSubmit}>
            {paymentMethodStatus !== 'loading' && (
              <CardInfoWrapper>
              <Input
                label="Nombre"
                placeholder={t('enter_full_name')}
                required={true}
                empty={emptySepaName}
                value={sepaName}
                onChange={(event) => {
                  setSepaName(event.target.value)
                }}
              />
              <Input
                label="Correo"
                placeholder={t('enter_email_sepa')}
                required={true}
                empty={emptySepaEmail}
                value={sepaEmail}
                onChange={(event) => {
                  setSepaEmail(event.target.value)
                }}
              />
            <IbanLabel>
              IBAN
            </IbanLabel>
                <IbanElement onReady={handleCardReady} onChange={handleCardChange} supportedCountries={['SEPA']} placeholderCountry={'DE'}/>
                <ImportantInfo>
                  {t('sepa_details')}
                </ImportantInfo>
              </CardInfoWrapper>
            )}
            {hasSepa && (
              <CancelChangingWrapper>
                <ModalButton
                  secondary
                  disabled={isLoading}
                  label={t('cancel_changing')}
                  onClick={toggleCardChanging}
                />
              </CancelChangingWrapper>
            )}
            {isLoading || !isCardReady || paymentMethodStatus === 'loading' ? (
              <LoaderWrapper>
                <Loader width={45} height={45} />
              </LoaderWrapper>
            ) : (
              <div>
                <ButtonWrapper>
                  <ModalButton
                    disabled={!isCardComplete}
                    type="submit"
                    label={t('subscribe_now')}
                  />
                </ButtonWrapper>
                <ButtonWrapper>
                  <Link to="/properties">
                    <ModalButton secondary label={t('cancel')} />
                  </Link>
                </ButtonWrapper>
              </div>
            )}
          </CardForm>
        )}
      </>
      )}

      <CouponWrapper>
        {subscriptionInterval === PERIODICITY.monthly && (
          <>
            <CouponHeader>{t('do_you_have_a_coupon')}</CouponHeader>
            <CouponInputWrapper>
              <CouponInput
                value={enteredCoupon}
                empty={!enteredCoupon}
                placeholder={t('enter_coupon')}
                readOnly={Boolean(coupon)}
                onChange={handleCouponInputChange}
              />
              {coupon && (
                <ResetCouponImg onClick={resetCoupon} src={closeIcon} alt="reset" />
              )}
            </CouponInputWrapper>
            <CouponButton
              label={t('apply_coupon')}
              onClick={validateCoupon}
              disabled={!enteredCoupon || validatingCoupon}
            />
            {(accommodationsNumber || 0) > 1 && (
              <DotsWrapper>
                <Dot />
                <Dot />
                <Dot />
              </DotsWrapper>
            )}
          </>
        )}
        {!coupon ? (
          <TextWrapper>
            {(accommodationsNumber || 0) > 1 && (
              <div>
                <BoldText>
                  {getPrice().toFixed(2)}
                  {` `}
                  {currencyLabel}
                </BoldText>
                <GreyText>
                  /
                  {subscriptionType === SUBSCRIPTION_TYPES.hotel
                    ? t('room')
                    : t('property')}{' '}
                  <div>
                    x {` `}
                    <BoldText>{accommodationsNumber}</BoldText>{' '}
                    <GreyText>
                      {subscriptionType === SUBSCRIPTION_TYPES.hotel
                        ? t('rooms')
                        : t('properties')}{' '}
                    </GreyText>
                  </div>
                  {subscriptionInterval === PERIODICITY.yearly && (
                    <span>
                      <GreyText>x</GreyText> <BoldText>12</BoldText>{' '}
                      <GreyText>{t('months')}</GreyText>
                    </span>
                  )}
                </GreyText>
              </div>
            )}
          </TextWrapper>
        ) : (
          <>
            <CouponAppliedText>
              {t('coupon_applied')} <CheckImg src={checkIcon} alt="Check mark" />
            </CouponAppliedText>
            <DiscountText>
              {coupon.percent_off}% {t('discount').toLowerCase()}
            </DiscountText>
          </>
        )}
        {((subscriptionInterval === PERIODICITY.yearly &&
          (accommodationsNumber || 0) > 1) ||
          subscriptionInterval === PERIODICITY.monthly) && (
          <DotsWrapper>
            <Dot />
            <Dot />
            <Dot />
          </DotsWrapper>
        )}
        <PriceValue>
          {getFinishedPrice()}
          {` `}
          {currencyLabel}
        </PriceValue>
        {!coupon ? (
          <GreyText>
            {subscriptionInterval === PERIODICITY.monthly
              ? getMonthlyLabel()
              : getYearlyLabel()}
          </GreyText>
        ) : (
          <>
            <CouponHelper>
              <GreyText>{t('the_first_month')}.</GreyText>
            </CouponHelper>
            <CouponHelper>
              <GreyText>{t('then')}</GreyText> {` `}{' '}
              <BoldText>
                {price?.toFixed(2)}
                {` `}
                {currencyLabel}
              </BoldText>
              <GreyText>/ {t('month')}</GreyText>
            </CouponHelper>
          </>
        )}
      </CouponWrapper>
    </Content>
  );
}

const InjectedSubscriptionPaymentStep = injectStripe(SubscriptionPaymentStep);

function ElementsInjectedSubscriptionPaymentStep() {
  return (
    <Elements>
      <InjectedSubscriptionPaymentStep />
    </Elements>
  );
}

export {ElementsInjectedSubscriptionPaymentStep};