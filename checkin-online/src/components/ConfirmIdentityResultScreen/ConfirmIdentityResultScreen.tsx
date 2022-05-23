import React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useHistory} from 'react-router-dom';
import {useBiomatchUpdateGuest} from '../../hooks/useBiomatchUpdateGuest';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {breakIntoLines} from '../../utils/translations';
import {isMobileOrTablet} from '../../utils/mobile';
import {getIdentityVerificationHeaderProps} from '../ConfirmIdentityGuideScreen';
import scanningIcon from '../../assets/scanning_icn.svg';
import successSmallIcon from '../../assets/success-small.svg';
import errorSmallIcon from '../../assets/error-small.svg';
import Header from '../Header';
import Button from '../Button';
import {
  ScanResultContainer,
  Title,
  Subtitle,
  Image,
  Content,
  ButtonWrapper,
  DocumentResultArea,
  SelfieResultArea,
  ProgressCircle,
  ProgressArea,
  TitleErrorIcon,
  TitleSuccessIcon,
  ResultImage,
  TryButton,
} from './styled';

const matchingScaleCoefficient = 0.35;

function getFaceMatchPercentage(distance = 0.0) {
  const percentage = 100 - (1 - Number(distance) / (1 - matchingScaleCoefficient)) * 100;

  if (percentage < 0) {
    return 0;
  }

  if (percentage > 100) {
    return 100;
  }

  return percentage;
}

type LocationTypes = {
  facesComparingResult: any;
  documentPhoto: string;
  selfiePhoto: string;
  documentCheckId: string;
  selfieCheckId: string;
  failedOCRAttempts?: number;
  biomatch?: {
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
  isRetryBiomatch?: boolean;
  guestId?: string;
};

function ConfirmIdentityResultScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationTypes>();
  const reservationDetails = useComputedReservationDetails();
  const {updateBiomatchSelfieGuest} = useBiomatchUpdateGuest();
  const faceMatchPercentage = getFaceMatchPercentage(
    location.state?.facesComparingResult?.distance,
  );
  const isMatch = location.state?.facesComparingResult?.is_match;

  const areBiomatchRetriesEnabled = Boolean(
    reservationDetails.reservation?.are_biomatch_retries_enabled,
  );

  const isPhotoVerificationDisabled = Boolean(
    reservationDetails.reservation.is_biomatch_photo_verification_disabled,
  );

  const goBackToDocument = React.useCallback(() => {
    history.push('document', location.state);
  }, [history, location.state]);

  const goBackToSelfie = React.useCallback(() => {
    history.push('identity', location.state);
  }, [history, location.state]);

  const getBiometricResultPayload = React.useCallback(() => {
    const state = location.state;
    return {
      biomatch_passed: isMatch || state?.biomatch?.biomatch_passed,
      biomatch_doc: state?.documentPhoto || state?.biomatch?.biomatch_doc,
      biomatch_selfie: state?.selfiePhoto || state?.biomatch?.biomatch_selfie,
    };
  }, [isMatch, location.state]);

  React.useEffect(() => {
    const hasPersistedState =
      location.state?.facesComparingResult &&
      ((location.state.documentPhoto && location.state.selfiePhoto) ||
        location.state.biomatch);

    if (!hasPersistedState) {
      goBackToDocument();
    }
  }, [goBackToDocument, location.state]);

  const getPersistedRetryState = () => {
    return location.state;
  };

  const retryMatching = () => {
    history.push('document', getPersistedRetryState());
  };

  const getPersistedState = () => {
    const biomatchPayload = getBiometricResultPayload();
    return {
      ...location.state,
      documentCheckId: undefined,
      documentPhoto: undefined,
      selfiePhoto: undefined,
      document: {},
      biomatch: {
        ...biomatchPayload,
      },
    };
  };

  const goNext = () => {
    const state = getPersistedState();

    if (state.isRetryBiomatch) {
      updateBiomatchSelfieGuest();
      return history.push('/biomatch-results', state);
    }
    if (reservationDetails.isDocScanDisabled) {
      history.push('/form/add', state);
    } else {
      history.push('/form/type', state);
    }
  };

  const getTitle = () => {
    if (isMatch) {
      return (
        <>
          {t('identity_verification_success_title')}
          <TitleSuccessIcon src={successSmallIcon} alt="Green check mark" />
        </>
      );
    }
    return (
      <>
        {t('pending')}
        <TitleErrorIcon src={errorSmallIcon} alt="Exclamation mark" />
      </>
    );
  };

  const getSubtitle = () => {
    if (!areBiomatchRetriesEnabled && !isMatch) {
      return t('identetify_verification_error_can_proceed');
    }

    if (isMatch) {
      return t('only_identity_verification_success_text');
    }

    return t('retry_identity_verification_error_text');
  };

  return (
    <>
      <Header
        {...getIdentityVerificationHeaderProps(reservationDetails)}
        hideBackButton={false}
        activeStep={2}
        onBack={goBackToSelfie}
        title={t('verify_your_identity')}
      />
      <Content>
        <Image src={scanningIcon} alt="Two persons" />
        <Title>{getTitle()}</Title>
        <Subtitle>{getSubtitle()}</Subtitle>
        <ScanResultContainer>
          <DocumentResultArea>
            <ResultImage
              mirror={!isMobileOrTablet()}
              image={location.state?.documentPhoto}
            />
            {breakIntoLines(t('passport_photo'))}
          </DocumentResultArea>
          <ProgressArea>
            <ProgressCircle
              progress={isMatch ? faceMatchPercentage : 0}
              errorText={
                !isMatch && !isPhotoVerificationDisabled ? t('error').toUpperCase() : ''
              }
              warningText={!isMatch && isPhotoVerificationDisabled ? t('pending') : ''}
              label={t('matching')}
            />
          </ProgressArea>
          <SelfieResultArea>
            <ResultImage mirror image={location.state?.selfiePhoto} />
            {breakIntoLines(t('selfie_photo'))}
          </SelfieResultArea>
        </ScanResultContainer>
        <ButtonWrapper>
          <Button data-testid="submit-btn" label={t('next')} onClick={goNext} />
        </ButtonWrapper>
        <TryButton label={t('try_again')} onClick={retryMatching} link />
      </Content>
    </>
  );
}

export {ConfirmIdentityResultScreen};
