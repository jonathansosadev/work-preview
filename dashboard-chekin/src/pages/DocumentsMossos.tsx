import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import DocumentsHeader from '../components/dashboard/DocumentsHeader';
import PoliceReceiptsMossosTable from '../components/dashboard/PoliceReceiptsMossosTable';

function DocumentsMossos() {
  return (
    <>
      <TrialHeader />
      <Header />
      <DocumentsHeader />
      <PoliceReceiptsMossosTable />
    </>
  );
}

export {DocumentsMossos};
