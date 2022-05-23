import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import MarketplaceHeader from '../components/dashboard/MarketplaceHeader';
import PropertiesProtectionsList from 'components/dashboard/PropertiesProtectionsList';

function PropertiesConections() {
  return (
    <>
      <TrialHeader />
      <Header />
      <MarketplaceHeader />
      <PropertiesProtectionsList />
    </>
  );
}

export {PropertiesConections};
