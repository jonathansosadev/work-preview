import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import 'moment-timezone';
import 'array-flat-polyfill';
import 'polyfill-array-includes';
import 'url-search-params-polyfill';
import 'polyfill-array-includes';
import FullStory from 'react-fullstory';
import * as Sentry from '@sentry/react';
import * as serviceWorker from './serviceWorker';
import {pdfjs} from 'react-pdf';
import {hotjar} from 'react-hotjar';
import {Integrations} from '@sentry/tracing';
import {CaptureConsole} from '@sentry/integrations';
import {createBrowserHistory} from 'history';
import {initMixpanel} from './analytics/mixpanel';
import {initGoogleAdword} from './analytics/googleAdword';
import {getSearchParamFromUrl} from 'utils/common';
import App from './App';
import AppProviders from './context';
import Maintenance from './components/common/Maintenance';

const IS_UNDER_MAINTENANCE = Boolean(process.env.REACT_APP_MAINTENANCE_MODE);
const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';
const FULLSTORY_CONFIG = {
  org: process.env.REACT_APP_FULLSTORY_ORG || '',
  namespace: 'FS',
};
const browserHistory = createBrowserHistory();

function setupIsFromAdmin() {
  const developmentParam = getSearchParamFromUrl('development');

  if (developmentParam) {
    sessionStorage.setItem('developmentParam', developmentParam);
  }
}

function setupSentry() {
  const dsn = process.env.REACT_APP_SENTRY_DATA_SOURCE_NAME;
  const environment = process.env.REACT_APP_ENV; // 'cf.production'; //
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

function setupMixpanel() {
  const token = process.env.REACT_APP_MIXPANEL_TOKEN;

  if (token) {
    initMixpanel(token);
  }
}

function setupGoogleAdword() {
  initGoogleAdword();
}

function setupHotjar() {
  const hotjarId = Number(process.env.REACT_APP_HOTJAR_ID);
  const hotjarSv = Number(process.env.REACT_APP_HOTJAR_SV);
  const isEnvironmentProd = process.env.REACT_APP_ENV === 'production';

  if (hotjarId && hotjarSv && isEnvironmentProd) {
    hotjar.initialize(hotjarId, hotjarSv);
  }
}

if (IS_PRODUCTION_BUILD) {
  setupIsFromAdmin();
  setupSentry();
  setupMixpanel();
  setupGoogleAdword();
  setupHotjar();
} else {
  setupMixpanel();
}

console.log(
  'IS_PRODUCTION_BUILD: ',
  IS_PRODUCTION_BUILD,
  'NODE_ENV: ',
  process.env.NODE_ENV,
  'REACT_APP_ENV: ',
  process.env.REACT_APP_ENV,
);

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
