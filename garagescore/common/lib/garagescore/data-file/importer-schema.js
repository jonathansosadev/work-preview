const app = require('../../../../server/server');
const _ = require('lodash');
const gsDataFileUtil = require('./util');
const Q = require('q');
const InstancesCache = require('../../model-tool/instances-cache');
const dataTypes = require('../../../models/data/type/data-types');
const gsDataFileDataType = require('../../../models/data-file.data-type');
const optionsParser = require('./options-parser');
const removeDuplicates = require('./remove-duplicates');
const contentTransformers = require('./transformers/factory');
const gsParserLoader = require('../data-file-parser/loader');
const rpath = require('path');
const async = require('async');
const configuration = require('../configuration');
const { promisify } = require('util');
const { FED, log } = require('../../util/log');
const sharedFilters = require('./shared-filters');

const iCache = new InstancesCache({ max: 500000, maxAge: 5 * 60 * 1000 });

// check if a field exist in a json throw an Exception
const checkField = (json, path) => {
  const cc = path.split('.');
  let node = json;
  for (let i = 0; i < cc.length; i++) {
    node = node[cc[i]];
    if (typeof node === 'undefined') throw new Error(`Config field ${path} not found`);
  }
};

let ImporterSchema;

// shortcut
const importerFunction = (fctName, fctOption, schema) => (dataRecord, rowIndex, rowCells, callback) => {
  const options = fctOption === null ? {} : ImporterSchema.prototype[fctOption].apply(schema);
  try {
    gsDataFileUtil.importer[fctName](dataRecord, rowIndex, rowCells, options, callback);
  } catch (e) {
    console.error(e);
    if (callback) {
      callback(e);
    }
  }
};

/**
Create custom importers from a json configuration
*/
ImporterSchema = function importerSchema(config, garage) {
  if (garage) this.setGarageTimezone(garage.timezone);
  
  // how to read...
  checkField(config, 'fileformat');
  checkField(config, 'format');
  checkField(config, 'columns');

  const fileType = config.fileformat.type || config.fileformat.format;
  this.setFileFormat(fileType);
  this.setWorksheetName(config.fileformat.worksheetName);
  if (fileType === 'xml') {
    this.setXmlPath(config.fileformat.path);
  }
  if (fileType === 'xml' || fileType === 'csv') {
    this.setCharset(config.fileformat.charset);
    this.setIgnoreFirstXLines(config.fileformat.ignoreFirstXLines);
  }
  if (config.transformers) {
    this.setContentTransformers(config.transformers);
  }
  if (config.country) {
    this.setCountry(config.country);
  }

  this.setOptionalImportDate(config.optionalCompletedAt);

  // customer
  this.setColumnGender(config.columns.gender);
  this.setColumnFullName(config.columns.fullName);
  this.setColumnFirstName(config.columns.firstName);
  this.setColumnLastName(config.columns.lastName);

  // address
  this.setColumnCity(config.columns.city);
  this.setColumnCountryCode(config.columns.countryCode);
  this.setColumnPostCode(config.columns.postCode);
  this.setColumnStreetAddress(config.columns.streetAddress);

  // phones
  this.setColumnHomePhone(config.columns.homePhone);
  this.setColumnMobilePhone(config.columns.mobilePhone);
  this.setColumnOfficePhone(config.columns.officePhone);
  this.setColumnFax(config.columns.fax);

  // email
  this.setColumnEmail(config.columns.email);

  // billing
  this.setColumnBilledAt(config.columns.billedAt);

  // price
  this.setColumnPrice(config.columns.price);

  // vehicle
  this.setColumnVehicleCategoryId(config.columns.vehicleCategoryId);
  this.setColumnVehicleMake(config.columns.vehicleMake);
  this.setFormatVehicleMake(config.format.vehicleMake);

  this.setFormatDataTypes(config.format.dataTypes);
  this.setColumnVehicleModel(config.columns.vehicleModel);

  this.setColumnVehicleRegistrationPlate(config.columns.vehicleRegistrationPlate);
  this.setColumnVehicleRegistrationFirstRegisteredAt(config.columns.vehicleRegistrationFirstRegisteredAt);
  this.setFormatVehicleRegistrationFirstRegisteredAt(config.format.vehicleRegistrationFirstRegisteredAt);
  this.setColumnVehicleMileage(config.columns.vehicleMileage);

  this.setColumnVehicleVin(config.columns.vehicleVin);
  // this.setFormatVehicleVin(config.format.vehicleVin);

  this.setColumnDataRecordCompletedAt(config.columns.dataRecordCompletedAt);
  this.setFormatDataRecordCompletedAt(config.format.dataRecordCompletedAt);

  this.setColumnRowType(config.columns.rowType);

  // foreigns are more generic, they dont have get/set
  this.setForeignColumns(config.foreigns);

  // Get optOutMailing consent
  this.setColumnOptOutMailing(config.columns.optOutMailing);
  // Get optOutSMS consent
  this.setColumnOptOutSMS(config.columns.optOutSMS);

  this.autosetColumnNames();

  const importfcts = [];

  // generics
  const importName = importerFunction('customerName', 'nameOptions', this);

  const importContact = importerFunction('customerContactChannelPhonesFax', 'contactOptions', this);

  const importEmail = importerFunction('customerContactChannelEmail', 'emailOptions', this);

  const importDataRecordCompletedAt = importerFunction('dataRecordCompletedAt', 'dataRecordCompletedAtOptions', this);

  const importSnailMail = importerFunction('customerContactChannelSnailMail', 'snailMailOptions', this);

  const importGender = importerFunction('customerTypeGenderTitle', 'genderOptions', this);

  const importBilledAt = importerFunction('dataRecordBilledAt', 'billedAtOptions', this);

  const importPrice = importerFunction('price', 'priceOptions', this);

  const importVehicleMake = importerFunction('vehicleMake', 'vehicleMakeOptions', this);

  const importVehicleModel = importerFunction('vehicleModel', 'vehicleModelOptions', this);

  const importVehicleCategoryId = importerFunction('vehicleCategoryId', 'vehicleCategoryIdOptions', this);

  const importVehicleRegistrationPlate = importerFunction(
    'vehicleRegistrationPlate',
    'vehicleRegistrationPlateOptions',
    this
  );

  const importVehicleRegistrationFirstRegisteredAt = importerFunction(
    'vehicleRegistrationFirstRegisteredAt',
    'vehicleRegistrationFirstRegisteredAtOptions',
    this
  );

  const importVehicleMileage = importerFunction('vehicleMileage', 'vehicleMileageOptions', this);

  const importVehicleVin = importerFunction('vehicleVin', 'vehicleVinOptions', this);

  // type
  const importRowType = importerFunction('rowType', 'rowTypeOptions', this);

  // foreigns
  const importForeignGarageProvidedFrontDeskUserName = importerFunction(
    'dataRecordForeignGarageProvidedFrontDeskUserName',
    'foreignGarageProvidedFrontDeskUserNameOptions',
    this
  );

  const importForeignGarageProvidedFrontDeskUserTeam = importerFunction(
    'dataRecordForeignGarageProvidedFrontDeskUserTeam',
    'foreignGarageProvidedFrontDeskUserTeamOptions',
    this
  );

  const importForeignGarageProvidedCustomerId = importerFunction(
    'customerForeignGarageProvidedCustomerId',
    'foreignGarageProvidedCustomerIdOptions',
    this
  );

  const importForeignGarageProvidedGarageId = importerFunction(
    'customerForeignGarageProvidedGarageId',
    'foreignGarageProvidedGarageIdOptions',
    this
  );

  const importForeignData = importerFunction('foreignData', null, this);

  const importOptOutMailing = importerFunction('optOutMailing', 'optOutMailingOptions', this);

  const importOptOutSMS = importerFunction('optOutSMS', 'optOutSMSOptions', this);

  // legacy...
  importfcts.push(importName);
  importfcts.push(importContact);
  importfcts.push(importEmail);
  importfcts.push(importVehicleMake);
  importfcts.push(importVehicleModel);
  importfcts.push(importDataRecordCompletedAt);
  importfcts.push(importSnailMail);
  importfcts.push(importForeignGarageProvidedCustomerId);
  importfcts.push(importForeignGarageProvidedGarageId);
  importfcts.push(importGender);
  importfcts.push(importBilledAt);
  importfcts.push(importPrice);
  importfcts.push(importForeignGarageProvidedFrontDeskUserName);
  importfcts.push(importForeignGarageProvidedFrontDeskUserTeam);
  importfcts.push(importVehicleCategoryId);
  importfcts.push(importVehicleRegistrationPlate);
  importfcts.push(importVehicleRegistrationFirstRegisteredAt);
  importfcts.push(importVehicleMileage);
  importfcts.push(importVehicleVin);
  importfcts.push(importForeignData);
  importfcts.push(importRowType);
  importfcts.push(importOptOutMailing);
  importfcts.push(importOptOutSMS);

  this.setImportFunctions(importfcts);
  this.rowImportFunctions = importfcts;
  this.setValuesTransformer(config.valuesTransformer);
  this.setShouldImportCallback(config.shouldImportCallback);
};
// additionnal options, usually options coming from the garage configuration
ImporterSchema.prototype.setImportOptions = function setImportOptions(options, sharedImportFilters, columns) {
  const ignores = [];
  const ignoresCode = [];
  if (options && options.filter) {
    try {
      const f = optionsParser.parseRowsFilter(options.filter, columns);
      if (f && f.length > 0) {
        f.forEach((fct) => {
          ignores.push((row) => !fct(row)); // f() tells us if we have to keep the row, we have to negate it
          ignoresCode.push(options.filter);
        });
      }
    } catch (e) {
      console.error('Impossible to parse options.filter ', e);
    }
  }
  this.shouldIgnoreRow = (row, importId, eventsEmitter, callback) => {
    let i = 0;
    async.eachSeries(
      ignores,
      (ignore, next) => {
        try {
          if (ignore(row)) {
            callback(null, true);
            return;
          }
        } catch (e) {
          console.error(`Import filter error with: ${ignoresCode[i]}`);
        }
        i += 1;
        next();
      },
      () => {
        sharedFilters.ignoreRow(row, columns, importId, eventsEmitter).then((ignoredBySharedFilters) => {
          if (ignoredBySharedFilters) {
            callback(null, true);
            return;
          }
          callback(null, false);
        });
      }
    );
  };
};

