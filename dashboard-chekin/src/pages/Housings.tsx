import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import HousingsTable from '../components/dashboard/HousingsTable';

function Housings() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.housings, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <HousingsTable />
    </>
  );
}

export {Housings};
