import React from 'react';
import ReactGA from 'react-ga';
import {useLocation} from 'react-router-dom';

function setupGA() {
  const trackingId = process.env.REACT_APP_GA_TRACKING_ID;
  if (!trackingId) {
    console.warn('Missing Google Analytics tracking id. Setup abandoned.');
    return;
  }

  ReactGA.initialize(trackingId);
}

function GA() {
  const location = useLocation();

  React.useEffect(() => {
    setupGA();
  }, []);

  React.useEffect(() => {
    ReactGA.pageview(`${location.pathname}${location.search}`);
  }, [location]);

  return null;
}

export {GA};
