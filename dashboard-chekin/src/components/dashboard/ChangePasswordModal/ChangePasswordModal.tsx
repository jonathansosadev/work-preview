import React from 'react';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import {useAuth} from '../../../context/auth';
import {getErrorMessage} from '../../../utils/common';
import {useStatus} from '../../../utils/hooks';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {
  ChangePasswordTitle,
  FieldWrapper,
  ChangePasswordInput,
  ChangePasswordModalTwoButtonsWrapper,
} from './styled';

export enum FORM_NAMES {
  oldPassword = 'old_password',
  newPassword = 'password',
  repeatedNewPassword = 'repeatedNewPassword',
}

export type FormTypes = {
  [FORM_NAMES.oldPassword]?: string;
  [FORM_NAMES.newPassword]?: string;
  [FORM_NAMES.repeatedNewPassword]?: string;
};
type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ChangePasswordModal({isOpen, onClose}: ChangePasswordModalProps) {
  const {t} = useTranslation();
  const {
    register,
    formState: {errors, isSubmitted},
    getValues,
    handleSubmit,
    setError,
    trigger,
  } = useForm<FormTypes>();

  const {setStatus, isLoading} = useStatus({
    autoReset: true,
  });

  const {updateAccount} = useAuth();

  const getPasswordPayload = (data: FormTypes) => {
    return {
      [FORM_NAMES.oldPassword]: data[FORM_NAMES.oldPassword],
      [FORM_NAMES.newPassword]: data[FORM_NAMES.newPassword],
    };
  };

  const onSubmit = async (formData: FormTypes) => {
    setStatus('loading');
    const payload = getPasswordPayload(formData);
    const {error} = await updateAccount(payload);
    if (error) {
      const extractedError = getErrorMessage(error);
      const IsErrorAssociatedWithPassword = extractedError.includes(
        FORM_NAMES.newPassword,
      );

      if (IsErrorAssociatedWithPassword) {
        setError(FORM_NAMES.newPassword, {
          message: extractedError,
        });
        setStatus('error');
        return;
      }

      return;
    }
    setStatus('success');
    onClose();
  };

  const {onChange: onNewPasswordChange, ...newPasswordRegister} = register(
    FORM_NAMES.newPassword,
    {
      required: t('required') as string,
      validate: (value) =>
        value === getValues()[FORM_NAMES.repeatedNewPassword] ||
        (t('password_doesnt_match') as string),
    },
  );

  const {
    onChange: onRepeatedNewPasswordChange,
    ...repeatedNewPasswordRegister
  } = register(FORM_NAMES.repeatedNewPassword, {
    required: t('required') as string,
    validate: (value) =>
      value === getValues()[FORM_NAMES.newPassword] ||
      (t('password_doesnt_match') as string),
  });

  return (
    <Modal open={isOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ChangePasswordTitle>{t('change_password')}</ChangePasswordTitle>
        <FieldWrapper>
          <ChangePasswordInput
            disabled={isLoading}
            {...register(FORM_NAMES.oldPassword, {
              required: t('required') as string,
            })}
            error={errors[FORM_NAMES.oldPassword]?.message}
            type="password"
            placeholder={t('enter_current_password')}
            label={t('current_password')}
          />
        </FieldWrapper>
        <FieldWrapper>
          <ChangePasswordInput
            {...newPasswordRegister}
            disabled={isLoading}
            onChange={(event) => {
              onNewPasswordChange(event);

              if (isSubmitted) {
                trigger(FORM_NAMES.repeatedNewPassword);
              }
            }}
            error={
              errors[FORM_NAMES.newPassword]?.message ||
              errors[FORM_NAMES.newPassword]?.types?.message
            }
            type="password"
            placeholder={t('enter_new_password')}
            label={t('new_password')}
            {...newPasswordRegister}
          />
        </FieldWrapper>
        <FieldWrapper>
          <ChangePasswordInput
            disabled={isLoading}
            {...repeatedNewPasswordRegister}
            onChange={(event) => {
              onRepeatedNewPasswordChange(event);

              if (isSubmitted) {
                trigger(FORM_NAMES.newPassword);
              }
            }}
            error={errors[FORM_NAMES.repeatedNewPassword]?.message}
            type="password"
            placeholder={t('repeat_new_password')}
            label={t('repeat_new_password')}
          />
        </FieldWrapper>
        <ChangePasswordModalTwoButtonsWrapper>
          <ModalButton disabled={isLoading} type="submit" label={t('change_password')} />
          <ModalButton
            disabled={isLoading}
            secondary
            onClick={onClose}
            label={t('close')}
          />
        </ChangePasswordModalTwoButtonsWrapper>
      </form>
    </Modal>
  );
}

export {ChangePasswordModal};
