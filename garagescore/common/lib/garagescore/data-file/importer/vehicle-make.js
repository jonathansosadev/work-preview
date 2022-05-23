'use strict';

var _ = require('underscore');
var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:vehicle-make'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importVehicleMake(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }
  if (typeof dataRecord.importStats.dataValidity.vehicle === 'undefined') {
    dataRecord.importStats.dataValidity.vehicle = {};
  }
  dataRecord.importStats.dataValidity.vehicle.make = false;
  dataRecord.importStats.dataPresence.vehicle.make = false;

  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  if (typeof options.vehicleMakes === 'undefined') {
    callback && callback('vehicleMakes option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  // -> dataRecord.vehicle.make

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.vehicle.make = true;
    if (_.has(options.vehicleMakes, cellValue)) {
      dataRecord.importStats.dataValidity.vehicle.make = true;

      if (typeof dataRecord.vehicle === 'undefined') {
        dataRecord.vehicle = {};
      }

      dataRecord.vehicle.make = options.vehicleMakes[cellValue];
    } else {
      if (typeof dataRecord.vehicle === 'undefined') {
        dataRecord.vehicle = {};
      }
      dataRecord.vehicle.unknownMake = cellValue;
      // gsLogger.warn('Row %d, Column "%s": Invalid vehicle make value "%s"', rowIndex, cellLabel, cellValue);
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
  }

  callback && callback(null, dataRecord);
};
