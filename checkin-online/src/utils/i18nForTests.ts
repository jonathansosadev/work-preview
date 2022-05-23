import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import checkinOnlineEN from '../translations/checkinOnlineTextsEN.json';
import checkinOnlineES from '../translations/checkinOnlineTextsES.json';
import checkinOnlineIT from '../translations/checkinOnlineTextsIT.json';

const resources = {
  en: {
    translation: checkinOnlineEN,
  },
  es: {
    translation: checkinOnlineES,
  },
  it: {
    translation: checkinOnlineIT,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      wait: true,
    },
  });

export default i18n;
