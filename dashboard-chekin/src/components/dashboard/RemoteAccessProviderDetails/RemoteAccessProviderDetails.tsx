import React from 'react';
import {useTranslation} from 'react-i18next';
import {useForm, FormProvider} from 'react-hook-form';
import {useQueryClient} from 'react-query';
import api from '../../../api';
import i18n from '../../../i18n';
import {useStatus} from '../../../utils/hooks';
import {getRequiredOrOptionalFieldLabel, toastResponseError} from '../../../utils/common';
import {useIsMounted} from '../../../utils/hooks';
import {LOCK_VENDORS} from '../../../utils/constants';
import Input from '../Input';
import InputField from '../InputField';
import ModalButton from '../ModalButton';
import Loader from '../../common/Loader';
import {
  FieldsWrapper,
  ButtonsWrapper,
  NextButton,
  SingleFieldWrapper,
} from '../RemoteAccessSelectProviderModal/styled';

enum FORM_NAMES {
  apiKey = 'token',
  accountName = 'account_name',
  username = 'username',
  email = 'email',
  password = 'password',
  oauthCode = 'oauth_code',
  oauthState = 'oauth_state',
  ipAddress = 'ip_address',
  port = 'port',
}

type FormTypes = {
  [FORM_NAMES.apiKey]: string;
  [FORM_NAMES.accountName]: string;
  [FORM_NAMES.username]: string;
  [FORM_NAMES.email]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.oauthCode]: string;
  [FORM_NAMES.oauthState]: string;
  [FORM_NAMES.ipAddress]: string;
  [FORM_NAMES.port]: number;
};

const INIT_DISPLAY_FIELDS: {[key: string]: boolean} = {
  [FORM_NAMES.accountName]: true,
  [FORM_NAMES.apiKey]: false,
  [FORM_NAMES.username]: false,
  [FORM_NAMES.email]: false,
  [FORM_NAMES.password]: false,
  [FORM_NAMES.oauthCode]: false,
  [FORM_NAMES.oauthState]: false,
  [FORM_NAMES.ipAddress]: false,
  [FORM_NAMES.port]: false,
};

function getDisplayFields(provider?: string) {
  switch (provider) {
    case LOCK_VENDORS.nuki:
    case LOCK_VENDORS.homeit:
    case LOCK_VENDORS.keynest: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.apiKey]: true,
      };
    }
    case LOCK_VENDORS.akiles: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.oauthCode]: true,
        [FORM_NAMES.oauthState]: true,
      };
    }
    case LOCK_VENDORS.omnitec:
    case LOCK_VENDORS.ttlock:
    case LOCK_VENDORS.yacan:
    case LOCK_VENDORS.mondise: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.username]: true,
        [FORM_NAMES.password]: true,
      };
    }
    case LOCK_VENDORS.keyless: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.username]: true,
        [FORM_NAMES.apiKey]: true,
      };
    }
    case LOCK_VENDORS.keycafe: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.email]: true,
        [FORM_NAMES.apiKey]: true,
      };
    }
    case LOCK_VENDORS.manualBox: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.accountName]: true,
      };
    }
    case LOCK_VENDORS.remotelock: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.oauthCode]: true,
      };
    }
    case LOCK_VENDORS.salto: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.ipAddress]: true,
        [FORM_NAMES.port]: true,
      };
    }
    case LOCK_VENDORS.elea: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.apiKey]: true,
      };
    }
    default: {
      return INIT_DISPLAY_FIELDS;
    }
  }
}

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.accountName]: false,
  [FORM_NAMES.apiKey]: i18n.t('required'),
  [FORM_NAMES.username]: i18n.t('required'),
  [FORM_NAMES.email]: i18n.t('required'),
  [FORM_NAMES.password]: i18n.t('required'),
  [FORM_NAMES.oauthCode]: i18n.t('required'),
  [FORM_NAMES.oauthState]: i18n.t('required'),
  [FORM_NAMES.ipAddress]: i18n.t('required'),
  [FORM_NAMES.port]: i18n.t('required'),
};

function getRequiredFields() {
  return INIT_REQUIRED_FIELDS;
}

function getFields(provider?: string) {
  const display = getDisplayFields(provider);
  const required = getRequiredFields();

  return {display, required};
}

type RemoteAccessProviderDetailsProps = {
  selectedProvider: string;
  onFinish: () => any;
  goBackFromProviderDetails: () => void;
  isEdit?: boolean;
  lockAccountId?: string;
};

