import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useLocation, useHistory} from 'react-router-dom';
import {useQuery} from 'react-query';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import {scrollToBottom, toastResponseError} from '../../../utils/common';
import {AccountCreatedModal} from '../AccountCreatedModal/AccountCreatedModal';
import {useErrorToast} from '../../../utils/hooks';
import {Plan} from '../../../utils/types';
import {
  ACCOMMODATION_TYPES,
  PATTERNS,
  PERIODICITY,
  SUBSCRIPTION_TRIAL_TYPES,
  ORIGINS,
} from '../../../utils/constants';
import villas365LogoIcon from '../../../assets/365villas-logo.png';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import blueQuestionMark from '../../../assets/blue_question_mark.svg';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import Input from '../Input';
import Button from '../Button';
import Loader from '../../common/Loader';
import Tooltip from '../Tooltip';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
import {Wrapper, DimensionsWrapper, Content, SyncTile} from '../../../styled/onboarding';
import {
  Illustration,
  Logo,
  LoginText,
  Form,
  ButtonAndLoaderWrapper,
  FormItemWrapper,
  StepText,
  StepTextLink,
  VillasStepByStepWizard,
  StepGuideWrapper,
  Dot,
  ThreeDotsGroup,
  TooltipWrapper,
  TooltipButton,
  linkContentStyle,
  QuestionMark,
} from './styled';

const DEFAULT_SUBSCRIPTION_QUANTITY = null;
const SUBSCRIPTION_TRIAL_TYPE = process.env.REACT_APP_SUBSCRIPTION_TRIAL_TYPE;
const QUERY_CONFIG = {
  cacheTime: 24 * 60 * 1000,
  staleTime: 24 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

type LocationState = {
  accommodationType: string;
  accommodationsNumber: string;
};

enum FORM_NAMES {
  email = 'email',
  key_token = 'key_token',
  pass_token = 'pass_token',
  owner_token = 'owner_token',
  password = 'password',
  repeatedPassword = 'repeat_password',
}

type FormData = {
  [FORM_NAMES.email]: string;
  [FORM_NAMES.key_token]: string;
  [FORM_NAMES.pass_token]: string;
  [FORM_NAMES.owner_token]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.repeatedPassword]: string;
};

const VILLAS_365_LOGIN_LINK = 'https://secure.365villas.com/home/login';
const VILLAS_365_SYNC_SETTING = 'https://secure.365villas.com/sync-settings';

function FirstStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      {t('in_a_new_browser_tab_log_into')}
      {` `}
      <StepTextLink target="_blank" href={VILLAS_365_LOGIN_LINK}>
        365Villas
      </StepTextLink>
    </StepText>
  );
}

function SecondStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      {t('this_can_be_found_at')}
      {' > '} <b>{t('portfolio_features')}</b>
      {' > '} <b>{t('website_features')}</b>
      {' > '} <b>{t('booking_engine')}</b>
      {' > '} <b>{t('calendars_and_online_booking')}</b>
      {' - '}
      <StepTextLink target="_blank" href={VILLAS_365_SYNC_SETTING}>
        {t('sync_setting')}
      </StepTextLink>
    </StepText>
  );
}

function fetchPlan(plan = '', type = '') {
  return queryFetcher(api.payments.ENDPOINTS.plans(`interval=${plan}&type=${type}`), {
    headers: getAnonymousHeaders(),
  });
}

