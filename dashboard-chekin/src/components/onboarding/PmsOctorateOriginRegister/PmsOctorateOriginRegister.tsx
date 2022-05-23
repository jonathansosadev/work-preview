import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useLocation} from 'react-router-dom';
import octorateLogoIcon from '../../../assets/octorate_logo.png';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import {toastResponseError} from '../../../utils/common';
import {useErrorToast} from '../../../utils/hooks';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import {Content, DimensionsWrapper, SyncTile, Wrapper} from '../../../styled/onboarding';
import {
  ButtonAndLoaderWrapper,
  Form,
  FormItemWrapper,
  Illustration,
  LoginText,
  Logo,
} from './styled';
import {AccountCreatedModal} from '../AccountCreatedModal/AccountCreatedModal';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
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
import Modal from '../../dashboard/Modal';
import {ModalButton} from '../../dashboard/ModalButton/ModalButton';
import {useQuery} from 'react-query';
import {Plan} from '../../../utils/types';

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

function PmsOctorateOriginRegister() {
  const [showAccountCreatedModal, setShowAccountCreatedModal] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState,
    trigger,
    getValues,
  } = useForm<FormData>({
    shouldUnregister: true,
  });

  const {errors} = formState;

  const [showAskCollaboratorModal, setShowAskCollaboratorModal] = React.useState(false);
  const [collaboratorError, setCollaboratorError] = React.useState('');
  const [isReadyToRegister, setIsReadyToRegister] = React.useState(false);
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
          label: 'BookingSync',
          link: {
            pathname: 'bookingsync-sync',
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
          label: 'Cloudbeds',
          link: {
            pathname: 'cloudbeds-sync',
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
          label: 'Lodgify',
          link: {
            pathname: 'lodgify-sync',
            state: location.state,
          },
        },
        {
          label: 'Vreasy',
          link: {
            pathname: 'vreasy-sync',
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
      return urlState.split(',')[1];
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

  const getCustomSubscriptionTrialTypePayload = React.useCallback(
    (data: {}) => {
      return {
        ...data,
        estimated_range_of_managed_properties: location.state?.accommodationsNumber || '',
        origin: ORIGINS.dashboard,
        subscription_type: isAPIAccommodationType
          ? ACCOMMODATION_TYPES.house
          : accommodationType,
      };
    },
    [accommodationType, isAPIAccommodationType, location.state],
  );

  const getStripeSubscriptionTrialTypePayload = React.useCallback(
    (data: {}) => {
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
    },
    [accommodationType, isAPIAccommodationType, location.state, monthlyPlan],
  );

  const getRegisterPayload = React.useCallback(
    (data: {}) => {
      if (SUBSCRIPTION_TRIAL_TYPE === SUBSCRIPTION_TRIAL_TYPES.stripe) {
        return getStripeSubscriptionTrialTypePayload(data);
      }

      return getCustomSubscriptionTrialTypePayload(data);
    },
    [getCustomSubscriptionTrialTypePayload, getStripeSubscriptionTrialTypePayload],
  );

  const registerOctorateUser = React.useCallback(
    async (payload = {}) => {
      payload = getRegisterPayload(payload);
      const {data, error} = await api.auth.integrationRegister('octorate', payload);
      if (data) {
        mixpanelTrackWithUTM('Onboarding - Octorate');
        setShowAccountCreatedModal(true);
      } else {
        if (
          error instanceof Array &&
          error.length &&
          error[0].startsWith('Please, tell')
        ) {
          setCollaboratorError(error[0]);
          setShowAskCollaboratorModal(true);
        } else {
          toastResponseError(error);
        }
      }
    },
    [getRegisterPayload],
  );

  React.useEffect(() => {
    async function checkUrl() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const octorate_state = url.searchParams.get('state');
      if (octorate_state && monthlyPlanStatus === 'success') {
        const email = octorate_state.split(',')[0];
        const subscription_type = octorate_state.split(',')[1];
        if (code && email && subscription_type) {
          setIsLoading(true);
          setValue(FORM_NAMES.email, email.replace(' ', '+'));
          setIsReadyToRegister(true);
          setIsLoading(false);
        }
      } else if (!accommodationType && !octorate_state) {
        goBack();
      }
    }

    checkUrl();
  }, [
    history,
    location,
    goBack,
    accommodationType,
    setValue,
    monthlyPlanStatus,
    registerOctorateUser,
  ]);

  const [isLoading, setIsLoading] = React.useState(false);

  const hideCollaboratorErrorModal = () => {
    setCollaboratorError('');
    setShowAskCollaboratorModal(false);
  };

  const redirectToOctorateOauth = (payload: any) => {
    const octorateOauthUrl = `https://admin.octorate.com/octobook/identity/oauth.xhtml?client_id=c4e1158569ae46958ca835e0c326b164&redirect_uri=${window.origin}/register/pms/octorate-sync&state=${payload.email},${location.state.accommodationType}`;
    window.location.replace(octorateOauthUrl);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    if (isReadyToRegister) {
      const url = new URL(window.location.href);
      const octorate_state = url.searchParams.get('state');
      if (octorate_state) {
        const code = url.searchParams.get('code');
        const payload = {
          email: data.email,
          subscription_type: octorate_state.split(',')[1],
          password: data.password,
          api_key: code,
        };
        await registerOctorateUser(payload);
      } else {
        setIsLoading(false);
      }
    } else {
      await redirectToOctorateOauth(data);
    }
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
          <RegisterSyncHeader syncOptions={accountSyncOptions}>
            Octorate
          </RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={octorateLogoIcon} alt="Octorate" />
              <Form onSubmit={handleSubmit(onSubmit)}>
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
                {isReadyToRegister && (
                  <>
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
                  </>
                )}
                <ButtonAndLoaderWrapper>
                  {isLoading ? (
                    <Loader height={40} width={40} />
                  ) : (
                    <Button
                      type={'submit'}
                      light
                      size="big"
                      label={t('connect_with_octorate')}
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
            </SyncTile>
            <IDontWorkWithPMSButton />
          </Content>
          <Illustration alt="House" src={houseIllustrationIcon} />
        </DimensionsWrapper>
      </Wrapper>
    </>
  );
}

export {PmsOctorateOriginRegister};
