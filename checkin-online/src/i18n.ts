import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import checkinOnlineEN from './translations/checkinOnlineTextsEN.json';
import checkinOnlineES from './translations/checkinOnlineTextsES.json';
import checkinOnlineIT from './translations/checkinOnlineTextsIT.json';
import checkinOnlineRU from './translations/checkinOnlineTextsRU.json';
import checkinOnlineHU from './translations/checkinOnlineTextsHU.json';
import checkinOnlineCS from './translations/checkinOnlineTextsCS.json';
import checkinOnlineDE from './translations/checkinOnlineTextsDE.json';
import checkinOnlineFR from './translations/checkinOnlineTextsFR.json';
import checkinOnlineBG from './translations/checkinOnlineTextsBG.json';
import checkinOnlinePT from './translations/checkinOnlineTextsPT.json';
import checkinOnlineEE from './translations/checkinOnlineTextsEE.json';
import checkinOnlineRO from './translations/checkinOnlineTextsRO.json';

const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production';

const defaultLanguages = {
  es: ['ca'],
};

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
  ru: {
    translation: checkinOnlineRU,
  },
  hu: {
    translation: checkinOnlineHU,
  },
  cs: {
    translation: checkinOnlineCS,
  },
  de: {
    translation: checkinOnlineDE,
  },
  fr: {
    translation: checkinOnlineFR,
  },
  bg: {
    translation: checkinOnlineBG,
  },
  pt: {
    translation: checkinOnlinePT,
  },
  ro: {
    translation: checkinOnlineRO,
  },
  ee: {
    translation: checkinOnlineEE,
  },
};

i18n.on('languageChanged', function (nextLanguage) {
  const fallbackLanguage = Object.keys(defaultLanguages).find(key => {
    return defaultLanguages[key as keyof typeof defaultLanguages].includes(nextLanguage);
  });

  if (fallbackLanguage) {
    i18n.changeLanguage(fallbackLanguage);
    return;
  }
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: !IS_PRODUCTION_BUILD,
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      wait: true,
    },
  });

export default i18n;
