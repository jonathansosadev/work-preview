import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import useSWR from 'swr';
import {subYears} from 'date-fns';
import api, {getURL} from '../../api';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {getHousingCountryCode} from '../../utils/reservation';
import {getHeaderProps} from '../AddPersonalDataTypeScreen';
import {GENDERS_OPTIONS, PATTERNS} from '../../utils/constants';
import {WebcamRefTypes} from '../Webcam/Webcam';
import {getDocTypes, getRemappedDocType} from '../../utils/docTypes';
import {useReservation} from '../../context/reservation';
import {useMRZDetection} from '../../hooks/useMRZDetection';
import {useErrorModal, useIsMounted, useModalControls} from '../../utils/hooks';
import {isMobileOrTablet} from '../../utils/mobile';
import mrzIllustration from '../../assets/mrz-illustration.png';
import mrzIllustration2x from '../../assets/mrz-illustration@2x.png';
import crossIcon from '../../assets/cross-white.svg';
import successIcon from '../../assets/success-icon.svg';
import cameraIcon from '../../assets/camera.svg';
import scanningIcon from '../../assets/scanning_doc_icn.svg';
import reviewDataIcon from '../../assets/review-data-icon.svg';
import likeIcon from '../../assets/like.svg';
import eyeIcon from '../../assets/eye-white.svg';
import contractIcon from '../../assets/contract.svg';
import Header from '../Header';
import Button from '../Button';
import Modal from '../Modal';
import QuestionMarkButton from '../QuestionMarkButton';
import DocumentUploaderModal from '../DocumentUploaderModal';
import {ModalButton, ModalSecondaryButton, UploadButton} from '../../styled/common';
import {
  ButtonIcon,
  ButtonWrapper,
  Content,
  DetectionWebcam,
  MRZModalCloseButton,
  EyeIcon,
  Hint,
  MRZIllustration,
  MRZIllustrationWrapper,
  Title,
  ErrorModalFirstButton,
  ContractIcon,
} from './styled';

const successModalTimeoutS = 1.5;

type LocationType = {
  country: {
    code: string;
    name: string;
  };
};

function getLocationsAsOptions(data: {results: Array<LocationType>}) {
  const results = data?.results;

  if (!results) {
    return [];
  }
  return results.map(l => {
    return {
      value: l?.country?.code,
      label: l?.country?.name,
    };
  });
}

function AddPersonalDataScanScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const {data: reservation} = useReservation();
  const details = useComputedReservationDetails();
  const isMounted = useIsMounted();
  const webcamRef = React.useRef<WebcamRefTypes>(null);
  const timeoutRef = React.useRef<any>();
  const {displayError, ErrorModal, closeErrorModal} = useErrorModal();
  const {data: locations} = useSWR(getURL(api.locations.ENDPOINTS.get('ordering=name')));
  const [isCaptureButtonDisabled, setIsCaptureButtonDisabled] = React.useState(true);
  const [detectedData, setDetectedData] = React.useState<any>(null);
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
    startMRZDetection,
    abortController,
    MrzErrorModal,
    displayMrzError,
    isMaxFailedAttemptsReached,
  } = useMRZDetection({
    startLoading,
    stopLoading,
  });
  const {
    isOpen: isReviewModalOpen,
    openModal: openReviewModal,
    closeModal: closeReviewModal,
  } = useModalControls();
  const {
    isOpen: isMRZModalOpen,
    openModal: openMRZModal,
    closeModal: closeMRZModal,
  } = useModalControls();
  const {
    isOpen: isUploadDocumentModalOpen,
    closeModal: closeUploadDocumentModal,
    openModal: openUploadDocumentModal,
  } = useModalControls();

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const getPersistedState = () => {
    return location?.state;
  };

  const goBack = () => {
    const persistedState = getPersistedState();

    if (details.hasGuestMembers) {
      history.push('/', persistedState);
      return;
    }

    if (details.isDocScanDisabled) {
      if (details.hasBiomatchForGuestLeader) {
        history.push('/onboarding', persistedState);
        return;
      }

      history.push('/', persistedState);
      return;
    }

    history.push('/form/type', persistedState);
  };

  const enableScreenshotButton = () => {
    if (isMounted.current) {
      setIsCaptureButtonDisabled(false);
    }
  };

  const getValidName = (name?: string) => {
    if (!name) {
      return undefined;
    }
    return PATTERNS.name.test(name) ? name : undefined;
  };

  const buildFormData = () => {
    if (!detectedData) {
      displayError({
        message: 'Form data is missing',
      });
      return;
    }

    const birthDate =
      detectedData?.valid_date_of_birth && detectedData?.date_of_birth
        ? new Date(detectedData.date_of_birth)
        : undefined;
    const docDateOfIssue =
      detectedData?.valid_expiration_date && detectedData?.expiration_date
        ? subYears(new Date(detectedData.expiration_date), 10)
        : undefined;

    const sex = GENDERS_OPTIONS().find(g => g.value === detectedData?.sex);
    const nationality = getLocationsAsOptions(locations).find(l => {
      return l?.value === detectedData?.nationality;
    });

    const remappedDocType = getRemappedDocType({
      docType: detectedData?.type_doc,
      countryCode: getHousingCountryCode(reservation),
    });
    const docType = getDocTypes(reservation, detectedData?.nationality).find(o => {
      return o?.value === remappedDocType;
    });

    return {
      sex,
      docDateOfIssue,
      birthDate,
      nationality,
      docType,
      residenceCountry: nationality,
      docNumber: detectedData?.number,
      name: getValidName(detectedData?.names),
      surname: getValidName(detectedData?.first_surname),
      second_surname: getValidName(detectedData?.second_surname),
    };
  };

  const goToNextStepWithFormData = () => {
    const formData = buildFormData();
    const persistedState = getPersistedState() || {};

    closeReviewModal();
    history.push('/form/add', {
      ...persistedState,
      formData,
      highlightFormFields: true,
      ocrWasUsed: true,
    });
  };

  const goToNextStep = () => {
    const persistedState = getPersistedState() || {};

    closeErrorModal();
    history.push('/form/add', persistedState);
  };

  const handleDetectionSuccess = ({data}: {image: string; data: any}) => {
    setDetectedData(data);
    stopLoading();
    openSuccessModal();

    timeoutRef.current = setTimeout(() => {
      closeSuccessModal();
      openReviewModal();
    }, 1000 * successModalTimeoutS);
  };

  const handleImage = async (image?: string) => {
    try {
      const reservationId = reservation?.id;
      setDetectedData(null);

      await startMRZDetection({
        image,
        reservationId,
        onSuccess: handleDetectionSuccess,
        onError: displayMrzError,
      });
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
      <Header
        title={t('add_personal_data')}
        onBack={goBack}
        hideBackButton={isLoading}
        {...getHeaderProps(details)}
      />
      <Content>
        <Title>
          <Trans i18nKey="scan_where_mrz_code_is">
            Scan your ID or passport by the side where the <b>MRZ code</b> is.
          </Trans>
          <QuestionMarkButton onClick={openMRZModal} />
        </Title>
        <Hint>{t('keep_your_doc_inside_the_box')}</Hint>
        <DetectionWebcam
          mirrored={false}
          ref={webcamRef}
          isMobile={isMobileOrTablet()}
          onUserMedia={enableScreenshotButton}
        />
        <UploadButton
          label={t('upload_manually')}
          onClick={openUploadDocumentModal}
          secondary
        />
        <ButtonWrapper>
          <Button
            label={t('capture')}
            onClick={handleCaptureScreenshot}
            disabled={isCaptureButtonDisabled}
            icon={<ButtonIcon src={cameraIcon} alt="Camera" />}
          />
        </ButtonWrapper>
      </Content>
      <ErrorModal
        message={
          isMaxFailedAttemptsReached ? t('scanner_cannot_detect_try_to_add_manually') : ''
        }
      >
        {isMaxFailedAttemptsReached && (
          <>
            <ErrorModalFirstButton
              label={t('add_data_manually')}
              onClick={goToNextStep}
              icon={<ContractIcon src={contractIcon} alt="Contract" />}
            />
            <ModalButton
              label={t('ok')}
              icon={<img src={likeIcon} alt="Like" />}
              onClick={closeErrorModal}
            />
          </>
        )}
      </ErrorModal>
      <MrzErrorModal />
      <Modal
        open={isSuccessModalOpen}
        title={`${t('success')}!`}
        iconSrc={successIcon}
        iconAlt="Success"
      />
      <Modal
        open={isLoading}
        title={t('scanning')}
        text={t('it_could_take_seconds')}
        iconSrc={scanningIcon}
        iconAlt="Scanner"
      >
        <ModalSecondaryButton onClick={() => abortController.abort()}>
          {t('cancel')}
        </ModalSecondaryButton>
      </Modal>
      <Modal
        open={isReviewModalOpen}
        iconSrc={reviewDataIcon}
        iconAlt="A person with magnifier"
        title={t('please_review_your_data')}
        text={t('be_sure_that_data_correct')}
      >
        <ModalButton
          onClick={goToNextStepWithFormData}
          label={t('review_data')}
          icon={<EyeIcon src={eyeIcon} alt="Eye" />}
        />
      </Modal>
      <Modal
        closeOnDocumentClick
        closeOnEscape
        open={isMRZModalOpen}
        onClose={closeMRZModal}
      >
        <MRZModalCloseButton onClick={closeMRZModal}>
          <img src={crossIcon} alt="Cross" />
        </MRZModalCloseButton>
        <MRZIllustrationWrapper>
          <MRZIllustration
            src={mrzIllustration}
            srcSet={`${mrzIllustration} 1x, ${mrzIllustration2x} 2x`}
            alt="Man pointing to MRZ code"
          />
        </MRZIllustrationWrapper>
      </Modal>
      <DocumentUploaderModal
        title={
          <Trans i18nKey="scan_where_mrz_code_is">
            Scan your ID or passport by the side where the
            <b style={{color: 'black'}}>MRZ code</b> is.
          </Trans>
        }
        open={isUploadDocumentModalOpen}
        closeModal={closeUploadDocumentModal}
        onSaveFile={handleManualUpload}
      />
    </>
  );
}

export {AddPersonalDataScanScreen};
