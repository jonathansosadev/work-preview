import i18next from 'i18next';
import {isMobile} from 'react-device-detect';
import * as Sentry from '@sentry/react';
import {refreshFetch} from '../utils/refreshFetch';
import {getAndHandleResponseError, getResponseHeaders} from '../utils/api';
import * as reservations from './reservations';
import * as locations from './locations';
import * as auth from './auth';
import * as purposesOfStay from './purposesOfStay';
import * as documents from './documents';
import * as guests from './guests';
import * as ocr from './ocr';
import * as statTaxExemptions from './statTaxExemptions';
import * as testErrors from './testErrors';
import * as alice from './alice';
import * as seasons from './seasons';
import * as guestPaymentAccounts from './guestPaymentAccounts';
import * as guestPayments from './guestPayments';
import * as paymentsSettings from './paymentsSettings';
import * as seasonGuests from './seasonGuests';
import * as securityDeposits from './securityDeposits';
import * as guestForms from './guestForms';
import * as reservationPayments from './reservationPayments';
import * as housingExemptions from './housingExemptions';
import * as locks from './locks';
import * as getCountryByIp from './getCountryByIp';
import * as universalLink from './universalLink';
import * as validators from './validators';
import * as upselling from './upselling';

const USER_TOKEN = 'user';
const BASE_URL = process.env.REACT_APP_BASE_URL;
const RETRY_RESPONSE_STATUSES = [500, 503, 504];
const MAX_RETRIES_NUMBER = 1;

function getURL(endpoint = '') {
  return `${BASE_URL}/api/v3/${endpoint}`;
}

export type ResolverTypes<T = any> = {
  data: T;
  error: any;
  aborted?: boolean;
};

type ResolverData = {
  customURL?: string;
  retries?: number;
};

async function resolver<T = any>(
  endpoint: string,
  options?: any,
  data?: ResolverData,
): Promise<ResolverTypes<T>> {
  const result: ResolverTypes = {
    data: null,
    error: null,
    aborted: false,
  };

  try {
    const {response, body} = await refreshFetch(data?.customURL || getURL(endpoint), {
      headers: getAuthAndBaseHeaders(),
      ...options,
    });

    if (options?.signal?.aborted) {
      console.warn('ABORTED');
      return result;
    }

    if (response.status === 204) {
      result.data = 'success';
      return result;
    }

    const responseError = getAndHandleResponseError(response, body, options);
    if (responseError) {
      result.error = responseError;
      return result;
    }

    result.data = body;
  } catch (error) {
    if (options?.signal?.aborted) {
      result.aborted = true;
    }

    const retries = data?.retries || 0;
    if (
      RETRY_RESPONSE_STATUSES.includes(error?.response?.status) &&
      retries < MAX_RETRIES_NUMBER
    ) {
      return resolver(endpoint, options, {
        ...data,
        retries: retries + 1,
      });
    }

    const responseError = getAndHandleResponseError(
      error?.response,
      error?.body,
      options,
    );
    if (responseError) {
      result.error = responseError;
      return result;
    } else {
      const headers = getResponseHeaders(error?.response);

      Sentry.withScope(scope => {
        scope.setFingerprint([
          data?.customURL || getURL(endpoint),
          String(error?.response?.statusCode),
        ]);
        Sentry.captureException(error);
        Sentry.captureMessage(`Headers: ${headers || 'no headers'}`);
      });
    }

    result.error = error;
  }

  return result;
}

type AuthTypes = {
  [key: string]: string;
};

function getAuthAndBaseHeaders(): AuthTypes {
  return {
    Authorization: `JWT ${getTokenFromLocalStorage()}`,
    'Content-Type': 'application/json',
    'Accept-Language': i18next.language.slice(0, 2),
    'X-source': isMobile ? 'M' : 'D',
  };
}

function getAnonymousHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

function getTokenFromLocalStorage(): string | null {
  let token = null;

  try {
    const rawUser = localStorage.getItem(USER_TOKEN);
    if (rawUser !== null) {
      const user = JSON.parse(rawUser);
      token = user.token;
    }
  } catch (err) {
    console.error(err);
  }

  return token;
}

function persistTokenToLocalStorage(token = ''): void {
  localStorage.setItem(USER_TOKEN, JSON.stringify({token}));
}

function removeTokenFromLocalStorage(): void {
  localStorage.removeItem(USER_TOKEN);
}

const api = {
  reservations,
  locations,
  auth,
  purposesOfStay,
  documents,
  guests,
  ocr,
  statTaxExemptions,
  testErrors,
  alice,
  seasons,
  guestPaymentAccounts,
  guestPayments,
  paymentsSettings,
  seasonGuests,
  securityDeposits,
  guestForms,
  reservationPayments,
  housingExemptions,
  locks,
  getCountryByIp,
  universalLink,
  validators,
  upselling,
};

export default api;

export {
  getURL,
  resolver,
  getAuthAndBaseHeaders,
  getAnonymousHeaders,
  getTokenFromLocalStorage,
  persistTokenToLocalStorage,
  removeTokenFromLocalStorage,
};
