import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import EditReservationSections from '../components/dashboard/EditReservationSections';

function ReservationsEdit(props: any) {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.reservations, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <EditReservationSections {...props} />
    </>
  );
}

export {ReservationsEdit};