function PmsVillas365OriginRegister() {
  const [showAccountCreatedModal, setShowAccountCreatedModal] = React.useState(false);
  const {register, handleSubmit, watch, formState, trigger, getValues} = useForm<
    FormData
  >({
    shouldUnregister: true,
  });

  const {errors} = formState;

  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const accountSyncOptions = React.useMemo(
    () =>
      [
        {
          label: 'Smoobu',
          link: {
            pathname: 'smoobu-sync',
            state: location.state,
          },
        },
        {
          label: 'Booking',
          link: {
            pathname: 'booking-sync',
            state: location.state,
          },
        },
        {
          label: 'BookingSync',
          link: {
            pathname: 'bookingsync-sync',
            state: location.state,
          },
        },
        {
          label: 'Guesty',
          link: {
            pathname: 'guesty-sync',
            state: location.state,
          },
        },
        {
          label: 'Planyo',
          link: {
            pathname: 'planyo-sync',
            state: location.state,
          },
        },
        {
          label: 'Hostaway',
          link: {
            pathname: 'hostaway-sync',
            state: location.state,
          },
        },
        {
          label: 'Rentals United',
          link: {
            pathname: 'rentals-united-sync',
            state: location.state,
          },
        },
        {
          label: 'Resharmonics',
          link: {
            pathname: 'resharmonics-sync',
            state: location.state,
          },
        },
        {
          label: 'Rentlio',
          link: {
            pathname: 'rentlio-sync',
            state: location.state,
          },
        },
        {
          label: t('other'),
          link: {
            pathname: '/register/pms',
            state: location.state,
          },
        },
      ].sort((a, b) => a.label.localeCompare(b.label)),
    [t, location.state],
  );

  const email = watch(FORM_NAMES.email);
  const password = watch(FORM_NAMES.password);
  const repeatedPassword = watch(FORM_NAMES.repeatedPassword);

  React.useEffect(
    function revalidateRepeatedPasswordOnNewPasswordChange() {
      if (repeatedPassword) {
        trigger(FORM_NAMES.repeatedPassword);
      }
    },
    [password, repeatedPassword, trigger],
  );

  const accommodationType = location.state?.accommodationType;
  const isAPIAccommodationType = accommodationType === ACCOMMODATION_TYPES.api;

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
    history.push({
      ...location,
      pathname: '/register/pms',
    });
  }, [history, location]);

  React.useEffect(() => {
    if (!accommodationType) {
      goBack();
    }
  }, [goBack, accommodationType]);

  const [isLoading, setIsLoading] = React.useState(false);

  const registerVillas365User = async (payload = {}) => {
    payload = getRegisterPayload(payload);
    const {data, error} = await api.auth.integrationRegister('villas-365', payload);
    if (data) {
      mixpanelTrackWithUTM('Onboarding - 365Villas');
      setShowAccountCreatedModal(true);
    } else {
      toastResponseError(error);
    }
  };

  const getRegisterPayload = (data: {}) => {
    if (SUBSCRIPTION_TRIAL_TYPE === SUBSCRIPTION_TRIAL_TYPES.stripe) {
      return getStripeSubscriptionTrialTypePayload(data);
    }

    return getCustomSubscriptionTrialTypePayload(data);
  };

  const getCustomSubscriptionTrialTypePayload = (data: {}) => {
    return {
      ...data,
      estimated_range_of_managed_properties: location.state?.accommodationsNumber || '',
      origin: ORIGINS.dashboard,
      subscription_type: isAPIAccommodationType
        ? ACCOMMODATION_TYPES.house
        : accommodationType,
    };
  };

  const getStripeSubscriptionTrialTypePayload = (data: {}) => {
    const planId = monthlyPlan?.unique_id;
    if (!planId) {
      toastResponseError('Plan id could not be found.');
      return {};
    }

    return {
      ...data,
      estimated_range_of_managed_properties: location.state?.accommodationsNumber || '',
      subscription: {
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

  const getRegistryPayload = (data: FormData) => {
    return {
      ...data,
      [FORM_NAMES.repeatedPassword]: undefined,
    };
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const payload = getRegistryPayload(data);
    await registerVillas365User(payload);
    setIsLoading(false);
  };

  return (
    <>
      {showAccountCreatedModal && (
        <AccountCreatedModal email={email} password={password} />
      )}

      <Wrapper>
        <DimensionsWrapper>
          <LeftAlignedChekinLogoHeader />
          <RegisterSyncHeader syncOptions={accountSyncOptions}>
            365Villas
          </RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={villas365LogoIcon} alt="Villas365" />
              <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_text') as string}
                    disabled={isLoading}
                    label={t('villas365_key_token')}
                    error={errors[FORM_NAMES.key_token]?.message}
                    {...register(FORM_NAMES.key_token, {
                      required: t('required') as string,
                    })}
                  />
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_text') as string}
                    disabled={isLoading}
                    label={t('villas365_pass_token')}
                    error={errors[FORM_NAMES.pass_token]?.message}
                    {...register(FORM_NAMES.pass_token, {
                      required: t('required') as string,
                    })}
                  />
                  {window.innerHeight < 820 && (
                    <TooltipWrapper>
                      <Tooltip
                        contentStyle={linkContentStyle}
                        position="top center"
                        label={
                          <TooltipButton type="button" onClick={scrollToBottom}>
                            {t('where_can_i_find_them')}
                          </TooltipButton>
                        }
                      >
                        <QuestionMark src={blueQuestionMark} alt="Question mark" />
                      </Tooltip>
                    </TooltipWrapper>
                  )}
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_text') as string}
                    disabled={isLoading}
                    label={t('villas365_owner_token')}
                    error={errors[FORM_NAMES.owner_token]?.message}
                    {...register(FORM_NAMES.owner_token, {
                      required: t('required') as string,
                    })}
                  />
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_your_email') as string}
                    disabled={isLoading}
                    label={t('email')}
                    error={errors[FORM_NAMES.email]?.message}
                    {...register(FORM_NAMES.email, {
                      pattern: {
                        value: PATTERNS.email,
                        message: t('invalid_email'),
                      },
                      required: t('required') as string,
                    })}
                  />
                </FormItemWrapper>

                <FormItemWrapper>
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
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    label={t('repeat_password')}
                    placeholder={t('enter_your_password')}
                    type="password"
                    empty={!Boolean(repeatedPassword)}
                    error={errors[FORM_NAMES.repeatedPassword]?.message}
                    {...register(FORM_NAMES.repeatedPassword, {
                      required: t('required') as string,
                      validate: (value) => {
                        const password = getValues()[FORM_NAMES.password];
                        if (!value || !password) {
                          return true;
                        }
                        return (
                          value === password || (t('passwords_dont_match') as string)
                        );
                      },
                    })}
                  />
                </FormItemWrapper>
                <ButtonAndLoaderWrapper>
                  {isLoading ? (
                    <Loader height={40} width={40} />
                  ) : (
                    <Button
                      type={'submit'}
                      light
                      size="big"
                      label={t('connect_with_villas365')}
                      disabled={monthlyPlanStatus === 'loading'}
                    />
                  )}
                </ButtonAndLoaderWrapper>
              </Form>
              <LoginText>
                {t('already_connected')}
                <div>
                  <Link to="/login">
                    <Button secondary label={t('login_here')} type="button" />
                  </Link>
                </div>
              </LoginText>
              <StepGuideWrapper>
                <>
                  <ThreeDotsGroup>
                    <Dot />
                    <Dot />
                    <Dot />
                  </ThreeDotsGroup>
                  <VillasStepByStepWizard
                    title={t('getting_your_tokens')}
                    components={[<FirstStep />, <SecondStep />]}
                  />
                </>
              </StepGuideWrapper>
            </SyncTile>
            <IDontWorkWithPMSButton />
          </Content>
          <Illustration alt="House" src={houseIllustrationIcon} />
        </DimensionsWrapper>
      </Wrapper>
    </>
  );
}

export {PmsVillas365OriginRegister};
