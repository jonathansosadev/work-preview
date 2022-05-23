import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import DocumentsHeader from '../components/dashboard/DocumentsHeader';
import IDEVReceiptsTable from '../components/dashboard/IDEVReceiptsTable';

function DocumentsIDEV() {
  return (
    <>
      <TrialHeader />
      <Header />
      <DocumentsHeader />
      <IDEVReceiptsTable />
    </>
  );
}

export {DocumentsIDEV};
