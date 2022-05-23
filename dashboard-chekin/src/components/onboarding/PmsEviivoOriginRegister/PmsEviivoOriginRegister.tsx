import React from 'react';
import {useForm, useFieldArray} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Link, useLocation, useHistory} from 'react-router-dom';
import eviivoLogoIcon from '../../../assets/eviivo-logo.jpg';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import warningIcon from '../../../assets/warning-icon.svg';
import plusIcon from '../../../assets/plus-blue.svg';
import removeIcon from '../../../assets/close-blue.svg';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import {toastResponseError} from '../../../utils/common';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
import {
  Wrapper,
  DimensionsWrapper,
  Content,
  SyncTile,
  ThreeDotsGroup,
  Dot,
} from '../../../styled/onboarding';
import {
  Illustration,
  Logo,
  LoginText,
  Form,
  ButtonAndLoaderWrapper,
  FormItemWrapper,
  StepGuideWrapper,
  IconButton,
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
import {useErrorToast} from '../../../utils/hooks';
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
  client_secret = 'client_secret',
  client_id = 'client_id',
  password = 'password',
  repeatedPassword = 'repeat_password',
  shortnames = 'shortnames',
}

type FormData = {
  [FORM_NAMES.email]: string;
  [FORM_NAMES.client_secret]: string;
  [FORM_NAMES.client_id]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.repeatedPassword]: string;
  [FORM_NAMES.shortnames]: {}[];
};

function fetchPlan(plan = '', type = '') {
  return queryFetcher(api.payments.ENDPOINTS.plans(`interval=${plan}&type=${type}`), {
    headers: getAnonymousHeaders(),
  });
}

function PmsEviivoOriginRegister() {
  const [showAccountCreatedModal, setShowAccountCreatedModal] = React.useState(false);
  const [showAskCollaboratorModal, setShowAskCollaboratorModal] = React.useState(false);
  const [collaboratorError, setCollaboratorError] = React.useState('');
  const {register, handleSubmit, watch, formState, trigger, getValues, control} = useForm<
    FormData
  >({
    defaultValues: {
      [FORM_NAMES.shortnames]: [''],
    },
    shouldUnregister: true,
  });
  const {fields, append, remove} = useFieldArray({
    control,
    name: FORM_NAMES.shortnames,
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

  const registerEviivoUser = async (payload = {}) => {
    payload = getRegisterPayload(payload);
    const {data, error} = await api.auth.integrationRegister('eviivo', payload);
    if (data) {
      mixpanelTrackWithUTM('Onboarding - Eviivo');
      setShowAccountCreatedModal(true);
    } else {
      if (error instanceof Object && 'client_id' in error) {
        setCollaboratorError(error.client_id[0]);
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
      estimated_range_of_managed_properties: location.state?.accommodationsNumber || '',
      origin: ORIGINS.dashboard,
      subscription_type: isAPIAccommodationType
        ? ACCOMMODATION_TYPES.house
        : accommodationType,
    };
  };

  const getStripeSubscriptionTrialTypePayload = (data: any) => {
    const planId = monthlyPlan?.unique_id;
    if (!planId) {
      toastResponseError('Plan id could not be found.');
      return {};
    }

    return {
      ...data,
      shortnames: data.shortnames.join(','),
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
    await registerEviivoUser(payload);
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
          <RegisterSyncHeader syncOptions={accountSyncOptions}>Eviivo</RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={eviivoLogoIcon} alt="Eviivo" />
              <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_text') as string}
                    disabled={isLoading}
                    label={t('client_secret')}
                    error={errors[FORM_NAMES.client_secret]?.message}
                    {...register(FORM_NAMES.client_secret, {
                      required: t('required') as string,
                    })}
                  />
                </FormItemWrapper>
                <FormItemWrapper>
                  <Input
                    placeholder={t('enter_text') as string}
                    disabled={isLoading}
                    label={t('client_id')}
                    error={errors[FORM_NAMES.client_id]?.message}
                    {...register(FORM_NAMES.client_id, {
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
                {fields.map((field, index) => (
                  <FormItemWrapper key={index}>
                    <Input
                      defaultValue={''}
                      label={t('shortname')}
                      placeholder={t('enter_text')}
                      type="text"
                      error={(errors?.[FORM_NAMES.shortnames]?.[index] as any)?.message}
                      {...register(`shortnames.${index}` as const, {
                        required: t('required') as string,
                      })}
                    />
                    {index !== 0 && (
                      <IconButton type="button" onClick={() => remove(index)}>
                        <img src={removeIcon} alt="Remove" />
                      </IconButton>
                    )}
                  </FormItemWrapper>
                ))}
                <IconButton type="button" onClick={() => append({})}>
                  <img src={plusIcon} alt="Plus" />
                </IconButton>
                <ButtonAndLoaderWrapper>
                  {isLoading ? (
                    <Loader height={40} width={40} />
                  ) : (
                    <Button
                      type={'submit'}
                      light
                      size="big"
                      label={t('connect_with_eviivo')}
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
                <ThreeDotsGroup>
                  <Dot />
                  <Dot />
                  <Dot />
                </ThreeDotsGroup>
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

export {PmsEviivoOriginRegister};
