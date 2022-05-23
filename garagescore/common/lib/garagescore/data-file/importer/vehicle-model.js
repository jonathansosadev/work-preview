'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:vehicle-model'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var sgModels = require('../../vehicle/models.js');
var parseUtils = require('./parse-utils');

module.exports = function importVehicleModel(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }
  if (typeof dataRecord.importStats.dataValidity.vehicle === 'undefined') {
    dataRecord.importStats.dataValidity.vehicle = {};
  }
  dataRecord.importStats.dataValidity.vehicle.model = false;
  dataRecord.importStats.dataPresence.vehicle.model = false;

  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.vehicle.model = true;

    var model = sgModels.normalizeModelName(cellValue);
    if (model) {
      dataRecord.importStats.dataValidity.vehicle.model = true;

      if (typeof dataRecord.vehicle === 'undefined') {
        dataRecord.vehicle = {};
      }
      dataRecord.vehicle.model = model;
    } else {
      // gsLogger.warn('Row %d, Column "%s": Invalid vehicle model value "%s" (normalized:"%s")', rowIndex, cellLabel, cellValue, model);
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
  }

  callback && callback(null, dataRecord);
};
