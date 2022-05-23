import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import api from '../../api';
import {
  useAbortController,
  useErrorModal,
  useIsMounted,
  useModalControls,
} from '../../utils/hooks';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {OCR_CHECKING_STATUSES, TIMEOUT_BEFORE_REDIRECT_MS} from '../../utils/constants';
import {getIdentityVerificationHeaderProps} from '../ConfirmIdentityGuideScreen';
import {WebcamRefTypes} from '../Webcam/Webcam';
import successIcon from '../../assets/success-icon.svg';
import scanningIcon from '../../assets/scanning_doc_icn.svg';
import scanningErrorIcon from '../../assets/scanning_doc_error.svg';
import Header from '../Header';
import Button from '../Button';
import Modal from '../Modal';
import DocumentUploaderModal from '../DocumentUploaderModal';
import {ModalSecondaryButton, UploadButton, WebcamSubtext} from '../../styled/common';
import {ButtonWrapper, Content, DocumentWebCam, Subtitle, Title} from './styled';
import {useReservation} from '../../context/reservation';

type LocationTypes = {
  documentCheckId: string;
  documentPhoto: string;
  failedOCRAttempts?: number;
  isRetryBiomatch: boolean;
  front_side_scan?: string;
};

function ConfirmDocumentIdentityScreen() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationTypes>();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const timeoutRef = React.useRef<any>();
  const {isLoaded: isLoadedReservation} = useReservation();
  const reservationDetails = useComputedReservationDetails();
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);
  const {abortController, setupAbortController} = useAbortController();
  const {ErrorModal, displayError} = useErrorModal();
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModalControls();
  const {
    isOpen: isLoading,
    openModal: startLoading,
    closeModal: stopLoading,
  } = useModalControls();
  const {
    isOpen: isUploadDocumentModalOpen,
    closeModal: closeUploadDocumentModal,
    openModal: openUploadDocumentModal,
  } = useModalControls();

  const goBack = React.useCallback(() => {
    if (location.state?.isRetryBiomatch) {
      history.push('/biomatch-results', location.state);
      return;
    }
    history.push('/verification/guide', location.state);
  }, [history, location.state]);

  React.useLayoutEffect(() => {
    const reservationLoadedAndHasNotBiomatch =
      isLoadedReservation &&
      !reservationDetails.hasBiomatch &&
      !location.state?.isRetryBiomatch;

    if (reservationLoadedAndHasNotBiomatch) {
      goBack();
    }
  }, [goBack, isLoadedReservation, location.state, reservationDetails.hasBiomatch]);

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleError = (error?: Error, aborted?: boolean) => {
    stopLoading();
    if (!aborted) {
      displayError(error);
    }
  };

  const abortCurrentRequest = () => {
    abortController.abort();
  };

  const enableScreenshotButton = () => {
    if (isMounted.current) {
      setIsCaptureButtonDisabled(false);
    }
  };

  const getPersistedState = (documentCheckId: string, image: string) => {
    const newState = {
      ...location.state,
      documentCheckId,
      documentPhoto: image,
    };
    if (reservationDetails.isDubaiReservation) newState.front_side_scan = image;

    return newState;
  };

  const redirectAfterTimeout = (documentCheckId: string, image: string) => {
    timeoutRef.current = setTimeout(() => {
      closeSuccessModal();
      history.push('identity', getPersistedState(documentCheckId, image));
    }, TIMEOUT_BEFORE_REDIRECT_MS);
  };

  const checkDocumentFaceDetection = async (id: string, image: string) => {
    const signal = setupAbortController();
    const {data, error, aborted} = await api.ocr.checkDocumentFaceDetection(id, {
      signal,
    });
    const isPhotoVerificationDisabled = Boolean(
      reservationDetails.reservation?.is_biomatch_photo_verification_disabled,
    );

    const isInProgress =
      !isPhotoVerificationDisabled && data?.status === OCR_CHECKING_STATUSES.processing;
    const isSuccess =
      isPhotoVerificationDisabled ||
      (data?.status === OCR_CHECKING_STATUSES.complete && data?.is_face_detected);
    const isError =
      data?.status === OCR_CHECKING_STATUSES.error || !data?.is_face_detected;

    if (!isMounted.current) {
      return;
    }

    if (error) {
      handleError(error, aborted);
      return;
    }

    if (isInProgress) {
      await checkDocumentFaceDetection(id, image);
      return;
    }

    if (isSuccess) {
      openSuccessModal();
      redirectAfterTimeout(id, image);
      return;
    }

    if (isError) {
      handleError();
    }
  };

  const startDocumentFaceDetection = async (image = '', reservationId = '') => {
    startLoading();

    const signal = setupAbortController();
    const {data, error, aborted} = await api.ocr.sendDocumentForFaceDetection(
      image,
      reservationId,
      {
        signal,
      },
    );

    if (!isMounted.current) {
      return;
    }

    if (data) {
      await checkDocumentFaceDetection(data.id, image);
    }
    if (error) {
      handleError(error, aborted);
    }
  };

  const handleImage = async (image?: string) => {
    try {
      const reservationId = reservationDetails?.reservation?.id;
      await startDocumentFaceDetection(image, reservationId);
    } catch (err) {
      displayError(err);
    }
  };

  const handleCaptureScreenshot = () => {
    const image = webcamRef?.current?.getScreenshot();
    handleImage(image);
  };

  const handleManualUpload = (image: string) => {
    handleImage(image);
  };

  return (
    <>
      <ErrorModal iconSrc={scanningErrorIcon} />
      <Modal
        open={isLoading}
        title={t('scanning')}
        text={t('it_could_take_seconds')}
        iconSrc={scanningIcon}
        iconAlt="Scanner"
      >
        <ModalSecondaryButton onClick={abortCurrentRequest}>
          {t('cancel')}
        </ModalSecondaryButton>
      </Modal>
      <Modal
        open={isSuccessModalOpen}
        title={`${t('success')}!`}
        iconSrc={successIcon}
        iconAlt="Success"
      />
      <Header
        {...getIdentityVerificationHeaderProps(reservationDetails)}
        hideBackButton={isLoading || isSuccessModalOpen}
        title={t('verify_your_identity')}
        onBack={goBack}
      />

      <Content>
        <Title>{t('capture_id_or_passport')}</Title>
        <Subtitle>{t('please_capture_side_with_photo')}</Subtitle>
        <WebcamSubtext>{t('keep_your_doc_inside_the_box')}</WebcamSubtext>
        <DocumentWebCam
          ref={webcamRef}
          onUserMedia={enableScreenshotButton}
          minScreenshotW={800}
          minScreenshotH={600}
        />
        <ButtonWrapper>
          <Button
            label={t('capture')}
            onClick={handleCaptureScreenshot}
            disabled={isCaptureButtonDisabled}
          />
        </ButtonWrapper>
        <UploadButton
          label={t('upload_manually')}
          onClick={openUploadDocumentModal}
          secondary
        />
      </Content>
      <DocumentUploaderModal
        onlyJpg
        title={t('single_page_that_contains_all_the_data')}
        description={t('where_the_photo_is')}
        open={isUploadDocumentModalOpen}
        closeModal={closeUploadDocumentModal}
        onSaveFile={handleManualUpload}
      />
    </>
  );
}

export {ConfirmDocumentIdentityScreen};
