import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {addDays, format} from 'date-fns';
import {
  COUNTRY_CODES,
  PAYMENT_PROVIDERS,
  SECURITY_DEPOSIT_STATUSES,
  WS_EVENT_TYPES,
} from '../../utils/constants';
import {useWebsocket} from '../../context/websocket';
import crossIcon from '../../assets/x_bold.svg';
import {DimensionsWrapper} from '../../styled/common';
import api, {ResolverTypes} from '../../api';
import {getCurrentLocale} from '../../utils/common';
import {useReservation} from '../../context/reservation';
import {
  useErrorModal,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../utils/hooks';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {usePaymentSettings} from '../../hooks/usePaymentSettings';
import {useIpDetails} from '../../context/ipDetails';
import {InputEventType} from '../../utils/types';
import Modal from '../Modal';
import Header from '../Header';
import Button from '../Button';
import Loader from '../Loader';
import StripeCardElement, {useStripeCardElement} from '../StripeCardElement';
import {
  BottomText,
  ButtonsWrapper,
  CardholderNameInput,
  CloseIcon,
  CloseIconButton,
  Content,
  DepositAmount,
  DepositAmountTitle,
  ExpirationDatesAndCVCFields,
  ExpiryDateInput,
  ExpiryDatesWrapper,
  FieldLabel,
  FieldOverlay,
  Footer,
  FormError,
  FormField,
  FormTitle,
  Iframe,
  LoaderWrapper,
  Main,
  PaycometCVC,
  PaycometPan,
  PaymentContent,
  paymentModalContentStyle,
  PriceWrapper,
  SecondaryButton,
  Slash,
  StripeCardElementFormField,
  Text,
  Title,
} from './styled';

const PAYCOMET_SCRIPT_URL = process.env.REACT_APP_PAYCOMET_SCRIPT_URL;
const JET_ID = process.env.REACT_APP_PAYCOMET_JET_ID;
const SCRIPT_AFTER_LOADING_TIMEOUT_S = 1;
const TOKEN_WAITING_INTERVAL_S = 0.3;
const RELEASE_DAYS_NUMBER = 7;
const DEFAULT_DEPOSIT_AMOUNT = '0.00';
const PAYMENT_ACCOUNT_CREATION_STATUS = 'NEW';
const VERTICAL_FORM_LAYOUT_PAYMENT_PROVIDERS = [PAYMENT_PROVIDERS.stripe];

function getReleaseDate(reservation?: any, country?: string) {
  const date = reservation?.check_out_date;
  let dateFormat = 'dd/MM/yyyy';

  if (!date) {
    return '00/00/0000';
  }

  if (country === COUNTRY_CODES.usa) {
    dateFormat = 'MM/dd/yyyy';
  }

  return format(addDays(new Date(date), RELEASE_DAYS_NUMBER), dateFormat);
}

function getSecurityDeposit(reservation?: any) {
  if (!reservation) {
    return DEFAULT_DEPOSIT_AMOUNT;
  }

  return reservation?.security_deposit_amount || DEFAULT_DEPOSIT_AMOUNT;
}

function getIsDepositMandatory(reservation?: any) {
  if (!reservation) {
    return false;
  }

  return (
    reservation?.housing?.security_deposit_status === SECURITY_DEPOSIT_STATUSES.mandatory
  );
}

enum SECURITY_DEPOSIT_PAYMENT_STATUSES {
  new = 'NEW',
  confirmed = 'CONFIRMED',
  canceled = 'CANCELED',
  released = 'RELEASED',
  secureWaiting = 'SECURE_WAITING',
}

type LocationState = {
  wasPaymentSkipped?: boolean;
};

function SecurityDepositPaymentScreen() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const ws = useWebsocket();
  const {isLoading, setStatus} = useStatus();
  const {ErrorModal, displayError} = useErrorModal();
  const {
    data: reservation,
    isLoading: isLoadingReservation,
    setReservation,
    refreshReservation,
  } = useReservation();
  const {hasDeposits} = useComputedReservationDetails();
  const [isLoadingPaycometScript, setIsLoadingPaycometScript] = React.useState(true);
  const [failedToken, setFailedToken] = React.useState('');
  const [expirationMonth, setExpirationMonth] = React.useState('');
  const [expirationYear, setExpirationYear] = React.useState('');

  const [secureURL, setSecureURL] = React.useState('');
  const {
    isOpen: isSecurePaymentModalOpen,
    openModal: openSecurePaymentModal,
    closeModal: closeSecurePaymentModal,
  } = useModalControls();

  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {ipDetails} = useIpDetails();

  const tokenInputRef = React.useRef<HTMLInputElement>(null);
  const formErrorRef = React.useRef<HTMLDivElement>(null);
  const expirationYearRef = React.useRef<HTMLInputElement>(null);
  const expirationMonthRef = React.useRef<HTMLInputElement>(null);
  const intervalRef = React.useRef<any>();

  const {
    isPaycometPaymentProvider,
    isStripePaymentProvider,
    paymentProvider,
    arePaymentSettingsValid,
    hasPaymentSettings,
    isLoading: isLoadingPaymentSettings,
    revalidate: revalidatePaymentSettings,
  } = usePaymentSettings();

  const depositReleaseDate = getReleaseDate(reservation, ipDetails?.country_code);
  const depositAmount = getSecurityDeposit(reservation);
  const isDepositMandatory = getIsDepositMandatory(reservation);

  const handleSecureModalClose = React.useCallback(() => {
    setSecureURL('');
    closeSecurePaymentModal();
  }, [closeSecurePaymentModal]);

  const handlePaymentError = React.useCallback(
    (error?: any, tokenOrUniqueString = '') => {
      const defaultErrorMessage = t('bank_authentication_process_has_failed');
      displayError(error || defaultErrorMessage);
      setStatus('idle');
      setFailedToken(tokenOrUniqueString);
      handleSecureModalClose();
    },
    [t, displayError, setStatus, handleSecureModalClose],
  );

  const {
    cardProps,
    confirmDepositPaymentIntent,
    disabled: isStripeCardInvalid,
  } = useStripeCardElement(handlePaymentError);

  const isSubmitButtonDisabled =
    isLoading ||
    (isStripePaymentProvider && isStripeCardInvalid) ||
    (isPaycometPaymentProvider && isLoadingPaycometScript);
  const isPageLoaderVisible =
    isLoadingReservation || (!hasPaymentSettings && isLoadingPaymentSettings);
  const shouldLoadPaycometScript = !isPageLoaderVisible && isPaycometPaymentProvider;

  React.useEffect(() => {
    const hasReservation = Boolean(reservation?.id);
    const shouldRedirect =
      (hasReservation && !hasDeposits && !isLoadingPaymentSettings) ||
      !arePaymentSettingsValid;

    if (shouldRedirect) {
      history.push('/finish');
    }
  }, [
    arePaymentSettingsValid,
    hasDeposits,
    history,
    reservation,
    isLoadingPaymentSettings,
  ]);

  React.useLayoutEffect(
    function loadPaycometScript() {
      if (!shouldLoadPaycometScript) {
        return;
      }

      const script = document.createElement('script');
      const locale = getCurrentLocale();

      script.src = `${PAYCOMET_SCRIPT_URL}?lang=${locale}`;
      script.async = true;
      script.addEventListener('load', () => {
        // Timeout to prevent fields flickering after loading
        setTimeout(() => {
          if (isMounted.current) {
            setIsLoadingPaycometScript(false);
          }
        }, [SCRIPT_AFTER_LOADING_TIMEOUT_S * 1000]);
      });

      setIsLoadingPaycometScript(true);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    },
    [failedToken, isMounted, shouldLoadPaycometScript],
  );

  const setSecurityDepositStatus = React.useCallback(
    (status: SECURITY_DEPOSIT_PAYMENT_STATUSES) => {
      setReservation((prevState: any) => {
        return {
          ...prevState,
          security_deposit: {
            ...prevState.security_deposit,
            status,
          },
        };
      });
    },
    [setReservation],
  );

  const confirmDeposit = React.useCallback(() => {
    setSecurityDepositStatus(SECURITY_DEPOSIT_PAYMENT_STATUSES.confirmed);
  }, [setSecurityDepositStatus]);

  const cancelDeposit = React.useCallback(() => {
    setSecurityDepositStatus(SECURITY_DEPOSIT_PAYMENT_STATUSES.canceled);
  }, [setSecurityDepositStatus]);

  const handleSecurityDepositError = React.useCallback(
    (error?: any, tokenOrUniqueString = '') => {
      cancelDeposit();
      handlePaymentError(error, tokenOrUniqueString);
    },
    [cancelDeposit, handlePaymentError],
  );

  const handlePaymentSuccess = React.useCallback(async () => {
    confirmDeposit();
    await revalidatePaymentSettings();
    await refreshReservation();

    history.push('/deposits/finish', location.state);
  }, [
    confirmDeposit,
    history,
    location.state,
    refreshReservation,
    revalidatePaymentSettings,
  ]);

  const saveSecurityURLToReservation = React.useCallback(
    (url: string) => {
      setReservation((prevState: any) => {
        return {
          ...prevState,
          security_deposit: {
            ...prevState.security_deposit,
            secure_url: url,
            status: SECURITY_DEPOSIT_PAYMENT_STATUSES.secureWaiting,
          },
        };
      });
    },
    [setReservation],
  );

  const handleSecurePayment = React.useCallback(
    (secureURL?: string) => {
      setStatus('idle');

      if (!secureURL) {
        const securityDepositId = reservation?.security_deposit?.id || '';

        handlePaymentError(t('missing_payment_secure_link'));
        Sentry.captureMessage(
          `${t(
            'missing_payment_secure_link',
          )}. Security deposit ID: ${securityDepositId}`,
        );
        return;
      }

      saveSecurityURLToReservation(secureURL);

      openSecurePaymentModal();
      setSecureURL(secureURL);
    },
    [
      handlePaymentError,
      openSecurePaymentModal,
      reservation,
      saveSecurityURLToReservation,
      setStatus,
      t,
    ],
  );

  const getPaycometDepositPaymentPayload = React.useCallback(() => {
    return {
      amount: depositAmount,
      guest_payment_account_id: reservation?.guest_payment_account?.id,
    };
  }, [depositAmount, reservation]);

  const payPaycometDeposit = React.useCallback(async () => {
    const payload = getPaycometDepositPaymentPayload();
    const {error, data} = await api.securityDeposits.post(payload);

    if (data) {
      setReservation((prevState: any) => {
        return {...prevState, security_deposit: data};
      });
    }

    if (error) {
      displayError(error);
      handlePaymentError(error, String(Math.random()));
    }

    // Waiting for websocket...
  }, [
    displayError,
    getPaycometDepositPaymentPayload,
    handlePaymentError,
    setReservation,
  ]);

  React.useLayoutEffect(
    function handleWSEvents() {
      if (ws.message.event_type === WS_EVENT_TYPES.securityDepositConfirmed) {
        handlePaymentSuccess();
      }

      if (ws.message.event_type === WS_EVENT_TYPES.securityDepositCancelled) {
        handleSecurityDepositError(ws.message?.status_details, String(Date.now()));
      }

      return ws.clearMessage;
    },
    [
      displayError,
      handlePaymentError,
      handlePaymentSuccess,
      handleSecurePayment,
      handleSecurityDepositError,
      history,
      payPaycometDeposit,
      ws,
    ],
  );

  React.useEffect(
    function handlePaycometWSEvents() {
      if (!isPaycometPaymentProvider) {
        return;
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentAccountConfirmed) {
        payPaycometDeposit();
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentAccountRejected) {
        handlePaymentError(ws.message?.status_details, String(Date.now()));
      }

      if (ws.message.event_type === WS_EVENT_TYPES.securityDepositSecureWaiting) {
        handleSecurePayment(ws.message.secure_url);
      }

      return ws.clearMessage;
    },
    [
      handlePaymentError,
      handleSecurePayment,
      isPaycometPaymentProvider,
      payPaycometDeposit,
      ws.clearMessage,
      ws.message,
    ],
  );

  React.useEffect(
    function handleStripeWSEvents() {
      if (!isStripePaymentProvider) {
        return;
      }

      if (ws.message.event_type === WS_EVENT_TYPES.securityDepositAuthCodeReceived) {
        const clientSecret: string = ws.message.auth_code;
        confirmDepositPaymentIntent(clientSecret);
      }

      return ws.clearMessage;
    },

    [
      confirmDepositPaymentIntent,
      isStripePaymentProvider,
      ws.message.auth_code,
      ws.message.event_type,
      ws.clearMessage,
    ],
  );

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const goToFinish = () => {
    history.push('/finish');
  };

  const handleExpirationMonthChange = (e: InputEventType) => {
    const {value} = e.target;
    if (value === '') {
      setExpirationMonth(value);
      return;
    }

    if (value.length > 2) {
      expirationYearRef.current?.focus();
      const lastDigit = value.split('').pop()!;
      setExpirationYear(lastDigit);
      return;
    }

    const monthNumber = Number(value);
    if (monthNumber < 0) {
      setExpirationMonth('0');
      return;
    }

    if (monthNumber > 12) {
      setExpirationMonth('12');
      expirationYearRef.current?.focus();
      return;
    }

    setExpirationMonth(value);
  };

  const handleMonthBlur = (e: InputEventType) => {
    const {value} = e.target;

    if (value && value.length === 1) {
      setExpirationMonth(`0${value}`);
    }
  };

  const handleExpirationYearChange = (e: InputEventType) => {
    const {value} = e.target;
    if (value.length > 2) {
      return;
    }
    setExpirationYear(value);
  };

  const handleExpirationYearKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isBackspaceKeyCode = e.keyCode === 8;
    const value = e.currentTarget.value;

    if (isBackspaceKeyCode && !value) {
      expirationMonthRef.current?.focus();
    }
  };

  const getPaymentAccountPayload = (token: string) => {
    return {
      reservation_id: reservation?.id,
      temporary_token: token,
      status: PAYMENT_ACCOUNT_CREATION_STATUS,
    };
  };

  const createOrUpdatePaymentAccount = async (token: string) => {
    const payload = getPaymentAccountPayload(token);
    let result: ResolverTypes = {
      error: null,
      data: null,
    };

    const paymentAcoountId = reservation?.guest_payment_account?.id;
    if (paymentAcoountId) {
      result = await api.guestPaymentAccounts.patch(paymentAcoountId, payload);
    } else {
      result = await api.guestPaymentAccounts.post(payload);
    }

    if (result.error) {
      handlePaymentError(result.error, token);
      return result.error;
    }

    if (result.data) {
      setReservation((prevState: any) => {
        return {
          ...prevState,
          guest_payment_account: result.data,
        };
      });
    }

    // Waiting for websocket...
  };

  const handlePayment = async (token: string) => {
    setStatus('loading');

    const creationError = await createOrUpdatePaymentAccount(token);
    if (creationError) {
      return;
    }
  };

  const handlePaycometSubmit = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!tokenInputRef.current) {
      return;
    }
    tokenInputRef.current.value = '';

    intervalRef.current = setInterval(() => {
      const token = tokenInputRef.current?.value;
      if (token) {
        clearInterval(intervalRef.current);
        handlePayment(token);
      }
    }, TOKEN_WAITING_INTERVAL_S * 1000);
  };

  const getStripeDepositPaymentPayload = () => {
    return {
      reservation_id: reservation?.id,
      amount: depositAmount,
    };
  };

  const createOrUpdateStripeSecurityDeposit = async () => {
    const payload = getStripeDepositPaymentPayload();
    const {error} = await api.securityDeposits.post(payload);

    if (error) {
      handlePaymentError(error);
    }
  };

  const handleStripeSubmit = async () => {
    if (isStripeCardInvalid) {
      return;
    }

    setStatus('loading');
    await createOrUpdateStripeSecurityDeposit();
    // Waiting for WS_EVENT_TYPES.guestPaymentAuthCodeReceived
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const handlers = {
      [PAYMENT_PROVIDERS.paycomet]: handlePaycometSubmit,
      [PAYMENT_PROVIDERS.stripe]: handleStripeSubmit,
    };

    const providerHandler = handlers[paymentProvider];
    if (!providerHandler) {
      throw new Error(
        `Form submition failed: ${paymentProvider} is unknown payment provider.`,
      );
    }

    providerHandler();
  };

  const PaycometForm = React.useMemo(() => {
    return (
      <>
        <input type="hidden" name="paytpvToken" ref={tokenInputRef} />
        <input type="hidden" data-paycomet="no-mask" value="" />
        <input type="hidden" data-paycomet="jetID" value={JET_ID} />
        <FormField data-testid="paycomet-form">
          {isLoadingPaycometScript && <FieldOverlay />}
          <FieldLabel>
            <div>{t('card_number')}</div>
            <PaycometPan id="paycomet-pan" data-paycomet="paNumber" />
            <input
              style={{opacity: 0}}
              type="text"
              id="old-pan-input"
              paycomet-name="pan"
              paycomet-style="width: 100%; height: 100%; font-size: 16px; border: 0; outline: none; color: #161643; font-family: sans-serif;"
            />
          </FieldLabel>
        </FormField>
        <FormField>
          <FieldLabel>
            {isLoadingPaycometScript && <FieldOverlay />}
            <div>{t('cardholder_name')}</div>
            <CardholderNameInput type="text" data-paycomet="cardHolderName" />
          </FieldLabel>
        </FormField>
        <ExpirationDatesAndCVCFields>
          {isLoadingPaycometScript && <FieldOverlay />}
          <FieldLabel>
            <div>{t('expiry_date')}</div>
            <ExpiryDatesWrapper>
              <ExpiryDateInput
                ref={expirationMonthRef}
                type="text"
                data-paycomet="dateMonth"
                value={expirationMonth}
                onChange={handleExpirationMonthChange}
                onBlur={handleMonthBlur}
                placeholder="MM"
              />
              <Slash>/</Slash>
              <ExpiryDateInput
                ref={expirationYearRef}
                type="text"
                data-paycomet="dateYear"
                onKeyUp={handleExpirationYearKeyUp}
                onChange={handleExpirationYearChange}
                value={expirationYear}
                placeholder="YY"
              />
            </ExpiryDatesWrapper>
          </FieldLabel>
          {isLoadingPaycometScript && <FieldOverlay />}
          <FieldLabel>
            <div>CVC</div>
            <PaycometCVC id="paycomet-cvc2" data-paycomet="cvc2" />
            <input
              style={{opacity: 0}}
              type="text"
              id="old-CVC2-input"
              paycomet-name="cvc2"
              paycomet-style="width: 100%; height: 100%; font-size:16px; border:0; outline: none; color: #161643; font-family: sans-serif;"
            />
          </FieldLabel>
        </ExpirationDatesAndCVCFields>
      </>
    );
  }, [expirationMonth, expirationYear, isLoadingPaycometScript, t]);

  const StripeForm = React.useMemo(() => {
    return (
      <StripeCardElementFormField data-testid="stripe-form">
        <StripeCardElement {...cardProps} />
      </StripeCardElementFormField>
    );
  }, [cardProps]);

  const ProviderForm = React.useMemo(() => {
    const forms = {
      [PAYMENT_PROVIDERS.paycomet]: PaycometForm,
      [PAYMENT_PROVIDERS.stripe]: StripeForm,
    };

    const providerForm = forms[paymentProvider];
    if (!providerForm) {
      throw new Error(
        `Form rendering failed: ${paymentProvider} is unknown payment provider.`,
      );
    }

    return providerForm;
  }, [PaycometForm, StripeForm, paymentProvider]);

  return (
    <div>
      <Header hideBackButton title={t('security_deposit')} />
      <DimensionsWrapper>
        <Content>
          {isPageLoaderVisible ? (
            <Main>
              <LoaderWrapper>
                <Loader height={45} width={45} label={t('loading')} />
              </LoaderWrapper>
            </Main>
          ) : (
            <Main>
              <Title>
                {isDepositMandatory
                  ? t('make_your_deposit_now')
                  : t('would_you_like_to_make_deposit').toUpperCase()}
              </Title>
              <Text>
                {isDepositMandatory
                  ? t('it_is_mandatory_to_deposit')
                  : t('you_can_make_deposit_before_arriving')}
              </Text>
              <form
                onSubmit={handleSubmit}
                id={isPaycometPaymentProvider ? 'paycometPaymentForm' : undefined}
                key={isPaycometPaymentProvider ? failedToken : undefined}
                // eslint-disable-next-line
                action={isPaycometPaymentProvider ? 'javascript:void(0);' : undefined}
              >
                <PaymentContent
                  verticalLayout={VERTICAL_FORM_LAYOUT_PAYMENT_PROVIDERS.includes(
                    paymentProvider,
                  )}
                >
                  <div>
                    <FormTitle>{t('payment_card_details')}</FormTitle>
                    {ProviderForm}
                  </div>
                  <PriceWrapper>
                    <DepositAmountTitle>{t('deposit_amount')}</DepositAmountTitle>
                    <DepositAmount>
                      {depositAmount} {paymentSettingsCurrencyLabel}
                    </DepositAmount>
                  </PriceWrapper>
                </PaymentContent>
                {isPaycometPaymentProvider && (
                  <FormError id="paymentErrorMsg" ref={formErrorRef} />
                )}
                <BottomText>
                  <Text>{t('i_accept_deposit_rules')}</Text>
                  <Text>
                    {t('the_amount_will_be_released_on_date', {
                      date: depositReleaseDate,
                    })}
                  </Text>
                </BottomText>
                <ButtonsWrapper>
                  <Button
                    type="submit"
                    label={t('accept')}
                    disabled={isSubmitButtonDisabled}
                  />
                  {!isDepositMandatory && (
                    <SecondaryButton
                      secondary
                      label={t('pay_at_the_accommodation')}
                      onClick={goToFinish}
                    />
                  )}
                </ButtonsWrapper>
              </form>
            </Main>
          )}
        </Content>
        <Footer>Chekin (Spain)</Footer>
      </DimensionsWrapper>
      <ErrorModal />
      <Modal
        contentStyle={paymentModalContentStyle}
        open={isSecurePaymentModalOpen}
        onClose={handleSecureModalClose}
      >
        <CloseIconButton onClick={handleSecureModalClose}>
          <CloseIcon src={crossIcon} alt="Cross" />
        </CloseIconButton>
        <Iframe title="3D Secure" src={secureURL} />
      </Modal>
    </div>
  );
}

export {SecurityDepositPaymentScreen};
