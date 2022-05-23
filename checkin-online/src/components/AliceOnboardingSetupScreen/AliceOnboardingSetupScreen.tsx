import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {getIdentityVerificationHeaderProps} from '../ConfirmIdentityGuideScreen';
import Header from '../Header';
import AliceOnboardingSetupForm from '../AliceOnboardingSetupForm';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';

function AliceOnboardingSetupScreen() {
  const {t} = useTranslation();
  const location = useLocation();
  const history = useHistory();
  const reservationDetails = useComputedReservationDetails();

  const goBack = () => {
    history.push('/', location.state);
  };

  return (
    <>
      <Header
        {...getIdentityVerificationHeaderProps(reservationDetails)}
        title={t('verify_your_identity')}
        onBack={goBack}
      />
      <AliceOnboardingSetupForm />
    </>
  );
}

export {AliceOnboardingSetupScreen};
