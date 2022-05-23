// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import WS from 'jest-websocket-mock';
import {server} from './api/mocks/server';

jest.mock('./i18n');
jest.mock('react-signature-canvas');
jest.mock('react-webcam');
jest.mock('react-toastify', () => {
  return {
    toast: {
      error: jest.fn(),
      success: jest.fn(),
      warn: jest.fn(),
    },
  };
});
jest.mock('react-i18next', () => {
  const useMock = [(k: any) => k, {}];
  // @ts-ignore
  useMock.t = (k: any) => k;

  return {
    useTranslation: () => useMock,
    initReactI18next: () => {},
    Trans: ({i18nKey}: any) => i18nKey,
  };
});

Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: () =>
      Promise.resolve({
        getVideoTracks: () => [{getCapabilities: jest.fn(), stop: jest.fn()}],
      }),
  },
});
window.scrollTo = jest.fn();
const oldLocation = {...window.location};
delete window.location;
(window as any).location = {
  ...oldLocation,
  assign: jest.fn(),
};

const localStorageMock = (function () {
  let store: {[key: string]: string} = {};
  return {
    getItem: function (key: any) {
      return store[key] || null;
    },
    setItem: function (key: string, value: any) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
    removeItem: function (key: string) {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', {value: localStorageMock});

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  WS.clean();
  jest.resetAllMocks();
  jest.resetModules();
});
afterAll(() => server.close());
