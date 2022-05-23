import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useLocation, useHistory} from 'react-router-dom';
import {
  ACCOMMODATION_TYPES,
  PATTERNS,
  PERIODICITY,
  SUBSCRIPTION_TRIAL_TYPES,
  ORIGINS,
} from '../../../utils/constants';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import {toastResponseError} from '../../../utils/common';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import guestyLogoIcon from '../../../assets/guesty-logo.png';
import warningIcon from '../../../assets/warning-icon.svg';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import AccountCreatedModal from '../AccountCreatedModal';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import Input from '../Input';
import Button from '../Button';
import Loader from '../../common/Loader';
import Modal from '../../dashboard/Modal';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
import {ModalButton} from '../../dashboard/ModalButton/ModalButton';
import {Wrapper, DimensionsWrapper, Content, SyncTile} from '../../../styled/onboarding';
import {
  Illustration,
  Logo,
  LoginText,
  Form,
  ButtonAndLoaderWrapper,
  FormItemWrapper,
  GuestyStepByStepWizard,
  Dot,
  ThreeDotsGroup,
  StepGuideWrapper,
  StepText,
  StepTextLink,
  StepWrapper,
} from './styled';
import {useQuery} from 'react-query';
import {Plan} from '../../../utils/types';
import {useErrorToast} from '../../../utils/hooks';

const DEFAULT_SUBSCRIPTION_QUANTITY = null;
const SUBSCRIPTION_TRIAL_TYPE = process.env.REACT_APP_SUBSCRIPTION_TRIAL_TYPE;
const QUERY_CONFIG = {
  cacheTime: 24 * 60 * 1000,
  staleTime: 24 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

function fetchPlan(plan = '', type = '') {
  return queryFetcher(api.payments.ENDPOINTS.plans(`interval=${plan}&type=${type}`), {
    headers: getAnonymousHeaders(),
  });
}

type LocationState = {
  accommodationType: string;
  accommodationsNumber: string;
};

enum FORM_NAMES {
  email = 'email',
  api_key = 'api_key',
  password = 'password',
  repeatedPassword = 'repeat_password',
}

type FormData = {
  [FORM_NAMES.email]: string;
  [FORM_NAMES.api_key]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.repeatedPassword]: string;
};

const GUESTY_LOGIN_LINK = 'https://app.guesty.com/auth/login';
const GUESTY_CHEKIN_INTEGRATION_LINK =
  'https://app.guesty.com/account/integrations/g/chekin?applicationId=5ca45f693608af06d75cc35f';

function FirstStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      {t('in_a_new_browser_tab_log_into')}
      {` `}
      <StepTextLink target="_blank" href={GUESTY_LOGIN_LINK}>
        Guesty
      </StepTextLink>
    </StepText>
  );
}

function SecondStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      <StepWrapper>
        {t('go_to_the')} {` `}
        <StepTextLink target="_blank" href={GUESTY_CHEKIN_INTEGRATION_LINK}>
          {t('chekin_integration_page')} {` `}
        </StepTextLink>
      </StepWrapper>
      {t('or_navigate_to')} {` `}
      <b>
        {t('marketplace').toUpperCase()} {'>'} CheKin {'>'} {t('_connect').toUpperCase()}
      </b>
    </StepText>
  );
}

function ThirdStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      <StepWrapper>
        {t('next_to')}
        <b> API token, </b>
        {t('click')}
        <b> {t('copy_to_clipboard')}</b>
      </StepWrapper>
      {t('empty_api_key_box_click')}
      <b> {t('generate_new_key')} </b>
    </StepText>
  );
}

function PmsGuestyOriginRegister() {
  const [showAccountCreatedModal, setShowAccountCreatedModal] = React.useState(false);
  const [showAskCollaboratorModal, setShowAskCollaboratorModal] = React.useState(false);
  const [collaboratorError, setCollaboratorError] = React.useState('');
  const {register, handleSubmit, watch, formState, trigger} = useForm<FormData>({
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
          label: '365Villas',
          link: {
            pathname: 'villas-365-sync',
            state: location.state,
          },
        },
        {
          label: 'Cloudbeds',
          link: {
            pathname: 'cloudbeds-sync',
            state: location.state,
          },
        },
        {
          label: '365Villas',
          link: {
            pathname: 'villas-365-sync',
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
          label: 'Lodgify',
          link: {
            pathname: 'lodgify-sync',
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
          label: 'Rentals United',
          link: {
            pathname: 'rentals-united-sync',
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

  const [isLoading, setIsLoading] = React.useState(false);

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

  const getRegisterPayload = (data: {}) => {
    if (SUBSCRIPTION_TRIAL_TYPE === SUBSCRIPTION_TRIAL_TYPES.stripe) {
      return getStripeSubscriptionTrialTypePayload(data);
    }

    return getCustomSubscriptionTrialTypePayload(data);
  };

  const getCustomSubscriptionTrialTypePayload = (data: {}) => {
    return {
      ...data,
      repeat_password: undefined,
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
      repeat_password: undefined,
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

  const registerGuestyUser = async (payload = {}) => {
    payload = getRegisterPayload(payload);
    const {data, error} = await api.auth.integrationRegister('guesty', payload);
    if (data) {
      mixpanelTrackWithUTM('Onboarding - Guesty');
      setShowAccountCreatedModal(true);
    } else {
      if (error instanceof Object && 'api_key' in error) {
        setCollaboratorError(error.api_key[0]);
        setShowAskCollaboratorModal(true);
      } else {
        toastResponseError(error);
      }
    }
  };

  const hideCollaboratorErrorModal = () => {
    setCollaboratorError('');
    setShowAskCollaboratorModal(false);
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
    await registerGuestyUser(payload);
    setIsLoading(false);
  };

  return (
    <>
      {showAccountCreatedModal && (
        <AccountCreatedModal email={email} password={password} />
      )}
      {showAskCollaboratorModal && (
        <Modal
          open
          closeOnDocumentClick
          iconSrc={warningIcon}
          iconAlt="warning"
          title={t('you_already_have_an_account_in_chekin_connected')}
          text={collaboratorError}
          onClose={hideCollaboratorErrorModal}
        >
          <ModalButton label={t('close')} onClick={hideCollaboratorErrorModal} />
        </Modal>
      )}
      <Wrapper>
        <DimensionsWrapper>
          <LeftAlignedChekinLogoHeader />
          <RegisterSyncHeader syncOptions={accountSyncOptions}>Guesty</RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={guestyLogoIcon} alt="Guesty" />
              <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_your_api_key') as string}
                    disabled={isLoading}
                    label={t('api_key')}
                    error={errors[FORM_NAMES.api_key]?.message}
                    {...register(FORM_NAMES.api_key, {
                      required: t('required') as string,
                    })}
                  />
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_your_email') as string}
                    disabled={isLoading}
                    label={t('email')}
                    inputMode="email"
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
                      label={t('connect_with_guesty')}
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
                  <GuestyStepByStepWizard
                    title={t('getting_your_api_key')}
                    components={[<FirstStep />, <SecondStep />, <ThirdStep />]}
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

export {PmsGuestyOriginRegister};
