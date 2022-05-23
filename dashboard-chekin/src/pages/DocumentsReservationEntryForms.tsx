import React from 'react';
import TrialHeader from '../components/dashboard/TrialHeader';
import Header from '../components/dashboard/Header';
import DocumentsHeader from '../components/dashboard/DocumentsHeader';
import ReservationEntryForms from '../components/dashboard/ReservationEntryForms';

function DocumentsReservationEntryForms() {
  return (
    <>
      <TrialHeader />
      <Header />
      <DocumentsHeader />
      <ReservationEntryForms />
    </>
  );
}

export {DocumentsReservationEntryForms};
