import React from 'react';
import {useTranslation} from 'react-i18next';
import {useMutation} from 'react-query';
import api from '../../../../api';
import {useIsMounted} from '../../../../utils/hooks';
import {toastResponseError} from '../../../../utils/common';
import {ButtonResend} from './styled';

const showSuccessMessageMs = 2500;

type ResendEmailButtonProps = {
  reservation: any;
  className?: string;
  label?: string;
};

export const ResendEmailButton = ({
  reservation,
  label = '',
  className,
}: ResendEmailButtonProps) => {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const timeoutResendEmailRef = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    return () => {
      if (timeoutResendEmailRef.current) {
        clearTimeout(timeoutResendEmailRef.current);
      }
    };
  }, []);

  const sendEmailMutation = useMutation<{status: string}, Error, void>(
    () =>
      api.reservations.sendVerificationRetryEmail(reservation?.id!, {
        language: reservation?.default_email_language!,
      }),
    {
      onSuccess: () => {
        timeoutResendEmailRef.current = setTimeout(() => {
          sendEmailMutation.reset();
        }, showSuccessMessageMs);
      },
      onError: (error) => {
        if (!isMounted.current) {
          return;
        }
        if (error) {
          toastResponseError(error);
          return;
        }
      },
    },
  );

  const handleClick = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    sendEmailMutation.mutate();
  };

  return (
    <ButtonResend
      disabled={sendEmailMutation.isLoading || sendEmailMutation.isSuccess}
      onClick={handleClick}
      className={className}
      isSuccess={sendEmailMutation.isSuccess}
      type="button"
    >
      {sendEmailMutation.isLoading && t('sending')}
      {!sendEmailMutation.isLoading && !sendEmailMutation.isSuccess && label}
      {sendEmailMutation.isSuccess && t('sent')}
    </ButtonResend>
  );
};
