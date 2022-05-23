import React from 'react';
import Header from '../components/dashboard/Header';
import TrialHeader from '../components/dashboard/TrialHeader';
import NewPropertySections from '../components/dashboard/NewPropertySections';

function NewProperties() {
  // React.useEffect(() => {
  //   initGoogleOptimize(GOOGLE_OPTIMIZE_PAGES_IDS.account, true);
  // }, []);

  return (
    <>
      <TrialHeader />
      <Header />
      <NewPropertySections />
    </>
  );
}

export {NewProperties};
