/** Auto validate a public review*/
const moderationStatus = require('../../../models/data/type/moderation-status');
const rejectedReasons = require('../../../models/data/type/rejected-reasons');
const gib = require('./gibberish-detector');
const lexicalFilters = require('./lexical-filters');
const sim = require('./similarity-detector');
const langDetector = require('./lang-detector');
const { JS, log } = require('../../util/log');

const _cleanAccents = function _cleanAccents(text) {
  // change éà... to ea...
  const accent = [
    /[\300-\306]/g,
    /[\340-\346]/g, // A, a
    /[\310-\313]/g,
    /[\350-\353]/g, // E, e
    /[\314-\317]/g,
    /[\354-\357]/g, // I, i
    /[\322-\330]/g,
    /[\362-\370]/g, // O, o
    /[\331-\334]/g,
    /[\371-\374]/g, // U, u
    /[\321]/g,
    /[\361]/g, // N, n
    /[\307]/g,
    /[\347]/g, // C, c
  ];
  const noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
  let cleaned = text;
  for (let i = 0; i < accent.length; i++) {
    cleaned = cleaned.replace(accent[i], noaccent[i]);
  }
  return cleaned;
};

const _cleanPunct = function _cleanPunct(text, replaceBy = ' ') {
  let cleaned = text;
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, replaceBy); // eslint-disable-line
  return cleaned;
};

const _countDifferentChars = function _countDifferentChars(s) {
  const chars = {};
  for (let x = 0, y = s.length; x < y; x++) {
    chars[s[x]] = chars[s[x]] + 1 || 1;
  }
  return Object.keys(chars).length;
};

const _vowelsCount = function _vowelsCount(s) {
  const m = s.match(/[aeiouy]/gi);
  return m === null ? 0 : m.length;
};

const _containsFrenchPhoneNumber = function _containsFrenchPhoneNumber(s) {
  return /\b(\d\d[ \\.]?){4}\d\d\b/.test(s);
};
const _containsEmail = function _containsEmail(s) {
  return /([\w_.\-+])+@([\w-]+\.)+([\w]{2,10})+/.test(s);
};
const _containsURL = function _containsURL(s) {
  return s.indexOf('http') >= 0 || s.indexOf('www.') >= 0;
};

const _uselessExpressions = sim.generateDetector([], 0.4); // no more used, because now we accept them... like 'Rien à signaler'
/* eslint-disable quote-props */
const whiteList = {
  'rien à signaler': 1,
  'rien à dire': 1,
  ras: 1,
  'parfait rien à signaler': 1,
  'je recommande': 1,
  'très bien': 1,
  'très professionnel': 1,
  "j'aime beaucoup": 1,
  parfait: 1,
  satisfait: 1,
  rapidité: 1,
  efficacité: 1,
  // es
  perfecto: 1,
  'todo bien': 1,
  'todo perfecto': 1,
  'todo fue perfecto': 1,
  'muy buena': 1,
  'muy bueno': 1,
  bien: 1,
  'muy bien': 1,
  'todo genial': 1,
};
/** Return a pair
{approvableStatus, rejectedReason}
According to the analysis of a data.review
*/

