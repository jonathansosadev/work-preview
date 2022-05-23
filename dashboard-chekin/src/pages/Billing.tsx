import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import BillingSections from '../components/dashboard/BillingSections';
import {useScrollToTop} from '../utils/hooks';

function Billing() {
  useScrollToTop();

  return (
    <>
      <TrialHeader />
      <Header />
      <BillingSections />
    </>
  );
}

export {Billing};
