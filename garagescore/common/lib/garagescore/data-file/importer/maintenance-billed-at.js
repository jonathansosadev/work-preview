'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:maintenance-billed-at'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var moment = require('moment');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importDataRecordBilledAt(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  // -> dataRecord.billedAt

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.billedAt = true;

    var dataRecordDate = moment(cellValue, 'MM/DD/YY');

    if (dataRecordDate.isValid()) {
      dataRecord.billedAt = dataRecordDate.toDate();
      dataRecord.importStats.dataValidity.billedAt = true;
    } else {
      // gsLogger.warn('Row %d, Column "%s": Invalid dataRecord date value "%s"', rowIndex, cellLabel, cellValue);
      dataRecord.importStats.dataValidity.billedAt = false;
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.billedAt = false;
  }
  callback && callback(null, dataRecord);
};
