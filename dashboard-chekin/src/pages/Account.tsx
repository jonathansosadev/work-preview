import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import AccountSections from '../components/dashboard/AccountSections';

function Account() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.account, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <AccountSections />
    </>
  );
}

export {Account};
