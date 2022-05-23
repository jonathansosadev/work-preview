import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import TrialHeader from '../components/dashboard/TrialHeader';
import Header from '../components/dashboard/Header';
import GuestDetailsForm from '../components/dashboard/GuestDetailsForm';

function Guest() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.reservations, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <GuestDetailsForm />
    </>
  );
}

export default Guest;