function RemoteAccessProviderDetails({
  selectedProvider,
  onFinish,
  goBackFromProviderDetails,
  isEdit,
  lockAccountId,
}: RemoteAccessProviderDetailsProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const formMethods = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {
    handleSubmit,
    register,
    setValue,
    formState: {errors},
  } = formMethods;
  const [fields, setFields] = React.useState(() => {
    return getFields();
  });
  const {isLoading, setStatus} = useStatus();
  const isMounted = useIsMounted();

  React.useEffect(() => {
    const nextFields = getFields(selectedProvider);
    setFields(nextFields);
  }, [selectedProvider]);

  React.useEffect(() => {
    if (selectedProvider === LOCK_VENDORS.manualBox) {
      setValue(FORM_NAMES.accountName, t('manual_box'));
    }
  }, [selectedProvider, setValue, t]);

  const getLockUserPayload = (formData: Partial<FormTypes>) => {
    return {
      ...formData,
      vendor: selectedProvider,
    };
  };

  const getSaltoPayload = (formData: Partial<FormTypes>) => {
    return {
      account_name: formData[FORM_NAMES.accountName],
      vendor: selectedProvider,
      endpoint: `${formData[FORM_NAMES.ipAddress]}:${formData[FORM_NAMES.port]}`,
    };
  };

  const submitLockUser = async (formData: Partial<FormTypes>) => {
    let payload;
    let lockError;

    if (selectedProvider === LOCK_VENDORS.salto) {
      payload = getSaltoPayload(formData);
    } else {
      payload = getLockUserPayload(formData);
    }

    if (isEdit && lockAccountId) {
      const {error} = await api.locks.updateLockUser(lockAccountId, payload);
      lockError = error;
    } else {
      const {error} = await api.locks.createLockUser(payload);
      lockError = error;
    }

    if (!isMounted.current) {
      return;
    }

    if (lockError) {
      toastResponseError(lockError);
    } else {
      await queryClient.refetchQueries('lockUsers');
    }

    return lockError;
  };

  const onSubmit = async (formData: Partial<FormTypes>) => {
    setStatus('loading');

    const error = await submitLockUser(formData);
    if (!error) {
      await onFinish();
    }

    setStatus('idle');
  };

  return (
    <div>
      <FormProvider {...formMethods}>
        <FieldsWrapper>
          {fields.display[FORM_NAMES.apiKey] && (
            <SingleFieldWrapper>
              <Input
                {...register(FORM_NAMES.apiKey, {
                  required: fields.required[FORM_NAMES.apiKey],
                })}
                label={getRequiredOrOptionalFieldLabel(
                  t('api_key'),
                  fields.required[FORM_NAMES.apiKey],
                )}
                placeholder={t('enter_key')}
                error={errors[FORM_NAMES.apiKey]?.message}
                disabled={isLoading}
              />
            </SingleFieldWrapper>
          )}
          {fields.display[FORM_NAMES.username] && (
            <SingleFieldWrapper>
              <Input
                {...register(FORM_NAMES.username, {
                  required: fields.required[FORM_NAMES.username],
                })}
                label={getRequiredOrOptionalFieldLabel(
                  t('username'),
                  fields.required[FORM_NAMES.username],
                )}
                placeholder={t('enter_username')}
                error={errors[FORM_NAMES.username]?.message}
                disabled={isLoading}
              />
            </SingleFieldWrapper>
          )}
          {fields.display[FORM_NAMES.email] && (
            <SingleFieldWrapper>
              <Input
                {...register(FORM_NAMES.email, {
                  required: fields.required[FORM_NAMES.email],
                })}
                label={getRequiredOrOptionalFieldLabel(
                  t('email'),
                  fields.required[FORM_NAMES.email],
                )}
                placeholder={t('enter_email')}
                error={errors[FORM_NAMES.email]?.message}
                disabled={isLoading}
              />
            </SingleFieldWrapper>
          )}
          {fields.display[FORM_NAMES.password] && (
            <SingleFieldWrapper>
              <Input
                {...register(FORM_NAMES.password, {
                  required: fields.required[FORM_NAMES.password],
                })}
                label={getRequiredOrOptionalFieldLabel(
                  t('password'),
                  fields.required[FORM_NAMES.password],
                )}
                type="password"
                placeholder={t('enter_password')}
                error={errors[FORM_NAMES.password]?.message}
                disabled={isLoading}
              />
            </SingleFieldWrapper>
          )}
          {fields.display[FORM_NAMES.oauthState] && (
            <SingleFieldWrapper>
              <Input
                {...register(FORM_NAMES.oauthState, {
                  required: fields.required[FORM_NAMES.oauthState],
                })}
                label={getRequiredOrOptionalFieldLabel(
                  t('email'),
                  fields.required[FORM_NAMES.oauthState],
                )}
                placeholder={t('enter_email')}
                error={errors[FORM_NAMES.oauthState]?.message}
                disabled={isLoading}
              />
            </SingleFieldWrapper>
          )}
          {fields.display[FORM_NAMES.oauthCode] && (
            <SingleFieldWrapper>
              <Input
                {...register(FORM_NAMES.oauthCode, {
                  required: fields.required[FORM_NAMES.oauthCode],
                })}
                label={getRequiredOrOptionalFieldLabel(
                  t('oauth_code'),
                  fields.required[FORM_NAMES.oauthCode],
                )}
                placeholder={t('enter_code')}
                error={errors[FORM_NAMES.oauthCode]?.message}
                disabled={isLoading}
              />
            </SingleFieldWrapper>
          )}
          {fields.display[FORM_NAMES.ipAddress] && (
            <InputField
              name={FORM_NAMES.ipAddress}
              label={t('ip_address')}
              placeholder={t('enter_ip_address')}
              disabled={isLoading}
              fields={fields}
            />
          )}
          {fields.display[FORM_NAMES.port] && (
            <InputField
              name={FORM_NAMES.port}
              label={t('port')}
              placeholder={t('enter_port')}
              disabled={isLoading}
              fields={fields}
            />
          )}
          {fields.display[FORM_NAMES.accountName] && (
            <InputField
              name={FORM_NAMES.accountName}
              label={t('account_name')}
              placeholder={t('enter_name')}
              disabled={isLoading}
              fields={fields}
            />
          )}
        </FieldsWrapper>
      </FormProvider>
      <ButtonsWrapper>
        {isLoading ? (
          <Loader height={37} width={37} />
        ) : (
          <>
            <NextButton visible label={t('next')} onClick={handleSubmit(onSubmit)} />
            <ModalButton
              secondary
              label={t('cancel')}
              onClick={goBackFromProviderDetails}
            />
          </>
        )}
      </ButtonsWrapper>
    </div>
  );
}

export {RemoteAccessProviderDetails};
