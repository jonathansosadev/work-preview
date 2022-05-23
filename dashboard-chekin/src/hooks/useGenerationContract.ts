import React from 'react';
import api from '../api';
import {WS_EVENT_TYPES} from '../utils/constants';
import {useWebsocket} from '../context/websocket';
import {useIsMounted} from '../utils/hooks';
import {downloadFromLink, toastResponseError} from '../utils/common';

const timeoutMs = 1500;

const CONTRACT_GENERATION_STATUSES = {
  none: '',
  request: 'REQUEST',
  started: 'STARTED',
  finished: 'FINISHED',
  failed: 'FAILED',
};

function useGenerationContract() {
  const isMounted = useIsMounted();
  const {message, clearMessage} = useWebsocket();
  const timeoutRef = React.useRef<any>();
  const [shouldDownloadContract, setShouldDownloadContract] = React.useState(false);
  const [status, setStatus] = React.useState(CONTRACT_GENERATION_STATUSES.none);

  const fetchContractSample = React.useCallback(
    async (message: any) => {
      const {instance_id} = message;
      const {error, data} = await api.documents.getContract(instance_id);

      if (!isMounted.current) {
        return;
      }

      if (data?.file) {
        setStatus(CONTRACT_GENERATION_STATUSES.finished);
        downloadFromLink(data.file);
      }
      if (error) {
        toastResponseError(error);
        setStatus(CONTRACT_GENERATION_STATUSES.failed);
      }
    },
    [isMounted],
  );

  React.useEffect(
    function handleContractSampleWSEvents() {
      const eventType = message?.event_type;

      if (eventType === WS_EVENT_TYPES.contractSampleCreationStarted) {
        setStatus(CONTRACT_GENERATION_STATUSES.started);
      }
      if (eventType === WS_EVENT_TYPES.contractSampleCreationFinished) {
        if (shouldDownloadContract) {
          setShouldDownloadContract(false);
          fetchContractSample(message);
        } else {
          setStatus(CONTRACT_GENERATION_STATUSES.finished);
        }
      }
      if (eventType === WS_EVENT_TYPES.contractSampleCreationFailed) {
        setStatus(CONTRACT_GENERATION_STATUSES.failed);
      }

      return () => {
        clearMessage();
      };
    },
    [clearMessage, fetchContractSample, message, shouldDownloadContract],
  );

  React.useEffect(
    function checkGenerationContractStatus() {
      if (
        [
          CONTRACT_GENERATION_STATUSES.failed,
          CONTRACT_GENERATION_STATUSES.finished,
        ].includes(status)
      ) {
        timeoutRef.current = setTimeout(() => setStatus(''), timeoutMs);
      }

      return () => {
        clearTimeout(timeoutRef.current);
      };
    },
    [status],
  );

  return {status, setStatus, setShouldDownloadContract};
}

export {useGenerationContract, CONTRACT_GENERATION_STATUSES};
