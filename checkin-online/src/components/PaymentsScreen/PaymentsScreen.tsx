import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import useSWR from 'swr';
import crossIcon from '../../assets/x_bold.svg';
import closeIcon from '../../assets/close-icon.svg';
import warningIcon from '../../assets/warning-icon.svg';
import {getCurrentLocale} from '../../utils/common';
import {InputEventType} from '../../utils/types';
import {FormTypes as TaxesSetupFormTypes} from '../TaxesSetupScreen/TaxesSetupScreen';
import {
  useErrorModal,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../utils/hooks';
import {useReservation} from '../../context/reservation';
import {useWebsocket} from '../../context/websocket';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {usePaymentSettings} from '../../hooks/usePaymentSettings';
import {PAYMENT_PROVIDERS, WS_EVENT_TYPES} from '../../utils/constants';
import {PATHS} from '../../Routes';
import api, {getURL, ResolverTypes} from '../../api';
import creditCardIcon from '../../assets/credit-card.svg';
import {useHousingExemptions} from '../../hooks/useHousingExemptions';
import Header from '../Header';
import Loader from '../Loader';
import Modal from '../Modal';
import StripeCardElement, {useStripeCardElement} from '../StripeCardElement';
import {DimensionsWrapper, ModalButton} from '../../styled/common';
import {
  Content,
  Wrapper,
  ResultColumn,
  ResultWrapper,
  ResultTitle,
  ResultSubtitle,
  Divider,
  PaymentColumn,
  FormTitle,
  SubmitButtonWrapper,
  TotalTitle,
  PayButton,
  SecurePaymentText,
  SecureWrapper,
  Title,
  CardholderNameInput,
  ExpiryDateInput,
  Slash,
  ExpiryDatesWrapper,
  FormError,
  Main,
  ExpirationDatesAndCVCFields,
  FieldLabel,
  FieldOverlay,
  FormField,
  PaycometCVC,
  PaycometPan,
  Footer,
  Iframe,
  CloseIcon,
  CloseIconButton,
  paymentModalContentStyle,
  SecondaryButton,
  WideFieldLabel,
  DeleteDealIcon,
  RemovePriceItemButton,
} from './styled';
import {useCartDeals} from '../OffersAndExperiencesScreen/useCartDeals';

const PAYCOMET_SCRIPT_URL = process.env.REACT_APP_PAYCOMET_SCRIPT_URL;
const JET_ID = process.env.REACT_APP_PAYCOMET_JET_ID;
const SCRIPT_AFTER_LOADING_TIMEOUT_S = 1;
const TOKEN_WAITING_INTERVAL_S = 0.3;
const PAYMENT_ACCOUNT_CREATION_STATUS = 'NEW';

enum PAYMENT_TYPES {
  reservationGeneral = 'RESERVATION_GENERAL',
}

enum GUEST_PAYMENT_SUCCESS_STATUSES {
  secureWaiting = 'SECURE_WAITING',
  new = 'NEW',
  completed = 'COMPLETED',
  failed = 'FAILED',
}

function fetchGuestPayment(reservation: any) {
  const reservationId = reservation?.id;

  if (!reservationId) {
    return null;
  }

  return getURL(api.guestPayments.ENDPOINTS.forTaxes(`reservation_id=${reservationId}`));
}

export type ReservationPayment = {
  amount: string;
  amount_with_commission: number;
  app_commission_amount: number;
  guest_commission_amount: number;
  guest_payment_id: null | string;
  id: string;
  managers_profit: number;
  name: string;
  reservation_id: string;
  status: string;
  status_details: string;
  type: 'UPSELLING' | 'TOURIST_TAXES' | 'BOOKING' | 'PMS_INTEGRATION' | 'EXTRA_SERVICE';
};

type LocationState = {
  taxAmount: number;
  formState: TaxesSetupFormTypes;
  guestsTaxes: {[key: number]: number};
  wasPaymentSkipped?: boolean;
};

type GuestPayment = {
  status: GUEST_PAYMENT_SUCCESS_STATUSES;
  amount: string;
  created_at: string;
  description: string;
  id: string;
  ip_address: string;
  reservation_id: string;
  secure_url: string;
  security_deposit: null | string;
  security_deposit_id: null | string;
  status_details: string;
  type: 'RESERVATION_TAXES';
};

function PaymentsScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const ws = useWebsocket();
  const isMounted = useIsMounted();
  const {
    data: reservation,
    isLoading: isLoadingReservation,
    setReservation,
    refreshReservation,
  } = useReservation();
  const {
    hasTaxes,
    isSomePayments,
    hasDeposits,
    arePaymentsOptional,
    isGuestPayingPaymentsFees,
    isGuestPayingTaxesFees,
    areBookingPaymentsActivated,
    hasUpselling,
  } = useComputedReservationDetails();
  const [expirationMonth, setExpirationMonth] = React.useState('');
  const [expirationYear, setExpirationYear] = React.useState('');
  const [isLoadingScript, setIsLoadingScript] = React.useState(true);
  const [failedToken, setFailedToken] = React.useState('');
  const {isLoading, setStatus} = useStatus();
  const {ErrorModal, displayError} = useErrorModal();
  const [
    preloadedBookingPayment,
    setPreloadedBookingPayment,
  ] = React.useState<ReservationPayment | null>(null);
  const [
    preloadedTaxesPayment,
    setPreloadedTaxesPayment,
  ] = React.useState<ReservationPayment | null>(null);
  const [preloadedExtraServices, setPreloadedExtraServices] = React.useState<
    {name: string; amount: string}[]
  >([]);
  const [totalPaymentsAmount, setTotalPaymentsAmount] = React.useState<string | null>(
    null,
  );
  const [subtotalPaymentsAmount, setSubtotalPaymentsAmount] = React.useState<
    null | string
  >(null);
  const [preloadedUpselling, setPreloadedUpselling] = React.useState<
    ReservationPayment[]
  >([]);
  const [transactionFeeAmount, setTransactionFeeAmount] = React.useState('');
  const [isFirstLoad, setIsFirstLoad] = React.useState(false);
  const [deletionFieldId, setDeletionFieldId] = React.useState('');
  const [isPaycometScriptLoaded, setIsPaycometScriptLoaded] = React.useState(false);

  const {
    isStripePaymentProvider,
    isPaycometPaymentProvider,
    paymentProvider,
    arePaymentSettingsValid,
    isLoading: isLoadingPaymentSettings,
    revalidate: revalidatePaymentSettings,
  } = usePaymentSettings();

  const [secureURL, setSecureURL] = React.useState('');
  const {
    isOpen: isSecurePaymentModalOpen,
    openModal: openSecurePaymentModal,
    closeModal: closeSecurePaymentModal,
  } = useModalControls();
  const {
    isOpen: isDeleteConfirmationModalOpen,
    openModal: openDeleteConfirmationModal,
    closeModal: closeDeleteConfirmationModal,
  } = useModalControls();

  const {exemptions} = useHousingExemptions(
    reservation?.source_name,
    reservation?.housing?.id,
  );
  const {
    paymentSettingsCurrencyLabel,
    paymentSettingsCurrencySign,
  } = usePaymentSettings();

  const {deleteCartDealFromStorage} = useCartDeals({onError: displayError});

  const tokenInputRef = React.useRef<HTMLInputElement>(null);
  const formErrorRef = React.useRef<HTMLDivElement>(null);
  const expirationYearRef = React.useRef<HTMLInputElement>(null);
  const expirationMonthRef = React.useRef<HTMLInputElement>(null);
  const intervalRef = React.useRef<any>();

  const shouldLoadPaycometScript = !isLoadingReservation && isPaycometPaymentProvider;

  const {
    data: guestPayment,
    isValidating: isLoadingGuestPayment,
    mutate: mutateGuestPayment,
  } = useSWR<GuestPayment>(fetchGuestPayment(reservation));

  const reservationPayments: ReservationPayment[] | undefined =
    reservation?.reservation_payments;

  const handlePaymentError = React.useCallback(
    (error?: any, tokenOrUniqueString = '') => {
      const defaultErrorMessage = t('bank_authentication_process_has_failed');

      displayError(error || defaultErrorMessage);
      setStatus('idle');
      setFailedToken(tokenOrUniqueString);
      setIsPaycometScriptLoaded(false);
    },
    [displayError, setStatus, t],
  );

  const {
    disabled: isStripeCardInvalid,
    cardProps,
    confirmPaymentIntent,
  } = useStripeCardElement(handlePaymentError);

  const isSubmitButtonDisabled =
    isLoading ||
    isLoadingGuestPayment ||
    (isPaycometPaymentProvider && isLoadingScript) ||
    (isStripePaymentProvider && isStripeCardInvalid);

  const skipPayment = () => {
    if (hasDeposits) {
      history.push('/deposits/payment');
    } else {
      history.push('/finish', {wasPaymentSkipped: true});
    }
  };

  React.useEffect(function handleFirstLoad() {
    const firstLoad = `${sessionStorage.getItem('firstLoadPayments')}`;

    if (JSON.parse(firstLoad)) {
      setIsFirstLoad(true);
      sessionStorage.setItem('firstLoadPayments', 'false');
    }
  }, []);

  const goBack = React.useCallback(() => {
    if (hasUpselling) {
      history.push('/deals-list', location.state);
      return;
    }

    history.push(PATHS.taxesSetup, location.state);
  }, [hasUpselling, history, location.state]);

  React.useEffect(() => {
    const hasReservation = Boolean(reservation?.id);
    const shouldRedirect =
      (hasReservation &&
        !hasTaxes &&
        !isSomePayments &&
        !isLoadingPaymentSettings &&
        !hasUpselling) ||
      !arePaymentSettingsValid;

    if (shouldRedirect) {
      goBack();
    }
  }, [
    goBack,
    hasTaxes,
    isSomePayments,
    history,
    isLoading,
    location.state,
    reservation,
    isLoadingPaymentSettings,
    arePaymentSettingsValid,
    hasUpselling,
  ]);

  React.useEffect(
    function loadPaycometScript() {
      if (!shouldLoadPaycometScript || isPaycometScriptLoaded) {
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
            setIsLoadingScript(false);
          }
        }, [SCRIPT_AFTER_LOADING_TIMEOUT_S * 1000]);
      });

      setIsLoadingScript(true);
      setIsPaycometScriptLoaded(true);

      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    },
    [failedToken, isMounted, isPaycometScriptLoaded, shouldLoadPaycometScript],
  );

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  React.useEffect(
    function preloadPayments() {
      if (!exemptions) return;
      if (!reservationPayments) return;

      const {taxExemption, bookingPaymentExemption} = exemptions;

      if (!taxExemption) {
        const taxes = reservationPayments.find(
          field =>
            field.type === 'TOURIST_TAXES' &&
            field.status === 'ENABLED' &&
            parseFloat(field.amount) > 0,
        );

        if (taxes) {
          setPreloadedTaxesPayment(taxes);
        }
      }

      if (!bookingPaymentExemption && areBookingPaymentsActivated) {
        const booking = reservationPayments.find(
          field =>
            (field.type === 'BOOKING' || field.type === 'PMS_INTEGRATION') &&
            field.status === 'ENABLED' &&
            parseInt(field.amount, 10) > 0,
        );

        if (booking) {
          setPreloadedBookingPayment(booking);
        }

        const extraServices = reservationPayments
          ?.filter(field => {
            return (
              field.type === 'EXTRA_SERVICE' &&
              field.status === 'ENABLED' &&
              parseInt(field.amount, 10) > 0
            );
          })
          .map(field => ({name: field.name, amount: field.amount}));

        if (extraServices?.length) {
          setPreloadedExtraServices(extraServices);
        }
      }

      const upselling = reservationPayments.filter(field => {
        return (
          field.type === 'UPSELLING' &&
          field.status === 'ENABLED' &&
          parseInt(field.amount, 10) > 0
        );
      });

      if (upselling && upselling.length >= 0) {
        setPreloadedUpselling(upselling);
      }
    },
    [reservationPayments, exemptions, areBookingPaymentsActivated],
  );

  React.useEffect(
    function calculateTotalAmount() {
      if (!reservationPayments) return;

      const amountbookingPaid = reservation.already_paid_amount;
      const taxesPayment = preloadedTaxesPayment?.amount;
      const bookingPayment = preloadedBookingPayment?.amount;
      const extraPayments = preloadedExtraServices?.reduce(
        (acc, field) => acc + parseFloat(field.amount),
        0,
      );
      const upselling = preloadedUpselling?.reduce(
        (acc, field) => acc + parseFloat(field.amount),
        0,
      );

      if (
        (isGuestPayingPaymentsFees && (bookingPayment || extraPayments)) ||
        (isGuestPayingTaxesFees && taxesPayment) ||
        upselling
      ) {
        let subtotal = 0;

        if (isGuestPayingPaymentsFees && bookingPayment) {
          subtotal += +bookingPayment;
        }

        if (isGuestPayingPaymentsFees && extraPayments) {
          subtotal += +extraPayments;
        }

        if (isGuestPayingTaxesFees && taxesPayment) {
          subtotal += +taxesPayment;
        }

        if (!isGuestPayingPaymentsFees && bookingPayment) {
          subtotal += +bookingPayment;
        }

        if (!isGuestPayingPaymentsFees && extraPayments) {
          subtotal += +extraPayments;
        }

        if (!isGuestPayingTaxesFees && taxesPayment) {
          subtotal += +taxesPayment;
        }

        if (upselling) {
          subtotal += upselling;
        }

        if (+reservation.already_paid_amount > 0) {
          subtotal -= +amountbookingPaid;
        }

        const transactionFee = reservationPayments
          .filter(field => field.status === 'ENABLED')
          .reduce((acc, field) => acc + field.guest_commission_amount, 0);

        const totalPayment = subtotal + transactionFee;

        setSubtotalPaymentsAmount(subtotal.toFixed(2));
        setTransactionFeeAmount(transactionFee.toFixed(2));
        setTotalPaymentsAmount(totalPayment.toFixed(2));
      } else {
        let subtotal = 0;

        if (bookingPayment) {
          subtotal += +bookingPayment;
        }

        if (extraPayments) {
          subtotal += +extraPayments;
        }

        if (taxesPayment) {
          subtotal += +taxesPayment;
        }

        if (upselling) {
          subtotal += upselling;
        }

        if (+reservation.already_paid_amount > 0) {
          subtotal -= +amountbookingPaid;
        }

        setTotalPaymentsAmount(subtotal.toFixed(2));
      }
    },
    [
      reservationPayments,
      transactionFeeAmount,
      setSubtotalPaymentsAmount,
      isGuestPayingPaymentsFees,
      isGuestPayingTaxesFees,
      reservation,
      preloadedBookingPayment,
      preloadedTaxesPayment,
      preloadedExtraServices,
      preloadedUpselling,
    ],
  );

  const handleSecureModalClose = React.useCallback(() => {
    setSecureURL('');
    closeSecurePaymentModal();
  }, [closeSecurePaymentModal]);

  const markTaxesAsPaid = React.useCallback(() => {
    setReservation((prevState: any) => {
      return {
        ...prevState,
        have_taxes_been_paid: true,
      };
    });
  }, [setReservation]);

  const handlePaymentSuccess = React.useCallback(async () => {
    if (hasTaxes) {
      markTaxesAsPaid();
    }

    await revalidatePaymentSettings();
    refreshReservation();
    history.push('/taxes/finish', location.state);
  }, [
    hasTaxes,
    revalidatePaymentSettings,
    refreshReservation,
    history,
    location.state,
    markTaxesAsPaid,
  ]);

  const handleGuestPaymentError = React.useCallback(
    (error?: any, tokenOrUniqueString = '') => {
      mutateGuestPayment(prevState => {
        return {
          ...prevState,
          status: GUEST_PAYMENT_SUCCESS_STATUSES.failed,
        };
      });
      handlePaymentError(error, tokenOrUniqueString);
      handleSecureModalClose();
    },
    [handleSecureModalClose, handlePaymentError, mutateGuestPayment],
  );

  const handleSecurePayment = React.useCallback(
    (secureURL?: string) => {
      setStatus('idle');

      if (!secureURL) {
        handlePaymentError(t('missing_payment_secure_link'));
        Sentry.captureMessage(
          `${t('missing_payment_secure_link')}. Guest payment ID: ${guestPayment?.id}`,
        );
        return;
      }

      mutateGuestPayment(prevState => {
        return {
          ...prevState,
          status: GUEST_PAYMENT_SUCCESS_STATUSES.secureWaiting,
          secure_url: secureURL,
        };
      });

      openSecurePaymentModal();
      setSecureURL(secureURL);
    },
    [
      guestPayment,
      handlePaymentError,
      mutateGuestPayment,
      openSecurePaymentModal,
      setStatus,
      t,
    ],
  );

  const getPaycometPaymentPayload = React.useCallback(() => {
    return {
      reservation_id: reservation?.id,
    };
  }, [reservation]);

  const createGuestPayment = React.useCallback(
    async (payload: any) => {
      const result = await api.guestPayments.post(payload);

      if (!isMounted.current) {
        return;
      }

      if (result.data) {
        mutateGuestPayment(result.data, false);
      }

      if (result.error) {
        handlePaymentError(result.error, String(Math.random()));
      }
    },
    [handlePaymentError, isMounted, mutateGuestPayment],
  );

  const pay = React.useCallback(async () => {
    const payload = getPaycometPaymentPayload();
    await createGuestPayment(payload);
    // Waiting for websocket
  }, [createGuestPayment, getPaycometPaymentPayload]);

  React.useLayoutEffect(
    function handleWSEvents() {
      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentCompleted) {
        handlePaymentSuccess();
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentFailed) {
        handleGuestPaymentError(ws.message?.status_details, String(Date.now()));
      }

      return ws.clearMessage;
    },
    [
      displayError,
      handlePaymentError,
      history,
      pay,
      ws,
      handlePaymentSuccess,
      handleSecurePayment,
      handleGuestPaymentError,
    ],
  );

  React.useEffect(
    function handlePaycometWSEvents() {
      if (!isPaycometPaymentProvider) {
        return;
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentAccountConfirmed) {
        pay();
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentAccountRejected) {
        handlePaymentError(ws.message?.status_details, String(Date.now()));
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentSecureWaiting) {
        handleSecurePayment(ws.message.secure_url);
      }

      return ws.clearMessage;
    },
    [
      handlePaymentError,
      handleSecurePayment,
      isPaycometPaymentProvider,
      pay,
      ws.message,
      ws.clearMessage,
    ],
  );

  React.useEffect(
    function handleStripeWSEvents() {
      if (!isStripePaymentProvider) {
        return;
      }

      if (ws.message.event_type === WS_EVENT_TYPES.guestPaymentAuthCodeReceived) {
        const clientSecret = ws.message.auth_code;
        confirmPaymentIntent(clientSecret);
      }

      return ws.clearMessage;
    },
    [
      confirmPaymentIntent,
      isStripePaymentProvider,
      ws.message.auth_code,
      ws.message.event_type,
      ws.clearMessage,
    ],
  );

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

  const fetchDealId = async () => {
    const {error, data} = await api.upselling.getDeals(
      `reservation_payment=${deletionFieldId}`,
    );

    if (!isMounted.current) {
      return;
    }

    setDeletionFieldId('');

    if (error) {
      setStatus('idle');
      displayError(error);
      return;
    }

    const dealId = data?.[0]?.id as string;
    const offerId = data?.[0]?.offer?.id as string;

    if (!dealId) {
      setStatus('idle');
      displayError('Missing deal id.');
      Sentry.captureException(`Missing deal id of ${deletionFieldId} payment`);
      return;
    }

    return {dealId, offerId};
  };

  const deleteDeal = async (id: string, offerId: string) => {
    const {error} = await api.upselling.deleteDeal(id);
    deleteCartDealFromStorage(offerId);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('idle');
      setDeletionFieldId('');
      displayError(error);
      return;
    }

    await refreshReservation();
    setStatus('idle');

    if (isDeleteConfirmationModalOpen) {
      closeDeleteConfirmationModal();
    }
  };

  const fetchDealIdAndDeleteDeal = async () => {
    setStatus('loading');
    const {dealId, offerId} = (await fetchDealId()) || {};
    if (!dealId || !offerId) {
      return;
    }

    deleteDeal(dealId, offerId);
  };

  const setDealDeletionIdAndOpenConfirmationModal = (id: string) => {
    setDeletionFieldId(id);
    openDeleteConfirmationModal();
  };

  const handleDeleteConfirmationModalClose = () => {
    setDeletionFieldId('');
    closeDeleteConfirmationModal();
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

  const getStripePaymentPayload = React.useCallback(() => {
    return {
      reservation_id: reservation?.id,
      type: PAYMENT_TYPES.reservationGeneral,
    };
  }, [reservation]);

  const handleStripeSubmit = async () => {
    if (isStripeCardInvalid) {
      return;
    }

    const payload = getStripePaymentPayload();

    setStatus('loading');
    await createGuestPayment(payload);
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
          {isLoadingScript && <FieldOverlay />}
          <WideFieldLabel>
            <div>{t('card_number')}</div>
            <PaycometPan id="paycomet-pan" data-paycomet="paNumber" />
            <input
              style={{opacity: 0}}
              type="text"
              id="old-pan-input"
              paycomet-name="pan"
              paycomet-style="width: 100%; height: 100%; font-size: 16px; border: 0; outline: none; color: #161643; font-family: sans-serif;"
            />
          </WideFieldLabel>
        </FormField>
        <FormField>
          {isLoadingScript && <FieldOverlay />}
          <WideFieldLabel>
            <div>{t('cardholder_name')}</div>
            <CardholderNameInput type="text" data-paycomet="cardHolderName" />
          </WideFieldLabel>
        </FormField>
        <ExpirationDatesAndCVCFields>
          {isLoadingScript && <FieldOverlay />}
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
                inputMode="numeric"
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
                inputMode="numeric"
              />
            </ExpiryDatesWrapper>
          </FieldLabel>
          {isLoadingScript && <FieldOverlay />}
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
        <FormError id="paymentErrorMsg" ref={formErrorRef} />
      </>
    );
  }, [expirationMonth, expirationYear, isLoadingScript, t]);

  const StripeForm = React.useMemo(() => {
    return (
      <FormField data-testid="stripe-form">
        <StripeCardElement {...cardProps} />
      </FormField>
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
      <Modal
        withCloseButton
        closeOnEscape
        closeOnDocumentClick
        title={t('delete_payment_question')}
        text={t('you_are_going_to_delete_payment')}
        open={isDeleteConfirmationModalOpen}
        onClose={handleDeleteConfirmationModalClose}
        iconProps={{
          src: warningIcon,
          alt: '',
          height: 84,
          width: 84,
        }}
      >
        <ModalButton
          onClick={() => {
            closeDeleteConfirmationModal();
            fetchDealIdAndDeleteDeal();
          }}
          label={t('delete')}
        />
      </Modal>
      <Header
        onBack={goBack}
        title={t('payments')}
        hideBackButton={isLoading || isFirstLoad}
      />
      <DimensionsWrapper>
        <Content>
          <Title>
            {!arePaymentsOptional && t('it_is_mandatory_to_pay_for_your_booking')}
          </Title>
          <Wrapper>
            <ResultColumn>
              {preloadedBookingPayment && (
                <ResultWrapper>
                  <ResultTitle>{t('booking')}</ResultTitle>
                  <ResultSubtitle>
                    {preloadedBookingPayment.name} = {preloadedBookingPayment.amount}{' '}
                    {paymentSettingsCurrencySign}
                  </ResultSubtitle>
                </ResultWrapper>
              )}
              {preloadedTaxesPayment && (
                <ResultWrapper>
                  <ResultTitle>{t('tourist_taxes')}</ResultTitle>
                  <ResultSubtitle>
                    {t('taxes_amount')} = {preloadedTaxesPayment.amount}{' '}
                    {paymentSettingsCurrencySign}
                  </ResultSubtitle>
                </ResultWrapper>
              )}
              {Boolean(preloadedExtraServices.length) && (
                <ResultWrapper>
                  <ResultTitle>{t('extra_services')}</ResultTitle>
                  {preloadedExtraServices.map((field, i) => {
                    return (
                      <ResultSubtitle key={i}>
                        {field.name} = {field.amount} {paymentSettingsCurrencySign}
                      </ResultSubtitle>
                    );
                  })}
                </ResultWrapper>
              )}
              {Boolean(preloadedUpselling.length) && (
                <ResultWrapper>
                  <ResultTitle>{t('deals')}</ResultTitle>
                  {preloadedUpselling.map(field => {
                    return (
                      <ResultSubtitle key={field.id}>
                        {field.name} = {field.amount} {paymentSettingsCurrencySign}
                        <RemovePriceItemButton
                          disabled={deletionFieldId === field.id}
                          onClick={() =>
                            setDealDeletionIdAndOpenConfirmationModal(field.id)
                          }
                        >
                          <DeleteDealIcon src={closeIcon} alt="Delete payment item" />
                        </RemovePriceItemButton>
                      </ResultSubtitle>
                    );
                  })}
                </ResultWrapper>
              )}
              {(subtotalPaymentsAmount || transactionFeeAmount) && (
                <>
                  <ResultWrapper>
                    <ResultSubtitle>
                      {t('subtotal')} = {subtotalPaymentsAmount}{' '}
                      {paymentSettingsCurrencySign}
                    </ResultSubtitle>
                  </ResultWrapper>
                  <ResultWrapper>
                    <ResultSubtitle>
                      {t('transaction_fee')} = {transactionFeeAmount}{' '}
                      {paymentSettingsCurrencySign}
                    </ResultSubtitle>
                  </ResultWrapper>
                </>
              )}
              {(isSomePayments || Number(reservation?.already_paid_amount) > 0) && (
                <>
                  <ResultWrapper>
                    <ResultTitle>{t('amount_paid')}</ResultTitle>
                    <ResultSubtitle>
                      {t('amount_paid')} = {reservation?.already_paid_amount}{' '}
                      {paymentSettingsCurrencySign}
                    </ResultSubtitle>
                    <ResultSubtitle>
                      {t('amount_due')} = {reservation?.due_amount_to_pay}{' '}
                      {paymentSettingsCurrencySign}
                    </ResultSubtitle>
                  </ResultWrapper>
                </>
              )}
            </ResultColumn>
            <Divider />
            <PaymentColumn>
              <TotalTitle>
                {t('total_payment')} = {totalPaymentsAmount}
                {` `}
                {paymentSettingsCurrencyLabel}
              </TotalTitle>
              {!reservation && isLoadingReservation ? (
                <Main>
                  <Loader height={45} width={45} />
                </Main>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  key={isPaycometPaymentProvider ? failedToken : undefined}
                  id={isPaycometPaymentProvider ? 'paycometPaymentForm' : undefined}
                  // eslint-disable-next-line
                  action={isPaycometPaymentProvider ? 'javascript:void(0);' : undefined}
                >
                  <FormTitle>{t('payment_card_details')}</FormTitle>
                  {ProviderForm}
                  <SubmitButtonWrapper>
                    <SecureWrapper>
                      <img
                        src={creditCardIcon}
                        alt="Credit card icon"
                        width="27"
                        height="24"
                      />
                      <SecurePaymentText>
                        {t('safe_and_secure_payment')}
                      </SecurePaymentText>
                    </SecureWrapper>
                    <PayButton
                      type="submit"
                      label={t('pay_now')}
                      disabled={isSubmitButtonDisabled}
                    />
                  </SubmitButtonWrapper>
                </form>
              )}
              {arePaymentsOptional && (
                <SecondaryButton
                  secondary
                  label={t('pay_at_the_accommodation')}
                  onClick={skipPayment}
                />
              )}
            </PaymentColumn>
          </Wrapper>
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

export {PaymentsScreen};
