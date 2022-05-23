import * as Sentry from '@sentry/react';
import {getAuthAndBaseHeaders} from '../api';

const FAILURE_RESPONSE_STATUSES = [400, 401, 429];

function stringifySentryRequestInit(options: any) {
  const base64Fields = ['signature', 'picture_file', 'front_side_scan', 'back_side_scan'];
  const body = options?.body;

  if (body) {
    const parsedBody = JSON.parse(body);

    base64Fields.forEach(field => {
      if (parsedBody[field]) {
        parsedBody[field] = 'base64';
      }
    });

    return JSON.stringify({
      ...options,
      body: parsedBody,
    });
  }

  return JSON.stringify(options);
}

function getResponseHeaders(response?: Response) {
  let headers = '';

  if (!response) {
    return headers;
  }

  // @ts-ignore
  for (const pair of response?.headers?.entries()) {
    headers += `${pair[0]}: ${pair[1]}; `;
  }
  return headers;
}

function getAndHandleResponseError(response?: Response, body?: any, options?: any) {
  if (!response) {
    return null;
  }

  if (FAILURE_RESPONSE_STATUSES.includes(response.status)) {
    return body;
  }

  if (response.status === 401) {
    Sentry.captureMessage(
      `Error 401: ${response.url}. Headers: ${JSON.stringify(
        getAuthAndBaseHeaders(),
      )}. Request init: ${stringifySentryRequestInit(options)}`,
    );
  }

  if (response.status === 404) {
    Sentry.captureMessage(
      `Error 404: ${response.url}. Request init: ${stringifySentryRequestInit(options)}`,
    );

    return {
      message: `404 Not found. Please contact support.`,
      body,
    };
  }

  if (response.status === 405) {
    Sentry.captureMessage(
      `Error 405: ${response.url}. Request init: ${stringifySentryRequestInit(options)}`,
    );

    return {
      message: `405 Method not allowed. Please contact support.`,
      body,
    };
  }

  if (response.status === 500) {
    Sentry.captureMessage(
      `Error 500: ${response.url}. Request init: ${stringifySentryRequestInit(options)}`,
    );

    return {
      message: '500 Internal Server error. Please contact support.',
      body,
    };
  }

  if (response.status === 502) {
    Sentry.captureMessage(
      `Error 502: ${response.url}. Request init: ${stringifySentryRequestInit(options)}`,
    );

    return {
      message: '502 Bad Gateway. Please contact support.',
      body,
    };
  }

  if (response.status === 503) {
    Sentry.captureMessage(
      `Error 503: ${response.url}. Request init: ${stringifySentryRequestInit(options)}`,
    );

    return {
      message: '503 Service Unavailable. Please contact support.',
      body,
    };
  }

  if (response.status === 504) {
    Sentry.captureMessage(
      `Error 504: ${response.url}. Request init: ${stringifySentryRequestInit(options)}`,
    );

    return {
      message: '504 Gateway Timeout. Please contact support.',
      body,
    };
  }

  return null;
}

export {getAndHandleResponseError, getResponseHeaders};
