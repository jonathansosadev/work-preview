import React from 'react';
import {Redirect, Route, Switch, useLocation} from 'react-router-dom';
import {withSentryRouting} from '@sentry/react';
import {useComputedReservationDetails} from './context/computedReservationDetails';
import ConfirmBookingDetailsScreen from './components/ConfirmBookingDetailsScreen';
import AddPersonalDataScreen from './components/AddPersonalDataScreen';
import FrontSideIdCaptureScreen from './components/FrontSideIdCaptureScreen';
import BackSideIdCaptureScreen from './components/BackSideIdCaptureScreen';
import PassportScanScreen from './components/PassportScanScreen';
import SignScreen from './components/SignScreen';
import FinishScreen from './components/FinishScreen';
import ShareScreen from './components/ShareScreen';
import ConfirmIdentityGuideScreen from './components/ConfirmIdentityGuideScreen';
import ConfirmDocumentIdentityScreen from './components/ConfirmDocumentIdentityScreen';
import ConfirmSelfieIdentityScreen from './components/ConfirmSelfieIdentityScreen';
import ConfirmIdentityResultScreen from './components/ConfirmIdentityResultScreen';
import AddPersonalDataTypeScreen from './components/AddPersonalDataTypeScreen';
import AddPersonalDataScanScreen from './components/AddPersonalDataScanScreen';
import DocScanScreen from './components/DocScanScreen';
import AliceOnboardingScreen from './components/AliceOnboardingScreen';
import AliceOnboardingSetupScreen from './components/AliceOnboardingSetupScreen';
import TaxesSetupScreen from './components/TaxesSetupScreen';
import PaymentsScreen from './components/PaymentsScreen';
import PaymentsFinishScreen from './components/PaymentsFinishScreen';
import SecurityDepositPaymentScreen from './components/SecurityDepositPaymentScreen';
import SecurityDepositsFinishScreen from './components/SecurityDepositsFinishScreen';
import SearchReservationScreen from './components/SearchReservationScreen';
import NewReservation from './components/NewReservation';
import OffersAndExperiencesScreen from './components/OffersAndExperiencesScreen';
import CivitatisiFrame from './components/CivitatisiFrame';
import OfferDetailsScreen from './components/OfferDetailsScreen';
import GuestsIdentityInformation from './components/GuestsIdentityInformation';

const SentryRoute = withSentryRouting(Route);

enum PATHS {
  payments = '/payments',
  searchReservation = '/search-reservation',
  newReservation = '/new-reservation',
  offersAndExperiences = '/deals-list/:filter?',
  offerDetails = '/deal/:id',
  taxesSetup = '/taxes/setup',
}

