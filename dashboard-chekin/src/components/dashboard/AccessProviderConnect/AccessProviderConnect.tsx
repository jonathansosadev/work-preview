import React from 'react';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import alikesIcon from '../../../assets/akiles-logo.png';
import keycafeIcon from '../../../assets/keycafe-logo.png';
import keynestIcon from '../../../assets/keynest-logo.png';
import nukiIcon from '../../../assets/nuki-logo.png';
import omnitecIcon from '../../../assets/omnitec-logo.svg';
import homeitIcon from '../../../assets/homeit-logo.png';
import remotelockIcon from '../../../assets/remotelock-logo.png';
import yacanIcon from '../../../assets/yacan-logo.svg';
import mondiseIcon from '../../../assets/logo-mondise.png';
import saltoIcon from '../../../assets/logo-salto.svg';
import ttlockIcon from '../../../assets/logo-ttlock.png';
import eleaIcon from '../../../assets/logo-alea.png';
import roommatikIcon from '../../../assets/logo-roommatik.png';
import BackButton from '../BackButton';
import i18n from '../../../i18n';
import api from '../../../api';
import {useHistory} from 'react-router-dom';
import {LOCK_VENDOR_OPTIONS, LOCK_VENDORS} from '../../../utils/constants';
import {useIsMounted, useStatus} from '../../../utils/hooks';
import {
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import Loader from '../../common/Loader';
import {InputController} from '../Input';
import {toast} from 'react-toastify';
import {
  Wrapper,
  BackButtonWrapper,
  HeaderWrapper,
  Content,
  ContentItem,
  ProviderLogo,
  ProviderLogoWrapper,
  ProviderDescription,
  AccessProviderForm,
  ConnectHeader,
  SingleFieldWrapper,
  SubmitButtonWrapper,
  SubmitButton,
  ProviderDescriptionLink,
} from './styled';

const AKILES_OAUTH_URL = 'https://auth.akiles.app/oauth2/auth';
const ALIKES_CLIENT_ID = process.env.REACT_APP_AKILES_CLIENT_ID;
const AKILES_REDIRECT_URL = process.env.REACT_APP_AKILES_REDIRECT_URL;

const REMOTELOCK_OAUTH_URL = 'https://connect.remotelock.com/oauth/authorize';
const REMOTELOCK_CLIENT_ID = process.env.REACT_APP_REMOTELOCK_CLIENT_ID;
const REMOTELOCK_REDIRECT_URI = process.env.REACT_APP_REMOTELOCK_REDIRECT_URI;

const NUKI_OAUTH_URL = 'https://api.nuki.io/oauth/authorize';
const NUKI_CLIENT_ID = process.env.REACT_APP_NUKI_CLIENT_ID;
const NUKI_REDIRECT_URI = process.env.REACT_APP_NUKI_REDIRECT_URI;

const OMNITEC_WEBSITE = 'https://www.omnitecsystems.com/';
const AKILES_WEBSITE = 'https://akiles.app/';
const KEYNEST_WEBSITE = 'https://keynest.com/';
const NUKI_WEBSITE = 'https://nuki.io/';
const HOMEIT_WEBSITE = 'https://homeit.io/';
const REMOTELOCK_WEBSITE = 'https://www.remotelock.com/';
const SALTO_WEBSITE = 'https://saltosystems.com/';
const TTLOCK_WEBSITE = 'https://www.omnitecsystems.com/';
const MONDISE_WEBSITE = 'https://www.omnitecsystems.com/';
const ROOMATIC_WEBSITE = 'https://www.roommatik.com/';
const ELEA_WEBSITE = 'https://eleaopen.com/';
const YACAN_WEBSITE = 'https://www.yacan.es/';

type AccessProviderConnectProps = {
  type: string;
};

enum FORM_NAMES {
  apiKey = 'token',
  ipAddress = 'ip_address',
  port = 'port',
  accountName = 'account_name',
  username = 'username',
  email = 'email',
  password = 'password',
  oauthCode = 'oauth_code',
  oauthState = 'oauth_state',
}

type FormTypes = {
  [FORM_NAMES.apiKey]: string;
  [FORM_NAMES.ipAddress]: string;
  [FORM_NAMES.port]: string;
  [FORM_NAMES.accountName]: string;
  [FORM_NAMES.username]: string;
  [FORM_NAMES.email]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.oauthCode]: string;
  [FORM_NAMES.oauthState]: string;
};

const INIT_DISPLAY_FIELDS: {[key: string]: boolean} = {
  [FORM_NAMES.accountName]: true,
  [FORM_NAMES.ipAddress]: false,
  [FORM_NAMES.port]: false,
  [FORM_NAMES.apiKey]: false,
  [FORM_NAMES.username]: false,
  [FORM_NAMES.email]: false,
  [FORM_NAMES.password]: false,
  [FORM_NAMES.oauthCode]: false,
  [FORM_NAMES.oauthState]: false,
};

