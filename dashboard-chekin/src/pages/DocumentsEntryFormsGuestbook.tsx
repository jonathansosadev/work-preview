import React from 'react';
import {GOOGLE_OPTIMIZE_PAGES_IDS, initGoogleOptimize} from '../analytics/googleOptimize';
import TrialHeader from '../components/dashboard/TrialHeader';
import Header from '../components/dashboard/Header';
import DocumentsHeader from '../components/dashboard/DocumentsHeader';
import EntryFormsGuestbookView from '../components/dashboard/EntryFormsGuestbookView';

function DocumentsEntryFormsGuestbook() {
  React.useEffect(() => {
    initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.documents, true);
  }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <DocumentsHeader />
      <EntryFormsGuestbookView />
    </>
  );
}

export {DocumentsEntryFormsGuestbook};
