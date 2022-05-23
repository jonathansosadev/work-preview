'use strict';

var debug = require('debug')(
  'garagescore:common:lib:garagescore:data-file:importer:maintenance-foreign-garageprovidedfrontdeskuserteam'
); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importForeignGarageProvidedFrontDeskUserTeam(
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

  // -> dataRecord.foreign.garageProvidedFrontDeskUserTeam

  if (typeof dataRecord.importStats.dataPresence.foreign === 'undefined') {
    dataRecord.importStats.dataPresence.foreign = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.foreign.garageProvidedFrontDeskUserTeam = true;

    if (typeof dataRecord.foreign === 'undefined') {
      dataRecord.foreign = {};
    }

    dataRecord.foreign.garageProvidedFrontDeskUserTeam = cellValue;
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.foreign.garageProvidedFrontDeskUserTeam = false;
  }
  callback && callback(null, dataRecord);
};
