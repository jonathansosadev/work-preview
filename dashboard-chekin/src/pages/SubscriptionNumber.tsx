import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import SubscriptionNumberStep from '../components/dashboard/SubscriptionNumberStep';

function SubscriptionNumber() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.subscriptions, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <SubscriptionNumberStep />
    </>
  );
}

export {SubscriptionNumber};
