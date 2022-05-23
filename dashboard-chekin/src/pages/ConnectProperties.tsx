import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import ConnectPropertiesSection from '../components/dashboard/ConnectPropertiesSection';

function ConnectProperties() {
  return (
    <>
      <TrialHeader />
      <Header />
      <ConnectPropertiesSection />
    </>
  );
}

export {ConnectProperties};
