import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useLocation} from 'react-router-dom';
import {AliceTokens} from '../AliceOnboardingForm/AliceOnboardingForm';
import Header from '../Header';
import AliceOnboardingForm from '../AliceOnboardingForm';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {getIdentityVerificationHeaderProps} from '../ConfirmIdentityGuideScreen';

type LocationState = {
  aliceTokens: AliceTokens;
  [key: string]: any;
};

function AliceOnboardingScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const reservationDetails = useComputedReservationDetails();
  const [tokens, setTokens] = React.useState<AliceTokens | undefined>(
    location.state?.aliceTokens,
  );

  const handleGoBack = React.useCallback(() => {
    const state = {
      ...location.state,
      aliceTokens: tokens,
    };

    history.push('/onboarding/setup', state);
  }, [history, location.state, tokens]);

  return (
    <>
      <Header
        {...getIdentityVerificationHeaderProps(reservationDetails)}
        hideBackButton={false}
        title={t('verify_your_identity')}
        onBack={handleGoBack}
      />
      <AliceOnboardingForm onGoBack={handleGoBack} onTokensChange={setTokens} />
    </>
  );
}

export {AliceOnboardingScreen};
