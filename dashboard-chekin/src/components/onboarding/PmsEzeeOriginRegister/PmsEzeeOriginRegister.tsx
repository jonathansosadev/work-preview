import React from 'react';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useHistory, useLocation} from 'react-router-dom';
import {
  ACCOMMODATION_TYPES,
  PATTERNS,
  PERIODICITY,
  SUBSCRIPTION_TRIAL_TYPES,
  ORIGINS,
} from '../../../utils/constants';
import {useErrorToast} from '../../../utils/hooks';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import {toastResponseError} from '../../../utils/common';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import ezeeLogoIcon from '../../../assets/ezee-logo.png';
import warningIcon from '../../../assets/warning-icon.svg';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import AccountCreatedModal from '../AccountCreatedModal';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import Input from '../Input';
import Button from '../Button';
import Loader from '../../common/Loader';
import Modal from '../../dashboard/Modal';
import {ModalButton} from '../../dashboard/ModalButton/ModalButton';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
import {Content, DimensionsWrapper, SyncTile, Wrapper} from '../../../styled/onboarding';
import {
  ButtonAndLoaderWrapper,
  Form,
  FormItemWrapper,
  Illustration,
  LoginText,
  Logo,
} from './styled';
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
  external_auth_key = 'external_auth_key',
  external_hotel_code = 'external_hotel_code',
  password = 'password',
  repeatedPassword = 'repeat_password',
}

type FormData = {
  [FORM_NAMES.email]: string;
  [FORM_NAMES.external_auth_key]: string;
  [FORM_NAMES.external_hotel_code]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.repeatedPassword]: string;
};

function fetchPlan(plan = '', type = '') {
  return queryFetcher(api.payments.ENDPOINTS.plans(`interval=${plan}&type=${type}`), {
    headers: getAnonymousHeaders(),
  });
}

function PmsEzeeOriginRegister() {
  const [showAccountCreatedModal, setShowAccountCreatedModal] = React.useState(false);
  const [showAskCollaboratorModal, setShowAskCollaboratorModal] = React.useState(false);
  const [collaboratorError, setCollaboratorError] = React.useState('');
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
  } = useQuery<Plan>(
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
    if (!accommodationType) {
      goBack();
    }
  }, [goBack, accommodationType]);

  const registerEzeeUser = async (payload = {}) => {
    payload = getRegisterPayload(payload);
    const {data, error} = await api.auth.integrationRegister('ezeetechnosys', payload);
    if (data) {
      mixpanelTrackWithUTM('Onboarding - Ezee');
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

  const onSubmit = async (data = {}) => {
    setIsLoading(true);
    await registerEzeeUser(data);
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
          <RegisterSyncHeader syncOptions={accountSyncOptions}>Ezee</RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={ezeeLogoIcon} alt="Ezee" />
              <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItemWrapper>
                  <Input
                    disabled={isLoading}
                    placeholder={t('enter_your_auth_key') as string}
                    label={t('auth_key')}
                    error={errors[FORM_NAMES.external_auth_key]?.message}
                    {...register(FORM_NAMES.external_auth_key, {
                      required: t('required') as string,
                    })}
                  />
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    disabled={isLoading}
                    placeholder={t('enter_your_hotel_code') as string}
                    label={t('hotel_code')}
                    error={errors[FORM_NAMES.external_hotel_code]?.message}
                    {...register(FORM_NAMES.external_hotel_code, {
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
                      label={t('connect_with_ezee')}
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
            </SyncTile>
            <IDontWorkWithPMSButton />
          </Content>
          <Illustration alt="House" src={houseIllustrationIcon} />
        </DimensionsWrapper>
      </Wrapper>
    </>
  );
}

export {PmsEzeeOriginRegister};
