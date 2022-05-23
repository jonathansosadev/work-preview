'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:vehicle-mileage'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importVehicleMileage(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  // -> dataRecord.vehicle.mileage

  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.vehicle.mileage = true;
    if (typeof dataRecord.vehicle === 'undefined') {
      dataRecord.vehicle = {};
    }
    dataRecord.vehicle.mileage = cellValue;
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.vehicle.mileage = false;
  }

  callback && callback(null, dataRecord);
};
