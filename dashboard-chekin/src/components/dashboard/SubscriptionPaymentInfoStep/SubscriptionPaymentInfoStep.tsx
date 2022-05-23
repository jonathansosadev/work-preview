import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Link, useLocation} from 'react-router-dom';
import {getSubscriptionInterval} from '../../../utils/subscription';
import {useSubscription} from '../../../context/subscription';
import {sendConversion} from '../../../analytics/googleAdword';
import checkIcon from '../../../assets/green-check.svg';
import {PERIODICITY, SUBSCRIPTION_INTERVALS} from '../../../utils/constants';
import {Heading} from '../../../styled/common';
import {
  Content,
  Header,
  SubHeader,
  SubHeaderImg,
  PlanDescription,
  OkButton,
} from './styled';

const GOOGLE_CONVERSION = 'AW-481274774/QCPLCO6ipPQBEJbXvuUB';

type LocationState = {
  prevSubscription?: any;
  interval?: SUBSCRIPTION_INTERVALS;
};

function SubscriptionPaymentInfoStep() {
  const {t} = useTranslation();
  const {
    subscription,
    hasSubscribedWithFreeCheckinsLeft,
    isCustomTrial,
    isTrialMode,
  } = useSubscription();
  const location = useLocation<LocationState>();
  const checkinsLeft = subscription
    ? subscription?.quantity_allowed - subscription?.quantity_used
    : 0;
  const subscriptionInterval =
    location.state?.interval || getSubscriptionInterval(subscription);
  const isMonthlyPlan = subscriptionInterval === PERIODICITY.monthly;

  React.useEffect(() => {
    sendConversion(GOOGLE_CONVERSION);
  }, []);

  return (
    <Content>
      <Heading>
        <div />
        <Header>{t('subscription')}</Header>
      </Heading>
      <SubHeader>
        <SubHeaderImg src={checkIcon} alt="Green check" />
        {t('subscription_completed_exclamation')}
      </SubHeader>
      <PlanDescription>
        {isMonthlyPlan
          ? t('you_are_now_subscribed_to_our_month_plan')
          : t('you_are_now_subscribed_to_our_annual_plan')}
      </PlanDescription>
      {(hasSubscribedWithFreeCheckinsLeft || isTrialMode) && (
        <PlanDescription>
          {t('you_dont_have_to_pay_until_trial_finished')}
          {isCustomTrial && (
            <div>
              <Trans
                values={{number: checkinsLeft}}
                i18nKey="there_are_number_checkins_left_for_finishing_trial"
              >
                There are <b>* check-ins</b> left for finishing your trial
              </Trans>
            </div>
          )}
        </PlanDescription>
      )}
      <Link to="/account/billing">
        <OkButton label="Ok" secondary />
      </Link>
    </Content>
  );
}

export {SubscriptionPaymentInfoStep};
