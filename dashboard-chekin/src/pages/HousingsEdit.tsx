import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import EditHousingSections from '../components/dashboard/EditHousingSections';

function HousingsEdit(props: any) {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.housings, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <EditHousingSections {...props} />
    </>
  );
}

export {HousingsEdit};
