import React from 'react';
import {default as Content} from '../components/dashboard/ImportReservations';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';

function ImportReservations() {
  return (
    <>
      <TrialHeader />
      <Header />
      <Content />
    </>
  );
}

export {ImportReservations};
