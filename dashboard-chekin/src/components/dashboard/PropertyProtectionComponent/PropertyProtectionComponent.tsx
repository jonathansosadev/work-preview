import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  Wrapper,
  HeaderWrapper,
  Content,
  ContentItem,
  ProviderLogo,
  ProviderLogoWrapper,
  AccessProviderForm,
  SingleFieldWrapper,
  SubmitButtonWrapper,
  SubmitButton,
  ProviderDescriptionLink,
  HeaderWrapperText,
  ListDotElement,
} from './styled';
import superHogLogo from '../../../assets/superhog-logo.png';
import BackButton from '../BackButton';
import i18n from '../../../i18n';
import api, { queryFetcher } from '../../../api';
import { useHistory } from 'react-router-dom';
import { LOCK_PROPERTY_PROTECTIONS, LOCK_PROPERTY_PROTECTIONS_OPTIONS } from '../../../utils/constants';
import { useErrorToast, useModalControls, useStatus } from '../../../utils/hooks';
import {
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import Loader from '../../common/Loader';
import { InputController } from '../Input';
import SuperHogValidationsModal from '../SuperHogValidationsModal';
import { ShortHousing, SuperHogHousing } from 'utils/types';
import { useQuery } from 'react-query';

// const SUPER_HOG_WEBSITE = 'https://www.omnitecsystems.com/';

type PropertyProtectionComponentProps = {
  type: string;
};


enum FORM_NAMES {
  apiKey = 'token',
  accountName = 'account_name',
  username = 'username',
  email = 'email',
  password = 'password',
  oauthCode = 'oauth_code',
  oauthState = 'oauth_state',
}

type FormTypes = {
  [FORM_NAMES.apiKey]: string;
  [FORM_NAMES.accountName]: string;
  [FORM_NAMES.username]: string;
  [FORM_NAMES.email]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.oauthCode]: string;
  [FORM_NAMES.oauthState]: string;
};

const INIT_DISPLAY_FIELDS: { [key: string]: boolean } = {
  [FORM_NAMES.accountName]: true,
  [FORM_NAMES.apiKey]: false,
  [FORM_NAMES.username]: false,
  [FORM_NAMES.email]: false,
  [FORM_NAMES.password]: false,
  [FORM_NAMES.oauthCode]: false,
  [FORM_NAMES.oauthState]: false,
};

function getDisplayFields(provider: string) {
  switch (provider) {
    case LOCK_PROPERTY_PROTECTIONS.superhub: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.username]: false,
        [FORM_NAMES.email]: true,
        [FORM_NAMES.password]: true,
        [FORM_NAMES.accountName]: false,
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
};


function getRequiredFields() {
  return INIT_REQUIRED_FIELDS;
}

function getFields(provider: string) {
  const display = getDisplayFields(provider);
  const required = getRequiredFields();

  return { display, required };
}

const SUPER_HOG_DESCRIPTION = (
  <>

      <Trans i18nKey="super_hog_description">
        <p>
          Superhog provides advanced guest screening with embedded insurance to vacation rental Hosts, Property Managers, Platforms, Operators and Guests. 
          <br /> 
          <br /> 
          Superhog verifies users using biometric technology and puts protection in place for Guest property damage in the form of our guarantee and deposit.
          <br />
          <br />
          Connect your Superhog account with Chekin to link the properties and send the identity verification data of the guest to Superhog for damage protection validations and see the status directly on the booking details page.
        </p>
        
      </Trans>
      <br />
      <br />
      <strong>{i18n.t('requeriments')}</strong>: 
        <ListDotElement>{i18n.t('identity_verification_premium_text')}</ListDotElement> 
        <ListDotElement> {i18n.t('existing_sueperhog_account_text')}</ListDotElement> 
        <br />
        <strong>{i18n.t('what_chekin_gets')}:</strong>
        <ListDotElement>{i18n.t('listing_information')}</ListDotElement> 
        <ListDotElement>{i18n.t('approved_or_rejected_status')}</ListDotElement>

        <br />
          <strong>{i18n.t('what_we_send_superhog_text')}:</strong> 
        <ListDotElement>{i18n.t('guest_full_name_text')}</ListDotElement> 
        <ListDotElement>{i18n.t('id_ver_biometric_result_text')}</ListDotElement>
        <br /> 
        {i18n.t('more_information_superhog_website')} <a href="https://superhog.com/">https://superhog.com/</a>
        
      {/* <a href="https://superhog.com/"></a> */}
      <ProviderDescriptionLink target="_blank" /*href={OMNITEC_WEBSITE}*/>
        {/* ({OMNITEC_WEBSITE}) */}
      </ProviderDescriptionLink>
  </>
);


