var debug = require('debug')('garagescore:common:lib:surveygizmo:rest-api'); // eslint-disable-line max-len,no-unused-vars
var config = require('config');
/*
 * Proxy a single instance of the SurveyGizmo REST API object
 */
/* BEGIN HACK
console.log('Hacking surveygizmo-js dependencies to find a bug');
var Body = require('surveygizmo-js/node_modules/isomorphic-fetch/node_modules/node-fetch/lib/body');
Body.prototype.json = function () {
  return this._decode().then(function (text) {
    console.log(text);
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error(parseErr);
      console.log(text);
      throw parseErr;
    }
  });
};
END HACK */

var api = null;
if (config.has('survey.useFakeApi') && config.get('survey.useFakeApi')) {
  console.log('Using sgizmo fake api');
  api = require('./fake-api');
} else {
  api = require('surveygizmo-js').restApi();
}

module.exports = api;
