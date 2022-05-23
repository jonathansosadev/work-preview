import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import changePlanIcon from '../../../assets/change-plan-icon.svg';
import {useSubscription} from '../../../context/subscription';
import {
  Invoices,
  Plan,
  PlanTotalPrice,
  SelectOption,
  Subscription,
} from '../../../utils/types';
import {
  getNextSubscriptionInterval,
  getSubscriptionInterval,
  getSubscriptionIntervalOption,
} from '../../../utils/subscription';
import {
  CURRENCIES,
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_INTERVALS_OPTIONS,
  SUBSCRIPTION_PRODUCT_TYPES,
  SUBSCRIPTION_TYPES,
} from '../../../utils/constants';
import api, {queryFetcher} from '../../../api';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import Modal from '../Modal';
import Select from '../Select';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {Loader} from '../../common/Loader/Loader';
import checkIcon from '../../../assets/check-green.svg';
import {
  Content,
  FieldWrapper,
  FinishModalButtonWrapper,
  LoaderWrapper,
  Main,
  PriceContainer,
  PriceContent,
  PriceLabel,
  PriceLoaderWrapper,
  PriceTypeAndInterval,
  PriceWrapper,
} from './styled';
import {useUser} from '../../../context/user';
import {useComputedDetails} from '../../../context/computedDetails';

const INTERVAL_TYPES_OPTIONS = Object.values(SUBSCRIPTION_INTERVALS_OPTIONS);

function fetchPlans({queryKey: query}: {queryKey: string}) {
  return queryFetcher(api.payments.ENDPOINTS.plans(query));
}

function fetchPrice({queryKey: [, planId]}: {queryKey: [string, string]}, quantity = 1) {
  return queryFetcher(
    api.payments.ENDPOINTS.planTotalPrice(planId, `quantity=${quantity}`),
  );
}

function fetchSelfCheckinPlan({queryKey: [, query]}: {queryKey: [string, string]}) {
  const params = `${query}&product=${SUBSCRIPTION_PRODUCT_TYPES.selfCheckin}`;
  return queryFetcher(api.payments.ENDPOINTS.plans(params));
}

function getNextPlanInterval(subscription?: Subscription) {
  const nextPeriodItem = getNextSubscriptionInterval(
    subscription,
    SUBSCRIPTION_PRODUCT_TYPES.chekin,
  );

  if (!nextPeriodItem) {
    const currentPeriodItem = getSubscriptionInterval(
      subscription,
      SUBSCRIPTION_PRODUCT_TYPES.chekin,
    );

    return currentPeriodItem || null;
  }

  return nextPeriodItem;
}

type ChangePlanModalProps = {
  open?: boolean;
  invoices?: Invoices;
  onClose: () => void;
};