/** load a parser from filesystem */
const _loadStaticParser = function _loadStaticParser(path, importOptions, garage, sharedImportFilters) {
  let s = null;
  try {
    s = require(rpath.join(__dirname, `import-schema/${path}`)); // eslint-disable-line global-require
  } catch (e1) {}
  if (!s) {
    try {
      s = require(rpath.join(__dirname, `import-schema/${path.toLowerCase()}`)); // eslint-disable-line global-require
    } catch (e2) {}
    if (!s) {
      return null;
    }
  }
  schema = new ImporterSchema(s.config, garage);
  // import options (given in parameters or from the garage conf in db)
  if (importOptions) {
    schema.setImportOptions(importOptions, sharedImportFilters, s.config && s.config.columns);
  }
  // methods override, mostly for legacy reasons
  if (s.override) {
    Object.keys(s.override).forEach((e) => {
      schema[e] = s.override[e].bind(schema);
    });
  }
  return schema;
};
/** load a parser from DB */
const _loadDynamicicParser = function _loadDynamicicParser(path, importOptions, garage, sharedImportFilters, callback) {
  gsParserLoader.load(path, (err, parser) => {
    if (err) {
      callback(err);
      return;
    }
    if (!parser) {
      callback(new Error('loadInstance - No parser loaded'));
      return;
    }
    schema = new ImporterSchema(parser, garage);
    // import options (given in parameters or from the garage conf in db)
    if (importOptions) {
      schema.setImportOptions(importOptions, sharedImportFilters, parser.columns);
    }
    callback(null, schema);
  });
};
/** load a new instance*/
const loadInstance = function loadInstance(path, importOptions, garageId, callback) {
  configuration.get('sharedImportFilters', (errGF, sharedImportFilters) => {
    if (errGF) {
      callback(errGF);
      return;
    }
    app.models.Garage.findById(garageId, (getByIdErr, garage) => {
      if (getByIdErr) {
        callback(getByIdErr);
        return;
      }
      let schema = _loadStaticParser(path, importOptions, garage, sharedImportFilters);
      if (schema) {
        callback(null, schema);
        return;
      }
      _loadDynamicicParser(path, importOptions, garage, sharedImportFilters, callback);
    });
  });
};

