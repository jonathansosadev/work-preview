import React from 'react';
import AccessProviderConnect from '../components/dashboard/AccessProviderConnect';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import {LOCK_VENDORS} from '../utils/constants';

function SaltoAccessProviderConnect() {
    return (
        <>
            <TrialHeader />
            <Header />
            <AccessProviderConnect type={LOCK_VENDORS.salto} />
        </>
    );
}

export {SaltoAccessProviderConnect};