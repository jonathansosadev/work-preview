import React from 'react';
import {useTranslation} from 'react-i18next';
import envelopeIcon from '../../../assets/envelope.svg';
import Button from '../Button';

export type SendEmailStatus = 'loading' | 'idle' | 'success' | 'error';

type SendEmailBtnViewProps = {
  label: string;
  status: SendEmailStatus;
  sendEmail: () => void;
  icon?: string;
  disabled?: boolean;
  className?: string;
};

function SendEmailBtnView({
  className,
  label,
  disabled,
  sendEmail,
  icon = envelopeIcon,
  status = 'idle',
}: SendEmailBtnViewProps) {
  const {t} = useTranslation();
  const isLoading = status === 'loading';
  const isIdle = status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <Button
      className={className}
      secondary
      type="button"
      blinking={isLoading}
      onClick={sendEmail}
      disabled={disabled || isLoading}
      label={
        <>
          <img src={icon} height="13" alt="Mail" />
          {isIdle && label}
          {isLoading && t('sending')}
          {isSuccess && t('email_sent_exclamation')}
          {isError && t('error')}
        </>
      }
    />
  );
}

export {SendEmailBtnView};
