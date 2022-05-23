import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import MarketplaceHeader from '../components/dashboard/MarketplaceHeader';
import AccessProvidersList from '../components/dashboard/AccessProvidersList';

function AccessProviders() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.marketplace, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <MarketplaceHeader />
      <AccessProvidersList />
    </>
  );
}

export {AccessProviders};
