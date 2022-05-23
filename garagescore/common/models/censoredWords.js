/**
 * This collection is made for the blacklisting of words
 * Mostly used for curses but also for proper noun or whatever you want to censor in comments
 * All the words are classified by languages ex : { language: 'fr', words: ['con', 'bete', 'prout', 'Jean'] }
 * We save in cache the big RegExp per languages and per type
 * containsWord is made to test if a text contain one of the words listed
 */
const CensoredWordsType = require('./censoredWords.type.js');

module.exports = function CensoredWordsDefinition(CensoredWords) {
  CensoredWords._censoredWordsCache = null; // eslint-disable-line no-param-reassign
  CensoredWords._cachedRegex = null; // eslint-disable-line no-param-reassign
  CensoredWords.updateAllCachedCensoredWords = function updateAllCachedCensoredWords(callback) {
    // eslint-disable-line no-param-reassign
    CensoredWords._censoredWordsCache = null; // eslint-disable-line no-param-reassign
    CensoredWords._cachedRegex = null; // eslint-disable-line no-param-reassign
    CensoredWords.getAllCachedRegex(callback);
  };
  CensoredWords.getAllCachedCensoredWords = function getAllCachedCensoredWords(callback) {
    // eslint-disable-line no-param-reassign
    if (CensoredWords._censoredWordsCache) {
      callback(null, CensoredWords._censoredWordsCache);
      return;
    }
    CensoredWords.find({}, (err, censoredWords) => {
      if (err) {
        callback(err);
        return;
      }
      CensoredWords._censoredWordsCache = censoredWords; // eslint-disable-line no-param-reassign
      callback(null, censoredWords);
    });
  };
  CensoredWords.getAllCachedRegex = function getAllCachedRegex(callback) {
    // eslint-disable-line no-param-reassign
    if (CensoredWords._cachedRegex) {
      callback(null, CensoredWords._cachedRegex);
      return;
    }
    CensoredWords.getAllCachedCensoredWords((err, censoredWords) => {
      if (err) {
        callback(err);
        return;
      }
      CensoredWords._cachedRegex = {}; // eslint-disable-line no-param-reassign
      for (let i = 0; i < censoredWords.length; i++) {
        if (censoredWords[i].words && censoredWords[i].words.length > 0 && censoredWords[i].language) {
          CensoredWords._cachedRegex[censoredWords[i].language] = {}; // eslint-disable-line no-param-reassign
          const cursesWords = censoredWords[i].words.filter((w) => !/[A-Z]/.test(w));
          if (cursesWords && cursesWords.length > 0) {
            CensoredWords._cachedRegex[censoredWords[i].language].curses = new RegExp( // eslint-disable-line no-param-reassign
              `\\b(${cursesWords.join('|').toLowerCase()})\\b`
            );
          }
          const namesWords = censoredWords[i].words.filter((w) => /[A-Z]/.test(w));
          if (namesWords && namesWords.length > 0) {
            CensoredWords._cachedRegex[censoredWords[i].language].names = new RegExp( // eslint-disable-line no-param-reassign
              `\\b(${namesWords.join('|')})\\b`);
          }
        }
      }
      callback(null, CensoredWords._cachedRegex);
    });
  };
  CensoredWords.containsWord = function containsWord(language, type, text) {
    // eslint-disable-line no-param-reassign
    if (!CensoredWordsType.hasValue(type)) throw new Error(`Param " ${type} " is not in CensoredWordsType`);
    if (this._cachedRegex && this._cachedRegex[language] && this._cachedRegex[language][type]) {
      return this._cachedRegex[language][type].test(text);
    }
    return new Promise(function (resolve, reject) {
      // eslint-disable-line
      CensoredWords.getAllCachedRegex((err, cachedRegex) => {
        if (!cachedRegex || !cachedRegex[language] || !cachedRegex[language][type]) {
          reject(new Error(`No censoredWords found in cache for ${language}/${type}.`));
          return;
        }
        resolve(cachedRegex[language][type].test(text));
      });
    });
  };
};
