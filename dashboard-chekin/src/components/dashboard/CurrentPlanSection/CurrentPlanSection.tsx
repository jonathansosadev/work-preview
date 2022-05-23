import React from 'react';
import {useQuery} from 'react-query';
import moment from 'moment';
import type {Subscription} from '../../../utils/types';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import api, {queryFetcher} from '../../../api';
import {SUBSCRIPTION_PRODUCT_TYPES, WS_EVENT_TYPES} from '../../../utils/constants';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
} from '../../../utils/hooks';
import {useSubscription} from '../../../context/subscription';
import {useWebsocket} from '../../../context/websocket';
import {useAuth} from '../../../context/auth';
import {getMomentTZDate} from '../../../utils/common';
import {
  getNextSubscriptionInterval,
  getNextSubscriptionQuantity,
  getSubscriptionInterval,
  getSubscriptionIntervalOption,
  getSubscriptionQuantity,
} from '../../../utils/subscription';
import {useComputedDetails} from '../../../context/computedDetails';
import backpackImg from '../../../assets/backpack.svg';
import redWarningImg from '../../../assets/red-warning.svg';
import redCircleManImg from '../../../assets/man-in-a-red-circle.svg';
import Loader from '../../common/Loader';
import ModalButton from '../ModalButton';
import Modal from '../Modal';
import Button from '../ButtonBilling';
import Input from '../Input';
import SelfCheckinPremiumService from '../SelfCheckinPremiumService';
import PricingPopup from '../PricingPopup';
import BillingPricing from '../BillingPricing';
import ChangePlanModal from '../ChangePlanModal';
import Section from '../Section';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {
  BoldUppercaseText,
  ButtonLabelText,
  ButtonLabelWrapper,
  ButtonsWrapper,
  FieldWrapper,
  LoaderWrapper,
  MarginTopWrapper,
  PlanInfoContent,
  PlanInfoForm,
  PlanTypeText,
  PlanTypeValue,
  PremiumServicesContainer,
  PremiumServicesHeader,
  PricingPopupTrigger,
  PricingPopupTriggerWrapper,
  RegularText,
  SubscribeButtonLink,
  SubscribeLink,
  TextWrapper,
  TrialsLeftCount,
  TrialsLeftImg,
  TrialsLeftLightText,
  TrialsLeftMediumText,
  TrialsLeftTile,
  PymentTitle,
  BillingContainer,
} from './styled';

const CUSTOM_TRIAL_SUBSCRIPTION_FREE_CHECKINS = 5;

function fetchUpcomingInvoices() {
  return queryFetcher(api.payments.ENDPOINTS.upcomingInvoices());
}

function getPreloadedSubscriptionInterval(
  subscription?: Subscription,
  isNextPeriod?: boolean,
): string {
  let interval: string | null;

  if (isNextPeriod) {
    interval = getNextSubscriptionInterval(
      subscription,
      SUBSCRIPTION_PRODUCT_TYPES.chekin,
    );
  } else {
    interval = getSubscriptionInterval(subscription, SUBSCRIPTION_PRODUCT_TYPES.chekin);
  }
  return getSubscriptionIntervalOption(interval).label as string;
}

function getPreloadedAccommodationsNumber(
  subscription?: Subscription,
  isNextPeriod?: boolean,
) {
  if (isNextPeriod) {
    return getNextSubscriptionQuantity(subscription, SUBSCRIPTION_PRODUCT_TYPES.chekin);
  } else {
    return getSubscriptionQuantity(subscription, SUBSCRIPTION_PRODUCT_TYPES.chekin);
  }
}

type GoodbyeModalProps = {
  open: boolean;
  close: () => void;
};

