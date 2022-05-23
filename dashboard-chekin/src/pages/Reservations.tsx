import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import ReservationsTable from '../components/dashboard/ReservationsTable';

function Reservations() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.reservations, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <ReservationsTable />
    </>
  );
}

export {Reservations};
