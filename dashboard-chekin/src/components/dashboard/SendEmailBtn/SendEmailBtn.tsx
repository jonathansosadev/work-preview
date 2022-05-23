import React from 'react';
import api from '../../../api';
import {useErrorModal, useStatus, useAsyncOperation} from '../../../utils/hooks';
import {SendEmailBtnView} from './SendEmailBtnView';

function SendEmailBtn({
  className,
  getEmailPayload,
  reservationId,
  getLanguagePayload,
  refetchEmailStatistics,
  icon,
  label,
  disabled,
}: any) {
  const {ErrorModal, displayError} = useErrorModal();
  const {setStatus: setEmailSendingStatus, status} = useStatus({
    autoReset: true,
  });
  const {asyncOperation} = useAsyncOperation();

  const handleEmailSendingError = (error = '') => {
    setEmailSendingStatus('idle');
    displayError(error);
  };

  const sendCheckinOnlineEmail = async () => {
    setEmailSendingStatus('loading');

    const payload = getEmailPayload();

    asyncOperation(() => api.reservations.sendReservationEmail(payload), {
      onError: handleEmailSendingError,
    });

    const languagePayload = getLanguagePayload();

    asyncOperation(() => api.reservations.patch(reservationId, languagePayload), {
      onError: handleEmailSendingError,
    });
    if (refetchEmailStatistics) {
      await refetchEmailStatistics();
    }
    setEmailSendingStatus('success');
  };

  return (
    <>
      <SendEmailBtnView
        className={className}
        label={label}
        disabled={disabled}
        status={status}
        icon={icon}
        sendEmail={sendCheckinOnlineEmail}
      />
      <ErrorModal />
    </>
  );
}

export {SendEmailBtn};
