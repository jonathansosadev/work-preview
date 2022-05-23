import React, {Suspense} from 'react';
import {withProfiler, ErrorBoundary} from '@sentry/react';
import {useTranslation} from 'react-i18next';
import {useDisableInputNumberScroll} from './utils/hooks';
import {useUser} from './context/user';
import Authenticated from './apps/Authenticated';
// import Analytics from './components/common/Analytics';
import GA from './components/common/GA';
import FullPageSpinner from './components/common/FullPageSpinner';
import ErrorBoundaryFallback from './components/common/ErrorBoundaryFallback';
import WebcamWarningModal from './components/dashboard/WebcamWarningModal';
import Hubspot from './components/common/Hubspot';
import CacheControl from './components/common/CacheControl';
import Footer from './components/dashboard/Footer';
import {AppContainer} from './styled/common';

const Unauthenticated = React.lazy(() => import('./apps/Unauthenticated'));

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';

function App() {
  const {t} = useTranslation();
  const user = useUser();
  useDisableInputNumberScroll();

  return (
    <ErrorBoundary
      fallback={<ErrorBoundaryFallback />}
      showDialog={IS_PRODUCTION_BUILD}
      dialogOptions={{
        user: {
          name: user?.name,
          email: user?.email,
        },
        labelComments: t('describe_what_happened'),
      }}
    >
      <Suspense fallback={<FullPageSpinner />}>
        {IS_PRODUCTION_BUILD && <CacheControl />}
        {IS_PRODUCTION_BUILD && <GA />}
        <Hubspot />
        {user ? (
          <>
            <WebcamWarningModal />
            <AppContainer>
              <Authenticated />
            </AppContainer>
            <Footer />
          </>
        ) : (
          <Unauthenticated />
        )}
      </Suspense>
    </ErrorBoundary>
  );
}

export default withProfiler(App);