function GoodbyeModal({open, close}: GoodbyeModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      open={open}
      iconSrc={redCircleManImg}
      iconAlt="Warning"
      iconProps={{
        height: 154,
        width: 154,
      }}
      title={t('plan_canceled')}
      text={t('we_are_sorry_to_say_goodbye')}
    >
      <ModalTwoButtonsWrapper>
        <ModalButton onClick={close} label={t('ok')} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

function CurrentPlanSection() {
  const {t} = useTranslation();
  const ws = useWebsocket();
  const history = useHistory();
  const isMounted = useIsMounted();
  const {accountDetails: user} = useAuth();
  const {ErrorModal, displayError} = useErrorModal();
  const {isAccountCollaborator, isAccountManager} = useComputedDetails();
  const {
    subscription,
    hasSubscriptionPlan,
    isTrialMode,
    isSubscriptionRequired,
    isTrialEnded,
    isSubscriptionScheduledToCancel,
    restartSubscription,
    isSubscriptionCanceled,
    refreshSubscription,
    isSubscriptionActive,
    isCustomTrial,
    isHotelSubscription,
    isRemoteAccessActive,
    isIdentityVerificationActive,
    isTaxActive,
    isDepositActive,
    isLoading: isLoadingSubscription,
  } = useSubscription();
  const {
    isOpen: isCancelSubscriptionModalOpen,
    closeModal: closeCancelSubscriptionModal,
    openModal: openCancelSubscriptionModal,
  } = useModalControls();
  const {
    isOpen: isAfterCancelSubscriptionModalOpen,
    closeModal: closeAfterCancelSubscriptionModal,
    openModal: openAfterCancelSubscriptionModal,
  } = useModalControls();
  const {
    isOpen: isPricingModalOpen,
    closeModal: closePricingModal,
    openModal: openPricingModal,
  } = useModalControls();
  const {
    isOpen: isChangePlanModalOpen,
    closeModal: closeChangePlanModal,
    openModal: openChangePlanModal,
  } = useModalControls();

  const [accommodationsNumber, setAccommodationsNumber] = React.useState(0);
  const [isWaitingForWSEvent, setIsWaitingForWSEvent] = React.useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = React.useState(false);

  const isUsingNextPeriodItem = isCustomTrial && isTrialMode;
  const [subscriptionInterval, setSubscriptionInterval] = React.useState(() => {
    return getPreloadedSubscriptionInterval(subscription, isUsingNextPeriodItem);
  });

  const hasUpcomingInvoices = isCustomTrial
    ? !isCancellingSubscription &&
      !isWaitingForWSEvent &&
      !isLoadingSubscription &&
      isSubscriptionActive &&
      !isSubscriptionScheduledToCancel
    : !isCancellingSubscription &&
      !isWaitingForWSEvent &&
      !isLoadingSubscription &&
      !isSubscriptionScheduledToCancel;

  const {
    data: invoices,
    error: upcomingInvoicesError,
    status: upcomingInvoicesStatus,
    refetch: refetchUpcomingInvoices,
  } = useQuery('upcomingInvoices', fetchUpcomingInvoices, {
    refetchOnWindowFocus: false,
    enabled: hasUpcomingInvoices,
  });
  useErrorToast(upcomingInvoicesError, {
    notFoundMessage: t('errors.requested_invoices_not_found'),
  });

  const isLoading =
    !isChangePlanModalOpen &&
    (upcomingInvoicesStatus === 'loading' ||
      isLoadingSubscription ||
      isWaitingForWSEvent);

  React.useEffect(
    function redirect() {
      const isAccessDenied =
        isAccountCollaborator || !isSubscriptionRequired || isAccountManager;

      if (isAccessDenied) {
        history.push('/bookings');
      }
    },
    [user, history, isSubscriptionRequired, isAccountCollaborator, isAccountManager],
  );

  React.useEffect(
    function handleWSEvents() {
      if (ws.message?.event_type === WS_EVENT_TYPES.subscriptionUpdated) {
        refetchUpcomingInvoices();
        setIsWaitingForWSEvent(false);
      }

      return () => {
        ws.clearMessage();
      };
    },
    [ws, refetchUpcomingInvoices],
  );

  React.useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  React.useEffect(() => {
    let quantity = getPreloadedAccommodationsNumber(subscription, isUsingNextPeriodItem);
    setAccommodationsNumber(quantity);
  }, [isUsingNextPeriodItem, subscription]);

  React.useEffect(() => {
    const interval = getPreloadedSubscriptionInterval(
      subscription,
      isUsingNextPeriodItem,
    );
    setSubscriptionInterval(interval);
  }, [isUsingNextPeriodItem, subscription]);

  const cancelSubscription = async () => {
    setIsCancellingSubscription(true);
    const {data, error} = await api.payments.deleteOneSubscription(
      subscription?.stripe_id,
    );

    if (!isMounted.current) {
      return;
    }

    if (error) {
      displayError(error);
    }

    if (data) {
      setIsWaitingForWSEvent(true);
      setIsCancellingSubscription(false);
      openAfterCancelSubscriptionModal();
      closeCancelSubscriptionModal();
    }

    setIsCancellingSubscription(false);
  };

  const reactivateSubscription = async () => {
    setIsWaitingForWSEvent(true);
    await restartSubscription();
  };

  const getCancellationDate = () => {
    if (!subscription?.cancellation_date) {
      return '';
    }

    const date = moment(subscription?.cancellation_date, 'DD-MM-YYYY');

    if (!moment.isDate(date)) {
      return '';
    }
    return getMomentTZDate(date, 'Europe/Madrid');
  };

  let content = (
    <div>
      <PlanInfoContent>
        <PlanInfoForm>
          <PlanTypeText>
            {t('your_current_plan_is')} {` `}
            <PlanTypeValue>
              {isHotelSubscription ? 'Hotel' : t('vacation_rental')}
            </PlanTypeValue>
          </PlanTypeText>
          <FieldWrapper>
            <Input
              readOnly
              label={
                isHotelSubscription ? t('number_of_rooms') : t('number_of_properties')
              }
              type="number"
              value={accommodationsNumber}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Input
              readOnly
              label={t('type_of_subscription')}
              value={subscriptionInterval}
            />
          </FieldWrapper>
          <ButtonsWrapper>
            <Button
              type="button"
              label={
                <ButtonLabelWrapper>
                  <ButtonLabelText>{t('change_plan')}</ButtonLabelText>
                </ButtonLabelWrapper>
              }
              onClick={openChangePlanModal}
              disabled={isLoading}
            />
            <Button
              type="button"
              label={
                <ButtonLabelWrapper>
                  <ButtonLabelText>{t('cancel_plan')}</ButtonLabelText>
                </ButtonLabelWrapper>
              }
              onClick={openCancelSubscriptionModal}
              danger
            />
          </ButtonsWrapper>
        </PlanInfoForm>
        {(isRemoteAccessActive ||
          isIdentityVerificationActive ||
          isTaxActive ||
          isDepositActive) && (
          <PremiumServicesContainer>
            <PremiumServicesHeader>{t('premium_services_added')}:</PremiumServicesHeader>
            <SelfCheckinPremiumService />
          </PremiumServicesContainer>
        )}
        <BillingContainer>
          <PricingPopupTriggerWrapper onClick={openPricingModal}>
            <PymentTitle>{t('payment')} </PymentTitle>
            {t('how_do_we_calc_the_price')}
            <PricingPopupTrigger> (?)</PricingPopupTrigger>
          </PricingPopupTriggerWrapper>
          <BillingPricing hasUpcomingInvoices={hasUpcomingInvoices} />
        </BillingContainer>
      </PlanInfoContent>
    </div>
  );

  if (isSubscriptionScheduledToCancel) {
    const cancellationDate = getCancellationDate();

    content = (
      <div>
        <TextWrapper>{t('your_plan_is_canceled')}</TextWrapper>
        {cancellationDate && (
          <>
            <TextWrapper>
              {t('you_will_have_access_until')} {` `} <b>{cancellationDate}</b>.
            </TextWrapper>
            <TextWrapper>{t('after_that_date')}</TextWrapper>
          </>
        )}
        <MarginTopWrapper>
          {isLoadingSubscription ? (
            <Loader width={40} height={40} />
          ) : (
            <Button
              type="button"
              label={t('reactivate_subscription')}
              onClick={reactivateSubscription}
              disabled={isLoadingSubscription}
              secondary
            />
          )}
        </MarginTopWrapper>
      </div>
    );
  }

  if (isSubscriptionCanceled) {
    content = (
      <div>
        <TextWrapper>{t('your_plan_is_canceled')}</TextWrapper>
        <TextWrapper>{t('you_have_to_subscribe_to_keep_adding')}</TextWrapper>
        <MarginTopWrapper>
          <SubscribeButtonLink to="/subscription/number">
            <Button
              type="button"
              label={
                <ButtonLabelWrapper>
                  <ButtonLabelText>{t('subscribe')}</ButtonLabelText>
                </ButtonLabelWrapper>
              }
            />
          </SubscribeButtonLink>
        </MarginTopWrapper>
      </div>
    );
  }

  if (isTrialEnded) {
    content = (
      <div>
        {' '}
        <TextWrapper>{t('trial_ended')}.</TextWrapper>
        <TextWrapper>{t('you_have_to_subscribe_to_keep_adding')}</TextWrapper>
        <MarginTopWrapper>
          <SubscribeButtonLink to="/subscription/number">
            <Button
              type="button"
              label={
                <ButtonLabelWrapper>
                  <ButtonLabelText>{t('subscribe')}</ButtonLabelText>
                </ButtonLabelWrapper>
              }
            />
          </SubscribeButtonLink>
        </MarginTopWrapper>
      </div>
    );
  }

  if (isTrialMode && !hasSubscriptionPlan) {
    content = (
      <div>
        <TextWrapper>
          <RegularText> {t('your_current_plan_is')}</RegularText>
          <BoldUppercaseText> {t('free_trial')}.</BoldUppercaseText>{' '}
          {t('this_includes_number_free_complete_check_ins', {
            number: CUSTOM_TRIAL_SUBSCRIPTION_FREE_CHECKINS,
          })}
        </TextWrapper>
        <TextWrapper>
          {t('if_you_do')}
          <SubscribeLink to="/subscription/number"> {t('subscribe')} </SubscribeLink>
          {t('you_will_get_unlimited_check_ins')}
        </TextWrapper>
        <TrialsLeftTile>
          <TrialsLeftImg src={backpackImg} alt="Backpack" />
          <TrialsLeftCount>
            {isLoadingSubscription ? (
              <Loader />
            ) : (
              subscription?.quantity_allowed! - subscription?.quantity_used!
            )}
          </TrialsLeftCount>
          <TrialsLeftMediumText>{t('check_ins')}</TrialsLeftMediumText>
          <TrialsLeftLightText>{t('left_to_end_the_trial')}</TrialsLeftLightText>
        </TrialsLeftTile>
        <SubscribeButtonLink to="/subscription/number">
          <Button
            type="button"
            label={
              <ButtonLabelWrapper>
                <ButtonLabelText>{t('subscribe')}</ButtonLabelText>
              </ButtonLabelWrapper>
            }
          />
        </SubscribeButtonLink>
      </div>
    );
  }

  return (
    <Section title={t('current_plan')}>
      <ChangePlanModal
        invoices={invoices}
        open={isChangePlanModalOpen}
        onClose={closeChangePlanModal}
      />
      <PricingPopup open={isPricingModalOpen} onClose={closePricingModal} />
      <ErrorModal />

      {isLoading ? (
        <LoaderWrapper>
          <Loader width={45} height={45} label={t('loading')} />
        </LoaderWrapper>
      ) : (
        content
      )}
      <Modal
        open={isCancelSubscriptionModalOpen}
        iconSrc={redWarningImg}
        iconAlt="Warning"
        iconProps={{
          height: 145,
          width: 145,
        }}
        title={t('are_you_sure_to_cancel_your_plan')}
        text={t('if_you_cancel_your_subscription_now')}
      >
        <ModalTwoButtonsWrapper>
          {isCancellingSubscription ? (
            <Loader width={40} height={40} />
          ) : (
            <>
              <ModalButton onClick={cancelSubscription} label={t('yes_cancel_now')} />
              <ModalButton
                secondary
                onClick={closeCancelSubscriptionModal}
                label={t('do_nothing')}
              />
            </>
          )}
        </ModalTwoButtonsWrapper>
      </Modal>
      <GoodbyeModal
        open={isAfterCancelSubscriptionModalOpen}
        close={closeAfterCancelSubscriptionModal}
      />
    </Section>
  );
}

export {CurrentPlanSection};