function Routes() {
  const location = useLocation();
  const {
    isDocScanDisabled,
    areGuestFieldsDisabled,
    isBiomatchForAllGuests,
    isLeaderGuest,
    isVerifyDocumentAndSelfie,
    isAliceOnboardingEnabled,
  } = useComputedReservationDetails();

  if (areGuestFieldsDisabled) {
    return (
      <Switch>
        <SentryRoute exact path="/finish">
          <FinishScreen />
        </SentryRoute>
        <SentryRoute exact path="/share">
          <ShareScreen />
        </SentryRoute>
        <SentryRoute exact path={PATHS.taxesSetup}>
          <TaxesSetupScreen />
        </SentryRoute>
        <SentryRoute exact path={PATHS.payments}>
          <PaymentsScreen />
        </SentryRoute>
        <SentryRoute exact path="/taxes/finish">
          <PaymentsFinishScreen />
        </SentryRoute>
        <SentryRoute exact path="/deposits/payment">
          <SecurityDepositPaymentScreen />
        </SentryRoute>
        <SentryRoute exact path="/deposits/finish">
          <SecurityDepositsFinishScreen />
        </SentryRoute>
        <SentryRoute exact path={PATHS.searchReservation}>
          <SearchReservationScreen />
        </SentryRoute>
        <Route path={PATHS.newReservation}>
          <NewReservation />
        </Route>
        <Redirect from="/" to={{pathname: PATHS.taxesSetup, state: location.state}} />
        <Redirect to={{pathname: '/', state: location.state}} />
      </Switch>
    );
  }

  const getRedirectUrl = () => {
    if (isBiomatchForAllGuests && isVerifyDocumentAndSelfie) {
      if (isAliceOnboardingEnabled) {
        return '/onboarding/setup';
      }
      return '/verification/guide';
    }

    if (isDocScanDisabled) {
      return '/form/add';
    }

    return null;
  };

  const redirectMainUrl = getRedirectUrl();
  return (
    <Switch>
      {isLeaderGuest && (
        <SentryRoute exact path="/">
          <ConfirmBookingDetailsScreen />
        </SentryRoute>
      )}
      {isLeaderGuest && (
        <SentryRoute exact path="/form/type">
          {isDocScanDisabled ? (
            <Redirect to={{pathname: '/form/add', state: location.state}} />
          ) : (
            <AddPersonalDataTypeScreen />
          )}
        </SentryRoute>
      )}

      {!isLeaderGuest && (
        <SentryRoute exact path="/">
          {redirectMainUrl ? (
            <Redirect to={{pathname: redirectMainUrl, state: location.state}} />
          ) : (
            <AddPersonalDataTypeScreen />
          )}
        </SentryRoute>
      )}
      <SentryRoute exact path="/biomatch-results">
        <GuestsIdentityInformation />
      </SentryRoute>
      <SentryRoute exact path="/form/add">
        <AddPersonalDataScreen />
      </SentryRoute>
      <SentryRoute exact path="/form/scan">
        <AddPersonalDataScanScreen />
      </SentryRoute>
      <SentryRoute exact path="/scan/front-side">
        <FrontSideIdCaptureScreen />
      </SentryRoute>
      <SentryRoute exact path="/scan/back-side">
        <BackSideIdCaptureScreen />
      </SentryRoute>
      <SentryRoute exact path="/scan/passport">
        <PassportScanScreen />
      </SentryRoute>
      <SentryRoute exact path="/scan/doc">
        <DocScanScreen />
      </SentryRoute>
      <SentryRoute exact path="/sign">
        <SignScreen />
      </SentryRoute>
      <SentryRoute exact path="/finish">
        <FinishScreen />
      </SentryRoute>
      <SentryRoute exact path="/share">
        <ShareScreen />
      </SentryRoute>
      <SentryRoute exact path="/verification/guide">
        <ConfirmIdentityGuideScreen />
      </SentryRoute>
      <SentryRoute exact path="/verification/document">
        <ConfirmDocumentIdentityScreen />
      </SentryRoute>
      <SentryRoute exact path="/verification/identity">
        <ConfirmSelfieIdentityScreen />
      </SentryRoute>
      <SentryRoute exact path="/verification/result">
        <ConfirmIdentityResultScreen />
      </SentryRoute>
      <SentryRoute exact path="/onboarding/setup">
        <AliceOnboardingSetupScreen />
      </SentryRoute>
      <SentryRoute exact path="/onboarding/form">
        <AliceOnboardingScreen />
      </SentryRoute>
      <SentryRoute exact path={PATHS.taxesSetup}>
        <TaxesSetupScreen />
      </SentryRoute>
      <SentryRoute exact path={PATHS.payments}>
        <PaymentsScreen />
      </SentryRoute>
      <SentryRoute exact path="/taxes/finish">
        <PaymentsFinishScreen />
      </SentryRoute>
      <SentryRoute exact path="/deposits/payment">
        <SecurityDepositPaymentScreen />
      </SentryRoute>
      <SentryRoute exact path="/deposits/finish">
        <SecurityDepositsFinishScreen />
      </SentryRoute>
      <SentryRoute exact path={PATHS.searchReservation}>
        <SearchReservationScreen />
      </SentryRoute>
      <Route path={PATHS.newReservation}>
        <NewReservation />
      </Route>
      <SentryRoute path={PATHS.offersAndExperiences}>
        <OffersAndExperiencesScreen />
      </SentryRoute>
      <SentryRoute path="/civitatis">
        <CivitatisiFrame />
      </SentryRoute>
      <Route path={PATHS.offerDetails}>
        <OfferDetailsScreen />
      </Route>
      <Redirect from="/" to={{pathname: '/form/add', state: location.state}} />
      <Redirect to={{pathname: '/', state: location.state}} />
    </Switch>
  );
}

export {PATHS};
export default Routes;
