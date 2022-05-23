'use strict';

var _ = require('underscore');
var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:foreign-data'); // eslint-disable-line max-len,no-unused-vars

module.exports = function importForeignData(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof dataRecord.foreign === 'undefined') {
    dataRecord.foreign = {};
  }
  // MongoDB can not handle keys including dots or dollar signs
  // HACK: “Escape” these symbols to their Unicode full width equivalents:
  // U+FF04 (i.e. “＄”) and U+FF0E (i.e. “．”).
  // Believe it or not, this is suggested in the MongoDB Docs:
  // http://docs.mongodb.org/manual/faq/developers/#faq-dollar-sign-escaping
  var escapedRowCells = {};
  _.each(rowCells, function escapeRowCell(value, key) {
    var escapedRowCellLabel = key.replace(/\$/g, '\uff04').replace(/\./g, '\uff0e');
    escapedRowCells[escapedRowCellLabel] = value;
  });
  dataRecord.foreign.dataFileRow = {
    index: rowIndex,
    cells: escapedRowCells,
  };

  callback && callback(null, dataRecord);
};
