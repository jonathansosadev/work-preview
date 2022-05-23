'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:price'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

module.exports = function importPrice(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  var cellLabel = options.cellLabel;

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);
  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.price = true;
    try {
      var v = cellValue;
      if (v.indexOf(',')) {
        v = v.replace(',', '.');
      }
      v = v.replace(',', '.');
      v = v.replace('€', ' ');
      v = v.replace('$', ' ');
      v = parseFloat(v, 10);
      dataRecord.price = v;
      dataRecord.importStats.dataValidity.price = true;
    } catch (e) {
      console.error(e);
      dataRecord.importStats.dataValidity.price = false;
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.price = false;
  }

  callback && callback(null, dataRecord);
};
