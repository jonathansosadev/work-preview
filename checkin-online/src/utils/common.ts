import i18next from 'i18next';
import moment from 'moment';
import {COUNTRY_CODES} from './constants';

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
    const nonFieldErrors = 'non_field_errors';
    Object.values(error.errors).forEach((err: any) => {
      message += ` ${err.field && err.field !== nonFieldErrors ? `${err.field}:` : ''} ${
        err.message
      }\n`;
    });
  } else if (error?.message) {
    message = error.message;
  } else {
    if (typeof error === 'object') {
      Object.values(error).forEach(err => {
        message += ` ${err}\n`;
      });
    }
  }

  if (typeof message === 'object') {
    return '';
  }

  if (message?.startsWith('Unexpected JSON')) {
    return 'Server error.';
  }

  return message;
}

function getURLSearchParam(name: string, source = window.location.search) {
  const searchParams = new URLSearchParams(source);
  return searchParams.get(name);
}

function setURLSearchParam(name: string, value = '', target = window.location.search) {
  const searchParams = new URLSearchParams(target);
  return searchParams.set(name, value);
}

function deleteQueryParam(name: string, source = window.location.search) {
  const searchParams = new URLSearchParams(source);
  searchParams.delete(name);

  return searchParams.toString();
}

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

function getCurrentLocale() {
  try {
    return i18next.language.slice(0, 2);
  } catch (e) {
    return 'en';
  }
}

function getEnvVariable(key: string) {
  const variable = process.env[key];

  if (!variable) {
    throw new Error(`${key} .env variable is missing.`);
  }

  return variable;
}

function getMinCheckInDate(countryCode?: string) {
  let date;

  if (countryCode === COUNTRY_CODES.portugal) {
    date = moment().subtract(4, 'days');
  } else {
    date = moment().subtract(1, 'days').startOf('day');
  }

  return date;
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

function getBase64(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject('File is missing');
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export {
  getBase64,
  getErrorMessage,
  getURLSearchParam,
  setURLSearchParam,
  getCurrentLocale,
  parseJwt,
  getEnvVariable,
  getMinCheckInDate,
  deleteQueryParam,
  copyToClipboard,
};
