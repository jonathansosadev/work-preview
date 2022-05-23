import mixpanel from 'mixpanel-browser';
import {extractUTMParams, parseJWT} from '../utils/common';
import {PATTERNS} from '../utils/constants';
import {getTokenFromLocalStorage} from '../api';

function mixpanelTrackWithUTM(eventName: string) {
  if (!mixpanel) {
    return;
  }

  try {
    mixpanel.track(eventName, extractUTMParams());
  } catch (e) {
    console.error(e);
  }
}

function mixpanelAlias(email: string) {
  const isEmail = PATTERNS.email.test(email);

  if (!mixpanel) {
    return;
  }

  try {
    if (isEmail) {
      mixpanel.alias(email);
    } else {
      console.error(`Not an email address ${email}, cannot use it for alias`);
    }
  } catch (e) {
    console.error(e);
  }
}

function mixpanelIdentify(email: string) {
  const isEmail = PATTERNS.email.test(email);

  if (!mixpanel) {
    return;
  }

  try {
    if (isEmail) {
      mixpanel.identify(email);
    } else {
      console.error(`Not an email address ${email}, cannot use it for identifying`);
    }
  } catch (e) {
    console.error(e);
  }
}

function mixpanelReset() {
  if (!mixpanel) {
    return;
  }

  try {
    mixpanel.reset();
  } catch (e) {
    console.error(e);
  }
}

function initMixpanel(token?: string) {
  if (!token) {
    return;
  }

  mixpanel.init(token, {
    loaded: (mixpanel) => {
      const distinctId = mixpanel.get_distinct_id();
      const isEmail = PATTERNS.email.test(distinctId);

      try {
        if (!isEmail) {
          const jwt = getTokenFromLocalStorage();

          if (jwt) {
            const userData = parseJWT(jwt);
            const email = userData.username;

            mixpanelAlias(email);
            mixpanelIdentify(email);
          }
        } else {
          mixpanelIdentify(distinctId);
        }
      } catch (e) {
        console.error(e);
      }

      localStorage.setItem('distinct_id', JSON.stringify(distinctId));
    },
  });
}

export {
  initMixpanel,
  mixpanelAlias,
  mixpanelIdentify,
  mixpanelReset,
  mixpanelTrackWithUTM,
};
