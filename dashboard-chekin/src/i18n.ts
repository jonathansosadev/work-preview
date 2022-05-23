import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import en from './translations/dashboardTextsEN.json';
import es from './translations/dashboardTextsES.json';
import it from './translations/dashboardTextsIT.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  it: {
    translation: it,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