const LOGOS: { [key: string]: string } = {
  [LOCK_PROPERTY_PROTECTIONS.superhub]: superHogLogo,
};

const PROVIDERS_DESCRIPTIONS: { [key: string]: JSX.Element } = {
  [LOCK_PROPERTY_PROTECTIONS.superhub]: SUPER_HOG_DESCRIPTION,
};

function fetchHousings() {
  return queryFetcher(api.housings.ENDPOINTS.all(`fields=id,name`));
}

function PropertyProtectionComponent({ type }: PropertyProtectionComponentProps) {
  const { t } = useTranslation();
  const history = useHistory();
  // const isMounted = useIsMounted();
  const [coreId, setCoreId] = React.useState<string>('');
  const { isLoading, setStatus } = useStatus();
  const [fields] = React.useState(() => {
    return getFields(type);
  });
  const [listings, setListings] = React.useState<SuperHogHousing[]>([]);


  const {
    data: housings,
    error: housingsError
  } = useQuery<ShortHousing[]>('housings', fetchHousings);
  useErrorToast(housingsError, {
    notFoundMessage:
      'Requested housings could not be found. Please contact support.',
  });


  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });

  // const goBack = React.useCallback(() => {
  //   history.push('/marketplace/property-protection');
  // }, [history]);

  const getPropertyProtectionPayload = React.useCallback(
    (formData: Partial<FormTypes> | object) => {
      return {
        ...formData,
        vendor: type,
      };
    },
    [type],
  );


  const {
    isOpen: isSuperHogValitadionModalOpen,
    closeModal: closeSuperHogValitadionModalOpen,
    openModal: openSuperHogValitadionModalOpen,
  } = useModalControls();

  const CreatePropertyProtectionUser = React.useCallback(
    async (formData: Partial<FormTypes> | object) => {

      const payload = getPropertyProtectionPayload(formData);
      const { data, error } = await api.propertiesProtections.createPropertyProtectionUser(payload);

      const superHogUserId = data?.id;
      const coreId = data?.core_id;
      if (superHogUserId) {
        setCoreId(coreId)
        const { data, error } = await api.propertiesProtections.getlistings(coreId)
        if (data) {
          setListings(data);
          const state = { origin: 'superhog', success: true, superHogHousings: data };
          openSuperHogValitadionModalOpen();
          if (housings && data.length > 0 && housings?.length > 0) {
            history.push('/marketplace/property-protection', state);
          } else if (housings && (housings.length === 0 || data.length === 0)) {
            openSuperHogValitadionModalOpen();
          }
        }
        setStatus('success');
        if (error) {
          setStatus('success');
          toastResponseError(error);
        }

      }

      if (error) {
        toastResponseError(error.detail);
        setStatus('success');
      }
    },
    [getPropertyProtectionPayload, housings, openSuperHogValitadionModalOpen, history, setStatus],
  );

  React.useEffect(() => {
    async function checkUrl() {
      setStatus('loading');

      setStatus('idle');
    }

    checkUrl();
  }, [history, type, setStatus]);

  const onSubmit = async (formData: Partial<FormTypes>) => {

    setStatus('loading');

    await CreatePropertyProtectionUser(formData);
  };


  return (
    <Wrapper>
      <HeaderWrapper>
        <BackButton link="/marketplace/property-protection" />

      </HeaderWrapper>
      <HeaderWrapperText>
        {t('lets_connect_with_')}{' '}
        {LOCK_PROPERTY_PROTECTIONS_OPTIONS[type as keyof typeof LOCK_PROPERTY_PROTECTIONS_OPTIONS].label}
      </HeaderWrapperText>
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
            {fields.display[FORM_NAMES.username] && (
              <SingleFieldWrapper>
                <InputController
                  {...register(FORM_NAMES.username, {
                    // required: fields.required[FORM_NAMES.username],
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
                    // required: fields.required[FORM_NAMES.password],
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

      {housings &&
        (<SuperHogValidationsModal
          superHogHousings={listings}
          housings={housings}
          open={isSuperHogValitadionModalOpen}
          onClose={closeSuperHogValitadionModalOpen}
          coreId={coreId}
        />)
      }

    </Wrapper>
  );
}

export { PropertyProtectionComponent };
