const app = require('../../../../server/server');
const CensoredWordsType = require('../../../../common/models/censoredWords.type.js');

/**
 * Test if the text given contain a curse
 */
const containsCurse = async function containsCurse(language, text) {
  try {
    return await app.models.CensoredWords.containsWord(language, CensoredWordsType.CURSES, text.toLowerCase());
  } catch (err) {
    console.error(err);
    return false;
  }
};
/**
 * Test if the text given contain a name => We simply do the same as containsCurse but it's case insensitive
 */
const containsName = async function containsName(language, text) {
  try {
    return await app.models.CensoredWords.containsWord(language, CensoredWordsType.NAMES, text);
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  containsCurse,
  containsName,
};
