/** Detect lang from a text */
const LanguageDetect = require('languagedetect');

const lngDetector = new LanguageDetect();

module.exports = (text) => {
  const langs = lngDetector.detect(text, 5);
  for (let i = 0; i < langs.length; i++) {
    const l = langs[i];
    if (l[0] === 'french') {
      return 'fr';
    }
    if (l[0] === 'english') {
      return 'en';
    }
    if (l[0] === 'spanish') {
      return 'es';
    }
  }
  return 'fr';
};
