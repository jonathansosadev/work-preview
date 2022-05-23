import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {ErrorBoundary, withProfiler} from '@sentry/react';
import {loadStripe} from '@stripe/stripe-js/pure';
import {Elements} from '@stripe/react-stripe-js';
import {getEnvVariable} from './utils/common';
import {useAuth} from './context/auth';
import {useReservation} from './context/reservation';
import {useComputedReservationDetails} from './context/computedReservationDetails';
import {getURLSearchParam} from './utils/common';
import {usePaymentSettings} from './hooks/usePaymentSettings';
import {SHORT_SHARE_LINK_SEARCH_PARAM_NAME} from './context/storedURLParams';
import errorIcon from './assets/error.svg';
import Routes, {PATHS} from './Routes';
import Modal from './components/Modal';
import SplashScreen from './components/SplashScreen';
import Analytics from './components/Analytics';
import WebcamWarningModal from './components/WebcamWarningModal';
import ErrorBoundaryFallback from './components/ErrorBoundaryFallback';
import {useRedirectAfterIdle} from './utils/hooks';

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';
const HOUSING_SEARCH_PARAM = 'housing-id';
const USER_SEARCH_PARAM = 'user';

function App() {
  const history = useHistory();
  const redirect = useRedirectAfterIdle();
  const {pathname} = useLocation<any>();
  const {t, i18n} = useTranslation();
  const {isLoading: isLoadingToken, isTokenValid} = useAuth();
  const {
    isLoading: isLoadingReservation,
    isError: isReservationError,
    data: reservation,
  } = useReservation();
  const {
    hasDeposits,
    hasTaxes,
    hasGuestMembers,
    areDepositsRequired,
  } = useComputedReservationDetails();
  const {paymentSettings, isStripePaymentProvider} = usePaymentSettings();
  const [isLoadingError, setIsLoadingError] = React.useState(false);
  const [isUniversalLink, setIsUniversalLink] = React.useState('');

  const isSplashScreenVisible =
    Boolean(!isUniversalLink) &&
    (isLoadingToken || isLoadingReservation) &&
    !reservation.id;

  const isTokenLoadingError = !isLoadingToken && !isTokenValid && !isLoadingError;
  const isReservationLoadingError = isReservationError && !isLoadingError;

  React.useEffect(
    function handleIsUniversalLink() {
      const housingId = getURLSearchParam(HOUSING_SEARCH_PARAM);
      const l = getURLSearchParam(SHORT_SHARE_LINK_SEARCH_PARAM_NAME);
      const user = getURLSearchParam(USER_SEARCH_PARAM);

      if (housingId) {
        setIsUniversalLink(housingId);
        sessionStorage.setItem(HOUSING_SEARCH_PARAM, housingId);
        history.replace(PATHS.searchReservation, {housingId, l, user});
      }
    },
    [history],
  );

  React.useEffect(() => {
    const sessionHousingId = sessionStorage.getItem(HOUSING_SEARCH_PARAM);
    if (sessionHousingId) {
      redirect(sessionHousingId);
    }
  }, [redirect]);

  React.useEffect(() => {
    if (isUniversalLink) return;

    if (isTokenLoadingError || isReservationLoadingError) {
      setIsLoadingError(true);
    }
  }, [isTokenLoadingError, isReservationLoadingError, isUniversalLink]);

  React.useLayoutEffect(
    function handleFirstPaymentsLoad() {
      if (sessionStorage.getItem('firstLoadPayments')) return;

      sessionStorage.setItem('firstLoadPayments', 'true');

      if (pathname !== '/payments/') {
        sessionStorage.setItem('firstLoadPayments', 'false');
      }
    },
    [pathname],
  );

  React.useEffect(
    function redirectToTaxes() {
      const isTaxesURL = pathname.includes('taxes');
      const isBiomatchURL = pathname.includes('verification');
      const isUpsellingURL = pathname.includes('deals-list') || pathname.includes('deal');
      const isBiomatchResults = pathname.includes('biomatch-results');
      const isPaymentsURL = pathname.includes(PATHS.payments);

      const hasReservation = Boolean(reservation?.id);
      const wasTaxesPaymentSkipped =
        !isPaymentsURL &&
        !isBiomatchURL &&
        !isBiomatchResults &&
        !isUpsellingURL &&
        !isTaxesURL &&
        hasGuestMembers &&
        hasReservation &&
        hasTaxes;

      if (wasTaxesPaymentSkipped) {
        history.push(PATHS.taxesSetup, {wasPaymentSkipped: true});
      }
    },
    [hasGuestMembers, hasTaxes, history, pathname, reservation],
  );

  React.useEffect(
    function redirectToDeposits() {
      const isTaxesURL = pathname.includes('taxes');
      const isDepositsURL = pathname.includes('deposits');
      const isBiomatchResultsURL = pathname.includes('biomatch-results');
      const isBiomatchURL = pathname.includes('verification');
      const isUpsellingURL = pathname.includes('deals-list') || pathname.includes('deal');
      const isPaymentsURL = pathname.includes(PATHS.payments);
      const hasReservation = Boolean(reservation?.id);
      const wasDepositsPaymentSkipped =
        !isPaymentsURL &&
        !isTaxesURL &&
        !isBiomatchURL &&
        !isDepositsURL &&
        !isBiomatchResultsURL &&
        !isBiomatchResultsURL &&
        !isUpsellingURL &&
        hasReservation &&
        hasGuestMembers &&
        !hasTaxes &&
        areDepositsRequired &&
        hasDeposits;

      if (wasDepositsPaymentSkipped) {
        history.push('/deposits/payment', {wasPaymentSkipped: true});
      }
    },
    [
      hasGuestMembers,
      hasDeposits,
      hasTaxes,
      history,
      pathname,
      reservation,
      areDepositsRequired,
    ],
  );

  const stripeAccount = paymentSettings?.external_account_id;
  const stripePromise = React.useMemo(() => {
    const needLoadStripe = isStripePaymentProvider && stripeAccount;
    const stripeKey = getEnvVariable('REACT_APP_STRIPE_API_KEY');

    if (!needLoadStripe) {
      return null;
    }

    return loadStripe(stripeKey, {stripeAccount});
  }, [isStripePaymentProvider, stripeAccount]);

  return (
    <ErrorBoundary
      fallback={<ErrorBoundaryFallback />}
      showDialog={IS_PRODUCTION_BUILD}
      dialogOptions={{
        labelComments: t('describe_what_happened'),
      }}
    >
      <Elements
        stripe={stripePromise}
        key={stripeAccount}
        options={{locale: i18n.language as any}}
      >
        <SplashScreen visible={IS_PRODUCTION_BUILD && isSplashScreenVisible}>
          {isLoadingError && (
            <Modal
              open
              title={t('oops')}
              text={
                isReservationLoadingError
                  ? t('reservation_loading_error')
                  : t('link_expired_loading_error')
              }
              iconSrc={errorIcon}
              iconAlt="Error sign"
            />
          )}
          <WebcamWarningModal />
          <Analytics />
          <Routes />
        </SplashScreen>
      </Elements>
    </ErrorBoundary>
  );
}

export default withProfiler(App);
