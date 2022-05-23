import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getHeaderProps} from '../ConfirmBookingDetailsScreen';
import {useReservation} from '../../context/reservation';
import {
  ComputedReservationDetailsContextProps,
  useComputedReservationDetails,
} from '../../context/computedReservationDetails';
import doorHandleIcon from '../../assets/unnamed.png';
import Header from '../Header';
import {Content, Image, SkipButton, Step, SubmitButton, Title} from './styled';

function getIdentityVerificationHeaderProps(
  props: ComputedReservationDetailsContextProps,
) {
  const {hasGuestMembers, isBiomatchForAllGuests} = props;
  const headerProps = getHeaderProps(props);

  if (hasGuestMembers && isBiomatchForAllGuests) {
    return {
      ...headerProps,
      hideBackButton: true,
      activeStep: 1,
    };
  }

  return {
    ...headerProps,
    hideBackButton: false,
    activeStep: 2,
  };
}

type LocationTypes = {
  isVerifying: boolean;
  failedOCRAttempts?: number;
  fromHousingFlow?: boolean;
};

function ConfirmIdentityGuideScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const {isLoaded: isLoadedReservation} = useReservation();
  const reservationDetails = useComputedReservationDetails();
  const isVerifyDocAndSelfieOptional =
    reservationDetails?.isVerifyDocumentAndSelfieOptional;
  const location = useLocation<LocationTypes>();

  const goBack = React.useCallback(() => {
    history.push('/', location.state);
  }, [history, location.state]);

  React.useLayoutEffect(() => {
    const reservationLoadedAndHasNotBiomatch =
      isLoadedReservation && !reservationDetails?.hasBiomatch;
    if (reservationLoadedAndHasNotBiomatch) {
      goBack();
    }
  }, [goBack, isLoadedReservation, reservationDetails]);

  const getPersistedState = () => {
    return {
      ...location.state,
      isVerifying: true,
    };
  };

  const goNext = () => {
    if (reservationDetails.isAliceOnboardingEnabled) {
      history.push('/onboarding/setup', getPersistedState());
    } else {
      history.push('/verification/document', getPersistedState());
    }
  };

  const goSkip = () => {
    history.push('/form/add', getPersistedState());
  };

  const {
    hideBackButton,
    ...restIdentityVerificationHeaderProps
  } = getIdentityVerificationHeaderProps(reservationDetails);

  const getSteps = () => {
    if (reservationDetails.isAliceOnboardingEnabled) {
      return [
        t('select_nationality_and_document_type'),
        t('take_photo_your_document'),
        t('take_a_selfie'),
      ];
    }

    return [t('take_photo_your_document'), t('take_a_selfie')];
  };

  return (
    <>
      <Header
        hideBackButton={location.state?.fromHousingFlow || hideBackButton}
        {...restIdentityVerificationHeaderProps}
        onBack={goBack}
        title={t('verify_your_identity')}
      />
      <Content>
        <Image src={doorHandleIcon} alt="Doorhandle" />
        <Title>{t('identity_verification_title')}</Title>
        {getSteps().map((step, idx) => (
          <Step key={idx}>
            {idx + 1} - {step}
          </Step>
        ))}
        <SubmitButton label={t('ok')} onClick={goNext} />
        {isVerifyDocAndSelfieOptional && (
          <SkipButton secondary label={t('skip_for_now')} onClick={goSkip} />
        )}
      </Content>
    </>
  );
}

export {ConfirmIdentityGuideScreen, getIdentityVerificationHeaderProps};
