import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import {default as Content} from '../components/dashboard/ImportHousings';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';

function ImportHousings() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.housings, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <Content />
    </>
  );
}

export {ImportHousings};
