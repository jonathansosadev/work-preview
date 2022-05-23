const _ = require('underscore');
const csv = require('csv');
const debug = require('debug')('garagescore:common:lib:garagescore:data-file:util'); // eslint-disable-line max-len,no-unused-consts
const s = require('underscore.string');
const util = require('util');
const XLSX = require('xlsx');
const xml2js = require('xml2js');
const iconv = require('iconv-lite');
const DataFileStatus = require('../../../models/data-file.status.js');
const async = require('async');
const lruCache = require('lru-cache');

const FIRSTSHEET = '#first#';

/*
 * DataRecord Sheet Row Utilities
 */

const undefinedFrontDeskUserNames = lruCache({
  max: 100000,
  length() {
    return 1;
  },
  maxAge: 1000 * 60 * 5, // last 5 minutes
});

// remove first x lines of a string
function _removeXLines(str, x, isHeaderlessCsv) {
  const trim = str.replace(/\r\n/g, '\n');
  let pos = 0;
  let count = x;
  if (isHeaderlessCsv) {
    // dont ignore the first line
    pos = trim.indexOf('\n', pos) + 1;
    const header = trim.substring(0, pos);
    while (trim.indexOf('\n', pos) >= 0 && count > 0) {
      pos = trim.indexOf('\n', pos) + 1;
      count--;
    }
    return count > 0 ? header : header + trim.substring(pos);
  }
  while (trim.indexOf('\n', pos) >= 0 && count > 0) {
    pos = trim.indexOf('\n', pos) + 1;
    count--;
  }
  return count > 0 ? '' : trim.substring(pos);
}

function readDataFileRowsFromCsvFileBuffer(csvFileBuffer, columnNames, options, contentTransformer, callback) {
  debug('Stringifying CSV file buffer …');
  let csvFile = options.charset ? iconv.decode(csvFileBuffer, options.charset) : csvFileBuffer.toString();
  csvFile = contentTransformer(csvFile);
  csvFile = csvFile.replace(/[\r\n]+$/, '');
  if (options.ignoreFirstXLines) {
    csvFile = _removeXLines(csvFile, options.ignoreFirstXLines, options.isHeaderlessCsv);
  }
  debug(`Reading CSV file buffer content (${csvFile.length} characters)…`);
  debug(csvFile.substring(0, Math.min(csvFile.length, 1000)));
  csv.parse(
    csvFile,
    { delimiter: ';', relax: true, relax_column_count: true, ltrim: true, rtrim: true },
    (err, csvFileRows) => {
      if (err) {
        callback(err);
        return;
      }
      const headerRow = csvFileRows.shift();
      /* deprecated
    headerRow = headerRow.slice(0, columnNames.length); // Fit headgit stater row to number of expected unexpected columns
if (!_.isEqual(headerRow, columnNames)) {
  console.error(headerRow);
  console.error(columnNames);
  throw new Error('Header Row of CSV File Buffer does not match schema column names');
}
*/

      // [ [ 'head1', 'head2', 'head3' ], [ 'r1c1', 'r1c2', 'r1c3' ], [ 'r2c1', 'r2c2', 'r2c3' ] ]
      // -> [ { 'head1': 'r1c1', 'head2': 'r1c2', 'head3': 'r1c3' }, { 'head1': 'r2c1', 'head2': 'r2c2', 'head3': 'r2c3' } ]
      const dataFileRows = [];
      for (let i = csvFileRows.length - 1; i >= 0; i--) {
        dataFileRows.push(_.object(headerRow, csvFileRows[i]));
      }

      callback(null, dataFileRows, headerRow);
    }
  );
}

/** count non empty column*/
function nonEmptyColumns(row) {
  return _.filter(row, (item) => !(_.isEmpty(item) || s.isBlank(item))).length;
}

/**
fix array->string
Right now, we only have one example of xml file
and in this file, each rows contains many useless arrays
eg, rows[i].client[0].adresse[0]
we prefer : rows[i].client.adresse
*/
function _fixXMLArrays(obj) {
  if (typeof obj === 'string') {
    return obj;
  } else if (Array.isArray(obj)) {
    return _fixXMLArrays(obj[0]);
  } else if (typeof obj === 'object') {
    const newObj = {};
    _.each(obj, (value, prop) => {
      newObj[prop] = _fixXMLArrays(value);
    });
    return newObj;
  }
  return obj;
}

/** Remove nested level
{customer : {address : 'toulon'}}
become
{customer.address : 'toulon'}
*/
function _flattenRow(obj) {
  const res = {};
  Object.keys(obj).forEach((i) => {
    if (typeof obj[i] === 'object') {
      const flat = _flattenRow(obj[i]);
      Object.keys(flat).forEach((x) => {
        res[i + (isNaN(x) ? `.${x}` : '')] = flat[x];
      });
    } else {
      res[i] = obj[i];
    }
  });
  return res;
}