/** load a new instance*/
const loadInstanceFromJSON = function loadInstanceFromJSON(
  config,
  columns,
  vehicleMakes,
  dataTypesFormatter,
  importOptions,
  garageId,
  callback
) {
  configuration.get('sharedImportFilters', (errGF, sharedImportFilters) => {
    if (errGF) {
      callback(errGF);
      return;
    }
    gsParserLoader.loadFromJSON(config, columns, vehicleMakes, dataTypesFormatter, (err, parser) => {
      if (err) {
        callback(err);
        return;
      }
      if (!parser) {
        callback(new Error('loadInstanceFromJSON - No parser loaded'));
        return;
      }

      app.models.Garage.findById(garageId, (getByIdErr, garage) => {
        if (getByIdErr) {
          callback(getByIdErr);
          return;
        }
        const schema = new ImporterSchema(parser, garage);
        if (importOptions) {
          schema.setImportOptions(importOptions, sharedImportFilters, columns);
        }
        callback(null, schema);
      });
    });
  });
};

// options for customerName import, override if needed
ImporterSchema.prototype.nameOptions = function nameOptions() {
  const fullName = this.getCorrectedColumnFullName();
  const firstName = this.getCorrectedColumnFirstName();
  const lastName = this.getCorrectedColumnLastName();
  const transformer = this.getValuesTransformer();
  const cels = {};
  if (fullName) cels.fullName = fullName;
  if (firstName) cels.firstName = firstName;
  if (lastName) cels.lastName = lastName;
  const res = { cellLabels: cels };
  if (transformer) {
    res.transformer = transformer;
  }
  return res;
};

// options for contact (tel) import, override if needed
ImporterSchema.prototype.contactOptions = function contactOptions() {
  const homePhone = this.getCorrectedColumnHomePhone();
  const mobilePhone = this.getCorrectedColumnMobilePhone();
  const officePhone = this.getCorrectedColumnOfficePhone();
  const fax = this.getColumnFax();
  const email = this.getCorrectedColumnEmail();

  const cels = {};
  if (email) cels.email = email;
  if (homePhone) cels.homePhone = homePhone;
  if (mobilePhone) cels.mobilePhone = mobilePhone;
  if (officePhone) cels.officePhone = officePhone;
  if (fax) cels.fax = fax;

  const options = { cellLabels: cels };
  const country = this.getCountry();
  if (country) {
    options.country = country;
  }
  return options;
};

// options for email import, override if needed
ImporterSchema.prototype.emailOptions = function emailOptions() {
  const email = this.getCorrectedColumnEmail();
  const homePhone = this.getCorrectedColumnHomePhone();
  const mobilePhone = this.getCorrectedColumnMobilePhone();
  const officePhone = this.getCorrectedColumnOfficePhone();
  const fax = this.getColumnFax();

  const cels = {};
  if (email) cels.email = email;
  if (homePhone) cels.homePhone = homePhone;
  if (mobilePhone) cels.mobilePhone = mobilePhone;
  if (officePhone) cels.officePhone = officePhone;
  if (fax) cels.fax = fax;

  return { cellLabels: cels };
};

// options for end intervention date, override if needed
ImporterSchema.prototype.dataRecordCompletedAtOptions = function dataRecordCompletedAtOptions() {
  const cellLabel = this.getCorrectedColumnDataRecordCompletedAt();
  const dateFormat = this.getFormatDataRecordCompletedAt();
  const transformer = this.getValuesTransformer();
  const options = {
    timezone: this.getGarageTimezone()
  };
  if (cellLabel) options.cellLabel = cellLabel;
  if (dateFormat) options.dateFormat = dateFormat;
  // grrr i dont like that, this is javascript config not json...
  if (this.getShouldImportCallback()) {
    options.shouldImportCallback = this.getShouldImportCallback();
  }
  if (transformer) {
    options.transformer = transformer;
  }
  options.isOptional = this.getOptionalImportDate();
  return options;
};

// options for address
ImporterSchema.prototype.snailMailOptions = function snailMailOptions() {
  const streetAddress = this.getCorrectedColumnStreetAddress();
  const postCode = this.getCorrectedColumnPostCode();
  const city = this.getCorrectedColumnCity();
  const countryCode = this.getCorrectedColumnCountryCode();

  const country = this.getCountry();

  const options = {};
  if (streetAddress || postCode || city || countryCode) {
    options.cellLabels = {};
    if (streetAddress) options.cellLabels.streetAddress = streetAddress;
    if (postCode) options.cellLabels.postCode = postCode;
    if (city) options.cellLabels.city = city;
    if (countryCode) options.cellLabels.countryCode = countryCode;
  }
  if (country) {
    options.country = country;
  }

  return options;
};

