const debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:service-provided-at'); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
const moment = require('moment');
require('moment-timezone');
const s = require('underscore.string');
const parseUtils = require('./parse-utils');

module.exports = function importDataRecordCompletedAt(dataRecord, rowIndex, rowCells, options, callback) {
  // note : readDataFileRowsFromXlsxWorkbook format date cells as MM/DD/YYYY
  if (typeof options.cellLabel === 'undefined') {
    if (options.isOptional) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      dataRecord.completedAt = d;
      dataRecord.importStats.dataValidity.completedAt = true;
      callback && callback(null, dataRecord);
      return;
    }
    callback && callback('cellLabel option is undefined');
    return;
  }
  let dateFormat = null;
  if (typeof options.dateFormat !== 'undefined') {
    if (dataRecord.type && options.dateFormat[dataRecord.type]) {
      dateFormat = options.dateFormat[dataRecord.type];
    }
    if (!dateFormat) {
      dateFormat = options.dateFormat;
    }
  } else {
    dateFormat = 'YYYY-MM-DD hh:mm';
  }
  if (!dateFormat) {
    dateFormat = 'YYYY-MM-DD hh:mm';
  }
  if (typeof options.dateFormat === 'object' && !options.dateFormat[dataRecord.type]) {
    console.warn('WARNING: Date config, date for job not found ! Please look at /backoffice/data-file/parsers/');
  }

  const cellLabel = options.cellLabel;

  // -> dataRecord.completedAt

  let shouldImport = true;
  const timezone = options.timezone ? options.timezone : 'Europe/Paris';
  if (typeof options.shouldImportCallback !== 'undefined') {
    shouldImport = options.shouldImportCallback(dataRecord, rowIndex, rowCells);
  }
  if (shouldImport) {
    let cellValue = parseUtils.getCellValue(rowCells, cellLabel);

    if (options.transformer) {
      cellValue = options.transformer('dataRecordCompletedAt', cellValue, rowCells);
    }
    if (!s.isBlank(cellValue)) {
      dataRecord.importStats.dataPresence.completedAt = true;

      const dataRecordDate =
        dateFormat === 'serial'
          ? moment.tz('1/1/1900', 'DD/MM/YYYY', timezone).add(cellValue, 'days')
          : moment.tz(cellValue, dateFormat, timezone);

      if (dataRecordDate.isValid()) {
        dataRecord.completedAt = dataRecordDate.toDate();
        dataRecord.importStats.dataValidity.completedAt = true;
      } else {
        // gsLogger.warn('Row %d, Column "%s": Invalid dataRecord date value', rowIndex, cellLabel, cellValue);
        dataRecord.importStats.dataValidity.completedAt = false;
      }
    } else if (options.isOptional) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      dataRecord.completedAt = d;
      dataRecord.importStats.dataValidity.completedAt = true;
    } else {
      // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
      dataRecord.importStats.dataPresence.completedAt = false;
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Not importing per shouldImportCallback', rowIndex, cellLabel);
  }

  callback && callback(null, dataRecord);
};
