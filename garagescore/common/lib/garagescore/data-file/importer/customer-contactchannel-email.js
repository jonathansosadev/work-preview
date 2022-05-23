const s = require('underscore.string');
const validator = require('validator');
const parseUtils = require('./parse-utils');
const emailAutoCorrect = require('../../../util/email-auto-correct');

module.exports = function importCustomerEmail(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabels === 'undefined') {
    callback && callback('cellLabels option is undefined');
    return;
  }
  if (typeof options.cellLabels.email === 'undefined') {
    callback && callback('cellLabels.email option is undefined');
    return;
  }
  const cellLabel = options.cellLabels.email;

  // -> dataRecord.customer.contactChannel.email

  if (typeof dataRecord.importStats.dataPresence.customer === 'undefined') {
    dataRecord.importStats.dataPresence.customer = {};
  }
  if (typeof dataRecord.importStats.dataPresence.customer.contactChannel === 'undefined') {
    dataRecord.importStats.dataPresence.customer.contactChannel = {};
  }

  if (typeof dataRecord.importStats.dataValidity.customer === 'undefined') {
    dataRecord.importStats.dataValidity.customer = {};
  }
  if (typeof dataRecord.importStats.dataValidity.customer.contactChannel === 'undefined') {
    dataRecord.importStats.dataValidity.customer.contactChannel = {};
  }

  if (typeof dataRecord.importStats.dataNC.customer === 'undefined') {
    dataRecord.importStats.dataNC.customer = {};
  }
  if (typeof dataRecord.importStats.dataNC.customer.contactChannel === 'undefined') {
    dataRecord.importStats.dataNC.customer.contactChannel = {};
  }

  const cellValue = parseUtils.getCellValue(rowCells, cellLabel);
  if (cellValue) {
    if (typeof dataRecord.customer === 'undefined') {
      dataRecord.customer = {};
    }
    if (typeof dataRecord.customer.contactChannel === 'undefined') {
      dataRecord.customer.contactChannel = {};
    }
    dataRecord.customer.contactChannel.email = { address: cellValue };
  }
  const isNCString = cellValue && emailAutoCorrect.isNCString(cellValue);
  if (isNCString) {
    // email is empty because its a nc string
    dataRecord.importStats.dataPresence.customer.contactChannel.email = false;
    dataRecord.importStats.dataNC.customer.contactChannel.email = true;
    dataRecord.importStats.dataValidity.customer.contactChannel.email = validator.isEmail(cellValue);
    dataRecord.customer.contactChannel.email = { address: cellValue };
  } else if (!isNCString && !s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.customer.contactChannel.email = true;
    if (validator.isEmail(cellValue)) {
      // email is valid
      dataRecord.importStats.dataValidity.customer.contactChannel.email = true;
    } else {
      // email is invalid
      dataRecord.importStats.dataValidity.customer.contactChannel.email = false;
      // check if we can fix the syntax error
      const correction = emailAutoCorrect.autoCorrect(cellValue);
      if (correction) {
        // email is now valid
        dataRecord.importStats.dataValidity.customer.contactChannel.email = true;
        dataRecord.customer.contactChannel.email = { address: correction };
      } else {
        // isSyntaxError = emailAutoCorrect.probableSyntaxError(cellValue);
      }
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.customer.contactChannel.email = false;
  }

  // try to parse email from mobilePhone Field
  if (dataRecord.importStats.dataValidity.customer.contactChannel.email !== true && options.cellLabels.mobilePhone) {
    const mobileCellValue = parseUtils.getCellValue(rowCells, options.cellLabels.mobilePhone);
    const corrected =
      mobileCellValue && validator.isEmail(mobileCellValue)
        ? mobileCellValue
        : mobileCellValue && emailAutoCorrect.autoCorrect(mobileCellValue);

    if (!s.isBlank(corrected)) {
      dataRecord.importStats.dataPresence.customer.contactChannel.email = true;
      dataRecord.importStats.dataValidity.customer.contactChannel.email = true;
      if (typeof dataRecord.customer === 'undefined') {
        dataRecord.customer = {};
      }
      if (typeof dataRecord.customer.contactChannel === 'undefined') {
        dataRecord.customer.contactChannel = {};
      }
      dataRecord.customer.contactChannel.email = { address: corrected };
      if (
        dataRecord.importStats.invalidData &&
        dataRecord.importStats.invalidData.customer &&
        dataRecord.importStats.invalidData.customer.contactChannel &&
        dataRecord.importStats.invalidData.customer.contactChannel.email
      ) {
        delete dataRecord.importStats.invalidData.customer.contactChannel.email;
      }
    }
  }
  callback && callback(null, dataRecord);
};
