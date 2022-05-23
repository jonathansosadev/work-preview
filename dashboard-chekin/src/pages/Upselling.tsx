import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import UpsellingSections from '../components/dashboard/UpsellingSections';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';

function Upselling() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.upselling, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <UpsellingSections />
    </>
  );
}

export {Upselling};