function readDataFileRowsFromXmlFileBuffer(xmlFileBuffer, columnNames, xmlPath, options, contentTransformer, callback) {
  debug('Stringifying XML file buffer …');
  const rows = [];
  debug('Reading XML file buffer content …');
  const parser = new xml2js.Parser();
  let xml = options.charset ? iconv.decode(xmlFileBuffer, options.charset) : xmlFileBuffer.toString('utf8');
  xml = contentTransformer(xml);
  if (options.ignoreFirstXLines) {
    xml = _removeXLines(xml, options.ignoreFirstXLines, false);
  }
  xml = xml.substring(xml.indexOf('<')); // remove every char before first tag
  parser.parseString(xml, (err, result) => {
    if (err) {
      callback(err, [], []);
      return;
    }
    try {
      const parts = xmlPath.split('.');
      let list = result;
      /* find the root element*/
      for (let i = 0; i < parts.length; i++) {
        list = list[parts[i]];
        if (i !== parts.length - 1 && Array.isArray(list)) {
          list = list[0];
        }
      }
      if (!list) {
        callback(null, [], []);
        return;
      }
      const header = {};
      for (let r = 0; r < list.length; r++) {
        let row = _fixXMLArrays(list[r]);
        row = _flattenRow(row);
        rows.push(row);
        Object.keys(row).forEach((h) => {
          header[h] = true;
        });
      }
      callback(null, rows, Object.keys(header));
    } catch (e) {
      callback(e, [], []);
    }
  });
}

/*
 * Returns rows from a worksheet, converts 'date cells' to MM/DD/YY
 * @throws {Error} Throws a generic Error if Worksheet not found in Workbook
 * @throws {Error} Throws a generic Error if Worksheet does not match schema
 */
function readDataFileRowsFromXlsxWorkbook(workbook, worksheetNameParam, columnNames, callback) {
  debug('Validating XLSX Workbook against DataRecord Sheet Schema …');
  debug(columnNames);

  const worksheetName = worksheetNameParam === FIRSTSHEET ? workbook.SheetNames[0] : worksheetNameParam;

  const worksheet = workbook.Sheets[worksheetName];
  if (typeof worksheet === 'undefined') {
    callback(new Error(util.format('XLSX Worksheet "%s" not found in XLSX Workbook', worksheetName)));
    return;
  }
  debug('Found XLSX Worksheet "%s" in XLSX Workbook', worksheetName);

  // Decode “formula-written” range of all worksheet cells into range of cells object
  // eg. 'B2:M13' -> { s: { c:1, r:1 }, e: { c:12, r:12 } }
  const worksheetRange = XLSX.utils.decode_range(worksheet['!ref']);
  const rowsCount = worksheetRange.e.r;
  const columnsCount = worksheetRange.e.c;
  const maxRows = 10000;
  const maxCols = 1000;
  if (columnsCount > maxCols && rowsCount > maxRows) {
    callback(
      new Error(`XLS with too many rows (${rowsCount}/${maxRows} max) and columns (${columnsCount}/${maxCols} max)`)
    );
    return;
  }
  if (rowsCount > maxRows) {
    callback(new Error(`XLS with too many rows (${rowsCount}/${maxRows} max)`));
    return;
  }
  if (columnsCount > maxCols) {
    callback(new Error(`XLS with too many columns (${columnsCount}/${maxCols} max)`));
    return;
  }

  const rows = [];
  let rowIndex = 0;
  let seriesOfEmptyRows = 0;
  let forceStop = false;
  // async loop to dont block the queue
  async.whilst(
    () => rowIndex <= rowsCount && !forceStop,
    (next) => {
      const row = [];
      let emptyRow = true;
      for (let columnIndex = 0; columnIndex <= columnsCount; columnIndex++) {
        // format_cell will format dates as MM/DD/YY (if the cell is a 'date cell') or just return the value
        const v = XLSX.utils.format_cell(worksheet[XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex })]);
        const c = v ? s.clean(v) : '';
        row.push(c);
        emptyRow &= !c || c.length === 0;
      }
      if (!emptyRow) {
        rows.push(row);
        seriesOfEmptyRows = 0;
      } else {
        seriesOfEmptyRows++;
        if (seriesOfEmptyRows > 1000) {
          console.error(new Error('Xls file with too many empty rows, stop parsing'));
          forceStop = true;
        }
      }
      rowIndex++;
      async.setImmediate(() => {
        next();
      }); // avoid Maximum call stack size exceeded
    },
    (err) => {
      if (err) {
        callback(err);
        return;
      }
      let headerRow = rows.shift();
      // fix some buggy files, if we don't have enough columns, it must not be the header
      while (headerRow && nonEmptyColumns(headerRow) < 4) {
        headerRow = rows.shift();
      }
      // [ [ 'head1', 'head2', 'head3' ], [ 'r1c1', 'r1c2', 'r1c3' ], [ 'r2c1', 'r2c2', 'r2c3' ] ]
      // -> [ { 'head1': 'r1c1', 'head2': 'r1c2', 'head3': 'r1c3' }, { 'head1': 'r2c1', 'head2': 'r2c2', 'head3': 'r2c3' } ]
      const dataFileRows = [];
      for (let i = rows.length - 1; i >= 0; i--) {
        dataFileRows.push(_.object(headerRow, rows[i]));
      }
      callback(null, dataFileRows, headerRow);
    }
  );
}

