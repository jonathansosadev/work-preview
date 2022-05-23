'use strict';

var _ = require('underscore');
var config = require('config');
var debug = require('debug')('garagescore:server:boot:client-app-serve-locally'); // eslint-disable-line max-len,no-unused-vars
var path = require('path');
var debugPerfs = require('debug')('perfs:server:boot:client-app-serve-locally');

debugPerfs('Starting boot client-app-serve-locally');
/*
 * Files middleware is mounted using this module instead of "files" in middleware.json
 * because it allows to guarantee client/app files being served before Short URL catcher
 */

module.exports = function mountClientAppServeLocally(app) {
  // Serve robots.txt, favicons directory and raw files from client/app directory
  if (config.has('client.app.serveLocally') && config.get('client.app.serveLocally')) {
    var clientAppBaseUrl;
    if (config.has('client.app.serveLocallyBaseUrl') && !_.isEmpty(config.get('client.app.serveLocallyBaseUrl'))) {
      clientAppBaseUrl = config.get('client.app.serveLocallyBaseUrl');
    }

    var clientAppPath = path.resolve(__dirname, '../../client/app');

    if (typeof clientAppBaseUrl === 'undefined') {
      debug('Serving client/app directory locally');
      app.use(app.loopback.static(clientAppPath));
    } else {
      debug('Serving client/app directory locally from “%s”', clientAppBaseUrl);
      app.use(app.loopback.static(clientAppBaseUrl, clientAppPath));
    }
  }
};
