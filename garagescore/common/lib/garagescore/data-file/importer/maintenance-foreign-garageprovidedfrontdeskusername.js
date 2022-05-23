'use strict';

var debug = require('debug')(
  'garagescore:common:lib:garagescore:data-file:importer:maintenance-foreign-garageprovidedfrontdeskusername'
); // eslint-disable-line max-len,no-unused-vars
// var gsLogger = require('../../logger');
var s = require('underscore.string');
var parseUtils = require('./parse-utils');
const { FED, log } = require('../../../util/log');

const checkUndefined = (value, dataRecord, cache, cb) => {
  try {
    const newWord =
      !s.isBlank(value) &&
      value !== 'ALL_USERS' &&
      value &&
      /[A-Za-z0-9\u00C0-\u00FF]/.test(value) &&
      value
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (typeof dataRecord.foreign === 'undefined') {
      dataRecord.foreign = {};
    }
    if (newWord) {
      cache.find('UndefinedDictionary', 'word', newWord, (err, dictionary) => {
        try {
          if (err) {
            log.error(FED, `IMPORT FRONTDESKUSERNAME ERROR (1841) : ${err}`);
            cb && cb(err);
            return;
          }
          if (dictionary && dictionary.length > 0) {
            // UNDEFINED
            dataRecord.importStats.dataPresence.foreign.garageProvidedFrontDeskUserName = false;
            dataRecord.foreign.garageProvidedFrontDeskUserName = 'UNDEFINED';
            cb && cb(null, dataRecord);
            return;
          } else {
            // DEFINED
            dataRecord.foreign.garageProvidedFrontDeskUserName = value;
            cb && cb(null, dataRecord);
            return;
          }
        } catch (e) {
          log.error(FED, `IMPORT FRONTDESKUSERNAME ERROR (new trycatch) (1841) : ${e}`);
          cb && cb(e, dataRecord);
        }
      });
    } else {
      // UNDEFINED
      dataRecord.importStats.dataPresence.foreign.garageProvidedFrontDeskUserName = false;
      dataRecord.foreign.garageProvidedFrontDeskUserName = 'UNDEFINED';
      cb && cb(null, dataRecord);
      return;
    }
  } catch (e) {
    log.error(FED, `IMPORT FRONTDESKUSERNAME ERROR (catched) (1841) : ${e.stackTrace}`);
    cb(e);
  }
};

module.exports = function importForeignGarageProvidedFrontDeskUserName(
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

  // -> dataRecord.foreign.garageProvidedFrontDeskUserName

  if (typeof dataRecord.importStats.dataPresence.foreign === 'undefined') {
    dataRecord.importStats.dataPresence.foreign = {};
  }

  var cellValue = parseUtils.getCellValue(rowCells, cellLabel);
  checkUndefined(cellValue, dataRecord, options.cache, callback);
};
