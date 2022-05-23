import React from 'react';
import {Link} from 'react-router-dom';
import {useIsMounted, useStatus} from '../../../utils/hooks';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import api from '../../../api';
import {toastResponseError} from '../../../utils/common';
import {PATTERNS} from '../../../utils/constants';
import arrowIcon from '../../../assets/arrow.svg';
import Input from '../Input';
import Button from '../Button';
import Loader from '../../common/Loader';
import {Wrapper} from '../RegisterForm';
import {
  Tile,
  PromptText,
  FieldsWrapper,
  TileTitle,
  BackLink,
  SuccessSentText,
  BackToLoginWrapper,
  SubmitButton,
  ArrowImg,
} from './styled';

enum FORM_NAMES {
  email = 'email',
}

type FormTypes = {
  [FORM_NAMES.email]: string;
};

function ForgotPasswordTile() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {
    register,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {setStatus, isLoading, isSuccess} = useStatus();
  const emailValue = watch(FORM_NAMES.email);

  const onSubmit = async (formData: FormTypes) => {
    setStatus('loading');
    const {data, error} = await api.password.reset(formData.email);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('error');
      toastResponseError(error);
    }

    if (data) {
      setStatus('success');
    }
  };

  return (
    <Wrapper>
      <BackLink to="/login">
        <ArrowImg src={arrowIcon} alt="Arrow" />
        {t('back_to_login').toUpperCase()}
      </BackLink>
      <Tile>
        <TileTitle>{t('forgot_password')}</TileTitle>
        <PromptText>{t('please_insert_your_email')}</PromptText>
        <form onSubmit={handleSubmit(onSubmit)}>
          {isSuccess ? (
            <BackToLoginWrapper>
              <SuccessSentText role="alert">
                {t('password_reset_email_success')}
              </SuccessSentText>
              <Link to="/login">
                <Button
                  label={t('back_to_login').toUpperCase()}
                  type="button"
                  secondary
                />
              </Link>
            </BackToLoginWrapper>
          ) : (
            <FieldsWrapper>
              <Input
                {...register(FORM_NAMES.email, {
                  required: t('required') as string,
                  pattern: {
                    value: PATTERNS.email,
                    message: t('invalid_email'),
                  },
                })}
                inputMode="email"
                disabled={isLoading}
                placeholder={t('enter_your_email')}
                label={t('email')}
                type="email"
                error={errors[FORM_NAMES.email]?.message}
              />
            </FieldsWrapper>
          )}
          {isLoading ? (
            <Loader />
          ) : (
            <SubmitButton
              type="submit"
              visible={Boolean(emailValue)}
              label={t('reset_password')}
              disabled={!Boolean(emailValue)}
            />
          )}
        </form>
      </Tile>
    </Wrapper>
  );
}

export {ForgotPasswordTile};