function getDisplayFields(provider: string) {
  switch (provider) {
    case LOCK_VENDORS.nuki: {
      return INIT_DISPLAY_FIELDS;
    }
    case LOCK_VENDORS.homeit:
    case LOCK_VENDORS.keynest: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.apiKey]: true,
      };
    }
    case LOCK_VENDORS.omnitec:
    case LOCK_VENDORS.mondise:
    case LOCK_VENDORS.ttlock: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.username]: true,
        [FORM_NAMES.password]: true,
      };
    }
    case LOCK_VENDORS.keyless:
    case LOCK_VENDORS.keycafe: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.email]: true,
        [FORM_NAMES.apiKey]: true,
      };
    }
    case LOCK_VENDORS.salto: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.ipAddress]: true,
        [FORM_NAMES.port]: true,
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
  [FORM_NAMES.ipAddress]: i18n.t('required'),
  [FORM_NAMES.port]: i18n.t('required'),
  [FORM_NAMES.username]: i18n.t('required'),
  [FORM_NAMES.email]: i18n.t('required'),
  [FORM_NAMES.password]: i18n.t('required'),
  [FORM_NAMES.oauthCode]: i18n.t('required'),
  [FORM_NAMES.oauthState]: i18n.t('required'),
};

function getRequiredFields() {
  return INIT_REQUIRED_FIELDS;
}

function getFields(provider: string) {
  const display = getDisplayFields(provider);
  const required = getRequiredFields();

  return {display, required};
}

