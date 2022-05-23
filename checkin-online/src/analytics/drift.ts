// @ts-nocheck
import {getCurrentLocale} from '../utils/common';

function initDrift(code: string) {
  if (!code) {
    console.info('No drift ID found');
    return;
  }

  let t = (window.driftt = window.drift = window.driftt || []);
  if (!t.init) {
    if (t.invoked) {
      return void (
        window.console &&
        console.error &&
        console.error('Drift snippet included twice.')
      );
    }
    t.invoked = true;
    t.methods = [
      'identify',
      'config',
      'track',
      'reset',
      'debug',
      'show',
      'ping',
      'page',
      'hide',
      'off',
      'on',
    ];
    t.factory = function (e: any) {
      return function () {
        let n = Array.prototype.slice.call(arguments);
        n.unshift(e);
        t.push(n);
        return t;
      };
    };
    t.methods.forEach(function (e: any) {
      t[e] = t.factory(e);
    });
    t.load = function (t: any) {
      let e = 3e5;
      let n = Math.ceil(new Date() / e) * e;
      let o = document.createElement('script');
      o.type = 'text/javascript';
      o.async = true;
      o.crossorigin = 'anonymous';
      o.src = 'https://js.driftt.com/include/' + n + '/' + t + '.js';
      let i = document.getElementsByTagName('script')[0];
      i.parentNode.insertBefore(o, i);
    };
  }
  window.drift.SNIPPET_VERSION = '0.3.1';

  window.drift.config({
    locale: getCurrentLocale(),
  });
  window.drift.load(code);
}

type Attributes = {
  housing_name: string;
  housing_id: string;
  reservation_id: string;
  co_link: string;
  name: string;
  surname: string;
  email_address: string;
  phone: string;
  origin: string;
  properties_range: string;
  create_date: string;
  subscription_type: string;
  subscription_qty: string;
  subscription_status: string;
  user_country: string;
  status: string;
  properties: number | string;
  reservations: number | string;
  guests: number | string;
};

function driftSetUserAttributes(payload: Partial<Attributes>) {
  try {
    window.drift?.on('ready', function () {
      window.drift.api.setUserAttributes(payload);
    });
  } catch (e) {
    console.error(e);
  }
}

type UserData = {
  email?: string;
  name?: string;
  origin?: string;
};

function driftIdentifyUser(userID: string, userData: UserData = {}) {
  try {
    window.drift?.on('ready', function () {
      window.drift.identify(userID, userData);
    });
  } catch (e) {
    console.error(e);
  }
}

export {initDrift, driftIdentifyUser, driftSetUserAttributes};
