import React from 'react';
import {useHistory} from 'react-router';
import {useTranslation, Trans} from 'react-i18next';
import {useForm, Controller} from 'react-hook-form';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import api from '../../../api';
import {PATTERNS} from '../../../utils/constants';
import {UPSELLING_LINKS} from '../../../utils/links';
import {useModalControls} from '../../../utils/hooks';
import {toastResponseError} from '../../../utils/common';
import warningIcon from '../../../assets/warning-offer.svg';
import Modal from '../Modal';
import {InputController} from '../Input';
import ModalButton from '../ModalButton';
import PhoneInput from '../PhoneInput';
import Checkbox from '../Checkbox';
import Link from '../Link';
import {
  Title,
  Form,
  ButtonsWrapper,
  Grid,
  contentStyle,
  SubmitButton,
  Subtitle,
  WrapperControllerCheckbox,
  WarningButtonsWrapper,
} from './styled';
import {BusinessInformationQueryKey} from '../OfferDetails/OfferDetails';

enum formNames {
  companyLegalName = 'company_legal_name',
  primaryContactName = 'primary_contact_name',
  mailingAddress = 'mailing_address',
  primaryContactEmail = 'primary_contact_email',
  additionalInformation = 'additional_information',
  phone = 'phone',
  termsAndConditions = 'has_agreed_with_terms_and_conditions',
}

type FormTypes = {
  [formNames.companyLegalName]: string;
  [formNames.primaryContactName]: string;
  [formNames.mailingAddress]: string;
  [formNames.primaryContactEmail]: string;
  [formNames.additionalInformation]: string;
  [formNames.phone]: string;
  [formNames.termsAndConditions]: boolean;
};

type WaivoCompanyRegistrationModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

