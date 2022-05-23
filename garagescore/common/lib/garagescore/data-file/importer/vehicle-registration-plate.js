'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:vehicle-registration-plate'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importVehicleRegistrationPlate(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  var assumedCountryCode = 'FR';

  // -> dataRecord.vehicle.registration.plate
  // -> dataRecord.vehicle.registration.countryCode

  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }
  if (typeof dataRecord.importStats.dataPresence.vehicle.registration === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle.registration = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.vehicle.registration.plate = true;
    dataRecord.importStats.dataPresence.vehicle.registration.countryCode = false;

    if (typeof dataRecord.vehicle === 'undefined') {
      dataRecord.vehicle = {};
    }
    if (typeof dataRecord.vehicle.registration === 'undefined') {
      dataRecord.vehicle.registration = {};
    }

    dataRecord.vehicle.registration.plate = cellValue;
    dataRecord.vehicle.registration.countryCode = assumedCountryCode;
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.vehicle.registration.plate = false;
  }

  callback && callback(null, dataRecord);
};