// options for gender
ImporterSchema.prototype.genderOptions = function genderOptions() {
  const cellLabel = this.getCorrectedColumnGender();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

// options for billing date
ImporterSchema.prototype.billedAtOptions = function billedAtOptions() {
  const cellLabel = this.getCorrectedColumnBilledAt();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

// options for price
ImporterSchema.prototype.priceOptions = function priceOptions() {
  const cellLabel = this.getCorrectedColumnPrice();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

// options for make
ImporterSchema.prototype.vehicleMakeOptions = function vehicleMakeOptions() {
  // TODO
  // right now the code use : this.vehicleMakes=config.brands;
  // could be nice to use ImporterSchema.prototype.preprocessRow and format here

  const cellLabel = this.getCorrectedColumnVehicleMake();
  const options = {};
  if (cellLabel) {
    options.cellLabel = cellLabel;
    options.vehicleMakes = this.getFormatVehicleMake();
  }
  return options;
};
// option for model
ImporterSchema.prototype.vehicleModelOptions = function vehicleModelOptions() {
  const cellLabel = this.getCorrectedColumnVehicleModel();
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

// options for vehicle category
ImporterSchema.prototype.vehicleCategoryIdOptions = function vehicleCategoryIdOptions() {
  const cellLabel = this.getCorrectedColumnVehicleCategoryId();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};
// options for plate nb
ImporterSchema.prototype.vehicleRegistrationPlateOptions = function vehicleRegistrationPlateOptions() {
  const cellLabel = this.getCorrectedColumnVehicleRegistrationPlate();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};
// options for First Registered
ImporterSchema.prototype.vehicleRegistrationFirstRegisteredAtOptions = function vehicleRegistrationFirstRegisteredAtOptions() {
  const cellLabel = this.getCorrectedColumnVehicleRegistrationFirstRegisteredAt();
  const dateFormat = this.getFormatVehicleRegistrationFirstRegisteredAt();
  const transformer = this.getValuesTransformer();
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  if (dateFormat) options.dateFormat = dateFormat;
  if (transformer) options.transformer = transformer;
  return options;
};

// Options for vehicke mileage
ImporterSchema.prototype.vehicleMileageOptions = function vehicleMileageOptions() {
  const cellLabel = this.getCorrectedColumnVehicleMileage();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

// Options for vehicke vin
ImporterSchema.prototype.vehicleVinOptions = function vehicleVinOptions() {
  const cellLabel = this.getCorrectedColumnVehicleVin();

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

// options for the row type
ImporterSchema.prototype.rowTypeOptions = function rowTypeOptions() {
  const cellLabel = this.getCorrectedColumnRowType();
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  options.dataTypes = this.getFormatDataTypes();
  return options;
};

// those option are nto so generics...

// options used in cobredia and tomauto
ImporterSchema.prototype.foreignGarageProvidedCustomerIdOptions = function foreignGarageProvidedCustomerIdOptions() {
  const cellLabel = this.getForeignColumn('providedCustomerId');
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};
// frontdesk user name
ImporterSchema.prototype.foreignGarageProvidedFrontDeskUserNameOptions = function foreignGarageProvidedFrontDeskUserNameOptions() {
  const cellLabel = this.getForeignColumn('providedFrontDeskUserName');

  const options = {
    cache: iCache,
  };
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};
// frontdesk user team
ImporterSchema.prototype.foreignGarageProvidedFrontDeskUserTeamOptions = function foreignGarageProvidedFrontDeskUserTeamOptions() {
  const cellLabel = this.getForeignColumn('providedFrontDeskUserTeam');

  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};
// options used in cobredia
ImporterSchema.prototype.foreignGarageProvidedGarageIdOptions = function foreignGarageProvidedGarageIdOptions() {
  const cellLabel = this.getForeignColumn('providedGarageId');
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

ImporterSchema.prototype.optOutMailingOptions = function optOutMailingOptions() {
  const cellLabel = this.getColumnOptOutMailing();
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

ImporterSchema.prototype.optOutSMSOptions = function optOutSMSOptions() {
  const cellLabel = this.getColumnOptOutSMS();
  const options = {};
  if (cellLabel) options.cellLabel = cellLabel;
  return options;
};

/**
To avoid any confusion
Every properties must be setted with a setter a accessed with a getter
Code become much more verbose but we dont have any hidden parameters
and it became easier to document and test each of them
Note that you can set a properties to undefined without error, because
x={}
y = x.unknownproperty
=> no errors (y is undefined)
*/

// column to read from the file when we have a csv or an xlsx, the set take no args
ImporterSchema.prototype.autosetColumnNames = function autosetColumnNames() {
  this._columnNames = [];
  const addColumns = (property) => {
    if (typeof property === 'undefined' || property === null) return;
    else if (typeof property === 'string') this._columnNames.push(property);
    else if (Array.isArray([property])) {
      for (let i = 0; i < property.length; i++) {
        this._columnNames.push(property[i]);
      }
    }
  };
  Object.keys(this).forEach((p) => {
    if (p.indexOf('_column_') >= 0) {
      addColumns(this[p]);
    }
  });
};

ImporterSchema.prototype.getColumnNames = function getColumnNames() {
  return this._columnNames;
};
ImporterSchema.prototype.getForeignColumnNames = function getForeignColumnNames() {
  return _.values(this._foreigns_columns);
};

// Path to the records in an xml file
ImporterSchema.prototype.setXmlPath = function setXmlPath(xmlPath) {
  this._xmlPath = xmlPath;
};
ImporterSchema.prototype.getXmlPath = function getXmlPath() {
  return this._xmlPath;
};
// sheet format, csv or xlsx
ImporterSchema.prototype.setFileFormat = function setFileFormat(fileformat) {
  this._fileformat = fileformat;
};
ImporterSchema.prototype.getFileFormat = function getFileFormat() {
  return this._fileformat;
};
// in case of an xlss, we need a worksheetName
ImporterSchema.prototype.setWorksheetName = function setWorksheetName(worksheetName) {
  this._worksheetName = worksheetName;
};
ImporterSchema.prototype.getWorksheetName = function getWorksheetName() {
  return this._worksheetName;
};

// text file, charset options
ImporterSchema.prototype.setCharset = function setCharset(charset) {
  this._charset = charset;
};
ImporterSchema.prototype.getCharset = function getCharset() {
  return this._charset;
};

// text file, ignore first lines
ImporterSchema.prototype.setIgnoreFirstXLines = function setIgnoreFirstXLines(ignoreFirstXLines) {
  this._ignoreFirstXLines = ignoreFirstXLines;
};
ImporterSchema.prototype.getIgnoreFirstXLines = function getIgnoreFirstXLines() {
  return this._ignoreFirstXLines;
};
// a list of file content transformers (note in a json transformers is an object we convert it in array in loader.js)
ImporterSchema.prototype.setContentTransformers = function setContentTransformers(transformers) {
  this._contentTransformers = transformers;
};

// country, used for the adress and the phone number
ImporterSchema.prototype.setCountry = function setCountry(country) {
  this._country = country;
};
ImporterSchema.prototype.getCountry = function getCountry() {
  return this._country;
};

/** list of columns by config
sometimes a a column can have multiple names,
use getColumnXXX to get every names of the column
and getCorrectedColumnXXX to get the corrected name found after parsing the file
*/

// column for fullName
ImporterSchema.prototype.setColumnFullName = function setColumnFullName(fullName) {
  this._column_fullName = fullName;
};
ImporterSchema.prototype.getColumnFullName = function getColumnFullName() {
  return this._column_fullName;
};

ImporterSchema.prototype.setOptionalImportDate = function setOptionalImportDate(isOptional) {
  this._optional_date = isOptional;
};
// optional maintenance date
ImporterSchema.prototype.getOptionalImportDate = function getOptionalImportDate() {
  return this._optional_date;
};

ImporterSchema.prototype.getCorrectedColumnFullName = function getCorrectedColumnFullName() {
  return this._corrected_column_fullName;
};
// column for firstName
ImporterSchema.prototype.setColumnFirstName = function setColumnFirstName(firstName) {
  this._column_firstName = firstName;
};
ImporterSchema.prototype.getColumnFirstName = function getColumnFirstName() {
  return this._column_firstName;
};
ImporterSchema.prototype.getCorrectedColumnFirstName = function getCorrectedColumnFirstName() {
  return this._corrected_column_firstName;
};
// column for _lastName
ImporterSchema.prototype.setColumnLastName = function setColumnLastName(lastName) {
  this._column_lastName = lastName;
};
ImporterSchema.prototype.getColumnLastName = function getColumnLastName() {
  return this._column_lastName;
};
ImporterSchema.prototype.getCorrectedColumnLastName = function getCorrectedColumnLastName() {
  return this._corrected_column_lastName;
};
// column for _homePhone
ImporterSchema.prototype.setColumnHomePhone = function setColumnHomePhone(homePhone) {
  this._column_homePhone = homePhone;
};
ImporterSchema.prototype.getColumnHomePhone = function getColumnHomePhone() {
  return this._column_homePhone;
};
ImporterSchema.prototype.getCorrectedColumnHomePhone = function getCorrectedColumnHomePhone() {
  return this._corrected_column_homePhone;
};
// column for mobilePhone
ImporterSchema.prototype.setColumnMobilePhone = function setColumnMobilePhone(mobilePhone) {
  this._column_mobilePhone = mobilePhone;
};
ImporterSchema.prototype.getColumnMobilePhone = function getColumnMobilePhone() {
  return this._column_mobilePhone;
};
ImporterSchema.prototype.getCorrectedColumnMobilePhone = function getCorrectedColumnMobilePhone() {
  return this._corrected_column_mobilePhone;
};
// column for officePhone
ImporterSchema.prototype.setColumnOfficePhone = function setColumnOfficePhone(officePhone) {
  this._column_officePhone = officePhone;
};
ImporterSchema.prototype.getColumnOfficePhone = function getColumnOfficePhone() {
  return this._column_officePhone;
};
ImporterSchema.prototype.getCorrectedColumnOfficePhone = function getCorrectedColumnOfficePhone() {
  return this._corrected_column_officePhone;
};
// column for fax
ImporterSchema.prototype.setColumnFax = function setColumnFax(fax) {
  this._column_fax = fax;
};
ImporterSchema.prototype.getColumnFax = function getColumnFax() {
  return this._column_fax;
};
ImporterSchema.prototype.getCorrectedColumnFax = function getCorrectedColumnFax() {
  return this._corrected_column_fax;
};
// column for email
ImporterSchema.prototype.setColumnEmail = function setColumnEmail(email) {
  this._column_email = email;
};
ImporterSchema.prototype.getColumnEmail = function getColumnEmail() {
  return this._column_email;
};
ImporterSchema.prototype.getCorrectedColumnEmail = function getCorrectedColumnEmail() {
  return this._corrected_column_email;
};
// column for dataRecordCompletedAt
ImporterSchema.prototype.setColumnDataRecordCompletedAt = function setColumnDataRecordCompletedAt(
  dataRecordCompletedAt
) {
  this._column_dataRecordCompletedAt = dataRecordCompletedAt;
};
ImporterSchema.prototype.getColumnDataRecordCompletedAt = function getColumnDataRecordCompletedAt() {
  return this._column_dataRecordCompletedAt;
};
ImporterSchema.prototype.getCorrectedColumnDataRecordCompletedAt = function getCorrectedColumnDataRecordCompletedAt() {
  return this._corrected_column_dataRecordCompletedAt;
};

ImporterSchema.prototype.setColumnStreetAddress = function setColumnStreetAddress(streetAddress) {
  this._column_streetAddress = streetAddress;
};
ImporterSchema.prototype.getColumnStreetAddress = function getColumnStreetAddress() {
  return this._column_streetAddress;
};
ImporterSchema.prototype.getCorrectedColumnStreetAddress = function getCorrectedColumnStreetAddress() {
  return this._corrected_column_streetAddress;
};

ImporterSchema.prototype.setColumnPostCode = function setColumnPostCode(postCode) {
  this._column_postCode = postCode;
};
ImporterSchema.prototype.getColumnPostCode = function getColumnPostCode() {
  return this._column_postCode;
};
ImporterSchema.prototype.getCorrectedColumnPostCode = function getCorrectedColumnPostCode() {
  return this._corrected_column_postCode;
};

ImporterSchema.prototype.setColumnCity = function setColumnCity(city) {
  this._column_city = city;
};
ImporterSchema.prototype.getColumnCity = function getColumnCity() {
  return this._column_city;
};
ImporterSchema.prototype.getCorrectedColumnCity = function getCorrectedColumnCity() {
  return this._corrected_column_city;
};

ImporterSchema.prototype.setColumnCountryCode = function setColumnCountryCode(countryCode) {
  this._column_countryCode = countryCode;
};
ImporterSchema.prototype.getColumnCountryCode = function getColumnCountryCode() {
  return this._column_countryCode;
};
ImporterSchema.prototype.getCorrectedColumnCountryCode = function getCorrectedColumnCountryCode() {
  return this._corrected_column_xxx;
};

ImporterSchema.prototype.setColumnGender = function setColumnGender(gender) {
  this._column_gender = gender;
};
ImporterSchema.prototype.getColumnGender = function getColumnGender() {
  return this._column_gender;
};
ImporterSchema.prototype.getCorrectedColumnGender = function getCorrectedColumnGender() {
  return this._corrected_column_gender;
};

ImporterSchema.prototype.setColumnBilledAt = function setColumnBilledAt(billedAt) {
  this._column_billedAt = billedAt;
};
ImporterSchema.prototype.getColumnBilledAt = function getColumnBilledAt() {
  return this._column_billedAt;
};
ImporterSchema.prototype.getCorrectedColumnBilledAt = function getCorrectedColumnBilledAt() {
  return this._corrected_column_billedAt;
};

ImporterSchema.prototype.setColumnPrice = function setColumnPrice(price) {
  this._column_price = price;
};
ImporterSchema.prototype.getColumnPrice = function getColumnPrice() {
  return this._column_price;
};
ImporterSchema.prototype.getCorrectedColumnPrice = function getCorrectedColumnPrice() {
  return this._corrected_column_price;
};

ImporterSchema.prototype.setColumnVehicleMake = function setColumnVehicleMake(vehicleMake) {
  this._column_vehicleMake = vehicleMake;
};
ImporterSchema.prototype.getColumnVehicleMake = function getColumnVehicleMake() {
  return this._column_vehicleMake;
};
ImporterSchema.prototype.getCorrectedColumnVehicleMake = function getCorrectedColumnVehicleMake() {
  return this._corrected_column_vehicleMake;
};

ImporterSchema.prototype.setColumnVehicleModel = function setColumnVehicleModel(vehicleModel) {
  this._column_vehicleModel = vehicleModel;
};
ImporterSchema.prototype.getColumnVehicleModel = function getColumnVehicleModel() {
  return this._column_vehicleModel;
};
ImporterSchema.prototype.getCorrectedColumnVehicleModel = function getCorrectedColumnVehicleModel() {
  return this._corrected_column_vehicleModel;
};

ImporterSchema.prototype.setColumnVehicleCategoryId = function setColumnVehicleCategoryId(vehicleCategoryId) {
  this._column_vehicleCategoryId = vehicleCategoryId;
};
ImporterSchema.prototype.getColumnVehicleCategoryId = function getColumnVehicleCategoryId() {
  return this._column_vehicleCategoryId;
};
ImporterSchema.prototype.getCorrectedColumnVehicleCategoryId = function getCorrectedColumnVehicleCategoryId() {
  return this._corrected_column_vehicleCategoryId;
};

ImporterSchema.prototype.setColumnVehicleRegistrationPlate = function setColumnVehicleRegistrationPlate(
  vehicleRegistrationPlate
) {
  this._column_vehicleRegistrationPlate = vehicleRegistrationPlate;
};
ImporterSchema.prototype.getColumnVehicleRegistrationPlate = function getColumnVehicleRegistrationPlate() {
  return this._column_vehicleRegistrationPlate;
};
ImporterSchema.prototype.getCorrectedColumnVehicleRegistrationPlate = function getCorrectedColumnVehicleRegistrationPlate() {
  return this._corrected_column_vehicleRegistrationPlate;
};

ImporterSchema.prototype.setColumnVehicleRegistrationFirstRegisteredAt = function setColumnVehicleRegistrationFirstRegisteredAt(
  vehicleRegistrationFirstRegisteredAt
) {
  this._column_vehicleRegistrationFirstRegisteredAt = vehicleRegistrationFirstRegisteredAt;
};
ImporterSchema.prototype.getColumnVehicleRegistrationFirstRegisteredAt = function getColumnVehicleRegistrationFirstRegisteredAt() {
  return this._column_vehicleRegistrationFirstRegisteredAt;
};
ImporterSchema.prototype.getCorrectedColumnVehicleRegistrationFirstRegisteredAt = function getCorrectedColumnVehicleRegistrationFirstRegisteredAt() {
  return this._corrected_column_vehicleRegistrationFirstRegisteredAt;
};

ImporterSchema.prototype.setColumnVehicleMileage = function setColumnVehicleMileage(vehicleMileage) {
  this._column_vehicleMileage = vehicleMileage;
};
ImporterSchema.prototype.getColumnVehicleMileage = function getColumnVehicleMileage() {
  return this._column_vehicleMileage;
};
ImporterSchema.prototype.getCorrectedColumnVehicleMileage = function getCorrectedColumnVehicleMileage() {
  return this._corrected_column_vehicleMileage;
};

ImporterSchema.prototype.setColumnVehicleVin = function setColumnVehicleVin(vehicleVin) {
  this._column_vehicleVin = vehicleVin;
};
ImporterSchema.prototype.getColumnVehicleVin = function getColumnVehicleVin() {
  return this._column_vehicleVin;
};
ImporterSchema.prototype.getCorrectedColumnVehicleVin = function getCorrectedColumnVehicleVin() {
  return this._corrected_column_vehicleVin;
};

ImporterSchema.prototype.setColumnRowType = function setColumnRowType(rowType) {
  this._column_rowType = rowType;
};
ImporterSchema.prototype.getColumnRowType = function getColumnRowType() {
  return this._column_rowType;
};
ImporterSchema.prototype.getCorrectedColumnRowType = function getCorrectedColumnRowType() {
  return this._corrected_column_rowType;
};

ImporterSchema.prototype.setForeignColumns = function setForeignColumns(foreigns) {
  this._foreigns_columns = foreigns;
};
ImporterSchema.prototype.getForeignColumn = function getForeignColumn(foreignColumn) {
  if (this._foreigns_columns) {
    return this._foreigns_columns[foreignColumn];
  }
  return null;
};

ImporterSchema.prototype.setColumnOptOutMailing = function setColumnOptOutMailing(optOutMailing) {
  this._column_optOutMailing = optOutMailing;
};

ImporterSchema.prototype.getColumnOptOutMailing = function getColumnOptOutMailing() {
  return this._column_optOutMailing;
};

ImporterSchema.prototype.setColumnOptOutSMS = function setColumnOptOutSMS(optOutSMS) {
  this._column_optOutSMS = optOutSMS;
};

ImporterSchema.prototype.getColumnOptOutSMS = function getColumnOptOutSMS() {
  return this._column_optOutSMS;
};
/** formats */

ImporterSchema.prototype.setFormatDataRecordCompletedAt = function setFormatDataRecordCompletedAt(
  formatDataRecordCompletedAt
) {
  this._format_dataRecordCompletedAt = formatDataRecordCompletedAt;
};
ImporterSchema.prototype.getFormatDataRecordCompletedAt = function getFormatDataRecordCompletedAt() {
  return this._format_dataRecordCompletedAt;
};

ImporterSchema.prototype.setGarageTimezone = function setGarageTimezone(
  garageTimezone
) {
  this.garageTimezone = garageTimezone;
};
ImporterSchema.prototype.getGarageTimezone = function getGarageTimezone() {
  return this.garageTimezone;
};

ImporterSchema.prototype.setFormatVehicleRegistrationFirstRegisteredAt = function setFormatVehicleRegistrationFirstRegisteredAt(
  formatVehicleRegistrationFirstRegisteredAt
) {
  this._format_vehicleRegistrationFirstRegisteredAt = formatVehicleRegistrationFirstRegisteredAt;
};
ImporterSchema.prototype.getFormatVehicleRegistrationFirstRegisteredAt = function getFormatVehicleRegistrationFirstRegisteredAt() {
  return this._format_vehicleRegistrationFirstRegisteredAt;
};

ImporterSchema.prototype.setFormatVehicleMake = function setFormatVehicleMake(formatVehicleMake) {
  this._format_vehicleMake = formatVehicleMake;
};
ImporterSchema.prototype.getFormatVehicleMake = function getFormatVehicleMake() {
  return this._format_vehicleMake;
};

ImporterSchema.prototype.setFormatDataTypes = function setFormatDataTypes(parsingDataTypes) {
  this._format_dataTypes = parsingDataTypes;
};
ImporterSchema.prototype.getFormatDataTypes = function getFormatDataTypes() {
  return this._format_dataTypes;
};

// function transforming columns values
ImporterSchema.prototype.setValuesTransformer = function setValuesTransformer(valuesTransformer) {
  this._valuesTransformer =
    valuesTransformer ||
    function transFunc(column, value) {
      return value;
    };
};
ImporterSchema.prototype.getValuesTransformer = function getValuesTransformer() {
  return this._valuesTransformer;
};

// ignore rows (set maintenancedate === 0)
ImporterSchema.prototype.setShouldImportCallback = function setShouldImportCallback(shouldImportCallback) {
  this._shouldImportCallback = shouldImportCallback;
};
ImporterSchema.prototype.getShouldImportCallback = function getShouldImportCallback() {
  return this._shouldImportCallback;
};

// a list of functions we will apply to each line and
// that help us contruct a dataRecord instance from a row
// they all have the same signature xxxx(dataRecord, rowIndex, rowCells, callback)
ImporterSchema.prototype.setImportFunctions = function setImportFunctions(importFunctions) {
  this._importFunctions = importFunctions;
};
ImporterSchema.prototype.getImportFunctions = function getImportFunctions() {
  return this._importFunctions;
};

// correct labels whena we had many columns names for the same property
ImporterSchema.prototype.correctLabels = function correctLabels(rows) {
  if (!rows) return;
  const labelsfoundO = {};
  let i;
  for (i = 0; i < rows.length; i++) {
    _.each(rows[i], (v, p) => {
      labelsfoundO[p] = p;
    });
  }
  const labelsfound = _.keys(labelsfoundO);
  _.each(this, (v, p) => {
    if (p.indexOf('_column_') >= 0) {
      const correctProperty = p.replace(/^_column_/, '_corrected_column_');
      let correctValue = null;
      if (typeof this[p] === 'string' && typeof this[p] !== 'undefined') {
        correctValue = this[p];
      } else if (Array.isArray(this[p])) {
        // set as correct the name
        const labels = this[p].slice();

        for (i = labels.length - 1; i >= 0; i--) {
          if (labelsfound.indexOf(labels[i]) < 0) {
            labels.splice(i, 1);
          }
        }
        if (labels.length > 0) {
          correctValue = labels.length === 1 ? labels[0] : labels;
        }
      }
      if (correctValue !== null) {
        this[correctProperty] = correctValue;
      }
    }
  });
};

// ignore some rows
ImporterSchema.prototype.removeRows = function removeRows(rows, eventsEmitter, callback) {
  if (!this.shouldIgnoreRow) {
    callback(null, rows);
    return;
  }
  const cleaned = [];
  const importId = Math.random(); // an unique identifier helping us speeding computation in the next loops
  // async processes, not so readable but better for the event loop
  async.each(
    rows,
    (row, next) => {
      this.shouldIgnoreRow(row, importId, eventsEmitter, (e, ignore) => {
        if (!ignore) {
          cleaned.push(row);
        }
        next();
      });
    },
    (e) => {
      callback(e, cleaned);
    }
  );
};

// clean our rows
ImporterSchema.prototype.preprocessRow = function preprocessRow(row) {
  // remove undefined properties
  return _.omitBy(row, _.isUndefined);
};

// compile optional options for csv
ImporterSchema.prototype.getCSVOptions = function getCSVOptions() {
  const options = {};
  if (this.getCharset()) {
    options.charset = this.getCharset();
  }
  if (this.getIgnoreFirstXLines()) {
    options.ignoreFirstXLines = this.getIgnoreFirstXLines();
  }
  if (this.getIgnoreFirstXLines()) {
    options.ignoreFirstXLines = this.getIgnoreFirstXLines();
  }
  options.isHeaderlessCsv = false;
  if (this._contentTransformers && Array.isArray(this._contentTransformers) && this._contentTransformers.length > 0) {
    options.isHeaderlessCsv = this._contentTransformers.map((t) => t.name).indexOf('headerless-csv') >= 0;
  }
  return options;
};
// compile optional options for xml
ImporterSchema.prototype.getXMLOptions = function getXMLOptions() {
  const options = {};
  if (this.getCharset()) {
    options.charset = this.getCharset();
  }
  if (this.getIgnoreFirstXLines()) {
    options.ignoreFirstXLines = this.getIgnoreFirstXLines();
  }
  return options;
};
// transform a file content before parsing it
ImporterSchema.prototype.getContentTransformerFct = function getContentTransformerFct(dataFileType) {
  if (this._contentTransformers && Array.isArray(this._contentTransformers) && this._contentTransformers.length > 0) {
    const tr = this._contentTransformers;
    return (string) => {
      let b = string;
      for (let f = 0; f < tr.length; f++) {
        const t = tr[f];
        b = contentTransformers.transform(t.name, t.options, b, dataFileType);
      }
      return b;
    };
  }
  return (string) => string;
};
// remove duplicates
ImporterSchema.prototype.removeDuplicates = removeDuplicates;

/** empty dataRecord to be parsed */
ImporterSchema.prototype.emptyDataRecord = function emptyDataRecord() {
  const dataRecord = {};
  dataRecord.importStats = {};
  dataRecord.importStats.dataPresence = {};
  dataRecord.importStats.dataValidity = {};
  dataRecord.importStats.dataFixes = {};
  dataRecord.importStats.dataNC = {};
  return dataRecord;
};

/** parse one row */
ImporterSchema.prototype.parseRow = function parseRow(rowCells, rowIndex, cleanDots) {
  if (cleanDots) {
    Object.keys(rowCells).forEach((p) => {
      if (p.indexOf('．') >= 0) {
        rowCells[p.replace(/．/g, '.')] = rowCells[p]; // eslint-disable-line no-param-reassign
        delete rowCells[p]; // eslint-disable-line no-param-reassign
      }
    });
  }
  this.correctLabels([rowCells]);
  const importF = (_dataRecord, _rowIndex, _cells, _rowImportFunction) =>
    _rowImportFunction.call(null, _dataRecord, _rowIndex, _cells);
  const dataRecord = this.emptyDataRecord();
  this.getImportFunctions().map(importF.bind(this, dataRecord, rowIndex, rowCells));
  return dataRecord;
};

/*
callback({iterator,nbDuplicates,columnLabels})
iterator' is not an es6 iterator but simply an object with a next method
at each call, we return an object {value:current_dataRecord, done:if the iterator doesnt have any more rows}
it also has a function hasNext() to use like
while(iterator.hasNext()) {
  const dataRecord = iterator.next().value;
}
*/
ImporterSchema.prototype.parseFileBuffer = function parseFileBuffer(
  dataFileFilePath,
  dataFileFileBuffer,
  dataFileType,
  eventsEmitter,
  callback
) {
  const deferred = Q.defer();
  const _dataRecordTypes = {};
  _dataRecordTypes[gsDataFileDataType.MAINTENANCES] = dataTypes.MAINTENANCE;
  _dataRecordTypes[gsDataFileDataType.VEHICLE_SALES] = dataTypes.VEHICLE_SALE;
  _dataRecordTypes[gsDataFileDataType.NEW_VEHICLE_SALES] = dataTypes.NEW_VEHICLE_SALE;
  _dataRecordTypes[gsDataFileDataType.USED_VEHICLE_SALES] = dataTypes.USED_VEHICLE_SALE;
  _dataRecordTypes[gsDataFileDataType.VEHICLE_INSPECTIONS] = dataTypes.VEHICLE_INSPECTION;
  _dataRecordTypes[gsDataFileDataType.MIXED] = dataTypes.UNKNOWN;
  // transform the content of a file
  const contentTransformer = this.getContentTransformerFct(dataFileType);
  // after reading, we need to clean and organize the rows
  const preprocess = function preprocess(promise, err, rows, columnLabels) {
    this.correctLabels(rows);
    if (err) {
      promise.reject(err);
      return;
    }
    this.removeRows(rows, eventsEmitter, (errRemove, cleanedRows) => {
      if (errRemove) {
        promise.reject(errRemove);
        return;
      }
      const processedRows = cleanedRows.map(this.preprocessRow);
      const newrows = [];
      let hasType = false;
      const importFunctions = this.getImportFunctions();
      const parseRow = async (cells, rowIndex, next) => {
        const dataRecord = this.emptyDataRecord();
        if (_dataRecordTypes[dataFileType]) {
          dataRecord.type = _dataRecordTypes[dataFileType];
        } else {
          dataRecord.type = dataTypes.UNKNOWN;
        }
        for (let f = 0; f < importFunctions.length; f++) {
          try {
            await promisify(importFunctions[f])(dataRecord, rowIndex, cells);
          } catch (e) {
            // Some cells are optional, errors will appear here often, nothing to be done.
            if (e === 'FATAL') {
              console.error('BAZOOKA'); // For ESLINT purposes
            }
          }
        }
        newrows.push(dataRecord);
        // Reverting data type to UNKNOWN if VehicleSale, we only need it during import
        if (dataRecord.type === 'VehicleSale') {
          dataRecord.type = dataTypes.UNKNOWN;
        }
        if (!hasType && dataRecord.type) {
          hasType = true;
        }
        next();
      };
      // use async to not block the event queue
      async.forEachOfSeries(processedRows, parseRow, () => {
        let nbDuplicates = newrows.length;
        let types = null;
        if (hasType) {
          types = [
            null,
            dataTypes.MAINTENANCE,
            dataTypes.NEW_VEHICLE_SALE,
            dataTypes.USED_VEHICLE_SALE,
            dataTypes.VEHICLE_INSPECTION,
          ];
        }
        this.removeDuplicates(newrows, types, () => {
          nbDuplicates -= newrows.length;
          const dataRecords = [];
          newrows.forEach((record, index) => {
            dataRecords.push({ value: record, done: index === processedRows.length - 1 });
          });
          const iterator = {
            i: 0,
            dataRecords,
            hasNext: function hasNext() {
              return this.i < this.dataRecords.length;
            },
            next: function next() {
              return this.dataRecords[this.i++];
            },
          };
          promise.resolve({ iterator, nbDuplicates, columnLabels });
        });
      });
    });
  }.bind(this, deferred);

  const readXlsX = (columnNames, worksheetName) => {
    gsDataFileUtil.readDataFileRowsFromXlsxFileBuffer(dataFileFileBuffer, worksheetName, columnNames, preprocess);
  };
  const readXml = (columnNames, xmlPath, xmlOptions) => {
    gsDataFileUtil.readDataFileRowsFromXmlFileBuffer(
      dataFileFileBuffer,
      columnNames,
      xmlPath,
      xmlOptions,
      contentTransformer,
      preprocess
    );
  };
  const readCsv = (columnNames, csvOptions) => {
    gsDataFileUtil.readDataFileRowsFromCsvFileBuffer(
      dataFileFileBuffer,
      columnNames,
      csvOptions,
      contentTransformer,
      preprocess
    );
  };
  const readJson = () => {
    gsDataFileUtil.readDataFileRowsFromJSONFileBuffer(
      dataFileFileBuffer,
      preprocess,
    );
  };
  const extension = dataFileFilePath.split('.').pop();
  const variable = this.getFileFormat() === 'variable';
  if (this.getFileFormat() === 'xlsx' || (variable && extension === 'xlsx') || (variable && extension === 'xls')) {
    readXlsX(this.getColumnNames(), this.getWorksheetName());
  } else if (this.getFileFormat() === 'xml' || (variable && extension === 'xml')) {
    readXml(this.getColumnNames(), this.getXmlPath(), this.getXMLOptions());
  } else if (this.getFileFormat() === 'csv' || (variable && extension === 'csv')) {
    readCsv(this.getColumnNames(), this.getCSVOptions());
  } else if (this.getFileFormat() === 'json' || (variable && extension === 'json')) {
    readJson(this.getColumnNames(), this.getCSVOptions());
  } else {
    readCsv(this.getColumnNames(), this.getCSVOptions());
  }
  return deferred.promise.nodeify(callback);
};

module.exports = {
  ImporterSchema,
  loadInstance,
  loadInstanceFromJSON,
};