function readDataFileRowsFromXlsxFileBuffer(xlsxFileBuffer, xlsxWorksheetName, columnNames, callback) {
  debug('Reading XLSX file buffer  …');
  try {
    const xlsxWorkbook = XLSX.read(xlsxFileBuffer, { type: 'buffer' });
    readDataFileRowsFromXlsxWorkbook(xlsxWorkbook, xlsxWorksheetName, columnNames, (e, rows, header) => {
      callback(e, rows, header);
    });
  } catch (e) {
    console.error(e);
    callback(null, [], []);
  }
}

async function readDataFileRowsFromJSONFileBuffer(jsonFileBuffer, callback) {
  debug('Reading JSON file buffer  …');
  try {
    const parsedJSON = JSON.parse(jsonFileBuffer.toString().trim());
    const headers = [...new Set(parsedJSON.map(Object.keys).flat())];

    callback(null, parsedJSON, headers);
  } catch (e) {
    console.error(e);
    callback(null, [], []);
  }
}

/*
 * Ensure DataFile is valid for Campaign creation:
 *  - has Complete importStatus
 *  - belongs to a Garage
 */
function ensureValidForCampaignCreation(dataFile, callback) {
  if (typeof dataFile.garageId === 'undefined') {
    callback(new Error('Undefined dataFile.garageId'));
    return;
  }
  if (typeof dataFile.importStatus === 'undefined') {
    callback(new Error(util.format('Undefined import status for DataRecord Sheet "%s"', dataFile.id)));
    return;
  }
  if (dataFile.importStatus !== DataFileStatus.COMPLETE) {
    callback(new Error(util.format('Import status for DataRecord Sheet "%s" is not "Complete"', dataFile.id)));
    return;
  }
  callback();
}

/*
 * File Store Utilities
 */

const supportedFileStores = ['Dropbox', 'S3', 'humanupload', 'memory', 'filesystem'];
function isValidFileStore(fileStore) {
  if (typeof fileStore !== 'undefined') {
    if (_.contains(supportedFileStores, fileStore)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  ensureValidForCampaignCreation,
  importer: {
    customerContactChannelEmail: require('./importer/customer-contactchannel-email'), // eslint-disable-line global-require
    customerContactChannelPhonesFax: require('./importer/customer-contactchannel-phones-fax'), // eslint-disable-line global-require
    customerContactChannelSnailMail: require('./importer/customer-contactchannel-snailmail'), // eslint-disable-line global-require
    customerForeignGarageProvidedCustomerId: require('./importer/customer-foreign-garageprovidedcustomerid'), // eslint-disable-line global-require
    customerForeignGarageProvidedGarageId: require('./importer/customer-foreign-garageprovidedgarageid'), // eslint-disable-line global-require
    customerName: require('./importer/customer-name'), // eslint-disable-line global-require
    customerTypeGenderTitle: require('./importer/customer-type-gender-title'), // eslint-disable-line global-require
    foreignData: require('./importer/foreign-data'), // eslint-disable-line global-require
    genericMissing: require('./importer/generic-missing'), // eslint-disable-line global-require
    dataRecordBilledAt: require('./importer/maintenance-billed-at'), // eslint-disable-line global-require
    price: require('./importer/price'), // eslint-disable-line global-require
    dataRecordCompletedAt: require('./importer/service-provided-at'), // eslint-disable-line global-require
    rowType: require('./importer/row-type'), // eslint-disable-line global-require
    dataRecordForeignGarageProvidedFrontDeskUserName: require('./importer/maintenance-foreign-garageprovidedfrontdeskusername'), // eslint-disable-line global-require
    dataRecordForeignGarageProvidedFrontDeskUserTeam: require('./importer/maintenance-foreign-garageprovidedfrontdeskuserteam'), // eslint-disable-line global-require
    vehicleCategoryId: require('./importer/vehicle-categoryid'), // eslint-disable-line global-require
    vehicleMake: require('./importer/vehicle-make'), // eslint-disable-line global-require
    vehicleModel: require('./importer/vehicle-model'), // eslint-disable-line global-require
    vehicleRegistrationPlate: require('./importer/vehicle-registration-plate'), // eslint-disable-line global-require
    vehicleRegistrationFirstRegisteredAt: require('./importer/vehicle-registration-firstregisteredat'), // eslint-disable-line global-require
    vehicleMileage: require('./importer/vehicle-mileage'), // eslint-disable-line global-require
    vehicleVin: require('./importer/vehicle-vin'), // eslint-disable-line global-require
    optOutMailing: require('./importer/optOutMailing'), // eslint-disable-line global-require
    optOutSMS: require('./importer/optOutSMS'), // eslint-disable-line global-require
  },
  isValidFileStore,
  readDataFileRowsFromCsvFileBuffer,
  readDataFileRowsFromXlsxFileBuffer,
  readDataFileRowsFromXmlFileBuffer,
  readDataFileRowsFromJSONFileBuffer,
  FIRSTSHEET,
};
