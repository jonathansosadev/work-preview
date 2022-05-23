'use strict';

var debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:customer-name'); // eslint-disable-line max-len,no-unused-vars
var gsCustomerUtil = require('../../customer/util');
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');

var cleanName = function (name) {
  return name.replace(/[^\wàâçéèêëîïíôóûùüÿñæœ .-]/g, '').trim();
};

module.exports = function importCustomerName(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabels === 'undefined') {
    callback && callback('cellLabels option is undefined');
    return;
  }

  // Supports either:
  //   cellLabels.fullName
  // or
  //   cellLabels.firstName and cellLabels.lastName
  if (typeof options.cellLabels.fullName !== 'undefined') {
    /* we accept now to have both full and first´last
    if ((typeof(options.cellLabels.firstName) !== 'undefined') || (typeof(options.cellLabels.lastName) !== 'undefined')) {
      callback && ('Both cellLabels.fullName and either cellLabels.firstName or cellLabels.lastName options are defined');
      return;
    }*/
  } else if (
    typeof options.cellLabels.firstName === 'undefined' ||
    typeof options.cellLabels.lastName === 'undefined'
  ) {
    callback &&
      callback('Both cellLabels.fullName and either cellLabels.firstName or cellLabels.lastName options are undefined');
    return;
  }

  // -> dataRecord.customer.lastName
  // -> dataRecord.customer.fullName
  // -> dataRecord.customer.firstName

  if (typeof dataRecord.importStats.dataPresence.customer === 'undefined') {
    dataRecord.importStats.dataPresence.customer = {};
  }

  if (typeof dataRecord.importStats.dataValidity.customer === 'undefined') {
    dataRecord.importStats.dataValidity.customer = {};
  }

  var fullNameCellValue = '';

  if (typeof options.cellLabels.fullName !== 'undefined') {
    // Use cellLabels.fullName
    fullNameCellValue = parseUtils.getCellValue(rowCells, options.cellLabels.fullName);
    fullNameCellValue = options.transformer('fullName', fullNameCellValue, rowCells);

    if (!s.isBlank(fullNameCellValue)) {
      dataRecord.importStats.dataPresence.customer.firstName = false;
      dataRecord.importStats.dataPresence.customer.lastName = false;
      dataRecord.importStats.dataPresence.customer.fullName = true;

      if (gsCustomerUtil.isValidCustomerFullName(fullNameCellValue)) {
        dataRecord.importStats.dataValidity.customer.fullName = true;

        if (typeof dataRecord.customer === 'undefined') {
          dataRecord.customer = {};
        }

        fullNameCellValue = cleanName(fullNameCellValue);
        dataRecord.customer.fullName = s.titleize(fullNameCellValue);
      } else {
        // gsLogger.error('Row %d, Column "%s": Invalid value "%s"', rowIndex, options.cellLabels.fullName, fullNameCellValue);
        dataRecord.importStats.dataValidity.customer.fullName = false;
      }
    } else {
      // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, options.cellLabels.fullName);
      dataRecord.importStats.dataPresence.customer.firstName = false;
      dataRecord.importStats.dataPresence.customer.lastName = false;
      dataRecord.importStats.dataPresence.customer.fullName = false;
    }
  }
  if (typeof options.cellLabels.firstName !== 'undefined' && typeof options.cellLabels.lastName !== 'undefined') {
    // Use cellLabels.firstName + cellLabels.lastName
    var firstNameCellValue = parseUtils.getCellValue(rowCells, options.cellLabels.firstName);
    firstNameCellValue = options.transformer('firstName', firstNameCellValue, rowCells);

    dataRecord.importStats.dataPresence.customer.firstName = !s.isBlank(firstNameCellValue);
    if (dataRecord.importStats.dataPresence.customer.firstName) {
      if (gsCustomerUtil.isValidCustomerFirstName(firstNameCellValue)) {
        dataRecord.importStats.dataValidity.customer.firstName = true;
      } else {
        // gsLogger.error('Row %d, Column "%s": Invalid value "%s"', rowIndex, options.cellLabels.firstName, firstNameCellValue);
        dataRecord.importStats.dataValidity.customer.firstName = false;
      }
    } else {
      // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, options.cellLabels.firstName);
    }

    var lastNameCellValue = parseUtils.getCellValue(rowCells, options.cellLabels.lastName);
    lastNameCellValue = options.transformer('lastName', lastNameCellValue, rowCells);

    dataRecord.importStats.dataPresence.customer.lastName = !s.isBlank(lastNameCellValue);
    if (dataRecord.importStats.dataPresence.customer.lastName) {
      if (gsCustomerUtil.isValidCustomerFirstName(lastNameCellValue)) {
        dataRecord.importStats.dataValidity.customer.lastName = true;
      } else {
        // gsLogger.error('Row %d, Column "%s": Invalid value "%s"', rowIndex, options.cellLabels.lastName, lastNameCellValue);
        dataRecord.importStats.dataValidity.customer.lastName = false;
      }
    } else {
      // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, options.cellLabels.lastName);
    }

    // It is assumed that:
    //   if both firstName and lastName are present, then fullName is present
    //   if only one of either firstName or lastName are present, then fullName is present
    //   if neither firstName nor lastName are present, then fullName is not present
    if (!firstNameCellValue) {
      firstNameCellValue = '';
    }
    if (!lastNameCellValue) {
      lastNameCellValue = '';
    }

    if (
      dataRecord.importStats.dataValidity.customer.firstName ||
      dataRecord.importStats.dataValidity.customer.lastName
    ) {
      if (typeof dataRecord.customer === 'undefined') {
        dataRecord.customer = {};
      }
    }

    // If either firstName or lastName is empty or invalid,
    // Then import neither
    if (
      dataRecord.importStats.dataValidity.customer.firstName ||
      dataRecord.importStats.dataValidity.customer.lastName
    ) {
      dataRecord.customer.firstName = s.titleize(firstNameCellValue);
      dataRecord.customer.lastName = s.titleize(lastNameCellValue);

      fullNameCellValue = s.trim(firstNameCellValue + ' ' + lastNameCellValue);
      if (
        !dataRecord.customer.fullName ||
        (dataRecord.customer.fullName && dataRecord.customer.fullName.length < fullNameCellValue.length)
      ) {
        dataRecord.importStats.dataPresence.customer.fullName = true;
        dataRecord.importStats.dataValidity.customer.fullName = gsCustomerUtil.isValidCustomerFullName(
          fullNameCellValue
        );
        fullNameCellValue = cleanName(fullNameCellValue);
        dataRecord.customer.fullName = s.titleize(fullNameCellValue);
      }
    }
  }

  callback && callback(null, dataRecord);
};
