'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:client'); // eslint-disable-line max-len,no-unused-vars
var version = require('./version');
var Urls = require('./urls');
var config = require('config');

function staticUrl(staticPath) {
  var sep = staticPath[0] === '/' ? '' : '/';
  return '/static/' + version + sep + staticPath;
}
function latestStaticUrl(staticPath) {
  var sep = staticPath[0] === '/' ? '' : '/';
  return process.env.WWW_URL + '/static/latest' + sep + staticPath;
}

function frontEndStaticUrl(staticPath) {
  var sep = staticPath[0] === '/' ? '' : '/';
  return process.env.WWW_URL + sep + staticPath;
}

function wwwUrl() {
  return config.has('publicUrl.www_url') && config.get('publicUrl.www_url');
}
function appUrl() {
  return config.has('publicUrl.app_url') && config.get('publicUrl.app_url');
}
function isProduction() {
  return appUrl() && appUrl().includes('app.custeed.com');
}
function googleApiKey() {
  return config.has('google.apiKey') && config.get('google.apiKey');
}
// explorer url is mangled on prod /explorer/xxx
var _explorerURL = '/explorer/';
var setExplorerUrl = function (url) {
  _explorerURL = url;
};
var getExplorerUrl = function () {
  return _explorerURL;
};

module.exports = {
  url: Urls,
  staticUrl: staticUrl,
  latestStaticUrl: latestStaticUrl,
  frontEndStaticUrl: frontEndStaticUrl,
  setExplorerUrl: setExplorerUrl,
  getExplorerUrl: getExplorerUrl,
  wwwUrl: wwwUrl,
  appUrl: appUrl,
  googleApiKey: googleApiKey,
  isReview: config.util.getEnv('NODE_APP_INSTANCE') === 'review',
  isProduction,
};
