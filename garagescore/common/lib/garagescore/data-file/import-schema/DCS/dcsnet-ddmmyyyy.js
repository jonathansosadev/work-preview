var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:DSC:dcsnet'); // eslint-disable-line max-len,no-unused-vars
var base = require('./dcsnet-global');

var config = JSON.parse(JSON.stringify(base.shared));
config.format.dataRecordCompletedAt = 'DD/MM/YYYY';

module.exports = {
  ID: 'DCSnet-ddmmyyyy',
  config: config,
};
