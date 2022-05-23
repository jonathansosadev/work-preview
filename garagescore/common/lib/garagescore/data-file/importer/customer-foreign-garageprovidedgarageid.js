'use strict';

var debug = require('debug')(
  'garagescore:common:lib:garagescore:data-file:importer:customer-foreign-garageprovidedgarageid'
); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importCustomerForeignGarageProvidedGarageId(
  dataRecord,
  rowIndex,
  rowCells,
  options,
  callback
) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  // -> dataRecord.customer.foreign.garageProvidedGarageId

  if (typeof dataRecord.importStats.dataPresence.customer === 'undefined') {
    dataRecord.importStats.dataPresence.customer = {};
  }
  if (typeof dataRecord.importStats.dataPresence.customer.foreign === 'undefined') {
    dataRecord.importStats.dataPresence.customer.foreign = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.customer.foreign.garageProvidedGarageId = true;

    if (typeof dataRecord.customer === 'undefined') {
      dataRecord.customer = {};
    }

    if (typeof dataRecord.customer.foreign === 'undefined') {
      dataRecord.customer.foreign = {};
    }

    dataRecord.customer.foreign.garageProvidedGarageId = cellValue.trim();
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.customer.foreign.garageProvidedGarageId = false;
  }

  callback && callback(null, dataRecord);
};
