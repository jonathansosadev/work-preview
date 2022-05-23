/**
 * app.models.Configuration gives us a way to share configs across the app with our db
 * but for some unit tests or scripts, app may not be available
 * This module allows us to use configuration with or without db
 * At the beginning of model/Configuration.js, the method _mapToConfigurationModel is called:
 * - so every script whith app running will use the db
 * - and other will just use a simple in-memory hash
 * */
var EMBED = {};
var MODE = 'embed';
var Configuration = null;
// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  _mapToConfigurationModel: function (instance) {
    Configuration = instance;
    MODE = 'app';
  },
  get: function (fieldName, cb) {
    if (MODE === 'embed') {
      var res = EMBED[fieldName];
      var isdef = typeof res !== 'undefined';
      cb(null, isdef ? res : null);
      return;
    }
    var method = 'get' + capitalizeFirstLetter(fieldName);
    Configuration[method](cb);
  },
  set: function (fieldName, fieldValue, cb) {
    if (MODE === 'embed') {
      EMBED[fieldName] = fieldValue;
      cb(null, EMBED[fieldName]);
      return;
    }
    var method = 'set' + capitalizeFirstLetter(fieldName);
    Configuration[method](fieldValue, cb);
  },
};
