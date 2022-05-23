const _ = require('underscore');
const debug = require('debug')(
  'garagescore:common:lib:garagescore:data-file:importer:customer-contactchannel-snailmail'
); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
const s = require('underscore.string');
const parseUtils = require('./parse-utils');

const COUNTRYCODES = {
  fr_FR: 'FR',
  es_ES: 'ES',
  en_US: 'US',
  es_PE: 'PE',
};

module.exports = function importCustomerSnailMail(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabels === 'undefined') {
    callback && callback('cellLabels option is undefined');
    return;
  }

  let country = options.country;
  if (typeof country === 'undefined') {
    country = 'fr_FR';
  }
  // -> dataRecord.customer.contactChannel.snailMail

  if (typeof dataRecord.importStats.dataPresence.customer === 'undefined') {
    dataRecord.importStats.dataPresence.customer = {};
  }
  if (typeof dataRecord.importStats.dataPresence.customer.contactChannel === 'undefined') {
    dataRecord.importStats.dataPresence.customer.contactChannel = {};
  }
  if (typeof dataRecord.importStats.dataPresence.customer.contactChannel.snailMail === 'undefined') {
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail = {};
  }
  if (typeof dataRecord.importStats.dataValidity.customer === 'undefined') {
    dataRecord.importStats.dataValidity.customer = {};
  }
  if (typeof dataRecord.importStats.dataValidity.customer.contactChannel === 'undefined') {
    dataRecord.importStats.dataValidity.customer.contactChannel = {};
  }
  if (typeof dataRecord.importStats.dataValidity.customer.contactChannel.snailMail === 'undefined') {
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail = {};
  }

  dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.streetAddress = false;
  dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.postCode = false;
  dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.city = false;
  dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.countryCode = false;
  dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.streetAddress = false;
  dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.postCode = false;
  dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.city = false;
  dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.countryCode = false;

  // var snailMailProperties = ['streetAddress', 'postCode', 'city', 'countryCode'];
  const compulsarySnailMailProperties = ['city'];

  for (let i = compulsarySnailMailProperties.length - 1; i >= 0; i--) {
    if (typeof options.cellLabels[compulsarySnailMailProperties[i]] === 'undefined') {
      callback && callback(`cellLabels.${compulsarySnailMailProperties[i]} options is undefined`);
      return;
    }
  }

  const snailMail = {};

  let streetAddress;
  if (typeof options.cellLabels.streetAddress !== 'undefined') {
    streetAddress = s.titleize(
      s.trim(s.dedent(_.map(_.values(_.pick(rowCells, options.cellLabels.streetAddress)), s.clean).join('\n')))
    );
  }
  if (!s.isBlank(streetAddress)) {
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.streetAddress = true;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.streetAddress = true;
    snailMail.streetAddress = streetAddress.replace(/\\'/g, "'");
  } else if (typeof options.cellLabels.streetAddress !== 'undefined') {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, options.cellLabels.streetAddress);
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.streetAddress = false;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.streetAddress = false;
  }

  let postCode;
  if (typeof options.cellLabels.postCode !== 'undefined') {
    postCode = parseUtils.getCellValue(rowCells, options.cellLabels.postCode);
  }
  if (
    !s.isBlank(postCode) &&
    (parseInt(postCode, 10) >= 10000 ||
      (parseInt(postCode, 10) >= 1000 && (postCode.length === 5 || postCode.length === 4))) &&
    parseInt(postCode, 10) < 100000
  ) {
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.postCode = true;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.postCode = true;
    if (postCode.length === 4) postCode = `0${postCode}`;
    snailMail.postCode = postCode;
  } else if (typeof options.cellLabels.postCode !== 'undefined') {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, options.cellLabels.postCode);
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.postCode = false;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.postCode = false;
  }

  let city;
  if (typeof options.cellLabels.city !== 'undefined') {
    city = s.titleize(parseUtils.getCellValue(rowCells, options.cellLabels.city));
  }
  if (!s.isBlank(city)) {
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.city = true;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.city = true;
    snailMail.city = city;
  } else if (typeof options.cellLabels.city !== 'undefined') {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, options.cellLabels.city);
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.city = false;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.city = false;
  }

  let countryCode;
  if (typeof options.cellLabels.countryCode !== 'undefined') {
    countryCode = s.clean(parseUtils.getCellValue(rowCells, options.cellLabels.countryCode));
  } else {
    countryCode = COUNTRYCODES[country];
  }
  if (!s.isBlank(countryCode)) {
    dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.countryCode = true;
    dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.countryCode = true;
    snailMail.countryCode = countryCode;
  }

  if (!_.isEmpty(snailMail)) {
    if (typeof dataRecord.customer === 'undefined') {
      dataRecord.customer = {};
    }
    if (typeof dataRecord.customer.contactChannel === 'undefined') {
      dataRecord.customer.contactChannel = {};
    }

    dataRecord.customer.contactChannel.snailMail = snailMail;
  }

  callback && callback(null, dataRecord);
};