const shouldApprove = async function shouldApprove(dataComment, authorfullName) {
  if (!dataComment) {
    log.debug(JS, 'publicReviewValidator - No comment');
    return { approvableStatus: moderationStatus.REJECTED, rejectedReason: rejectedReasons.CONTENT_IS_TOO_SHORT };
  }
  const comment = dataComment.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ');

  const lowerCaseComment = comment.toLowerCase();
  const noPunctuationComment = _cleanPunct(lowerCaseComment, '');
  if (whiteList[noPunctuationComment]) {
    return { approvableStatus: moderationStatus.APPROVED };
  }
  if (comment.length < 10) {
    log.debug(JS, 'publicReviewValidator - too short');
    return { approvableStatus: moderationStatus.REJECTED, rejectedReason: rejectedReasons.CONTENT_IS_TOO_SHORT };
  }
  if (_containsFrenchPhoneNumber(comment)) {
    log.debug(JS, 'publicReviewValidator - containsFrenchPhoneNumber');
    return {
      approvableStatus: moderationStatus.REJECTED,
      rejectedReason: rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA,
    };
  }
  if (_containsEmail(comment)) {
    log.debug(JS, 'publicReviewValidator - containsEmail');
    return {
      approvableStatus: moderationStatus.REJECTED,
      rejectedReason: rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA,
    };
  }
  if (_containsURL(lowerCaseComment)) {
    log.debug(JS, 'publicReviewValidator - containsURL');
    return {
      approvableStatus: moderationStatus.REJECTED,
      rejectedReason: rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA,
    };
  }
  if (authorfullName) {
    const names = authorfullName
      .replace(/[,]/g, ' ')
      .replace(/[^ABCDEFGHIJKLMNOPQRSTUVWXYZéèêëàâäôöùûü0123456789 _\-]/gi, '')
      .toLowerCase()
      .split(' ');
    for (let n = 0; n < names.length; n++) {
      const name = names[n];
      if (
        !(name.length < 4 || name === '[owner]') &&
        lowerCaseComment.match(new RegExp(`\\b${name.replace(/\*/g, '\\*')}\\b`, 'g'))
      ) {
        log.debug(JS, 'publicReviewValidator - author.fullName');
        return {
          approvableStatus: moderationStatus.REJECTED,
          rejectedReason: rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA,
        };
      }
    }
  }
  const countDifferentChars = _countDifferentChars(comment);
  if ((comment.length < 25 && countDifferentChars < comment.length / 5) || countDifferentChars <= 3) {
    log.debug(JS, `publicReviewValidator - countDifferentChars ${_countDifferentChars(comment)}`);
    // 25, 3 and 1/5 are totaly random values
    return { approvableStatus: moderationStatus.REJECTED, rejectedReason: rejectedReasons.CONTENT_IS_MEANINGLESS };
  }
  if (comment.length > 50) {
    const cleanDate = comment.replace(/[0-9]+\/[0-9]+\/[0-9]+/g, 'date');
    const cleanAccents = _cleanAccents(cleanDate);
    const vowelsRate = _vowelsCount(cleanAccents) / cleanAccents.length;
    const corrector = Math.max((-1 / 500) * comment.length + 1 / 5, 0);
    const minRate = 0.21428033822632347 * (1 - corrector);
    const maxRate = 0.45485972099680544 * (1 + corrector);
    if (vowelsRate < minRate || vowelsRate > maxRate) {
      // Nous avons calculé sur un échantillon de + de 10k avis publiés le taux de voyelles
      // moyenne = 0.33457002961156446
      // variance = 0.0021822392087558137
      // écart type = 0.04671444325640426
      // confidence level 99% => moyenne + 2.575 * écart type
      log.debug(JS, `publicReviewValidator - vowelsRate ${vowelsRate}`);
      return { approvableStatus: moderationStatus.REJECTED, rejectedReason: rejectedReasons.CONTENT_IS_MEANINGLESS };
    }
  }
  let duplicateComment = comment;
  if (duplicateComment.length > 10 && duplicateComment.length <= 15) {
    /** Duplication: Quick way to have more characters to test **/
    duplicateComment += ` ${duplicateComment}`;
  }
  const duplicateNoAccent = _cleanAccents(duplicateComment);
  if (gib.isGibberish(duplicateNoAccent)) {
    log.debug(JS, 'publicReviewValidator - isGibberish');
    return { approvableStatus: moderationStatus.REJECTED, rejectedReason: rejectedReasons.CONTENT_IS_MEANINGLESS };
  }
  const lang = langDetector(comment);

  const noAccent = _cleanAccents(comment);
  const noAccentNoPlural = noAccent.replace(/s\b/g, ' ');
  if (await lexicalFilters.containsCurse(lang, noAccentNoPlural)) {
    log.debug(JS, 'publicReviewValidator - isAbusive');
    return { approvableStatus: moderationStatus.REJECTED, rejectedReason: rejectedReasons.CONTENT_IS_ABUSIVE };
  }
  if (await lexicalFilters.containsName(lang, noAccent)) {
    log.debug(JS, 'publicReviewValidator - includesPersonalData');
    return {
      approvableStatus: moderationStatus.REJECTED,
      rejectedReason: rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA,
    };
  }
  if (_uselessExpressions(comment)) {
    log.debug(JS, 'publicReviewValidator -  useless expressions');
    return {
      approvableStatus: moderationStatus.REJECTED,
      rejectedReason: rejectedReasons.CONTENT_IS_UNRELATED_TO_REVIEWED_ITEM,
    };
  }
  return { approvableStatus: moderationStatus.APPROVED };
};

module.exports = { shouldApprove };
