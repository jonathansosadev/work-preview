import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import DocumentsHeader from '../components/dashboard/DocumentsHeader';
import ContractsTable from '../components/dashboard/ContractsTable';

function DocumentsContracts() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.documents, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <DocumentsHeader />
      <ContractsTable />
    </>
  );
}

export {DocumentsContracts};
