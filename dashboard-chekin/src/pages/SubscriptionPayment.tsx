import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import ElementsInjectedSubscriptionPaymentStep from '../components/dashboard/SubscriptionPaymentStep';

function SubscriptionPayment(props: any) {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.subscriptions, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <ElementsInjectedSubscriptionPaymentStep {...props} />
    </>
  );
}

export {SubscriptionPayment};