const OMNITEC_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('remote_access_to_the_property')}
      <ProviderDescriptionLink target="_blank" href={OMNITEC_WEBSITE}>
        ({OMNITEC_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const KEYNEST_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('simple_and_secure_key_exchange')}
      <ProviderDescriptionLink target="_blank" href={KEYNEST_WEBSITE}>
        ({KEYNEST_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const AKILES_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('smart_lock_system_connected')}
      <ProviderDescriptionLink target="_blank" href={AKILES_WEBSITE}>
        ({AKILES_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const KEYCAFE_DESCRIPTION = (
  <>
    <ProviderDescription>{i18n.t('key_management_system_with')}</ProviderDescription>
  </>
);

const NUKI_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('nuki_keyless_access')}
      <ProviderDescriptionLink target="_blank" href={NUKI_WEBSITE}>
        ({NUKI_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const HOMEIT_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('a_multi_sided_platform')}
      <ProviderDescriptionLink target="_blank" href={HOMEIT_WEBSITE}>
        ({HOMEIT_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const REMOTELOCK_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('remotelock_sets')}
      <ProviderDescriptionLink target="_blank" href={REMOTELOCK_WEBSITE}>
        ({REMOTELOCK_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const YACAN_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('salto_short_description')}
      <ProviderDescriptionLink target="_blank" href={YACAN_WEBSITE}>
        ({YACAN_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const SALTO_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('salto_short_description')}
      <ProviderDescriptionLink target="_blank" href={SALTO_WEBSITE}>
        ({SALTO_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const TTLOCK_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('ttlock_short_description')}
      <ProviderDescriptionLink target="_blank" href={TTLOCK_WEBSITE}>
        ({TTLOCK_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const MONDISE_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('mondise_short_description')}
      <ProviderDescriptionLink target="_blank" href={MONDISE_WEBSITE}>
        ({MONDISE_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const ROOMATIC_DESCRIPTION = (
  <>
    <ProviderDescription>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vitae commodo erat.
      <ProviderDescriptionLink target="_blank" href={ROOMATIC_WEBSITE}>
        ({ROOMATIC_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const ELEA_DESCRIPTION = (
  <>
    <ProviderDescription>
      {i18n.t('elea_short_description')}
      <ProviderDescriptionLink target="_blank" href={ELEA_WEBSITE}>
        ({ELEA_WEBSITE})
      </ProviderDescriptionLink>
    </ProviderDescription>
  </>
);

const LOGOS: {[key: string]: string} = {
  [LOCK_VENDORS.omnitec]: omnitecIcon,
  [LOCK_VENDORS.keynest]: keynestIcon,
  [LOCK_VENDORS.akiles]: alikesIcon,
  [LOCK_VENDORS.keycafe]: keycafeIcon,
  [LOCK_VENDORS.nuki]: nukiIcon,
  [LOCK_VENDORS.homeit]: homeitIcon,
  [LOCK_VENDORS.remotelock]: remotelockIcon,
  [LOCK_VENDORS.yacan]: yacanIcon,
  [LOCK_VENDORS.mondise]: mondiseIcon,
  [LOCK_VENDORS.salto]: saltoIcon,
  [LOCK_VENDORS.ttlock]: ttlockIcon,
  [LOCK_VENDORS.elea]: eleaIcon,
  [LOCK_VENDORS.roomatic]: roommatikIcon,
};

const PROVIDERS_DESCRIPTIONS: {[key: string]: JSX.Element} = {
  [LOCK_VENDORS.omnitec]: OMNITEC_DESCRIPTION,
  [LOCK_VENDORS.keynest]: KEYNEST_DESCRIPTION,
  [LOCK_VENDORS.akiles]: AKILES_DESCRIPTION,
  [LOCK_VENDORS.keycafe]: KEYCAFE_DESCRIPTION,
  [LOCK_VENDORS.nuki]: NUKI_DESCRIPTION,
  [LOCK_VENDORS.homeit]: HOMEIT_DESCRIPTION,
  [LOCK_VENDORS.remotelock]: REMOTELOCK_DESCRIPTION,
  [LOCK_VENDORS.yacan]: YACAN_DESCRIPTION,
  [LOCK_VENDORS.mondise]: MONDISE_DESCRIPTION,
  [LOCK_VENDORS.salto]: SALTO_DESCRIPTION,
  [LOCK_VENDORS.ttlock]: TTLOCK_DESCRIPTION,
  [LOCK_VENDORS.elea]: ELEA_DESCRIPTION,
  [LOCK_VENDORS.roomatic]: ROOMATIC_DESCRIPTION,
};

function AccessProviderConnect({type}: AccessProviderConnectProps) {
  const {t} = useTranslation();
  const history = useHistory();
  const isMounted = useIsMounted();
  const {isLoading, setStatus} = useStatus();
  const [fields] = React.useState(() => {
    return getFields(type);
  });
  const {
    handleSubmit,
    register,
    control,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });

  const goBack = React.useCallback(() => {
    history.push('/marketplace/access-providers');
  }, [history]);

  const getLockUserPayload = React.useCallback(
    (formData: Partial<FormTypes> | object) => {
      return {
        ...formData,
        vendor: type,
      };
    },
    [type],
  );

  const createLockUser = React.useCallback(
    async (formData: Partial<FormTypes> | object) => {
      const payload = getLockUserPayload(formData);
      const {error} = await api.locks.createLockUser(payload);

      if (!isMounted.current) {
        return;
      }

      setStatus('idle');

      if (error) {
        toastResponseError(error);
      } else {
        toast.success(t('connected'));
        goBack();
      }
    },
    [getLockUserPayload, goBack, isMounted, setStatus, t],
  );

  React.useEffect(() => {
    async function checkUrl() {
      setStatus('loading');

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      switch (type) {
        case LOCK_VENDORS.akiles:
          if (code && state) {
            const dataToCreateLockUser = {
              account_name: state ? state.split(',')[1] : '',
              oauth_code: code,
            };
            return await createLockUser(dataToCreateLockUser);
          }
          break;
        case LOCK_VENDORS.remotelock:
          if (code) {
            const dataToCreateLockUser = {
              oauth_code: code,
              account_name: state || '',
            };
            return await createLockUser(dataToCreateLockUser);
          }
          break;
        case LOCK_VENDORS.nuki:
          if (code && state) {
            const dataToCreateLockUser = {
              account_name: state || '',
              oauth_code: code,
            };
            return await createLockUser(dataToCreateLockUser);
          }
          break;
        default:
          break;
      }
      setStatus('idle');
    }

    checkUrl();
  }, [history, createLockUser, type, setStatus, t]);

  const redirectToAkilesOauth = (accountName?: string) => {
    const redirectUrl = `${AKILES_OAUTH_URL}?client_id=${ALIKES_CLIENT_ID}&redirect_url=${AKILES_REDIRECT_URL}&response_type=code&scope=full_read_write offline&state=chekin_state,${accountName}`;
    window.location.replace(redirectUrl);
  };

  const redirectToRemoteLockOauth = (accountName?: string) => {
    const redirectUrl = `${REMOTELOCK_OAUTH_URL}?client_id=${REMOTELOCK_CLIENT_ID}&redirect_uri=${REMOTELOCK_REDIRECT_URI}&response_type=code&state=${accountName}`;
    window.location.replace(redirectUrl);
  };

  const redirectToNukiOauth = (accountName?: string) => {
    const redirectUrl = `${NUKI_OAUTH_URL}?response_type=code&client_id=${NUKI_CLIENT_ID}&redirect_uri=${NUKI_REDIRECT_URI}&scope=account%20notification%20smartlock%20smartlock.readOnly%20smartlock.action%20smartlock.auth%20smartlock.config%20smartlock.log`;
    window.location.replace(redirectUrl);
  };

  const onSubmit = async (formData: Partial<FormTypes>) => {
    setStatus('loading');

    switch (type) {
      case LOCK_VENDORS.akiles:
        redirectToAkilesOauth(formData.account_name);
        break;
      case LOCK_VENDORS.remotelock:
        redirectToRemoteLockOauth(formData.account_name);
        break;
      case LOCK_VENDORS.nuki:
        redirectToNukiOauth(formData.account_name);
        break;
      default:
        await createLockUser(formData);
        break;
    }
  };

  return (
    <Wrapper>
      <BackButtonWrapper>
        <BackButton link="/marketplace/access-providers" />
      </BackButtonWrapper>
      <HeaderWrapper>
        <ConnectHeader>
          {t('connect_with_')}{' '}
          {LOCK_VENDOR_OPTIONS[type as keyof typeof LOCK_VENDOR_OPTIONS].label}
        </ConnectHeader>
      </HeaderWrapper>
      <Content>
        <ContentItem>
          <ProviderLogoWrapper>
            <ProviderLogo src={LOGOS[type]} />
          </ProviderLogoWrapper>
          {PROVIDERS_DESCRIPTIONS[type]}
        </ContentItem>
        <ContentItem>
          <AccessProviderForm onSubmit={handleSubmit(onSubmit)}>
            {fields.display[FORM_NAMES.apiKey] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.apiKey, {
                    required: fields.required[FORM_NAMES.apiKey],
                  })}
                  label={getRequiredOrOptionalFieldLabel(
                    t('api_key'),
                    fields.required[FORM_NAMES.apiKey],
                  )}
                  control={control}
                  placeholder={t('enter_key')}
                  error={errors[FORM_NAMES.apiKey]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            {fields.display[FORM_NAMES.ipAddress] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.ipAddress, {
                    required: fields.required[FORM_NAMES.ipAddress],
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    t('ip_address'),
                    fields.required[FORM_NAMES.ipAddress],
                  )}
                  placeholder={t('enter_ip_address')}
                  error={errors[FORM_NAMES.ipAddress]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            {fields.display[FORM_NAMES.port] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.port, {
                    required: fields.required[FORM_NAMES.port],
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    t('port'),
                    fields.required[FORM_NAMES.port],
                  )}
                  placeholder={t('enter_port')}
                  error={errors[FORM_NAMES.port]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            {fields.display[FORM_NAMES.username] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.username, {
                    required: fields.required[FORM_NAMES.username],
                  })}
                  label={getRequiredOrOptionalFieldLabel(
                    t('username'),
                    fields.required[FORM_NAMES.username],
                  )}
                  control={control}
                  placeholder={t('enter_username')}
                  error={errors[FORM_NAMES.username]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            {fields.display[FORM_NAMES.email] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.email, {
                    required: fields.required[FORM_NAMES.email],
                  })}
                  label={getRequiredOrOptionalFieldLabel(
                    t('email'),
                    fields.required[FORM_NAMES.email],
                  )}
                  control={control}
                  placeholder={t('enter_email')}
                  error={errors[FORM_NAMES.email]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            {fields.display[FORM_NAMES.password] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.password, {
                    required: fields.required[FORM_NAMES.password],
                  })}
                  label={getRequiredOrOptionalFieldLabel(
                    t('password'),
                    fields.required[FORM_NAMES.password],
                  )}
                  control={control}
                  type="password"
                  placeholder={t('enter_password')}
                  error={errors[FORM_NAMES.password]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            {fields.display[FORM_NAMES.oauthState] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.oauthState, {
                    required: fields.required[FORM_NAMES.oauthState],
                  })}
                  control={control}
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
                <InputController
                  {...register(FORM_NAMES.oauthCode, {
                    required: fields.required[FORM_NAMES.oauthCode],
                  })}
                  control={control}
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
            {fields.display[FORM_NAMES.accountName] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.accountName, {
                    required: fields.required[FORM_NAMES.accountName],
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    t('account_name'),
                    fields.required[FORM_NAMES.accountName],
                  )}
                  placeholder={t('enter_name')}
                  error={errors[FORM_NAMES.accountName]?.message}
                  disabled={isLoading}
                />
              </SingleFieldWrapper>
            )}
            <SubmitButtonWrapper>
              {isLoading ? (
                <Loader height={37} width={37} />
              ) : (
                <SubmitButton type={'submit'} label={t('connect')} />
              )}
            </SubmitButtonWrapper>
          </AccessProviderForm>
        </ContentItem>
      </Content>
    </Wrapper>
  );
}

export {AccessProviderConnect};
