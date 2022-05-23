import React from 'react';
import {toast} from 'react-toastify';
import i18n from '../i18n';
import {Group} from './types';
import moment, {Moment} from 'moment';
// import {ORIGINS_TO_SHOW_BOOKING_PAYMENTS} from './constants';

export type ErrorType =
  | {
      message: string;
      errors: any;
      details: string;
    }
  | string;

function getErrorMessage(error: ErrorType) {
  let message = '';

  if (!error) {
    return message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error?.details) {
    return error?.details;
  }
  if (error?.errors?.length) {
    Object.values(error.errors).forEach((err: any) => {
      message += ` ${err.message}\n`;
    });
  } else if (error?.message) {
    message = error.message;
  } else {
    if (typeof error === 'object') {
      Object.values(error).forEach((err) => {
        message += ` ${err}\n`;
      });
    }
  }

  if (message?.startsWith('Unexpected JSON')) {
    return 'Server error.';
  }
  return message;
}

function addSupportEmailToMessage(message?: any) {
  if (typeof message !== 'string') {
    return message;
  }

  return (
    <div>
      <div>{message}</div>
      {i18n.t('reach_us_at_email')}
    </div>
  );
}

function toastResponseError(error: any, options: any = {}) {
  const message = addSupportEmailToMessage(getErrorMessage(error));
  const toastId = error?.message || error || 'toastId';

  toast.error(message, {
    toastId,
    position: 'bottom-right',
    type: 'error',
    ...options,
  });
}

function toastResponseError2(error: any, options: any = {}) {
  const {message} = error;
  const toastId = message || 'toastId';

  toast.error(message, {
    toastId,
    position: 'bottom-right',
    type: 'error',
    ...options,
  });
}

function getSearchParamFromUrl<T = string>(param = '', url = window.location.search) {
  const searchParams = new URLSearchParams(url);
  return searchParams.get(param) as T | null;
}

function setSearchParamToUrl(param = '', value = '') {
  const {location, history} = window;
  const url = new URL(location.href);

  url.searchParams.set(param, String(value));
  history.replaceState({}, '', `${location.pathname}?${url.searchParams}`);
}

function removeSearchParamFromUrl(param = '') {
  const {location, history} = window;
  const url = new URL(location.href);

  url.searchParams.delete(param);
  history.replaceState({}, '', `${location.pathname}?${url.searchParams}`);
}

function getRequiredOrOptionalFieldLabel(label: string, required: any) {
  if (required) {
    return label;
  }
  return `${label} (${i18n.t('optional')})`;
}

function scrollToTop(value = 0, behavior?: 'auto' | 'smooth') {
  window.scrollTo({
    top: value,
    behavior: behavior,
  });
}

function scrollToBottom() {
  window.scrollTo({
    top: document.body.scrollHeight || document.documentElement.scrollHeight,
    behavior: 'smooth',
  });
}

function copyToClipboard(value: string) {
  const el = document.createElement('textarea');
  el.value = value;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function downloadFromLink(link?: string) {
  if (!link) return;
  const isSwitched = window.open(link, '_blank');
  if (!isSwitched) {
    const anchorLink = document.createElement('a');
    anchorLink.href = link;
    anchorLink.click();
  }
}

function clearLocationState() {
  window.history.pushState(null, '');
}

function getBase64(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject('File is missing');
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function getPaymentAmountEur(amount?: number, accommodationsNumber = 1) {
  if (!amount) {
    return '0.00';
  }
  return ((amount / 100) * accommodationsNumber).toFixed(2);
}

function getStringWithoutWhitespaces(string = '') {
  return string.replace(/ /g, '');
}

function getIsCollaborator(groups: Group[] = []) {
  const COLLABORATOR = 'Collaborator';
  return Boolean(groups.find((group) => group.name === COLLABORATOR));
}

function getCurrentLocale() {
  try {
    return i18n.language.slice(0, 2);
  } catch (e) {
    console.error(e);
    return 'en';
  }
}

function getMomentTZDate(date: string | Moment | number | Date, timeZone: string) {
  return moment(moment(date).tz(timeZone).format('YYYY-MM-DDTHH:mm'));
}

function parseJWT(token: string) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

function extractUTMParams() {
  const utm = {
    'UTM Source': getSearchParamFromUrl('utm_source'),
    'UTM Medium': getSearchParamFromUrl('utm_medium'),
    'UTM Campaign': getSearchParamFromUrl('utm_campaign'),
  };

  if (utm['UTM Source'] || utm['UTM Medium'] || utm['UTM Campaign']) {
    localStorage.setItem('user_utm_data', JSON.stringify(utm));
    return utm;
  }

  return {};
}

type MenuItemsType = {
  [key: string]: {
    label: string;
    value: string;
    exact?: boolean;
    className?: string;
  };
};

function getMenuOptions(options: MenuItemsType) {
  return Object.values(options);
}

function getIsBookingPaymentsShown(userOrigin: string | undefined) {
  return true; //ORIGINS_TO_SHOW_BOOKING_PAYMENTS.some((origin) => origin === userOrigin);
}

function getDisplayFields(formNames: {[key: string]: string}) {
  return Object.values(formNames).reduce((acc, curr) => ({...acc, [curr]: true}), {});
}

function getFileImageSrc(urlOrFile?: string | File) {
  if (!urlOrFile) {
    return '';
  }

  if (typeof urlOrFile === 'string') {
    return urlOrFile;
  }

  return URL.createObjectURL(urlOrFile);
}

function getFileSizeMB(file: File) {
  return file.size / Math.pow(1024, 2);
}

function parseBooleanFromString(value?: boolean | 'true' | 'false') {
  if (typeof value === 'boolean') return value;
  return value === 'true';
}

export enum Locales {
  en = 'en',
  es = 'es',
}

type LocaleType = Locales.en | Locales.es;
type GetLocaleItemsType = <T = any>(
  a: {[Locales.en]: T} & {[key in LocaleType]?: T},
) => T;

const getItemBasedOnLocale: GetLocaleItemsType = (localeDictionary) => {
  const locale = getCurrentLocale();
  const item =
    locale in localeDictionary
      ? localeDictionary[locale as LocaleType]
      : localeDictionary[Locales.en];
  return item!;
};

function isDateAfterDays(
  startDate: Date | Moment | string | null | undefined,
  daysCount: number,
) {
  const startDateShow = moment(startDate).add(daysCount, 'd');
  return moment().isAfter(startDateShow);
}

export {
  parseBooleanFromString,
  downloadFromLink,
  getFileSizeMB,
  getFileImageSrc,
  getMenuOptions,
  getMomentTZDate,
  extractUTMParams,
  parseJWT,
  getCurrentLocale,
  getStringWithoutWhitespaces,
  getBase64,
  clearLocationState,
  getRequiredOrOptionalFieldLabel,
  getErrorMessage,
  getSearchParamFromUrl,
  setSearchParamToUrl,
  removeSearchParamFromUrl,
  toastResponseError,
  scrollToTop,
  scrollToBottom,
  copyToClipboard,
  getPaymentAmountEur,
  getIsCollaborator,
  addSupportEmailToMessage,
  getIsBookingPaymentsShown,
  getDisplayFields,
  toastResponseError2,
  getItemBasedOnLocale,
  isDateAfterDays,
};

export type {MenuItemsType};
