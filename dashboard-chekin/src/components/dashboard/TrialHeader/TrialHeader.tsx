import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {ORIGINS} from '../../../utils/constants';
import {getTrialDaysLeft} from '../../../utils/subscription';
import {useUser} from '../../../context/user';
import {useSubscription} from '../../../context/subscription';
import {TrialHeaderWrapper, TitleText, BoldText, SubscribeButton} from './styled';
import {usePaymentMethod} from '../../../hooks/usePaymentMethod';

const OriginsToHideBanner = [ORIGINS.smoobu, ORIGINS.amenitiz];

function TrialHeader() {
  const {t} = useTranslation();
  const user = useUser();
  const userOrigin = user?.origin || '';
  const {
    subscription,
    isSubscriptionCanceled,
    isSubscriptionActive,
    isSubscriptionScheduledToCancel,
    isTrialMode,
    restartSubscription,
    isLoading,
    hasSubscribedWithFreeCheckinsLeft,
    isTrialEnded,
    isCustomTrial,
  } = useSubscription();

  const {status: paymentMethodStatus, hasPaymentMethod} = usePaymentMethod();

  const checkinsLeft = subscription?.quantity_allowed! - subscription?.quantity_used!;
  const daysLeft = getTrialDaysLeft(subscription?.trial_end_epoch);

  const isStripeTrialFinished = Boolean(!isCustomTrial && hasPaymentMethod);
  const isSubscribeButtonVisible =
    isSubscriptionCanceled || isCustomTrial
      ? !isSubscriptionScheduledToCancel && !hasSubscribedWithFreeCheckinsLeft
      : !isSubscriptionScheduledToCancel && !isStripeTrialFinished;
  const shouldHideHeader =
    OriginsToHideBanner.includes(userOrigin) ||
    paymentMethodStatus === 'loading' ||
    (!isSubscriptionScheduledToCancel && isSubscriptionActive) ||
    (!isSubscriptionScheduledToCancel &&
      subscription?.quantity_allowed === undefined &&
      !subscription?.trial_end_epoch &&
      !isSubscriptionCanceled);

  const getTitle = () => {
    if (isSubscriptionCanceled) {
      return (
        <TitleText>
          <BoldText>{t('you_dont_have_active_subscription')}</BoldText>
        </TitleText>
      );
    }

    if (isSubscriptionScheduledToCancel) {
      return (
        <TitleText>
          <BoldText>{t('you_are_not_subscribed')}</BoldText>
        </TitleText>
      );
    }

    if (isCustomTrial) {
      if (hasSubscribedWithFreeCheckinsLeft) {
        return (
          <TitleText>
            <Trans i18nKey="you_have_number_checkins_left">
              You have {{number: checkinsLeft || 0}} checkins left
            </Trans>
          </TitleText>
        );
      }

      if (isTrialMode) {
        return (
          <TitleText>
            <BoldText>{t('you_are_in_trial_mode')} - </BoldText>
            <Trans i18nKey="you_have_number_checkins_left">
              You have {{number: checkinsLeft || 0}} checkins left
            </Trans>
          </TitleText>
        );
      }

      if (isTrialEnded) {
        return (
          <TitleText>
            <BoldText>{t('your_trial_has_ended')} - </BoldText>
            <Trans i18nKey="you_have_number_checkins_left">
              You have {{number: checkinsLeft || 0}} checkins left
            </Trans>
          </TitleText>
        );
      }
    } else {
      if (isStripeTrialFinished) {
        return (
          <TitleText>
            <Trans i18nKey="you_have_number_days_left">
              You have {{number: daysLeft}} days left
            </Trans>
          </TitleText>
        );
      }

      if (isTrialMode) {
        return (
          <TitleText>
            <BoldText>{t('you_are_in_trial_mode')} - </BoldText>
            <Trans i18nKey="you_have_number_days_left">
              You have {{number: daysLeft}} days left
            </Trans>
          </TitleText>
        );
      }

      if (isTrialEnded) {
        return (
          <TitleText>
            <BoldText>{t('your_trial_has_ended')} - </BoldText>
            <Trans i18nKey="you_have_number_days_left">
              You have {{number: daysLeft}} days left
            </Trans>
          </TitleText>
        );
      }
    }
  };

  const title = getTitle();
  if (shouldHideHeader || !title) {
    return null;
  }

  return (
    <TrialHeaderWrapper>
      {title}
      {isSubscribeButtonVisible && (
        <Link to="/subscription/number">
          <SubscribeButton label={t('subscribe_now')} />
        </Link>
      )}
      {isSubscriptionScheduledToCancel && (
        <SubscribeButton
          disabled={isLoading}
          onClick={restartSubscription}
          label={t('reactivate_subscription')}
        />
      )}
    </TrialHeaderWrapper>
  );
}

export {TrialHeader};
