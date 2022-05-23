const crypto = require('crypto');
const debug = require('debug')('common:lib:util:crypto');

function encrypt(text, algorithm, password) {
  try {
    if (text) {
      const cipher = crypto.createCipher(algorithm, password);
      let crypted = cipher.update(text, 'utf8', 'hex');
      crypted += cipher.final('hex');
      return crypted;
    }
    return '';
  } catch (err) {
    debug(err);
    return '';
  }
}

function decrypt(text, algorithm, password) {
  try {
    if (text) {
      const decipher = crypto.createDecipher(algorithm, password);
      let dec = decipher.update(text, 'hex', 'utf8');
      dec += decipher.final('utf8');
      return dec;
    }
    return '';
  } catch (err) {
    debug(err);
    return '';
  }
}

module.exports = { encrypt, decrypt };
