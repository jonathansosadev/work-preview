var debug = require('debug')('garagescore:server:boot:rest-api'); // eslint-disable-line max-len,no-unused-vars
var debugPerfs = require('debug')('perfs:server:boot:rest-api');

debugPerfs('Starting boot rest-api');

module.exports = function mountRestApi(server) {
  var restApiRoot = server.get('restApiRoot');
  server.use(restApiRoot, server.loopback.rest());
};
