var debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schema:DSC:dcsnet'); // eslint-disable-line max-len,no-unused-vars
var base = require('./base');

var config = JSON.parse(JSON.stringify(base.shared));

config.fileformat = {
  type: 'xlsx',
  worksheetName: '#first#',
};
config.format.dataRecordCompletedAt = 'DD/MM/YYYY hh:mm';

module.exports = {
  ID: 'xlsx-ddmmyyyyhhmm',
  config: config,
};
