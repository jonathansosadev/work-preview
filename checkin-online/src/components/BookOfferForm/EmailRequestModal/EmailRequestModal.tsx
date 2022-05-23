import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import incompleteDataIcon from '../../../assets/data-incomplete-icon.svg';
import {PATTERNS} from '../../../utils/constants';
import Modal from '../../Modal';
import Button from '../../Button';
import {Form, ButtonsWrapper, InputWrapper, ModalInput} from './styled';
import api from '../../../api';
import {useIsMounted, useStatus} from '../../../utils/hooks';
import {getErrorMessage} from '../../../utils/common';

enum FormNames {
  email = 'email',
}

type FormTypes = {
  [FormNames.email]: string;
};

type EmailRequestModalProps = {
  onClose: () => void;
  guestId: string;
  onSuccess: () => void;
  mutateGuest: (data: any, shouldRevalidate: boolean) => Promise<any>;
  enterGuestMailRef: {current: string | null};
};

function EmailRequestModal({
  onClose,
  guestId,
  mutateGuest,
  onSuccess,
  enterGuestMailRef,
}: EmailRequestModalProps) {
  const {t} = useTranslation();
  const {register, errors, handleSubmit} = useForm<FormTypes>();
  const isMounted = useIsMounted();
  const {isLoading, setStatus} = useStatus();
  const [errorMessage, setErrorMessage] = React.useState('');

  const getPayload = (data: FormTypes) => {
    return {
      email: data[FormNames.email],
    };
  };

  const onSubmit = async (data: FormTypes) => {
    const payload = getPayload(data);
    setStatus('loading');
    setErrorMessage('');

    const {error, data: guest} = await api.guests.patch(guestId, payload);

    if (!isMounted.current) {
      return;
    }

    if (guest) {
      enterGuestMailRef.current = payload.email;
      onClose();
      await mutateGuest(guest, false);
      onSuccess();
    }

    if (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
    }
    setStatus('idle');
  };

  return (
    <Modal
      open
      closeOnDocumentClick={!isLoading}
      closeOnEscape={!isLoading}
      iconProps={{
        src: incompleteDataIcon,
        height: 84,
        width: 84,
        alt: '',
      }}
      onClose={onClose}
      title={t('add_your_email_title')}
      text={t('add_your_email_text')}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputWrapper>
          <ModalInput
            disabled={isLoading}
            ref={register({
              required: t('required') as string,
              pattern: {
                value: PATTERNS.email,
                message: t('invalid_email'),
              },
            })}
            name={FormNames.email}
            label={t('your_email')}
            error={errors[FormNames.email]?.message || errorMessage}
            placeholder={t('enter_email')}
          />
        </InputWrapper>
        <ButtonsWrapper>
          <Button type="submit" label={t('continue')} disabled={isLoading} />
          <Button secondary label={t('back')} onClick={onClose} disabled={isLoading} />
        </ButtonsWrapper>
      </Form>
    </Modal>
  );
}

export {EmailRequestModal};