function WaivoCompanyRegistrationModal({
  open,
  onClose,
  onSuccess,
}: WaivoCompanyRegistrationModalProps) {
  const {t} = useTranslation();
  const history = useHistory();
  const queryClient = useQueryClient();
  const {
    register,
    control,
    setError,
    formState: {errors},
    handleSubmit,
  } = useForm<FormTypes>();

  const {
    isOpen: isWaivoWarningModalOpen,
    openModal: openWaivoWarningModalOpen,
    closeModal: closeWaivoWarningModalOpen,
  } = useModalControls();

  const businessInformationMutation = useMutation<any, Error, FormTypes>(
    (payload) => api.users.businessInformationMutation(payload),
    {
      onError: toastResponseError,
      onSuccess: async () => {
        await queryClient.refetchQueries(BusinessInformationQueryKey);
        onClose();
        onSuccess();
      },
    },
  );

  const {data: waivoTermsLink} = useQuery<{link: string}>(
    api.documents.ENDPOINTS.waivoTermsPdf(),
    {
      refetchOnWindowFocus: false,
    },
  );

  async function asyncValidatePhone(phoneNumber: string) {
    phoneNumber = phoneNumber?.trim();
    if (!phoneNumber) return null;
    const {error} = await api.validators.validatePhoneNumber({phone: phoneNumber});

    if (error) {
      setError(formNames.phone, error);
      return error;
    }
  }

  const handleDiscardService = () => {
    history.push(UPSELLING_LINKS.offersList);
  };

  const onSubmit = async (data: FormTypes) => {
    const error = await asyncValidatePhone(data[formNames.phone]);
    if (error) return;
    businessInformationMutation.mutate(data);
  };

  const {isLoading} = businessInformationMutation;

  return (
    <>
      <Modal
        closeOnEscape={!isLoading}
        open={open}
        onClose={onClose}
        contentStyle={contentStyle}
      >
        <Title>{t('waivo_company_registration_title')}</Title>
        <Subtitle>{t('waivo_company_registration_subtitle')}</Subtitle>
        <Form>
          <Grid>
            <InputController
              autoFocus
              {...register(formNames.companyLegalName, {
                required: t('required') as string,
              })}
              control={control}
              label={t('company_legal_name')}
              placeholder={t('enter_name')}
              error={errors[formNames.companyLegalName]?.message}
              disabled={isLoading}
            />
            <InputController
              {...register(formNames.primaryContactName, {
                required: t('required') as string,
              })}
              control={control}
              label={t('primary_contact_name')}
              placeholder={t('enter_email')}
              error={errors[formNames.primaryContactName]?.message}
              disabled={isLoading}
            />
            <InputController
              {...register(formNames.primaryContactEmail, {
                required: t('required') as string,
                pattern: {
                  value: PATTERNS.email,
                  message: t('invalid_email') as string,
                },
              })}
              control={control}
              label={t('primary_contact_email')}
              placeholder={t('enter_email')}
              error={errors[formNames.primaryContactEmail]?.message}
              disabled={isLoading}
            />
            <div>
              <Controller
                control={control}
                render={({field, fieldState: {error}}) => {
                  return (
                    <PhoneInput
                      label={t('phone')}
                      error={error?.message}
                      disabled={isLoading}
                      {...field}
                    />
                  );
                }}
                name={formNames.phone}
                rules={{required: t('required') as string}}
              />
            </div>
            <InputController
              {...register(formNames.mailingAddress, {required: t('required') as string})}
              control={control}
              label={t('mailing_address')}
              placeholder={t('enter_address')}
              error={errors[formNames.mailingAddress]?.message}
              disabled={isLoading}
            />
            {/*----------FUTURE FEATURE-----------*/}
            {/*<Input*/}
            {/*  {...register(formNames.additionalInformation, {*/}
            {/*    required: t('required') as string,*/}
            {/*  })}*/}
            {/*  label={t('alternate_contact_label')}*/}
            {/*  placeholder={t('enter_name')}*/}
            {/*  error={errors[formNames.additionalInformation]?.message}*/}
            {/*  disabled={isLoading}*/}
            {/*/>*/}
            {/*----------FUTURE FEATURE-----------*/}
          </Grid>
          <WrapperControllerCheckbox>
            <Controller
              control={control}
              render={({field: {onChange, ...restField}, fieldState: {error}}) => {
                return (
                  <Checkbox
                    label={
                      <Trans i18nKey="program_tc_privacy">
                        Check here to indicate you have read and agree to the program{' '}
                        <Link to={waivoTermsLink?.link}>T&C</Link>
                        and <Link to={t('privacy_policy_link')}>Privacy Policy</Link>
                      </Trans>
                    }
                    checked={restField.value}
                    onChange={onChange}
                    error={error?.message}
                    disabled={isLoading}
                    {...restField}
                  />
                );
              }}
              name={formNames.termsAndConditions}
              rules={{required: t('required') as string}}
            />
          </WrapperControllerCheckbox>
          <ButtonsWrapper>
            <SubmitButton
              label={t('send_to_waivo')}
              disabled={isLoading}
              onClick={handleSubmit(onSubmit)}
            />
            <ModalButton
              secondary
              label={t('cancel')}
              onClick={openWaivoWarningModalOpen}
              disabled={isLoading}
            />
          </ButtonsWrapper>
        </Form>
      </Modal>
      <Modal
        iconSrc={warningIcon}
        iconProps={{height: 100, width: 100}}
        open={isWaivoWarningModalOpen}
        title={t('waivo_warning_modal_title')}
        text={t('waivo_warning_modal_text')}
      >
        <WarningButtonsWrapper>
          <SubmitButton
            label={t('complete_setup')}
            disabled={isLoading}
            onClick={closeWaivoWarningModalOpen}
          />
          <ModalButton
            secondary
            label={t('discard_service')}
            onClick={handleDiscardService}
            disabled={isLoading}
          />
        </WarningButtonsWrapper>
      </Modal>
    </>
  );
}

export {WaivoCompanyRegistrationModal};
