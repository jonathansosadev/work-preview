import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import api from '../api';
import {useAbortController, useErrorModal, useIsMounted} from '../utils/hooks';
import {getExapmleDocumentImageMrz} from '../utils/docTypes';
import {ErrorType} from '../utils/common';
import {device} from '../styled/device';

const MaxScanFailureAttemptsBeforeFormProceed = 3;
const DetectingResponsesGapS = 1;
enum DetectingStatuses {
  completed = 'COM',
  error = 'ERR',
  processing = 'PRO',
  new = 'NEW',
}

const ExampleMrzImage = styled.img`
  display: block;
  margin: 15px auto 0;

  @media (max-width: ${device.mobileL}) {
    max-width: 240px;
    max-height: 160px;
  }
`;

type MrzErrorModalProps = {
  docType?: string;
  nationality?: string;
};

type HandleMRZDetection = {
  reservationId: string;
  image?: string;
  onSuccess: (payload: {image: string; data: any}) => void;
  onError: (error: ErrorType) => void;
};

type HandleStatusDetection = {
  data: any;
  image: string;
  error: ErrorType;
  aborted?: boolean;
};

type UseMRZDetection = {
  startLoading: () => void;
  stopLoading: () => void;
};

function useMRZDetection({startLoading, stopLoading}: UseMRZDetection) {
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const timeoutRef = React.useRef<any>();
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const onSuccessRef = React.useRef<
    ((payload: {image: string; data: any}) => void) | null
  >(null);
  const onErrorRef = React.useRef<((error: ErrorType) => void) | null>(null);
  const isMaxFailedAttemptsReached =
    failedAttempts >= MaxScanFailureAttemptsBeforeFormProceed;
  const {abortController, setupAbortController} = useAbortController();
  const {t} = useTranslation();

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDetectionError = (error: any = null, aborted = false) => {
    stopLoading();
    if (!aborted) {
      setFailedAttempts(prevState => prevState + 1);
      onErrorRef.current?.(error);
    }
  };

  const handleStatusDetection = ({
    data,
    image,
    error,
    aborted,
  }: HandleStatusDetection) => {
    if (!isMounted.current) {
      return null;
    }

    if (error) {
      handleDetectionError(error, aborted);
      return null;
    }

    if (data?.status === DetectingStatuses.completed) {
      if (data?.mrz_detected && data?.valid_composite) {
        onSuccessRef.current?.({data, image});
      } else {
        handleDetectionError({
          message: t('could_not_detect'),
        });
      }

      return null;
    }

    if (data?.status === DetectingStatuses.error) {
      handleDetectionError({
        message: t('could_not_detect'),
      });
      return null;
    }
    return true;
  };

  const checkMRZDetection = async (id: string, image: string) => {
    if (!id) {
      handleDetectionError({
        message: 'MRZ Check Id is missing.',
      });
      return;
    }

    const {data, error, aborted} = await api.ocr.checkImageMRZDetection(id, {
      signal: setupAbortController(),
    });

    const resultStatus = handleStatusDetection({
      data,
      image,
      error,
      aborted,
    });
    if (!resultStatus) return;

    return new Promise(resolve => {
      timeoutRef.current = setTimeout(() => {
        resolve(checkMRZDetection(id, image));
      }, 1000 * DetectingResponsesGapS);
    });
  };

  const startMRZDetection = async ({
    image = '',
    reservationId = '',
    onSuccess,
    onError,
  }: HandleMRZDetection) => {
    startLoading();
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    const {data, error, aborted} = await api.ocr.sendImageForMRZDetection(
      image,
      reservationId,
      {
        signal: setupAbortController(),
      },
    );

    const resultStatus = handleStatusDetection({
      data,
      image,
      error,
      aborted,
    });
    if (!resultStatus) return;

    await checkMRZDetection(data?.id, image);
  };

  const MrzErrorModal = ({docType, nationality}: MrzErrorModalProps) => {
    const exampleMrzImage = getExapmleDocumentImageMrz(docType, nationality);
    return (
      <ErrorModal
        title={<>{t('error')} &#128542;</>}
        message={t('could_not_detect_mrz')}
        description={
          <>
            <span>{t('try_again_mrz_or_contact')}</span>
            <ExampleMrzImage
              width={320}
              height={200}
              src={exampleMrzImage}
              alt="exampleMrzImage"
            />
          </>
        }
      />
    );
  };

  return {
    startMRZDetection,
    isMaxFailedAttemptsReached,
    abortController,
    MrzErrorModal,
    displayMrzError: displayError,
  };
}

export {useMRZDetection};
