import React from 'react';
import TrialHeader from '../components/dashboard/TrialHeader';
import Header from '../components/dashboard/Header';
import SelfCheckinPlanSettings from '../components/dashboard/SelfCheckinPlanSettings';

function SelfCheckin() {
  return (
    <>
      <TrialHeader />
      <Header />
      <SelfCheckinPlanSettings />
    </>
  );
}

export {SelfCheckin};
