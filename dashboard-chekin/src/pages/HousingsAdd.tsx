import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import AddHousingSections from '../components/dashboard/AddHousingSections';

function HousingsAdd() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.housings, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <AddHousingSections />
    </>
  );
}

export {HousingsAdd};
