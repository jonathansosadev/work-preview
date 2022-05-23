import '@testing-library/jest-dom/extend-expect';
import {mockSWR} from './utils/test';

jest.mock('react-i18next', () => {
  const useMock = {
    t: (k: any) => k,
    i18n: {
      language: 'en',
    },
  };
  // @ts-ignore
  // useMock.t = (k: any) => k;
  // @ts-ignore
  // useMock.i18n = {
  //   language: 'en',
  // };

  return {
    useTranslation: () => useMock,
    initReactI18next: () => {},
    Trans: ({i18nKey}: any) => i18nKey,
  };
});
jest.mock('./i18n');
jest.mock('react-signature-canvas');
jest.mock('react-webcam');
jest.mock('swr', (...args: any) => jest.fn(...args));
jest.mock('./api/housingExemptions', () => {
  return {
    getById: () => ({data: null, error: null}),
    ENDPOINTS: {byId: (id: string, params = '') => `housing-exemptions/${id}/?${params}`},
  };
});

mockSWR();

const nativeConsoleError = global.console.error;

global.console.error = (...args: any) => {
  if (args.join('').includes('A future version of React will block javascript')) {
    return;
  }
  return nativeConsoleError(...args);
};

Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: () =>
      Promise.resolve({
        getVideoTracks: () => [{getCapabilities: jest.fn(), stop: jest.fn()}],
      }),
  },
});
