import React from 'react';
import {useForm, Controller} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useLocation, useHistory} from 'react-router-dom';
import {useQuery} from 'react-query';
import api, {
  getAnonymousHeaders,
  queryFetcher,
  removeUserTokenFromLocalStorage,
} from '../../../api';
import {toastResponseError} from '../../../utils/common';
import {useCountriesOptions} from '../../../hooks/useCountriesOptions';
import {useErrorToast, useIsMounted, useScrollToTop} from '../../../utils/hooks';
import {useAuth} from '../../../context/auth';
import {mixpanelTrackWithUTM, mixpanelAlias} from '../../../analytics/mixpanel';
import chekinLogoImage from '../../../assets/chekin-imago-blue.svg';
import registerIllustration from '../../../assets/register_illustration.svg';
import type {Plan} from '../../../utils/types';
import Input from '../Input';
import Button from '../Button';
import Checkbox from '../Checkbox';
import Loader from '../../common/Loader';
import RegisterFormSideNotes from '../RegisterFormSideNotes';
import Select from '../Select';
import PhoneInput from '../PhoneInput';
import {callLouFunc} from 'context/auth';
// import PricingModal from '../PricingModal';
import {
  ACCOMMODATION_TYPES,
  PATTERNS,
  PERIODICITY,
  SUBSCRIPTION_TRIAL_TYPES,
  ORIGINS,
} from '../../../utils/constants';
import {
  BackButtonWrapper,
  ButtonAndLoaderWrapper,
  CheckboxWrapper,
  FieldsWrapper,
  FieldWrapper,
  FormTile,
  Illustration,
  LoginText,
  Logo,
  // PricingDetailsWrapper,
  StyledLink,
  Subtitle,
  Title,
  Wrapper,
  CouponText,
} from './styled';

const SUBSCRIPTION_TRIAL_TYPE = process.env.REACT_APP_SUBSCRIPTION_TRIAL_TYPE;
const EMAIL_SEARCH_PARAM = 'email';
const COLLABORATOR_TOKEN_SEARCH_PARAM = 'collaborator_token';
const MANAGER_SUBSCRIPTION_TYPE_SEARCH_PARAM = 'manager_subscription_type';
const DEFAULT_SUBSCRIPTION_QUANTITY = null;
const QUERY_CONFIG = {
  cacheTime: 24 * 60 * 1000,
  staleTime: 24 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

function sendGoogleTag() {
  // @ts-ignore
  if (window.gtag) {
    // @ts-ignore
    window.gtag('event', 'conversion', {send_to: 'AW-481274774/fFP3CPDDl_IBEJbXvuUB'});
  }
}

function getSearchParamsFromURL() {
  const url = new URL(window.location.href);
  return url.searchParams || {};
}

function getEmailFromSearchParams() {
  const searchParams = getSearchParamsFromURL();
  return searchParams.get(EMAIL_SEARCH_PARAM);
}

function getCollaboratorTokenFromSearchParams() {
  const searchParams = getSearchParamsFromURL();
  return searchParams.get(COLLABORATOR_TOKEN_SEARCH_PARAM);
}

function getManagerSubscriptionTypeFromSearchParams() {
  const searchParams = getSearchParamsFromURL();
  return searchParams.get(MANAGER_SUBSCRIPTION_TYPE_SEARCH_PARAM);
}

function fetchPlan(plan = '', type = '') {
  return queryFetcher(api.payments.ENDPOINTS.plans(`interval=${plan}&type=${type}`), {
    headers: getAnonymousHeaders(),
  });
}

enum FORM_NAMES {
  email = 'email',
  password = 'password',
  repeatedPassword = 'repeat_password',
  name = 'name',
  country = 'country',
  phone = 'phone',
  brandName = 'company_name',
}

type CountryOption = {
  label: string;
  value: string;
};

type FormTypes = {
  [FORM_NAMES.email]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.repeatedPassword]: string;
  [FORM_NAMES.name]: string;
  [FORM_NAMES.country]: CountryOption;
  [FORM_NAMES.phone]: string;
  [FORM_NAMES.brandName]: string;
};

type LocationState = {
  accommodationType: string;
  accommodationsNumber: string;
  customPMS: string;
};

