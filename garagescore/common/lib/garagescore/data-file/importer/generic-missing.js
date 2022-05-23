'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:generic-missing'); // eslint-disable-line max-len,no-unused-vars
module.exports = function importGenericMissing(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.dataLabel === 'undefined') {
    callback && callback('dataLabel option is undefined');
    return;
  }

  var dataLabel = options.dataLabel;

  dataRecord.importStats.dataPresence[dataLabel] = false;

  callback && callback(null, dataRecord);
};
