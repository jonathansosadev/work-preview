import PropertyProtectionComponent from 'components/dashboard/PropertyProtectionComponent';
import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import {LOCK_PROPERTY_PROTECTIONS} from '../utils/constants';

function SuperHogPropertyProtection() {
  return (
    <>
      <TrialHeader />
      <Header />
      <PropertyProtectionComponent type={LOCK_PROPERTY_PROTECTIONS.superhub} />
    </>
  );
} 

export {SuperHogPropertyProtection};
