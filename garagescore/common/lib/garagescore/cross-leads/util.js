const crypto = require('crypto');
const decodeEntity = require('parse-entities');
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const slackClient = require('../../slack/client');
const app = require('../../../../server/server');
const { promisify } = require('util');

// clean html and CSS tag
const specialCharacters = [
  { replace: /<br\/?>/g, by: '\n' },
  { replace: /\r/g, by: ' ' },
  { replace: /<[^>]+>/g, by: ' ' },
];

module.exports = {
  fm: (matches) => matches[0], // first match
  sm: (matches) => matches[1], // second match
  lm: (matches) => matches[matches.length - 1], // last match
  decode: (txt) => {
    if (txt) {
      let result = txt;
      for (const specialCharacter of specialCharacters) {
        result = result.replace(specialCharacter.replace, specialCharacter.by);
      }
      // replace special character like &#x20AC; -> €
      return decodeEntity(result).trim();
    }
  },
  // decodePhone convert 0621982935 to +33621982935
  decodePhone: (phone, locale) => {
    // You don't need countryCode if it's already in the number, ex: 0033621982935
    let parsedNumber = phone;
    let parsedLocale = locale && locale.includes('_') ? locale.split('_').pop() : locale;
    if (locale) parsedNumber = phoneUtil.parse(phone, parsedLocale);
    else parsedNumber = phoneUtil.parseAndKeepRawInput(parsedNumber, null);
    return phoneUtil.format(parsedNumber, PNF.E164);
  },
  getSourceId: (fields) => {
    const id = fields.phone || fields.email;
    if (!id) return null;
    return crypto.createHash('md5').update(id).digest('hex');
  },
  getTestEmailFromInput: async (input) => {
    if (typeof input !== 'string') return null;
    const list = await promisify(app.models.Configuration.getXLeadsFilters)();
    if (!list || !Array.isArray(list.emails)) return null;
    const result = list.emails.find(
      (mail) => mail && typeof mail === 'object' && mail.enabled && input.includes(mail.value)
    );
    return result ? result.value : null;
  },
  // Try to find a test phone in a input and return it
  getTestPhoneFromInput: async (input) => {
    if (typeof input !== 'string') return null;
    const list = await promisify(app.models.Configuration.getXLeadsFilters)();
    if (!list || !Array.isArray(list.phones)) return null;
    const testPhone = list.phones.find(
      (phone) => phone && typeof phone === 'object' && phone.enabled && input.includes(phone.value)
    );
    return testPhone ? testPhone.value : null;
  },
  slackMessage: async (text, username = 'Super TestMAN', channel = '#çavapas') => {
    return new Promise((resolve, reject) => {
      slackClient.postMessage({ text, channel, username }, (e) => (e ? reject(e) : resolve()));
    });
  },

  /**
   *
   * @param {String} html | the raw html of the autoDefi's incomingCrossLeads
   * @param {Array} itemsToFind | the string value of the cell libele. Start the string with a '#' for add a new line with static text
   * exemple itemsToFind :
   * [
   *  '#--- Informations Distributeur ---',
   *  'Adresse Url du site Internet',
   *  'Nom du distributeur',
   *  'Lieu',
   * ]
   * @return {String}
   */
  autoDefiMessageGenerator: (html, itemsToFind) => {
    let formatedString = '';
    const customregex = (str) => new RegExp(`${str}\\?? ?:? ?<\/strong><\/div><\/td>([\\s\\S]*?)<\/div><\/td>`);

    itemsToFind.forEach((item) => {
      if (item[0] !== '#') {
        const RegexResult = html.match(customregex(item));
        if (RegexResult) {
          const result = module.exports.decode(module.exports.lm(RegexResult));
          if (result) formatedString += `${item}: ${result.replace(/\n/g, '')}\n`;
        }
      } else {
        formatedString += `${item.slice(1)}\n`;
      }
    });

    return formatedString;
  },
};
