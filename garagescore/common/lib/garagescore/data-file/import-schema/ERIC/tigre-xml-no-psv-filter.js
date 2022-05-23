var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:ERIC:maurel'); // eslint-disable-line max-len,no-unused-vars
var ericGlobal = require('./eric-global-xml');

var config = Object.assign({}, ericGlobal.shared);
config.format.dataRecordCompletedAt = 'YYYY-MM-DD';

module.exports = {
  ID: 'TIGREXML',
  config: config,
};
