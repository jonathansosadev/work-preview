'use strict';

var debug = require('debug')(
  'garagescore:common:lib:garagescore:data-file:importer:vehicle-registration-firstregisteredat'
); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var moment = require('moment');
require('moment-timezone');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importVehicleRegistrationFirstRegisteredAt(
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

  var dateFormat;
  if (typeof options.dateFormat !== 'undefined') {
    dateFormat = options.dateFormat;
  } else {
    dateFormat = 'MM/DD/YY';
  }

  var cellLabel = options.cellLabel;

  // -> dataRecord.vehicle.registration.firstRegisteredAt

  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }
  if (typeof dataRecord.importStats.dataPresence.vehicle.registration === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle.registration = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);
  cellValue = options.transformer('vehicleRegistrationFirstRegisteredAt', cellValue, rowCells);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.vehicle.registration.firstRegisteredAt = true;

    var firstRegisteredDate = moment.tz(cellValue, dateFormat, 'Europe/Paris');
    if (typeof dataRecord.importStats.dataValidity.vehicle === 'undefined') {
      dataRecord.importStats.dataValidity.vehicle = {};
    }
    if (typeof dataRecord.importStats.dataValidity.vehicle.registration === 'undefined') {
      dataRecord.importStats.dataValidity.vehicle.registration = {};
    }

    if (
      firstRegisteredDate.isValid() &&
      firstRegisteredDate.isAfter('1945-08-08') &&
      firstRegisteredDate.isBefore(new Date())
    ) {
      dataRecord.importStats.dataValidity.vehicle.registration.firstRegisteredAt = true;

      if (typeof dataRecord.vehicle === 'undefined') {
        dataRecord.vehicle = {};
      }
      if (typeof dataRecord.vehicle.registration === 'undefined') {
        dataRecord.vehicle.registration = {};
      }

      dataRecord.vehicle.registration.firstRegisteredAt = firstRegisteredDate.toDate();
    } else {
      // gsLogger.warn('Row %d, Column "%s": Invalid Vehicle Registration First Registered Date value', rowIndex, cellLabel, cellValue);
      dataRecord.importStats.dataValidity.vehicle.registration.firstRegisteredAt = false;
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.vehicle.registration.firstRegisteredAt = false;
  }

  callback && callback(null, dataRecord);
};