function RegisterForm() {
  useScrollToTop();
  const {
    register,
    watch,
    handleSubmit,
    reset,
    trigger,
    formState,
    control,
    getValues,
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });

  const {errors} = formState;

  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {login} = useAuth();

  const [isLoading, setIsLoading] = React.useState(false);
  const [areTermsAccepted, setAreTermsAccepted] = React.useState(false);

  const isSubscriptionDisabled = getCollaboratorTokenFromSearchParams();

  const accommodationType =
    location.state?.accommodationType ||
    getManagerSubscriptionTypeFromSearchParams() ||
    '';
  const isAPIAccommodationType = accommodationType === ACCOMMODATION_TYPES.api;
  const isHotelAccommodationType = accommodationType === ACCOMMODATION_TYPES.hotel;
  const isBrandNameFieldVisible = isAPIAccommodationType || isHotelAccommodationType;

  const phoneValue = watch(FORM_NAMES.phone);
  const password = watch(FORM_NAMES.password);
  const repeatedPassword = watch(FORM_NAMES.repeatedPassword);
  const country = watch(FORM_NAMES.country)?.label;

  const {countriesOptions, status: countriesStatus} = useCountriesOptions({
    ...QUERY_CONFIG,
    fetchOptions: {
      headers: getAnonymousHeaders(),
    },
  });

  const {
    data: monthlyPlan,
    status: monthlyPlanStatus,
    error: monthlyPlanError,
  } = useQuery<Plan, [string, string]>(
    [PERIODICITY.monthly, accommodationType],
    () => fetchPlan(PERIODICITY.monthly, accommodationType),
    QUERY_CONFIG,
  );
  useErrorToast(monthlyPlanError, {
    notFoundMessage: 'Requested plan could not be found. Please contact support.',
  });

  const goBack = React.useCallback(() => {
    history.goBack();
  }, [history]);

  React.useEffect(() => {
    if (!accommodationType && !isSubscriptionDisabled) {
      goBack();
    }
  }, [isSubscriptionDisabled, goBack, accommodationType]);

  React.useEffect(() => {
    mixpanelTrackWithUTM('Onboarding - Registration');
  }, []);

  React.useEffect(
    function preloadEmailFromURL() {
      const preloadedEmail = getEmailFromSearchParams();
      if (preloadedEmail) {
        reset({
          email: preloadedEmail,
        });
      }
    },
    [reset],
  );

  React.useEffect(
    function revalidateCountryOnPhoneChange() {
      if (formState.isSubmitted) {
        trigger(FORM_NAMES.country);
      }
    },
    [phoneValue, trigger, formState.isSubmitted],
  );

  React.useEffect(
    function revalidateRepeatedPasswordOnNewPasswordChange() {
      if (repeatedPassword) {
        trigger(FORM_NAMES.repeatedPassword);
      }
    },
    [password, repeatedPassword, trigger],
  );

  const handleTermsCheck = () => {
    setAreTermsAccepted((prevState) => !prevState);
  };

  const getUserOriginPayload = () => {
    const customPMS = location.state?.customPMS || undefined;
    const origin = customPMS ? ORIGINS.unknown : ORIGINS.dashboard;

    return {
      origin,
      custom_origin: customPMS,
    };
  };

  const getStripeSubscriptionTrialTypePayload = (data: FormTypes) => {
    const collaboratorToken = getCollaboratorTokenFromSearchParams();
    const originPayload = getUserOriginPayload();
    const planId = monthlyPlan?.unique_id;

    if (!planId) {
      toastResponseError('Plan id could not be found.');
      return {};
    }

    return {
      ...data,
      ...originPayload,
      [FORM_NAMES.repeatedPassword]: undefined,
      [FORM_NAMES.country]: data[FORM_NAMES.country]?.value,
      collaborator_token: collaboratorToken || undefined,
      estimated_range_of_managed_properties: location.state?.accommodationsNumber || '',
      subscription: collaboratorToken
        ? undefined
        : {
            type: isAPIAccommodationType ? ACCOMMODATION_TYPES.house : accommodationType,
            items: [
              {
                plan: planId,
                quantity: DEFAULT_SUBSCRIPTION_QUANTITY,
              },
            ],
          },
    };
  };

  const getCustomSubscriptionTrialTypePayload = (data: FormTypes) => {
    const collaboratorToken = getCollaboratorTokenFromSearchParams();
    const originPayload = getUserOriginPayload();

    return {
      ...data,
      ...originPayload,
      [FORM_NAMES.repeatedPassword]: undefined,
      [FORM_NAMES.country]: data[FORM_NAMES.country]?.value,
      collaborator_token: collaboratorToken || undefined,
      estimated_range_of_managed_properties: location.state?.accommodationsNumber || '',
      subscription_type: collaboratorToken
        ? undefined
        : isAPIAccommodationType
        ? ACCOMMODATION_TYPES.house
        : accommodationType,
    };
  };

  const getRegisterPayload = (data: FormTypes) => {
    if (SUBSCRIPTION_TRIAL_TYPE === SUBSCRIPTION_TRIAL_TYPES.stripe) {
      return getStripeSubscriptionTrialTypePayload(data);
    }

    return getCustomSubscriptionTrialTypePayload(data);
  };

  const registerUser = async (payload: any) => {
    const {data, error} = await api.auth.register(payload);

    if (!isMounted.current) {
      return {token: null, error: null};
    }

    if (data) {
      callLouFunc(data);
    }

    if (error) {
      toastResponseError(error);
    }

    return {token: data?.token, error};
  };

  const loginUser = async (token: string) => {
    let redirectUrl = '/after-registration';

    const {error} = await login(token, redirectUrl);
    if (error) {
      toastResponseError(error);
      setIsLoading(false);
    }
  };

  const registerAndLoginUser = async (payload: any) => {
    setIsLoading(true);
    const {token, error} = await registerUser(payload);

    if (error) {
      setIsLoading(false);
      return;
    }

    if (token) {
      sendGoogleTag();
      mixpanelAlias(payload.email);

      await loginUser(token);
    }
  };

  const onSubmit = (formData: FormTypes) => {
    removeUserTokenFromLocalStorage();

    const payload = getRegisterPayload(formData);
    registerAndLoginUser(payload);
  };

  return (
    <Wrapper>
      <RegisterFormSideNotes
        isAPIUser={isAPIAccommodationType}
        isSubscriptionDisabled={Boolean(isSubscriptionDisabled)}
      />
      <Link to="/login">
        <Logo src={chekinLogoImage} alt="chekin" />
      </Link>
      <LoginText>
        {t('already_have_an_acc')}
        <div>
          <Link to="/login">
            <Button secondary label={t('login_here')} type="button" />
          </Link>
        </div>
      </LoginText>
      <Title>{t('register')}</Title>
      {!isSubscriptionDisabled && (
        <Subtitle>{t('no_credit_card_required_exclamation')}</Subtitle>
      )}
      <FormTile onSubmit={handleSubmit(onSubmit)}>
        <FieldsWrapper>
          <FieldWrapper>
            <Input
              label={t('email')}
              placeholder={t('enter_your_email')}
              inputMode="email"
              error={errors[FORM_NAMES.email]?.message}
              {...register(FORM_NAMES.email, {
                pattern: {
                  value: PATTERNS.email,
                  message: t('invalid_email') as string,
                },
                required: t('required') as string,
              })}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              label={t('password')}
              placeholder={t('enter_your_password')}
              type="password"
              empty={!Boolean(password)}
              error={errors[FORM_NAMES.password]?.message}
              {...register(FORM_NAMES.password, {
                required: t('required') as string,
              })}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              label={t('repeat_password')}
              placeholder={t('enter_your_password')}
              type="password"
              empty={!Boolean(repeatedPassword)}
              error={errors[FORM_NAMES.repeatedPassword]?.message}
              {...register(FORM_NAMES.repeatedPassword, {
                required: t('required') as string,
                validate: (value) => {
                  if (!value || !password) {
                    return true;
                  }
                  return value === password || (t('passwords_dont_match') as string);
                },
              })}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              label={t('name_and_surname')}
              placeholder={t('enter_your_name_and_surname')}
              error={errors[FORM_NAMES.name]?.message}
              {...register(FORM_NAMES.name, {
                required: t('required') as string,
                pattern: {
                  value: PATTERNS.name,
                  message: t('only_letters_are_allowed') as string,
                },
              })}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.country}
              rules={{
                validate: (value) => {
                  const phone = Boolean(getValues()[FORM_NAMES.phone]);

                  if (phone && !value) {
                    return t('required') as string;
                  }
                },
              }}
              render={({field, fieldState: {error}}) => {
                return (
                  <Select
                    options={countriesOptions}
                    loading={countriesStatus === 'loading'}
                    label={t('country')}
                    placeholder={t('select_your_country')}
                    error={error?.message}
                    {...field}
                  />
                );
              }}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.phone}
              render={({field}) => {
                return (
                  <PhoneInput
                    choosenCountry={country}
                    label={`${t('phone_number')} (${t('optional')})`}
                    placeholder={t('enter_your_phone_number')}
                    {...field}
                  />
                );
              }}
            />
          </FieldWrapper>
          {isBrandNameFieldVisible && (
            <FieldWrapper>
              <Input
                label={t('brand_name')}
                placeholder={t('enter_your_brand_name')}
                error={errors[FORM_NAMES.brandName]?.message}
                {...register(FORM_NAMES.brandName, {
                  required: t('required') as string,
                })}
              />
            </FieldWrapper>
          )}
        </FieldsWrapper>
        <CheckboxWrapper>
          <Checkbox
            onChange={handleTermsCheck}
            checked={areTermsAccepted}
            label={
              <span>
                {t('i_accept')}
                {` `}
                <StyledLink href={t('terms_and_conditions_link')} target="_blank">
                  {t('terms_and_conditions')}
                </StyledLink>
              </span>
            }
          />
        </CheckboxWrapper>
        <CouponText>{t('do_you_have_a_coupon_you_will_use_it')}</CouponText>
        {/*{!isSubscriptionDisabled && (*/}
        {/*  <PricingDetailsWrapper>*/}
        {/*    <PricingModal />*/}
        {/*  </PricingDetailsWrapper>*/}
        {/*)}*/}
        <ButtonAndLoaderWrapper>
          {isLoading ? (
            <Loader />
          ) : (
            <Button
              type="submit"
              label={t('register')}
              disabled={!areTermsAccepted || monthlyPlanStatus === 'loading'}
            />
          )}
        </ButtonAndLoaderWrapper>
      </FormTile>
      {!isSubscriptionDisabled && (
        <BackButtonWrapper>
          <Button secondary label={t('back')} onClick={history.goBack} />
        </BackButtonWrapper>
      )}
      <Illustration src={registerIllustration} alt="Registration CheKin" />
    </Wrapper>
  );
}

export {RegisterForm};
