import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import DocumentsHeader from '../components/dashboard/DocumentsHeader';
import PoliceReceiptsTable from '../components/dashboard/PoliceReceiptsTable';

function DocumentsAlloggiati() {
  return (
    <>
      <TrialHeader />
      <Header />
      <DocumentsHeader />
      <PoliceReceiptsTable />
    </>
  );
}

export {DocumentsAlloggiati};
