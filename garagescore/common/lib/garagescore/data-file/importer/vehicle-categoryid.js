'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:vehicle-categoryid'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importVehicleCategoryId(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  // -> dataRecord.vehicle.categoryId

  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.vehicle.categoryId = true;

    if (typeof dataRecord.vehicle === 'undefined') {
      dataRecord.vehicle = {};
    }

    dataRecord.vehicle.categoryId = cellValue;
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.vehicle.categoryId = false;
  }

  callback && callback(null, dataRecord);
};
