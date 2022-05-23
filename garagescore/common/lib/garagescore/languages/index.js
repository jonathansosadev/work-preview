const _translations = {};
const _defaultLanguage = 'fr';
const _availableLanguages = ['fr'];

/* eslint-disable global-require */
_availableLanguages.forEach((lang) => {
  try {
    _translations[lang] = require(`./lang/${lang}`);
  } catch (e) {
    _translations[lang] = null;
  }
});
/* eslint-enable global-require */

module.exports = function (section) {
  return (wordId, lang, prefix) => {
    if (!_translations[lang]) {
      console.error(`Language '${lang}' is not supported`);
      return wordId;
    }
    if (typeof _translations[lang][section] === 'undefined') {
      console.error(`Section '${section}' not supported by this language.`);
      return wordId;
    }
    if (!prefix && typeof _translations[lang][section][wordId] === 'undefined') {
      console.error(`WordId '${wordId}' in '${lang}.json' is not defined. (Section: '${section}')`);
      return (
        (_translations[_defaultLanguage] &&
          _translations[_defaultLanguage][section] &&
          _translations[_defaultLanguage][section][wordId]) ||
        wordId
      );
    } else if (
      prefix &&
      (typeof _translations[lang][section][prefix] === 'undefined' ||
        typeof _translations[lang][section][prefix][wordId] === 'undefined')
    ) {
      console.error(
        `WordId or prefix '${prefix}'.'${wordId}' in '${lang}.json' is not defined. (Section: '${section}')`
      );
    }
    if (prefix) return _translations[lang][section][prefix][wordId];
    return _translations[lang][section][wordId];
  };
};
