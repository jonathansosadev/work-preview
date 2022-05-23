var crypto = require('crypto');
var config = require('config');
var debug = require('debug')('garagescore:server:boot:explorer'); // eslint-disable-line max-len,no-unused-vars
var debugPerfs = require('debug')('perfs:server:boot:explorer');
var client = require('../../common/lib/garagescore/client');

debugPerfs('Starting boot explorer');
module.exports = function mountLoopBackExplorer(server) {
  var explorer;
  try {
    explorer = require('loopback-explorer');
  } catch (err) {
    // Print the message only when the app was started via `server.listen()`.
    // Do not print any message when the project is used as a component.
    server.once('started', function () {
      console.log('Run `npm install loopback-explorer` to enable the LoopBack explorer');
    });
    return;
  }

  var restApiRoot = server.get('restApiRoot');

  var explorerApp = explorer(server, { basePath: restApiRoot });

  var shouldMangleExplorerAppUrl;
  if (config.has('apiExplorer.mangleUrl') && config.get('apiExplorer.mangleUrl')) {
    shouldMangleExplorerAppUrl = true;
  } else {
    shouldMangleExplorerAppUrl = false;
  }

  var explorerAppUrl;
  if (shouldMangleExplorerAppUrl) {
    explorerAppUrl = '/explorer/' + crypto.randomBytes(8).toString('hex');
  } else {
    explorerAppUrl = '/explorer';
  }
  client.setExplorerUrl(explorerAppUrl);
  server.use(explorerAppUrl, explorerApp);
  server.once('started', function () {
    var baseUrl = server.get('url').replace(/\/$/, '');
    // express 4.x (loopback 2.x) uses `mountpath`
    // express 3.x (loopback 1.x) uses `route`
    var explorerPath = explorerApp.mountpath || explorerApp.route;
    console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  });
};
