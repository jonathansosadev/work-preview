var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:DSC:dcsnet'); // eslint-disable-line max-len,no-unused-vars
var base = require('./base');

var config = JSON.parse(JSON.stringify(base.shared));

config.fileformat = { type: 'csv' };
config.format.dataRecordCompletedAt = 'DD/MM/YYYY';

module.exports = {
  ID: 'csv-ddmmyyyy',
  config: config,
};
