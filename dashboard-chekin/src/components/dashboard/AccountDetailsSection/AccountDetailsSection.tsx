import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import api from '../../../api';
import {useAuth} from '../../../context/auth';
import {getBase64, getFileImageSrc, toastResponseError} from '../../../utils/common';
import {useUser} from '../../../context/user';
import {User} from '../../../utils/types';
import {PATTERNS} from '../../../utils/constants';
import {
  useErrorModal,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import {useComputedDetails} from '../../../context/computedDetails';
import i18n from '../../../i18n';
import rubbishIcon from '../../../assets/rubbish.svg';
import rubbishWhiteIcon from '../../../assets/rubbish-bin.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import deleteAccountIcon from '../../../assets/icon-delete-account.svg';
import logoutIcon from '../../../assets/logout-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import Loader from '../../common/Loader';
import FloatingSaveButton from '../FloatingSaveButton';
import PhoneInput from '../PhoneInput';
import ChangePasswordModal from '../ChangePasswordModal';
import Tooltip from '../Tooltip';
import {InputController} from '../Input';
import {ModalTwoButtonsWrapper, Hr} from '../../../styled/common';
import {
  DetailsSection,
  Content,
  FieldWrapper,
  UndoButton,
  LogoTitle,
  AddLogoFileInput,
  LogoContainer,
  LogoContent,
  LogoDetails,
  LogoPlaceholder,
  CustomLogoImage,
  LogoButtonsWrapper,
  Footer,
  AccountType,
  AccountTypeTooltip,
  DeleteAccountButton,
  DeleteAccountModalButton,
  FieldsWrapper,
  FlexContainer,
  PasswordInput,
  Name,
  PasswordFlexContainer,
  ChangePasswordFlexContainer,
  ChangePasswordButtonWrapper,
  ChangePasswordButton,
  LogoutButton,
} from './styled';

export enum FORM_NAMES {
  name = 'name',
  email = 'email',
  phone = 'phone',
  phoneNumber = 'phoneNumber',
  phoneCode = 'phoneCode',
  logo = 'picture',
}

export type FormTypes = {
  [FORM_NAMES.name]: string;
  [FORM_NAMES.email]: string;
  [FORM_NAMES.phone]: string;
  [FORM_NAMES.phoneNumber]: string;
  [FORM_NAMES.phoneCode]: string;
  [FORM_NAMES.logo]?: string | File;
};

const REST_FIELDS = [FORM_NAMES.name, FORM_NAMES.email, FORM_NAMES.phoneNumber];

function buildFormData(user?: User | null) {
  if (!user) {
    return {};
  }

  return {
    [FORM_NAMES.name]: user.name,
    [FORM_NAMES.email]: user.email,
    [FORM_NAMES.phone]: user.phone,
    [FORM_NAMES.phoneNumber]: user.phone_details.number,
    [FORM_NAMES.phoneCode]: user.phone_details.code,
    [FORM_NAMES.logo]: user?.picture?.src || '',
  };
}

function getShouldResetFormState(
  fields: Partial<Record<FORM_NAMES, boolean | undefined>>,
) {
  const dirtyFields = Object.keys(fields).filter((field) => Boolean(field));
  if (!dirtyFields.length) {
    return false;
  }

  const hasRestFields = dirtyFields.some((field) => {
    const included = [...REST_FIELDS].find((f) => f === field);
    return Boolean(included);
  });
  if (hasRestFields) {
    return false;
  }
}

function AccountDetailsSection() {
  const {t} = useTranslation();
  const user = useUser();
  const isMounted = useIsMounted();
  const {
    register,
    reset,
    formState,
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });

  const {errors, dirtyFields} = formState;
  const {logout, updateAccount} = useAuth();
  const {isAccountOwner, isAccountCollaborator} = useComputedDetails();
  const {
    closeModal: closeRemoveLogoModal,
    isOpen: isRemoveLogoModalOpen,
    openModal: openRemoveLogoModal,
  } = useModalControls();
  const {
    isOpen: isDeleteAccountModalOpen,
    closeModal: closeDeleteAccountModal,
    openModal: openDeleteAccountModal,
  } = useModalControls();
  const {
    closeModal: closeChangePasswordModal,
    openModal: openChangePasswordModal,
    isOpen: isChangePasswordModalOpen,
  } = useModalControls();
  const {setStatus: setDeletingAccountStatus, isLoading: isDeletingAccount} = useStatus();
  const {isErrorModalOpen, displayError, ErrorModal} = useErrorModal();
  const {status, isIdle, setStatus} = useStatus({
    autoReset: true,
  });

  const logo = watch(FORM_NAMES.logo);

  const shouldResetFormState =
    !isChangePasswordModalOpen && getShouldResetFormState(dirtyFields);

  React.useEffect(
    function preloadFormData() {
      const formData = buildFormData(user);
      reset({
        ...getValues(),
        ...formData,
      });
    },
    [user, reset, getValues],
  );

  React.useEffect(
    function resetFormStateOnPasswordFieldsHide() {
      if (shouldResetFormState) {
        reset(getValues());
      }
    },
    [shouldResetFormState, getValues, reset],
  );

  React.useEffect(
    function registerLogo() {
      register(FORM_NAMES.logo);
    },
    [register],
  );

  const getAccountTypeText = () => {
    if (!user) {
      return '...';
    }

    if (isAccountOwner) {
      return t('owner');
    }

    if (isAccountCollaborator) {
      return t('collaborator');
    }

    return t('manager');
  };

  const getAccountTypeTooltipText = () => {
    if (!user) {
      return '...';
    }

    if (isAccountOwner) {
      return t('what_owner_can');
    }

    if (isAccountCollaborator) {
      return t('what_collaborator_can');
    }

    return t('what_manager_can');
  };

  const handleFileSelect = (event: any) => {
    const {target} = event;

    if (target?.files?.length) {
      const nextLogo = target.files[0];
      setValue(FORM_NAMES.logo, nextLogo, {
        shouldDirty: true,
      });
    }
  };

  const removeCustomLogo = () => {
    setValue(FORM_NAMES.logo, '', {
      shouldDirty: true,
    });
    closeRemoveLogoModal();
  };

  const deleteAccount = async () => {
    setDeletingAccountStatus('loading');

    const {error} = await api.users.deleteMe();

    if (error) {
      setDeletingAccountStatus('idle');
      toastResponseError(error);
      return;
    }
    logout();
  };

  const getLogoPayload = async (formData: FormTypes) => {
    const logo = formData[FORM_NAMES.logo];

    if (typeof logo === 'string') {
      if (!logo && user?.picture) {
        return {
          delete_picture: true,
        };
      }

      if (!logo || logo.startsWith('https://')) {
        return {};
      }
    }

    const encodedLogo = await getBase64(formData[FORM_NAMES.logo] as File);

    return {
      picture_file: encodedLogo,
    };
  };

  const getAccountPayload = async (formData: FormTypes) => {
    const logoPayload = await getLogoPayload(formData);

    return {
      ...formData,
      ...logoPayload,
      phone: formData[FORM_NAMES.phone],
      [FORM_NAMES.phoneNumber]: undefined,
      [FORM_NAMES.logo]: undefined,
    };
  };

  const updateAccountDetails = async (formData: FormTypes) => {
    setStatus('loading');
    const accountPayload = await getAccountPayload(formData);
    const {error} = await updateAccount(accountPayload);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('idle');

      displayError(error);
      return;
    }

    setStatus('success');
  };

  const onSubmit = (formData: FormTypes) => {
    updateAccountDetails(formData);
  };

  return (
    <>
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={closeChangePasswordModal}
          isOpen={isChangePasswordModalOpen}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DetailsSection title={<div>{t('account_details')} </div>}>
          <Content>
            <FieldsWrapper>
              <AccountType>
                {t('type_of_account')}: <span>{getAccountTypeText()}</span>{' '}
                <AccountTypeTooltip content={getAccountTypeTooltipText()} />
              </AccountType>
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.name, {
                    required: t('required') as string,
                    pattern: {
                      value: PATTERNS.name,
                      message: t('cant_contain_number_and_symbols'),
                    },
                  })}
                  control={control}
                  error={errors[FORM_NAMES.name]?.message}
                  disabled={false}
                  placeholder={t('enter_name')}
                  label={t('name')}
                />
              </FieldWrapper>
              <FieldWrapper>
                <InputController
                  tooltip={<Tooltip content={t('email_tooltip')} />}
                  {...register(FORM_NAMES.email, {
                    required: t('required') as string,
                    pattern: {
                      value: PATTERNS.email,
                      message: t('invalid_email'),
                    },
                  })}
                  control={control}
                  error={errors[FORM_NAMES.email]?.message}
                  disabled={false}
                  placeholder={t('enter_email')}
                  label={t('email')}
                  readOnly={true}
                />
              </FieldWrapper>
              <FieldWrapper>
                <Controller
                  control={control}
                  name={FORM_NAMES.phone}
                  render={({field, fieldState: {error}}) => {
                    return (
                      <PhoneInput
                        {...field}
                        label={i18n.t('phone_number')}
                        placeholder={t('enter_your_phone_number')}
                        defaultCode={watch(FORM_NAMES.phoneCode)}
                        defaultInputValue={watch(FORM_NAMES.phoneNumber)}
                        error={error}
                      />
                    );
                  }}
                />
              </FieldWrapper>
              <Hr />
            </FieldsWrapper>
            {isAccountOwner && (
              <div>
                <FlexContainer>
                  <LogoTitle>{t('logo')}</LogoTitle>
                  <AccountTypeTooltip content={t('logo_tooltip')} />
                </FlexContainer>
                <LogoContent>
                  <LogoContainer whiteBg={Boolean(logo)}>
                    {logo ? (
                      <CustomLogoImage src={getFileImageSrc(logo)} alt="Any" />
                    ) : (
                      <LogoPlaceholder>{t('your_logo')}</LogoPlaceholder>
                    )}
                    {logo && (
                      <UndoButton
                        secondary
                        type="button"
                        onClick={openRemoveLogoModal}
                        label={
                          <>
                            <img src={rubbishIcon} alt="Trash" />
                          </>
                        }
                      />
                    )}
                  </LogoContainer>
                  <LogoDetails>
                    <div>{t('size')}: 150px</div>
                    <div>Format: JPG,PNG</div>
                  </LogoDetails>
                  <LogoButtonsWrapper>
                    <div>
                      <AddLogoFileInput
                        secondary
                        onChange={handleFileSelect}
                        icon={''}
                        label={
                          Boolean(watch(FORM_NAMES.logo))
                            ? t('change_logo')
                            : t('add_logo')
                        }
                        accept="image/*"
                      />
                    </div>
                  </LogoButtonsWrapper>
                </LogoContent>
              </div>
            )}
          </Content>
          <FlexContainer>
            <ChangePasswordFlexContainer>
              <PasswordFlexContainer>
                <Name>Password:</Name>
                <PasswordInput disabled type="password" value={'*******'} />
              </PasswordFlexContainer>
              <ChangePasswordButtonWrapper>
                {!isChangePasswordModalOpen && (
                  <ChangePasswordButton onClick={openChangePasswordModal}>
                    {t('change_password')}
                  </ChangePasswordButton>
                )}
              </ChangePasswordButtonWrapper>
            </ChangePasswordFlexContainer>
          </FlexContainer>
        </DetailsSection>
        <Footer>
          <LogoutButton
            secondary
            onClick={logout}
            icon={<img src={logoutIcon} alt="" height={14} width={19} />}
            label={t('logout')}
          />
          {isAccountOwner && (
            <DeleteAccountButton
              danger
              onClick={openDeleteAccountModal}
              icon={<img src={rubbishWhiteIcon} alt="" width={12} height={16} />}
              label={t('delete_account')}
            />
          )}
        </Footer>
        {(formState.isDirty || !isIdle) && !isErrorModalOpen && (
          <FloatingSaveButton status={status} />
        )}
        {isRemoveLogoModalOpen && (
          <Modal
            open
            closeOnDocumentClick
            closeOnEscape
            iconSrc={warningIcon}
            iconProps={{
              height: 84,
              width: 84,
              alt: '',
            }}
            title={t('are_you_sure')}
            text={t('your_current_logo_will_be_deleted')}
            onClose={closeRemoveLogoModal}
          >
            <ModalTwoButtonsWrapper>
              <ModalButton danger label={t('delete_logo')} onClick={removeCustomLogo} />
              <ModalButton secondary label={t('cancel')} onClick={closeRemoveLogoModal} />
            </ModalTwoButtonsWrapper>
          </Modal>
        )}
        {isDeleteAccountModalOpen && (
          <Modal
            closeOnDocumentClick
            closeOnEscape
            iconSrc={deleteAccountIcon}
            iconAlt="User icon in trash"
            iconProps={{
              height: 101,
              width: 84,
            }}
            onClose={closeDeleteAccountModal}
            title={t('are_you_sure')}
            text={t('all_the_info_will_be_lost_this_cannot_be_undone')}
          >
            <ModalTwoButtonsWrapper>
              {isDeletingAccount ? (
                <Loader height={40} width={40} />
              ) : (
                <>
                  <DeleteAccountModalButton
                    label={t('delete_my_account')}
                    onClick={deleteAccount}
                  />
                  <ModalButton
                    secondary
                    label={t('cancel')}
                    onClick={closeDeleteAccountModal}
                  />
                </>
              )}
            </ModalTwoButtonsWrapper>
          </Modal>
        )}
        <ErrorModal />
      </form>
    </>
  );
}

export {AccountDetailsSection};
