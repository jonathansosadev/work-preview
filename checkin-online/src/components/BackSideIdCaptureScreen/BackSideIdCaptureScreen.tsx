import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {WebcamRefTypes} from '../Webcam/Webcam';
import {AliceReport} from '../AliceOnboardingForm/AliceOnboardingForm';
import {getDocTypesWithoutMrz} from '../../utils/docTypes';
import {useErrorModal, useIsMounted, useModalControls} from '../../utils/hooks';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {useReservationPayload} from '../../hooks/useReservationPayload';
import {useMRZDetection} from '../../hooks/useMRZDetection';
import {getHeaderProps} from '../DocScanScreen';
import successIcon from '../../assets/success-icon.svg';
import cameraIcon from '../../assets/camera.svg';
import userIcon from '../../assets/user.svg';
import Header from '../Header';
import Button from '../Button';
import Modal from '../Modal';
import DocumentUploaderModal from '../DocumentUploaderModal';
import {DimensionsWrapper, UploadButton} from '../../styled/common';
import {
  ButtonIcon,
  ButtonWrapper,
  Content,
  DocumentWebCam,
  Hint,
  Subtitle,
  Title,
} from './styled';

type LocationTypes = {
  front_side_scan: string;
  formData: any;
  number_of_guests?: number;
  children?: number;
  ocrWasUsed?: boolean;
  aliceReport?: AliceReport;
  isRetryBiomatch?: boolean;
  biomatch?: {
    reservation_id: string;
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
};

function BackSideIdCaptureScreen() {
  const {t} = useTranslation();
  const location = useLocation<LocationTypes>();
  const history = useHistory();
  const isMounted = useIsMounted();
  const timeoutRef = React.useRef<any>();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const {
    hasGuestMembers,
    isVerifyOnlyDocumentOptional,
    isVerifyOnlyDocument,
    hasScanDocument,
    ...reservationDetails
  } = useComputedReservationDetails();
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);
  const {ErrorModal, displayError} = useErrorModal();
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

  const {startMRZDetection, MrzErrorModal, displayMrzError} = useMRZDetection({
    startLoading,
    stopLoading,
  });
  const {
    submitAfterTimeout,
    isSuccessModalOpen,
    openSuccessModal,
    ReservationPayloadErrorModal,
  } = useReservationPayload({
    side: 'back_side_scan',
    timeoutRef,
    startLoading,
    stopLoading,
  });

  const isRetryBiomatch = location.state?.isRetryBiomatch;
  const nationality = location?.state?.formData?.nationality?.value;
  const docType = location?.state?.formData?.docType?.value;
  const docTypesWithoutMrz = getDocTypesWithoutMrz(
    reservationDetails.reservation,
    nationality,
  );
  const isDocumentWithoutMrz = docTypesWithoutMrz.includes(docType);

  const goBack = React.useCallback(() => {
    history.push('front-side', location.state);
  }, [history, location.state]);

  React.useEffect(() => {
    const hasRequiredPreviousData =
      location.state?.front_side_scan && location.state?.formData;

    if (!hasRequiredPreviousData && !isRetryBiomatch) {
      goBack();
    }
  }, [goBack, isRetryBiomatch, location.state]);

  React.useEffect(() => {
    const timeout = timeoutRef.current;
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const enableScreenshotButton = () => {
    if (isMounted.current) {
      setIsCaptureButtonDisabled(false);
    }
  };

  const handleErrorMrzDetection = (image?: string) => {
    if (isDocumentWithoutMrz) {
      return submitAfterTimeout(image, true);
    }
    if (isVerifyOnlyDocumentOptional && !isRetryBiomatch) {
      return submitAfterTimeout(image, false);
    }
    displayMrzError();
  };

  const handleImage = async (image?: string) => {
    const reservationId = reservationDetails.reservation.id;
    if (!isDocumentWithoutMrz && (hasScanDocument || isRetryBiomatch)) {
      await startMRZDetection({
        image,
        reservationId,
        onSuccess: ({image}) => submitAfterTimeout(image, true),
        onError: () => handleErrorMrzDetection(image),
      });
      return;
    }

    try {
      const image = webcamRef?.current?.getScreenshot();
      openSuccessModal();
      submitAfterTimeout(image, true);
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

  const getTitle = () => {
    if (isDocumentWithoutMrz) return t('where_the_photo_is');
    return (
      <Trans i18nKey="where_the_mrz_code_is">
        Where the <b style={{color: 'black'}}>MRZ code</b> is
      </Trans>
    );
  };

  return (
    <>
      <Modal
        open={isLoading}
        title={t('sending_your_data')}
        text={t('it_could_take_seconds')}
        iconSrc={userIcon}
        iconAlt="Person"
      />
      <ReservationPayloadErrorModal />
      <ErrorModal />
      <MrzErrorModal docType={docType} nationality={nationality} />
      <Modal
        open={isSuccessModalOpen}
        title={`${t('success')}!`}
        iconSrc={successIcon}
        iconAlt="Success"
      />
      <Header
        hideBackButton={isLoading}
        title={t('capture_id')}
        onBack={goBack}
        {...getHeaderProps({
          hasGuestMembers,
          isVerifyOnlyDocumentOptional,
          isVerifyOnlyDocument,
          hasScanDocument,
          ...reservationDetails,
        })}
      />
      <DimensionsWrapper>
        <Content>
          <Title>{t('backside')}</Title>
          <Subtitle>{getTitle()}</Subtitle>
          <Hint>{t('keep_your_doc_inside_the_box')}</Hint>
          <DocumentWebCam
            ref={webcamRef}
            onUserMedia={enableScreenshotButton}
            minScreenshotW={800}
            minScreenshotH={600}
          />
          <UploadButton
            label={t('upload_manually')}
            onClick={openUploadDocumentModal}
            secondary
          />
          <ButtonWrapper>
            <Button
              data-testid="submit-btn"
              label={t('capture')}
              onClick={handleCaptureScreenshot}
              disabled={isCaptureButtonDisabled}
              icon={<ButtonIcon src={cameraIcon} alt="Camera" />}
            />
          </ButtonWrapper>
        </Content>
      </DimensionsWrapper>
      <DocumentUploaderModal
        onlyJpg
        title={t('backside')}
        description={getTitle()}
        open={isUploadDocumentModalOpen}
        closeModal={closeUploadDocumentModal}
        onSaveFile={handleManualUpload}
      />
    </>
  );
}

export {BackSideIdCaptureScreen};
