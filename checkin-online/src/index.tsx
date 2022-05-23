import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import 'url-search-params-polyfill';
import 'polyfill-array-includes';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
import 'es7-object-polyfill';
import 'es6-object-assign/auto';
import ReactGA from 'react-ga';
import FullStory from 'react-fullstory';
import * as Sentry from '@sentry/react';
import {Integrations} from '@sentry/tracing';
import {CaptureConsole} from '@sentry/integrations';
import * as serviceWorker from './serviceWorker';
import {createBrowserHistory} from 'history';
import {polyfillForEach} from './utils/polyfills';
import {initDrift} from './analytics/drift';
import Maintenance from './components/Maintenance';
import AppProviders from './context';
import App from './App';

polyfillForEach();

const IS_UNDER_MAINTENANCE = Boolean(process.env.REACT_APP_MAINTENANCE_MODE);
const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';
const FULLSTORY_CONFIG = {
  org: process.env.REACT_APP_FULLSTORY_ORG || '',
  namespace: 'FS',
};
const browserHistory = createBrowserHistory();

function setupGA() {
  const trackingId = process.env.REACT_APP_GA_TRACKING_ID;

  if (trackingId) {
    ReactGA.initialize(trackingId);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }
}

function setupSentry() {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  const environment = process.env.REACT_APP_ENV;
  const domain = process.env.REACT_APP_DOMAIN || 'localhost';

  if (dsn) {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        new Integrations.BrowserTracing({
          tracingOrigins: [domain],
          routingInstrumentation: Sentry.reactRouterV5Instrumentation(browserHistory),
        }),
        new CaptureConsole({
          levels: ['error'],
        }),
      ],
      tracesSampleRate: 0.5,
      maxValueLength: 10000,
    });
  }
}

function setupDrift() {
  const driftId = process.env.REACT_APP_DRIFT_ID;

  if (driftId) {
    initDrift(driftId);
  }
}

if (IS_PRODUCTION_BUILD) {
  setupSentry();
  setupGA();
  setupDrift();
}

ReactDOM.render(
  IS_UNDER_MAINTENANCE ? (
    <Maintenance />
  ) : (
    <>
      {IS_PRODUCTION_BUILD && (
        <>
          <FullStory {...FULLSTORY_CONFIG} />
        </>
      )}
      <AppProviders browserHistory={browserHistory}>
        <App />
      </AppProviders>
    </>
  ),
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
