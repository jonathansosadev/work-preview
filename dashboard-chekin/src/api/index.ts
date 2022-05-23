import i18next from 'i18next';
import {refreshFetch} from '../utils/refreshFetch';
import {isMobile} from 'react-device-detect';
import {getAndHandleResponseError} from '../utils/api';
import * as Sentry from '@sentry/react';
import * as auth from './auth';
import * as users from './users';
import * as payments from './payments';
import * as housings from './housings';
import * as importXLSX from './importXLSX';
import * as locations from './locations';
import * as policeAccount from './policeAccount';
import * as statAccount from './statAccount';
import * as rooms from './rooms';
import * as documents from './documents';
import * as reservations from './reservations';
import * as purposesOfStay from './purposesOfStay';
import * as statTaxExemptions from './statTaxExemptions';
import * as guestGroups from './guestGroups';
import * as guests from './guests';
import * as ocr from './ocr';
import * as italianPoliceReceipts from './italianPoliceReceipts';
import * as password from './password';
import * as testErrors from './testErrors';
import * as seasons from './seasons';
import * as locks from './locks';
import * as policeReceipts from './policeReceipts';
import * as statReceipts from './statReceipts';
import * as customEmails from './customEmails';
import * as paymentsSettings from './paymentsSettings';
import * as writeOffs from './writeOffs';
import * as seasonGuests from './seasonGuests';
import * as guestPayments from './guestPayments';
import * as guestCustomForm from './guestCustomForm';
import * as paymentRefunds from './paymentRefunds';
import * as hubspot from './hubspot';
import * as reservationPayments from './reservationPayments';
import * as reservationSources from './reservationSources';
import * as housingExemptions from './housingExemptions';
import * as emailSendingSettings from './emailSendingSettings';
import * as upselling from './upselling';
import * as propertiesProtections from './propertiesConections';
import * as validators from './validators';

const USER_TOKEN = 'user';
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://api-ng.chekintest.xyz';
const RETRY_RESPONSE_STATUSES = [500, 503, 504];
const MAX_RETRIES_NUMBER = 1;

export type ResolverTypes<DataType = any> = {
  data: DataType;
  error: any;
  aborted?: boolean;
};

export type ResolverData = {
  customURL?: string;
  retries?: number;
};

function getURL(endpoint = '') {
  return `${BASE_URL}/api/v3/${endpoint}`;
}

function request(endpoint = '', options?: any, data?: ResolverData) {
  return refreshFetch(data?.customURL || getURL(endpoint), {
    headers: getAuthAndBaseHeaders(),
    ...options,
  });
}

function queryFetcher<T = any>(endpoint = '', options?: any, data?: ResolverData) {
  return request(endpoint, options, data)
    .then((result) => result.body as T)
    .catch((error: any) => {
      const responseError = getAndHandleResponseError(
        error.response,
        error.body,
        options,
      );

      if (responseError) {
        throw responseError;
      }
      throw error.body;
    });
}

async function resolver(
  endpoint: string,
  options?: any,
  data?: ResolverData,
): Promise<ResolverTypes> {
  const result: ResolverTypes = {
    data: null,
    error: null,
    aborted: false,
  };

  try {
    const {response, body} = await request(
      endpoint,
      {
        headers: getAuthAndBaseHeaders(),
        ...options,
      },
      data,
    );

    if (options?.signal?.aborted) {
      return result;
    }

    if (response.status === 204) {
      result.data = 'success';
      return result;
    }

    result.data = body;
  } catch (error:any) {
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
      Sentry.captureException(error);
    }

    result.error = error?.body;
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

function persistUserTokenToLocalStorage(token = ''): void {
  localStorage.setItem(USER_TOKEN, JSON.stringify({token}));
}

function removeUserTokenFromLocalStorage(): void {
  localStorage.removeItem(USER_TOKEN);
}

const api = {
  auth,
  users,
  payments,
  housings,
  importXLSX,
  locations,
  policeAccount,
  statAccount,
  rooms,
  documents,
  reservations,
  purposesOfStay,
  statTaxExemptions,
  guestGroups,
  guests,
  ocr,
  italianPoliceReceipts,
  password,
  testErrors,
  policeReceipts,
  statReceipts,
  locks,
  customEmails,
  seasons,
  paymentsSettings,
  writeOffs,
  seasonGuests,
  guestPayments,
  paymentRefunds,
  guestCustomForm,
  hubspot,
  reservationPayments,
  reservationSources,
  housingExemptions,
  emailSendingSettings,
  upselling,
  propertiesProtections,
  validators,
};

export default api;

export {
  getURL,
  resolver,
  getAuthAndBaseHeaders,
  getAnonymousHeaders,
  getTokenFromLocalStorage,
  persistUserTokenToLocalStorage,
  removeUserTokenFromLocalStorage,
  request,
  queryFetcher,
  USER_TOKEN,
};
