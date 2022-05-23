import React from 'react';
import {useTranslation} from 'react-i18next';
import {WebcamRefTypes} from '../Webcam/Webcam';
import {
  useErrorModal,
  useGoBackTo,
  useIsMounted,
  useModalControls,
} from '../../utils/hooks';
import {useReservationPayload} from '../../hooks/useReservationPayload';
import {
  ComputedReservationDetailsContextProps,
  useComputedReservationDetails,
} from '../../context/computedReservationDetails';
import {COUNTRY_CODES_WITHOUT_SIGNATURE} from '../../utils/constants';
import {getHousingCountryCode} from '../../utils/reservation';
import successIcon from '../../assets/success-icon.svg';
import cameraIcon from '../../assets/camera.svg';
import userIcon from '../../assets/user.svg';
import Header from '../Header';
import Webcam from '../Webcam';
import Button from '../Button';
import Modal from '../Modal';
import {DimensionsWrapper} from '../../styled/common';
import {ButtonIcon, ButtonWrapper, Content, Hint, Title} from './styled';

function getHeaderProps({
  hasGuestMembers,
  hasBiomatchForGuestLeader,
  isContractEnabled,
  isDubaiReservation,
  isThailandReservation,
  isGreeceReservation,
  reservation,
  isBiomatchForAllGuests,
  hasScanDocument,
}: ComputedReservationDetailsContextProps) {
  const countryCode = getHousingCountryCode(reservation);

  if (hasGuestMembers && isBiomatchForAllGuests) {
    if (isGreeceReservation) {
      if (hasScanDocument) {
        return {
          steps: 3,
          activeStep: 3,
        };
      }
    }

    if (COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) && !isThailandReservation) {
      if (hasScanDocument) {
        return {
          steps: 3,
          activeStep: 3,
        };
      }
    }

    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (isContractEnabled) {
        return {
          steps: 4,
          activeStep: 3,
        };
      }

      return {
        steps: 3,
        activeStep: 3,
      };
    }

    if (hasScanDocument) {
      return {
        steps: 4,
        activeStep: 3,
      };
    }

    return {
      steps: 3,
      activeStep: 3,
    };
  }

  if (hasGuestMembers) {
    if (isGreeceReservation) {
      if (hasScanDocument) {
        return {
          steps: 2,
          activeStep: 2,
        };
      }
    }

    if (COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) && !isThailandReservation) {
      if (hasScanDocument) {
        return {
          steps: 2,
          activeStep: 2,
        };
      }
    }

    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (isContractEnabled) {
        return {
          steps: 3,
          activeStep: 2,
        };
      }

      return {
        steps: 2,
        activeStep: 2,
      };
    }

    if (hasScanDocument) {
      return {
        steps: 3,
        activeStep: 2,
      };
    }

    return {
      steps: 2,
      activeStep: 2,
    };
  }

  if (isContractEnabled) {
    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (hasBiomatchForGuestLeader) {
        return {
          steps: 5,
          activeStep: 4,
        };
      }

      if (isContractEnabled && !hasBiomatchForGuestLeader) {
        return {
          steps: 4,
          activeStep: 3,
        };
      }

      return {
        steps: 4,
        activeStep: 3,
      };
    }
  }

  if (
    !isContractEnabled &&
    COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) &&
    !isThailandReservation
  ) {
    if (hasBiomatchForGuestLeader) {
      if (hasScanDocument) {
        return {
          steps: 4,
          activeStep: 3,
        };
      }
    }

    if (hasScanDocument) {
      return {
        steps: 3,
        activeStep: 2,
      };
    }
  }

  if (hasBiomatchForGuestLeader) {
    if (hasScanDocument) {
      return {
        steps: 5,
        activeStep: 3,
      };
    }

    return {
      steps: 4,
      activeStep: 3,
    };
  }

  if (hasScanDocument || hasBiomatchForGuestLeader) {
    return {
      steps: 4,
      activeStep: 4,
    };
  }

  return {
    steps: 3,
    activeStep: 3,
  };
}

function DocScanScreen() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const {hasGuestMembers, ...reservationDetails} = useComputedReservationDetails();
  const timeoutRef = React.useRef<any>();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);
  const {goBack} = useGoBackTo();
  const {
    isOpen: isLoading,
    openModal: startLoading,
    closeModal: stopLoading,
  } = useModalControls();
  const {
    submitAfterTimeout,
    isSuccessModalOpen,
    openSuccessModal,
    ReservationPayloadErrorModal,
  } = useReservationPayload({
    side: 'front_side_scan',
    timeoutRef,
    startLoading,
    stopLoading,
  });

  React.useEffect(() => {
    const ref = timeoutRef.current;
    return () => {
      clearTimeout(ref);
    };
  }, []);

  const enableScreenshotButton = () => {
    if (isMounted.current) {
      setIsCaptureButtonDisabled(false);
    }
  };

  const captureScreenshot = () => {
    try {
      const image = webcamRef?.current?.getScreenshot();
      openSuccessModal();
      submitAfterTimeout(image, true);
    } catch (err) {
      displayError(err);
    }
  };

  return (
    <>
      <ReservationPayloadErrorModal />
      <ErrorModal />
      <Modal
        open={isLoading}
        title={t('sending_your_data')}
        text={t('it_could_take_seconds')}
        iconSrc={userIcon}
        iconAlt="Person"
      />
      <Modal
        open={isSuccessModalOpen}
        title={`${t('success')}!`}
        iconSrc={successIcon}
        iconAlt="Success"
      />
      <Header
        hideBackButton={isLoading}
        title={t('scan_document')}
        onBack={goBack}
        {...getHeaderProps({hasGuestMembers, ...reservationDetails})}
      />
      <DimensionsWrapper>
        <Content>
          <Title>
            {t('single_page_that_contains_all_the_data')}
            <br />
            {t('where_the_photo_is')}
          </Title>
          <Hint>{t('keep_your_doc_inside_the_box')}</Hint>
          <Webcam ref={webcamRef} onUserMedia={enableScreenshotButton} />
          <ButtonWrapper>
            <Button
              data-testid="submit-btn"
              label={t('capture')}
              onClick={captureScreenshot}
              disabled={isCaptureButtonDisabled}
              icon={<ButtonIcon src={cameraIcon} alt="Camera" />}
            />
          </ButtonWrapper>
        </Content>
      </DimensionsWrapper>
    </>
  );
}

export {DocScanScreen, getHeaderProps};
