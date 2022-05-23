import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useLocation, useHistory} from 'react-router-dom';
import bookingLogoIcon from '../../../assets/bookingcom_logo.svg';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import successIcon from '../../../assets/new-chekin-square.svg';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import {toastResponseError} from '../../../utils/common';
import {useErrorToast} from '../../../utils/hooks';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import {Wrapper, DimensionsWrapper, Content, SyncTile} from '../../../styled/onboarding';
import {
  Illustration,
  Logo,
  LoginText,
  Form,
  ButtonAndLoaderWrapper,
  FormItemWrapper,
  StepGuideWrapper,
  StepText,
  BookingStepByStepWizard,
  Dot,
  ThreeDotsGroup,
} from './styled';
import {AccountCreatedModal} from '../AccountCreatedModal/AccountCreatedModal';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import Input from '../Input';
import Button from '../Button';
import {
  ACCOMMODATION_TYPES,
  PATTERNS,
  PERIODICITY,
  SUBSCRIPTION_TRIAL_TYPES,
  ORIGINS,
} from '../../../utils/constants';
import Loader from '../../common/Loader';
import i18n from '../../../i18n';
import Modal from '../../dashboard/Modal';
import {ModalButton} from '../../dashboard/ModalButton/ModalButton';
import {useQuery} from 'react-query';
import {Plan} from '../../../utils/types';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';

declare const window: any;

const BOOKING_SCRIPT_SRC = 'https://suiteportal.booking.com/js/oauth2-client-v2.0.js';
const BOOKING_CLIENT_ID = process.env.REACT_APP_BOOKING_CLIENT_ID;
const BOOKING_REDIRECT_URL = process.env.REACT_APP_BOOKING_REDIRECT_URL;

const DEFAULT_SUBSCRIPTION_QUANTITY = null;
const SUBSCRIPTION_TRIAL_TYPE = process.env.REACT_APP_SUBSCRIPTION_TRIAL_TYPE;
const QUERY_CONFIG = {
  cacheTime: 24 * 60 * 1000,
  staleTime: 24 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

type LocationState = {
  accommodationType?: string;
  accommodationsNumber: string;
};

enum FORM_NAMES {
  email = 'email',
  password = 'password',
  repeatedPassword = 'repeat_password',
}

type FormData = {
  [FORM_NAMES.email]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.repeatedPassword]: string;
};

function fetchPlan(plan = '', type = '') {
  return queryFetcher(api.payments.ENDPOINTS.plans(`interval=${plan}&type=${type}`), {
    headers: getAnonymousHeaders(),
  });
}

function FirstStep() {
  return <StepText>{i18n.t('the_page_will_redirect_to_booking_login')}</StepText>;
}

function SecondStep() {
  return <StepText>{i18n.t('after_booking_validates_your_creds')}</StepText>;
}

function ThirdStep() {
  return <StepText>{i18n.t('this_will_complete_the_registration')}</StepText>;
}

function PmsBookingOriginRegister() {
  const [showAccountCreatedModal, setShowAccountCreatedModal] = React.useState(false);
  const [showAskCollaboratorModal, setShowAskCollaboratorModal] = React.useState(false);
  const [showScopeUpdatedModal, setShowScopeUpdatedModal] = React.useState(false);
  const [collaboratorError, setCollaboratorError] = React.useState('');
  const {register, handleSubmit, watch, formState, trigger} = useForm<FormData>({
    shouldUnregister: true,
  });

  const {errors} = formState;

  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [isError, setIsError] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [subscriptionType, setSubscriptionType] = React.useState('');
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
          label: 'Lodgify',
          link: {
            pathname: 'lodgify-sync',
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

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = BOOKING_SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', function () {
      setIsLoading(false);

      if (window && window.BookingOAuth) {
        window.BookingOAuth.render('oauth-btn');
      } else {
        setIsError(true);
      }
    });

    setIsLoading(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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

  const getAccommodationTypeFromUrl = () => {
    const currentUrl = new URL(window.location.href);
    const urlState = currentUrl.searchParams.get('state');
    if (urlState) {
      return urlState;
    }
    return '';
  };

  const accommodationType =
    location.state?.accommodationType || getAccommodationTypeFromUrl();
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
    async function checkUrl() {
      const url = new URL(window.location.href);
      const bookingCode = url.searchParams.get('code');
      const bookingState = url.searchParams.get('state');
      if (bookingCode && bookingState) {
        setCode(bookingCode);
        setSubscriptionType(bookingState);
      } else if (!accommodationType) {
        goBack();
      }
    }

    checkUrl();
  }, [history, location, goBack, accommodationType]);

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

  const registerBookingUser = async (payload = {}) => {
    payload = {
      ...payload,
      access_token: code,
    };
    payload = getRegisterPayload(payload);
    const {data, error} = await api.auth.integrationRegister('booking', payload);
    if (data) {
      if (data.is_scope_updated) {
        setShowScopeUpdatedModal(true);
      } else {
        mixpanelTrackWithUTM('Onboarding - Booking');
        setShowAccountCreatedModal(true);
      }
    } else {
      if (error instanceof Array && error.length && error[0].startsWith('Please, tell')) {
        setCollaboratorError(error[0]);
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

  const onSubmit = async (data = {}) => {
    setIsLoading(true);
    await registerBookingUser(data);
    setIsLoading(false);
  };

  return (
    <>
      {showAccountCreatedModal && (
        <AccountCreatedModal email={email} password={password} />
      )}
      {showScopeUpdatedModal && (
        <Modal
          open
          iconSrc={successIcon}
          iconAlt="success"
          title={t('scope_updated')}
          text={t('please_sync_housings_and_reservations')}
        >
          <Link to="/login">
            <ModalButton label={t('login_here')} type="button" />
          </Link>
        </Modal>
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
          <RegisterSyncHeader syncOptions={accountSyncOptions}>
            booking.com
          </RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={bookingLogoIcon} alt="Booking" />
              {subscriptionType && (
                <Form onSubmit={handleSubmit(onSubmit)}>
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
                        label={t('connect_with_booking')}
                        disabled={monthlyPlanStatus === 'loading'}
                      />
                    )}
                  </ButtonAndLoaderWrapper>
                </Form>
              )}
              {!subscriptionType && (
                <ButtonAndLoaderWrapper>
                  {isLoading && <Loader />}
                  {isError && (
                    <div>Error. Could not load script. Please refresh the page</div>
                  )}
                  <div
                    id="oauth-btn"
                    data-app-id={BOOKING_CLIENT_ID}
                    data-state={location.state?.accommodationType}
                    data-redirect-uri={BOOKING_REDIRECT_URL}
                  />
                </ButtonAndLoaderWrapper>
              )}
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
                  <BookingStepByStepWizard
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

export {PmsBookingOriginRegister};
