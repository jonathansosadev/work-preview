const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const PNT = require('google-libphonenumber').PhoneNumberType;
const s = require('underscore.string');
const parseUtils = require('./parse-utils');

const allowedPhoneNumberTypesByContactChannel = {
  homePhone: [PNT.FIXED_LINE, PNT.FIXED_LINE_OR_MOBILE],
  officePhone: [PNT.FIXED_LINE, PNT.FIXED_LINE_OR_MOBILE, PNT.MOBILE, PNT.PREMIUM_RATE, PNT.SHARED_COST, PNT.TOLL_FREE],
  mobilePhone: [PNT.MOBILE, PNT.FIXED_LINE_OR_MOBILE],
  fax: [PNT.FIXED_LINE, PNT.FIXED_LINE_OR_MOBILE, PNT.SHARED_COST],
};

const COUNTRYCODES = {
  fr_FR: 'FR',
  fr_BE: 'BE',
  fr_MC: 'MC',
  nl_BE: 'BE',
  fr_NC: 'NC',
  es_ES: 'ES',
  ca_ES: 'ES',
  en_US: 'US',
  es_PE: 'PE',
};
module.exports = function importCustomerPhonesFax(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabels === 'undefined') {
    callback && callback('cellLabels option is undefined');
    return;
  }
  let country = options.country;
  if (typeof country === 'undefined') {
    country = 'fr_FR';
  }

  // -> dataRecord.customer.contactChannel.homePhone
  // -> dataRecord.customer.contactChannel.officePhone
  // -> dataRecord.customer.contactChannel.mobilePhone
  // -> dataRecord.customer.contactChannel.fax

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

  const importPhoneCell = function importPhoneCell(contactChannel, cellLabel) {
    let cellValue = parseUtils.getCellValue(rowCells, cellLabel);
    cellValue = cellValue && cellValue.replace(/[,\-()]/g, ''); // clean
    let phoneNumber;
    if (!s.isBlank(cellValue)) {
      dataRecord.importStats.dataPresence.customer.contactChannel[contactChannel] = true;
      if (typeof dataRecord.customer === 'undefined') {
        dataRecord.customer = {};
      }
      if (typeof dataRecord.customer.contactChannel === 'undefined') {
        dataRecord.customer.contactChannel = {};
      }
      dataRecord.customer.contactChannel[contactChannel] = { number: cellValue };
      try {
        phoneNumber = phoneUtil.parse(cellValue, COUNTRYCODES[country]);
      } catch (err) {
        dataRecord.importStats.dataValidity.customer.contactChannel[contactChannel] = false;
      }
      if (typeof phoneNumber !== 'undefined' && phoneUtil.isValidNumber(phoneNumber)) {
        if (
          allowedPhoneNumberTypesByContactChannel[contactChannel].indexOf(phoneUtil.getNumberType(phoneNumber)) >= 0 ||
          (contactChannel === 'mobilePhone' &&
            country === 'en_US' &&
            phoneUtil.getNumberType(phoneNumber) === PNT.FIXED_LINE_OR_MOBILE)
        ) {
          dataRecord.customer.contactChannel[contactChannel] = { number: phoneUtil.format(phoneNumber, PNF.E164) }; // fixes #1516 & pending#147 before we had: PNF.INTERNATIONAL

          dataRecord.importStats.dataValidity.customer.contactChannel[contactChannel] = true;
          if (contactChannel === 'mobilePhone') {
            if (typeof dataRecord.importStats.dataFixes.mobilePhoneImportedFromOtherColumn !== 'undefined') {
              // gsLogger.warn('Row %d, Column "%s": Overriding previously imported mobilePhone with value "%s"',
              //  rowIndex,
              //  cellLabel,
              //  cellValue);
              delete dataRecord.importStats.dataFixes.mobilePhoneImportedFromOtherColumn;
            }
          }
        } else {
          // gsLogger.warn('Row %d, Column "%s": Value "%s" is not a %s', rowIndex, cellLabel, cellValue, contactChannel);
          dataRecord.importStats.dataValidity.customer.contactChannel[contactChannel] = false;

          // Import contactChannel number as mobile if detected as such,
          // unless mobilePhone was already imported
          if (
            contactChannel !== 'mobilePhone' &&
            (typeof dataRecord.customer === 'undefined' ||
              typeof dataRecord.customer.contactChannel === 'undefined' ||
              typeof dataRecord.customer.contactChannel.mobilePhone === 'undefined' ||
              dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone === false) &&
            (phoneUtil.getNumberType(phoneNumber) === PNT.MOBILE ||
              (country === 'en_US' && phoneUtil.getNumberType(phoneNumber) === PNT.FIXED_LINE_OR_MOBILE))
          ) {
            // gsLogger.info('Row %d, Column "%s": Importing non-%s value "%s" as a mobilePhone',
            //   rowIndex,
            //   cellLabel,
            //   contactChannel,
            //   cellValue);

            if (typeof dataRecord.customer === 'undefined') {
              dataRecord.customer = {};
            }
            if (typeof dataRecord.customer.contactChannel === 'undefined') {
              dataRecord.customer.contactChannel = {};
            }
            dataRecord.customer.contactChannel.mobilePhone = { number: phoneUtil.format(phoneNumber, PNF.E164) }; // fixes #1516 & pending#147 before we had: PNF.INTERNATIONAL

            dataRecord.importStats.dataFixes.mobilePhoneImportedFromOtherColumn = true;
            dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone = true;
            dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone = true;
          }
        }
      } else {
        // gsLogger.warn('Row %d, Column "%s": Invalid %s value "%s"', rowIndex, cellLabel, contactChannel, cellValue);
        dataRecord.importStats.dataValidity.customer.contactChannel[contactChannel] = false;

        if (contactChannel === 'mobilePhone') {
          if (typeof dataRecord.importStats.invalidData === 'undefined') {
            dataRecord.importStats.invalidData = {};
          }
          if (typeof dataRecord.importStats.invalidData.customer === 'undefined') {
            dataRecord.importStats.invalidData.customer = {};
          }
          if (typeof dataRecord.importStats.invalidData.customer.contactChannel === 'undefined') {
            dataRecord.importStats.invalidData.customer.contactChannel = {};
          }
          dataRecord.importStats.invalidData.customer.contactChannel.mobilePhone = {
            value: cellValue,
            reason: 'syntaxError',
          };
        }
      }
    } else {
      // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
      dataRecord.importStats.dataPresence.customer.contactChannel[contactChannel] = false;
    }

  };

  // check in the email field if we have a mobilePhone
  const importMobilePhoneFromEmail = function importMobilePhoneFromEmail(options) {
    if (dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone) {
      return;
    }
    let cellValue =
      parseUtils.getCellValue(rowCells, 'email') ||
      parseUtils.getCellValue(rowCells, (options && options.cellLabels && options.cellLabels.email) || 'email');
    cellValue = cellValue && cellValue.replace(/[,\-()]/g, ''); // clean
    let phoneNumber;
    if (!s.isBlank(cellValue)) {
      if (typeof dataRecord.customer === 'undefined') {
        dataRecord.customer = {};
      }
      if (typeof dataRecord.customer.contactChannel === 'undefined') {
        dataRecord.customer.contactChannel = {};
      }
      try {
        phoneNumber = phoneUtil.parse(cellValue, COUNTRYCODES[country]);
      } catch (err) {
        return;
      }
      if (typeof phoneNumber !== 'undefined' && phoneUtil.isValidNumber(phoneNumber)) {
        if (
          phoneUtil.getNumberType(phoneNumber) === PNT.MOBILE ||
          (country === 'en_US' && phoneUtil.getNumberType(phoneNumber) === PNT.FIXED_LINE_OR_MOBILE)
        ) {
          if (typeof dataRecord.customer === 'undefined') {
            dataRecord.customer = {};
          }
          if (typeof dataRecord.customer.contactChannel === 'undefined') {
            dataRecord.customer.contactChannel = {};
          }
          dataRecord.customer.contactChannel.mobilePhone = { number: phoneUtil.format(phoneNumber, PNF.E164) }; // fixes #1516 & pending#147 before we had: PNF.INTERNATIONAL

          dataRecord.importStats.dataFixes.mobilePhoneImportedFromOtherColumn = true;
          dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone = true;
          dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone = true;
        }
      }
    }
  };

  // force parsing mobilePhone before homePhone, avoid a bug when mobilePhone is wrong in its own field but correct in the homePhone field
  importPhoneCell('mobilePhone', options.cellLabels['mobilePhone']);
  Object.keys(options.cellLabels).forEach((contactChannel) => {
    if (contactChannel !== 'mobilePhone' && contactChannel !== 'email') {
      importPhoneCell(contactChannel, options.cellLabels[contactChannel]);
    }
  });

  importMobilePhoneFromEmail(options);
  callback && callback(null, dataRecord);
};
