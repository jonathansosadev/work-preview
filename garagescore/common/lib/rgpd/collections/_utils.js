const crypto = require('crypto');

// hex_md5 for node if used without mongo:
const hex_md5 = (value) => crypto.createHash('md5').update(value).digest('hex');

/**
 * Mask a Email or Array of emails by masking the localPart only simon@gmail.com -> "email_${md5('simon')}@gmail.com"
 * @param {string} value
 * @returns {string}
 */
function maskEmail(value) {
  const mask = (email) => {
    if (typeof email !== 'string' || email.indexOf('@') === -1) return email;
    const [localPart, domain] = email.split('@');
    return `email_${hex_md5(localPart)}@${domain}`;
  };
  if (typeof value === 'string') return mask(value);
  if (!value || !Array.isArray(value)) return value;
  return value.map(mask);
}

/**
 * Mask a phone or a Array of phone by reversing the last LENGTH_TO_REVERSE digits "+33612345678" -> "+33687654321"
 * @param {string} value
 * @returns {string}
 */
function maskPhone(value) {
  const mask = (phone) => {
    const LENGTH_TO_REVERSE = 8;
    const forcedIndicative = '+338';
    if (typeof phone !== 'string' || phone.length < LENGTH_TO_REVERSE) return phone;

    const cleanedPhone = phone.replace(/ /g, '');
    const lastDigitsReversed = cleanedPhone.slice(-LENGTH_TO_REVERSE, cleanedPhone.length).split('').reverse().join('');
    return forcedIndicative + lastDigitsReversed;
  };
  if (typeof value === 'string') return mask(value);
  if (!value || !Array.isArray(value)) return value;
  return value.map(mask);
}

/**
 * Totally erase the content
 * @param {string} value
 * @returns {string}
 */
function erase(value) {
  if (typeof value !== 'string') return value;
  return '';
}

/**
 * Mask a value with a custom field input: ("Simon", "firstName") -> (value) => "firstName_${md5(value)}"
 * @param {string} value
 * @returns {string}
 */
function maskCustom(fieldName = 'anonymized') {
  const func = function maskCustom(value) {
    if (typeof value !== 'string') return value;
    return `CUSTOM_NAME_${hex_md5(value.replace(/ /g, ''))}`;
  };
  return func.toString().replace('CUSTOM_NAME', fieldName);
}

module.exports = {
  maskEmail,
  maskPhone,
  maskCustom,
  erase,
};
