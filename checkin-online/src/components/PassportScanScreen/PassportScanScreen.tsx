import React from 'react';
import {useLocation} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import {WebcamRefTypes} from '../Webcam/Webcam';
import {
  useErrorModal,
  useGoBackTo,
  useIsMounted,
  useModalControls,
} from '../../utils/hooks';
import {getDocTypesWithoutMrz} from '../../utils/docTypes';
import {LocationTypes, useReservationPayload} from '../../hooks/useReservationPayload';
import {useMRZDetection} from '../../hooks/useMRZDetection';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
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
  Hint,
  Passport,
  SkipButton,
  Title,
} from './styled';

function PassportScanScreen() {
  const {t} = useTranslation();
  const location = useLocation<LocationTypes>();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const timeoutRef = React.useRef<any>();
  const {
    hasGuestMembers,
    isVerifyOnlyDocument,
    isVerifyOnlyDocumentOptional,
    hasScanDocument,
    ...reservationDetails
  } = useComputedReservationDetails();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);
  const {goBack} = useGoBackTo();
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
    goSkip,
    ReservationPayloadErrorModal,
  } = useReservationPayload({
    startLoading,
    stopLoading,
    side: 'front_side_scan',
    timeoutRef,
  });

  const isRetryBiomatch = location.state?.isRetryBiomatch;
  const canSkip = isVerifyOnlyDocumentOptional && !isRetryBiomatch;
  const nationality = location?.state?.formData?.nationality?.value;
  const docType = location?.state?.formData?.docType?.value;
  const docTypesWithoutMrz = getDocTypesWithoutMrz(
    reservationDetails.reservation,
    nationality,
  );
  const isDocumentWithoutMrz = docTypesWithoutMrz.includes(docType);

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
    if (isDocumentWithoutMrz) return t('single_page_that_contains_all_the_data');
    return (
      <Trans i18nKey="single_page_that_contains_mrz">
        Single page that contains the <b style={{color: 'black'}}>MRZ code</b>
      </Trans>
    );
  };

  return (
    <>
      <ReservationPayloadErrorModal />
      <ErrorModal />
      <MrzErrorModal docType={docType} nationality={nationality} />
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
        {...getHeaderProps({
          hasGuestMembers,
          isVerifyOnlyDocument,
          isVerifyOnlyDocumentOptional,
          hasScanDocument,
          ...reservationDetails,
        })}
      />
      <DimensionsWrapper>
        <Content>
          <Title>{getTitle()}</Title>
          <Hint>{t('keep_your_doc_inside_the_box')}</Hint>
          <Passport
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
            {canSkip && (
              <SkipButton secondary label={t('skip_for_now')} onClick={goSkip} />
            )}
          </ButtonWrapper>
        </Content>
      </DimensionsWrapper>
      <DocumentUploaderModal
        onlyJpg
        title={getTitle()}
        open={isUploadDocumentModalOpen}
        closeModal={closeUploadDocumentModal}
        onSaveFile={handleManualUpload}
      />
    </>
  );
}

export {PassportScanScreen};