function ChangePlanModal({open, onClose, invoices}: ChangePlanModalProps) {
  const user = useUser();
  const currency = user!.currency;

  const isMounted = useIsMounted();
  const {t} = useTranslation();
  const {ErrorModal, displayError} = useErrorModal();
  const {
    subscription,
    updateAndSetSubscription,
    isHotelSubscription,
    isSelfCheckinActive,
  } = useSubscription();
  const [
    nextSubscriptionInterval,
    setNextSubscriptionInterval,
  ] = React.useState<SelectOption | null>(null);
  const [subscriptionInterval, setSubscriptionInterval] = React.useState<SelectOption>(
    () => {
      const interval = getNextPlanInterval(subscription);
      return getSubscriptionIntervalOption(interval);
    },
  );
  const [paymentQuery, setPaymentQuery] = React.useState(
    `interval=${
      SUBSCRIPTION_INTERVALS_OPTIONS[SUBSCRIPTION_INTERVALS.month].value
    }&type=${SUBSCRIPTION_TYPES.housing}&is_free=${
      user?.is_police_registration_free ? '1' : '0'
    }&currency=${currency}`,
  );
  const {isLoading, setStatus} = useStatus();
  const {
    isOpen: isSuccessModalOpen,
    closeModal: closeSuccessModal,
    openModal: openSuccessModal,
  } = useModalControls();
  const {currencyLabel} = useComputedDetails();

  const {
    data: selfCheckinPlan,
    error: selfCheckinPlanError,
    status: selfCheckinPlanStatus,
  } = useQuery<Plan, [string, string, CURRENCIES]>(
    ['selfCheckInPlanDetails', paymentQuery, currency],
    fetchSelfCheckinPlan,
    {
      enabled: Boolean(isSelfCheckinActive),
    },
  );
  useErrorToast(selfCheckinPlanError, {
    notFoundMessage: 'Self-checkin plan could not be found. Please contact support.',
  });

  const {
    data: planDetails,
    status: planDetailsStatus,
    error: planDetailsError,
  } = useQuery<Plan, string>(paymentQuery, fetchPlans, {
    refetchOnWindowFocus: false,
  });
  useErrorToast(planDetailsError, {
    notFoundMessage: 'Requested plan details could not be found. Please contact support',
  });

  const {data: price, status: priceStatus, error: priceError} = useQuery<
    PlanTotalPrice,
    [string, string, number?]
  >(['planChangePrice', planDetails?.unique_id], fetchPrice, {
    refetchOnWindowFocus: false,
    enabled: Boolean(planDetails?.unique_id),
  });
  useErrorToast(priceError, {
    notFoundMessage: 'Requested price could not be found. Please contact support',
  });

  const isPriceLoading = planDetailsStatus === 'loading' || priceStatus === 'loading';
  const isChangeButtonDisabled =
    nextSubscriptionInterval?.value === subscriptionInterval?.value ||
    isPriceLoading ||
    selfCheckinPlanStatus === 'loading';

  React.useEffect(
    function setPaymentQueryString() {
      if (!subscriptionInterval?.value || !subscription) {
        return;
      }

      const queryString = `interval=${subscriptionInterval.value}&type=${
        subscriptionInterval ? subscription.type : SUBSCRIPTION_TYPES.housing
      }&is_free=${user?.is_police_registration_free ? '1' : '0'}&currency=${currency}`;
      setPaymentQuery(queryString);
    },
    [subscription, subscriptionInterval, user, currency],
  );

  React.useEffect(
    function preloadSubscriptionInterval() {
      if (!subscription) {
        return;
      }

      const interval = getNextPlanInterval(subscription);
      const intervalOption = getSubscriptionIntervalOption(interval);
      setNextSubscriptionInterval(intervalOption);
      setSubscriptionInterval(intervalOption);
    },
    [subscription],
  );

  const getSubscriptionPayload = () => {
    const chekinId = planDetails?.unique_id;

    if (isSelfCheckinActive) {
      return {
        items: [
          {
            plan: chekinId,
            quantity: null,
          },
          {
            plan: selfCheckinPlan?.unique_id,
            quantity: null,
          },
        ],
      };
    }

    return {
      items: [
        {
          plan: chekinId,
          quantity: null,
        },
      ],
    };
  };

  const updateSubscription = async () => {
    setStatus('loading');
    const payload = getSubscriptionPayload();

    const {data, error} = await updateAndSetSubscription(
      subscription?.stripe_id!,
      payload,
    );

    if (!isMounted.current) {
      return;
    }

    if (data) {
      openSuccessModal();
    }
    if (error) {
      displayError(error);
    }

    setStatus('idle');
  };

  const getPrice = () => {
    if (!price) {
      return `0.00 ${currencyLabel}`;
    }

    const taxPercent = invoices?.tax_percent || 0;
    const priceWithTax = price.price * ((100 + taxPercent) / 100);
    return `${priceWithTax.toFixed(2)} ${currencyLabel}`;
  };

  const closeModals = () => {
    closeSuccessModal();
    onClose();
  };

  if (!open) {
    return null;
  }

  if (isSuccessModalOpen) {
    return (
      <Modal
        iconSrc={checkIcon}
        iconAlt="Green checkmark"
        iconProps={{height: 84, width: 84}}
        title={t('success')}
        text={t('subscription_will_change_on_the_next_period')}
      >
        <FinishModalButtonWrapper>
          <ModalButton label={t('ok')} onClick={closeModals} />
        </FinishModalButtonWrapper>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      iconSrc={changePlanIcon}
      iconAlt="A hand with screens"
      iconProps={{
        height: 84,
        width: 84,
      }}
      title={t('change_plan')}
    >
      <Content>
        <FieldWrapper>
          <Select
            disabled={isLoading}
            label={t('type_of_subscription')}
            onChange={(type: SelectOption) => setSubscriptionInterval(type)}
            value={subscriptionInterval}
            options={INTERVAL_TYPES_OPTIONS}
          />
        </FieldWrapper>
        {isLoading ? (
          <LoaderWrapper>
            <Loader height={30} width={30} />
          </LoaderWrapper>
        ) : (
          <Main>
            <PriceContent>
              <PriceLabel>{t('price')}</PriceLabel>
              <PriceWrapper>
                <PriceContainer>
                  {isPriceLoading ? (
                    <PriceLoaderWrapper>
                      <Loader />
                    </PriceLoaderWrapper>
                  ) : (
                    getPrice()
                  )}
                </PriceContainer>{' '}
                <PriceTypeAndInterval>
                  {subscriptionInterval?.value === SUBSCRIPTION_INTERVALS.month
                    ? t('month').toLowerCase()
                    : t('year').toLowerCase()}
                  /{isHotelSubscription ? t('room').toLowerCase() : 'property'}
                </PriceTypeAndInterval>
              </PriceWrapper>
            </PriceContent>
            <ModalTwoButtonsWrapper>
              <ModalButton
                disabled={isChangeButtonDisabled}
                onClick={updateSubscription}
                label={t('change_plan')}
              />
              <ModalButton secondary label={t('cancel')} onClick={onClose} />
            </ModalTwoButtonsWrapper>
          </Main>
        )}
      </Content>
      <ErrorModal />
    </Modal>
  );
}

export {ChangePlanModal};
