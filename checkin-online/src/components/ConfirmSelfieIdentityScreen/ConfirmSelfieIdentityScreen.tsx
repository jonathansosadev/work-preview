import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import api from '../../api';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {
  useAbortController,
  useErrorModal,
  useIsMounted,
  useModalControls,
} from '../../utils/hooks';
import {OCR_CHECKING_STATUSES} from '../../utils/constants';
import {WebcamRefTypes} from '../Webcam/Webcam';
import {getIdentityVerificationHeaderProps} from '../ConfirmIdentityGuideScreen';
import femaleIcon from '../../assets/female.svg';
import scanningIcon from '../../assets/scanning_icn.svg';
import scanningErrorIcon from '../../assets/scanning_doc_error.svg';
import Header from '../Header';
import Button from '../Button';
import Modal from '../Modal';
import {ModalSecondaryButton} from '../../styled/common';
import {
  ButtonWrapper,
  Content,
  SelfieArea,
  SelfieWebcam,
  Subtitle,
  Title,
} from './styled';

const VIDEO_CONSTRAINTS = {
  facingMode: 'user',
};

type LocationTypes = {
  documentCheckId: string;
  documentPhoto: string;
  isVerifying: boolean;
  failedOCRAttempts?: number;
};

function ConfirmSelfieIdentityScreen() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationTypes>();
  const {ErrorModal, displayError} = useErrorModal();
  const reservationDetails = useComputedReservationDetails();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);

  const {abortController, setupAbortController} = useAbortController();
  const {
    isOpen: isDetectingModalOpen,
    openModal: openDetectingModal,
    closeModal: closeDetectingModal,
  } = useModalControls();
  const {
    isOpen: isComparingModalOpen,
    openModal: openComparingModal,
    closeModal: closeComparingModal,
  } = useModalControls();

  const areBiomatchRetriesEnabled =
    reservationDetails.reservation.are_biomatch_retries_enabled;

  const goBack = React.useCallback(() => {
    history.push('/verification/document', location.state);
  }, [history, location.state]);

  React.useEffect(() => {
    const hasPersistedState =
      location.state?.documentCheckId && location.state?.documentPhoto;

    if (!hasPersistedState) {
      goBack();
    }
  }, [goBack, location.state]);

  const handleError = (error?: any, aborted?: boolean) => {
    closeDetectingModal();
    closeComparingModal();
    if (!aborted) {
      displayError(error);
    }
  };

  const getPersistedState = (result: string, selfiePhoto: string) => {
    return {
      ...location.state,
      selfiePhoto,
      facesComparingResult: result,
    };
  };

  const handleOCRMatchingCompletion = (data: any, image: string) => {
    let persistedState = getPersistedState(data, image);
    closeComparingModal();
    if (!data?.is_match) {
      const failedAttempts = persistedState.failedOCRAttempts || 0;
      persistedState = {
        ...persistedState,
        failedOCRAttempts: areBiomatchRetriesEnabled ? failedAttempts + 1 : 0,
      };
    }
    history.push('result', persistedState);
  };

  const abortCurrentRequest = () => {
    abortController.abort();
  };

  const enableScreenshotButton = () => {
    if (isMounted.current) {
      setIsCaptureButtonDisabled(false);
    }
  };

  const checkSelfieAndDocumentFacesComparing = async (id: string, image: string) => {
    const signal = setupAbortController();
    const {
      data,
      error,
      aborted,
    } = await api.ocr.checkSelfieAndDocumentFacesComparingStatus(id, {
      signal,
    });
    const isPhotoVerificationDisabled = Boolean(
      reservationDetails.reservation?.is_biomatch_photo_verification_disabled,
    );
    const isInProgress =
      !isPhotoVerificationDisabled && data?.status === OCR_CHECKING_STATUSES.processing;
    const isComplete =
      isPhotoVerificationDisabled || data?.status === OCR_CHECKING_STATUSES.complete;
    const isError = data?.status === OCR_CHECKING_STATUSES.error;

    if (!isMounted.current) {
      return;
    }

    if (error) {
      handleError(error, aborted);
      return;
    }

    if (isInProgress) {
      await checkSelfieAndDocumentFacesComparing(id, image);
      return;
    }

    if (isComplete) {
      handleOCRMatchingCompletion(data, image);
      return;
    }

    if (isError) {
      handleError();
    }
  };

  const startSelfieAndDocumentFacesComparing = async (
    selfieCheckId = '',
    image: string,
  ) => {
    openComparingModal();

    const signal = setupAbortController();
    const {data, error, aborted} = await api.ocr.compareSelfieAndDocumentFaces({
      signal,
      selfieCheckId,
      documentCheckId: location.state?.documentCheckId!,
      reservationId: reservationDetails?.reservation?.id,
    });

    if (!isMounted.current) {
      return;
    }

    if (data) {
      await checkSelfieAndDocumentFacesComparing(data?.id, image);
    }
    if (error) {
      handleError(error, aborted);
    }
  };

  const checkSelfieFaceDetection = async (id: string, image: string) => {
    const signal = setupAbortController();
    const {data, error, aborted} = await api.ocr.checkSelfieFaceDetection(id, {
      signal,
    });

    const isPhotoVerificationDisabled = Boolean(
      reservationDetails.reservation?.is_biomatch_photo_verification_disabled,
    );
    const isInProgress =
      !isPhotoVerificationDisabled && data?.status === OCR_CHECKING_STATUSES.processing;
    const isComplete =
      isPhotoVerificationDisabled ||
      (data?.status === OCR_CHECKING_STATUSES.complete && data?.is_face_detected);
    const isError =
      data.status === OCR_CHECKING_STATUSES.error || data?.is_face_detected === false;

    if (!isMounted.current) {
      return;
    }

    if (error) {
      handleError(error, aborted);
      return;
    }

    if (isInProgress) {
      await checkSelfieFaceDetection(id, image);
      return;
    }

    if (isComplete) {
      closeDetectingModal();
      await startSelfieAndDocumentFacesComparing(id, image);
      return;
    }

    if (isError) {
      handleError();
    }
  };

  const startSelfieFaceDetection = async (image = '', reservationId = '') => {
    openDetectingModal();

    const signal = setupAbortController();
    const {data, error, aborted} = await api.ocr.sendSelfieForFaceDetection(
      image,
      reservationId,
      {
        signal,
      },
    );

    if (!isMounted.current) {
      return;
    }

    if (error) {
      handleError(error, aborted);
    }
    if (data) {
      await checkSelfieFaceDetection(data.id, image);
    }
  };

  const captureScreenshot = async () => {
    try {
      const image = webcamRef?.current?.getScreenshot();
      const reservationId = reservationDetails?.reservation?.id;
      await startSelfieFaceDetection(image, reservationId);
    } catch (err) {
      displayError(err);
    }
  };

  return (
    <>
      <ErrorModal iconSrc={scanningErrorIcon} />
      <Modal
        open={isComparingModalOpen}
        title={t('comparing')}
        text={t('we_are_comparing_doc_and_selfie')}
        iconSrc={scanningIcon}
        iconAlt="Scanning female"
      >
        <ModalSecondaryButton onClick={abortCurrentRequest}>
          {t('cancel')}
        </ModalSecondaryButton>
      </Modal>
      <Modal
        open={isDetectingModalOpen}
        title={t('detecting')}
        text={t('we_are_detecting_your_face')}
        iconSrc={femaleIcon}
        iconAlt="Female"
      >
        <ModalSecondaryButton onClick={abortCurrentRequest}>
          {t('cancel')}
        </ModalSecondaryButton>
      </Modal>
      <Header
        {...getIdentityVerificationHeaderProps(reservationDetails)}
        hideBackButton={isDetectingModalOpen || isComparingModalOpen}
        title={t('verify_your_identity')}
        onBack={goBack}
      />
      <Content>
        <Title>{t('take_a_selfie')}</Title>
        <Subtitle>{t('take_a_selfie_tips')}</Subtitle>
        <SelfieWebcam
          hideScanArea
          mirrored
          ref={webcamRef}
          videoConstraints={VIDEO_CONSTRAINTS}
          onUserMedia={enableScreenshotButton}
        >
          <SelfieArea />
        </SelfieWebcam>
        <ButtonWrapper>
          <Button
            label={t('capture')}
            disabled={isCaptureButtonDisabled}
            onClick={captureScreenshot}
          />
        </ButtonWrapper>
      </Content>
    </>
  );
}

export {ConfirmSelfieIdentityScreen};
