import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {WebcamRefTypes} from '../Webcam/Webcam';
import {
  useErrorModal,
  useGoBackTo,
  useIsMounted,
  useModalControls,
} from '../../utils/hooks';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {getHeaderProps} from '../DocScanScreen';
import {TIMEOUT_BEFORE_REDIRECT_MS} from '../../utils/constants';
import successIcon from '../../assets/success-icon.svg';
import cameraIcon from '../../assets/camera.svg';
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
  Subtitle,
  Title,
  SkipButton,
  DocumentWebCam,
} from './styled';

type LocationTypes = {
  formData: any;
  number_of_guests?: number;
  children?: number;
  isRetryBiomatch?: boolean;
};

function FrontSideIdCaptureScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationTypes>();
  const isMounted = useIsMounted();
  const timeoutRef = React.useRef<any>();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const {goBack} = useGoBackTo();
  const {
    hasGuestMembers,
    isVerifyOnlyDocumentOptional,
    ...reservationDetails
  } = useComputedReservationDetails();
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);
  const {ErrorModal, displayError} = useErrorModal();
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModalControls();
  const {
    isOpen: isUploadDocumentModalOpen,
    closeModal: closeUploadDocumentModal,
    openModal: openUploadDocumentModal,
  } = useModalControls();

  const isRetryBiomatch = location.state?.isRetryBiomatch;
  const canSkip = isVerifyOnlyDocumentOptional && !isRetryBiomatch;

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

  const getPersistedState = (image = '') => {
    return {
      ...location.state,
      front_side_scan: image,
    };
  };

  const redirectWithImageAfterTimeout = (image = '') => {
    timeoutRef.current = setTimeout(() => {
      closeSuccessModal();
      history.push('back-side', getPersistedState(image));
    }, TIMEOUT_BEFORE_REDIRECT_MS);
  };

  const handleImage = (image?: string) => {
    try {
      openSuccessModal();
      redirectWithImageAfterTimeout(image);
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

  const goSkip = () => {
    history.push('back-side');
  };

  return (
    <>
      <ErrorModal />
      <Modal
        open={isSuccessModalOpen}
        title={`${t('success')}!`}
        iconSrc={successIcon}
        iconAlt="Success"
      />
      <Header
        title={t('capture_id')}
        onBack={goBack}
        {...getHeaderProps({
          hasGuestMembers,
          isVerifyOnlyDocumentOptional,
          ...reservationDetails,
        })}
      />
      <DimensionsWrapper>
        <Content>
          <Title>{t('frontside')}</Title>
          <Subtitle>{t('where_the_photo_is')}</Subtitle>
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
            {canSkip && (
              <SkipButton secondary label={t('skip_for_now')} onClick={goSkip} />
            )}
          </ButtonWrapper>
        </Content>
      </DimensionsWrapper>
      <DocumentUploaderModal
        onlyJpg
        title={t('frontside')}
        description={t('where_the_photo_is')}
        open={isUploadDocumentModalOpen}
        closeModal={closeUploadDocumentModal}
        onSaveFile={handleManualUpload}
      />
    </>
  );
}

export {FrontSideIdCaptureScreen};
