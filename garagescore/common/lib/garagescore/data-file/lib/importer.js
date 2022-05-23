const debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer'); // eslint-disable-line max-len,no-unused-vars
const config = require('config');
const _ = require('underscore');
const AWS = require('aws-sdk');
const util = require('util');
const fs = require('fs');
const { JobTypes } = require('../../../../../frontend/utils/enumV2');
const DataFileStatus = require('../../../../models/data-file.status.js');
const SourceTypes = require('../../../../models/data/type/source-types');
const dataTypes = require('../../../../models/data/type/data-types');
const GarageTypes = require('../../../../models/garage.type.js');
const Scheduler = require('../../scheduler/scheduler.js');
const importerSchema = require('../importer-schema');
const promises = require('../../../util/promises');
const gsDataFileUtil = require('../util');
const EventsEmitter = require('../../monitoring/internal-events/events-emitter');
const moment = require('moment');
require('moment-timezone');

/** download the import file from the file system*/

const _downloadFromFileSystem = (filePath, callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(err, data, {});
    }
  });
};

/** download the import file from the bucket dmsupload in s3*/
const _downloadFromS3 = (filePath, callback) => {
  AWS.config.region = config.get('dmsupload.awsS3BucketRegion');
  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('dmsupload.awsS3BucketName'),
    },
  });
  const params = {
    Key: filePath,
  };
  awsS3Bucket.getObject(params, (getErr, data) => {
    if (getErr) {
      console.error(`Error donwloading from S3: ${filePath}`, getErr);
      callback(getErr);
      return;
    }
    callback(null, data.Body, data.Metadata);
    return;
  });
};

/** download the import file from the bucket humanupload in s3*/
const _downloadFromHumanS3 = (filePath, callback) => {
  AWS.config.region = config.get('humanupload.awsS3BucketRegion');
  const awsS3Bucket = new AWS.S3({
    params: {
      Bucket: config.get('humanupload.awsS3BucketName'),
    },
  });
  const params = {
    Key: filePath,
  };
  awsS3Bucket.getObject(params, (getErr, data) => {
    if (getErr) {
      console.error(`Error donwloading from S3: ${filePath}`, getErr);
      callback(getErr);
      return;
    }
    callback(null, data.Body, data.Metadata);
    return;
  });
};

const _downloadFromAutomaticBillingS3 = (filePath, callback) => {
  AWS.config.region = 'eu-central-1';
  const awsS3Bucket = new AWS.S3({ params: { Bucket: 'facturation-automatique' } });
  const params = { Key: filePath };
  awsS3Bucket.getObject(params, (getErr, data) => {
    if (getErr) {
      console.error(`Error donwloading from S3: ${filePath}`, getErr);
      callback(getErr);
      return;
    }
    callback(null, data.Body, data.Metadata);
    return;
  });
};
/*
 * Load DataRecord Sheet File, calling callback(null, fileBuffer, fileMetadata)
 * Dropbox is currently the only officialy supported file store
 * return a promise
 */

async function loadFileFromFileStore(filePath, fileStore) {
  if (typeof filePath === 'undefined') {
    throw new Error('Undefined filePath');
  }

  if (fileStore === 'filesystem') {
    // just for test purpose
    return new Promise((resolve, reject) => {
      _downloadFromFileSystem(filePath, (e, fileBufffer) => {
        if (e) {
          reject(e);
        } else {
          const res = {
            fileBuffer: fileBufffer,
            fileMetadata: {},
          };
          resolve(res);
        }
      });
    });
  }

  if (fileStore === 'S3') {
    // just for test purpose
    return new Promise((resolve, reject) => {
      _downloadFromS3(filePath, (e, fileBufffer) => {
        if (e) {
          reject(e);
        } else {
          const res = {
            fileBuffer: fileBufffer,
            fileMetadata: {},
          };
          resolve(res);
        }
      });
    });
  }
  if (fileStore === 'humanupload') {
    // just for test purpose
    return new Promise((resolve, reject) => {
      _downloadFromHumanS3(filePath, (e, fileBufffer) => {
        if (e) {
          reject(e);
        } else {
          const res = {
            fileBuffer: fileBufffer,
            fileMetadata: {},
          };
          resolve(res);
        }
      });
    });
  }
  if (fileStore === 'facturation-automatique') {
    return new Promise((resolve, reject) => {
      _downloadFromAutomaticBillingS3(filePath, (e, fileBufffer) => {
        if (e) {
          reject(e);
        } else {
          const res = {
            fileBuffer: fileBufffer,
            fileMetadata: {},
          };
          resolve(res);
        }
      });
    });
  }
  throw new Error('Unknown fileStore');
}

/** parse a filebuffer and calls back an iterator*/
function parseFileBuffer(
  filePath,
  fileBuffer,
  importSchemaName,
  importOptions,
  dataType,
  garageId,
  eventsEmitterContext,
  callback
) {
  const importSchemaModulePath = `./import-schema/${importSchemaName}`;
  importerSchema.loadInstance(importSchemaName, importOptions, garageId, (e, importSchema) => {
    if (e) {
      callback(e);
      return;
    }
    if (!importSchema) {
      callback(new Error(`Schema [${importSchemaModulePath}] not found`));
      return;
    }
    if (!importSchema.parseFileBuffer) {
      callback(new Error(`Schema [${importSchemaModulePath}] too old, please use a newer schema`));
      return;
    }
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);
    importSchema.parseFileBuffer(filePath, fileBuffer, dataType, eventsEmitter, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, res.iterator, res.nbDuplicates, res.columnLabels);
    });
  });
}
/** parse a filebuffer and calls back an iterator*/
function parseFileBufferFromJSONParser(
  filePath,
  fileBuffer,
  parserConfig,
  columns,
  vehicleMakes,
  dataTypesFormatter,
  importOptions,
  dataType,
  garageId,
  eventsEmitterContext,
  callback
) {
  importerSchema.loadInstanceFromJSON(
    parserConfig,
    columns,
    vehicleMakes,
    dataTypesFormatter,
    importOptions,
    garageId,
    (e, importSchema) => {
      if (e) {
        callback(e);
        return;
      }
      if (!importSchema) {
        callback(new Error('parseFileBufferFromJSONParser error, schema not loaded'));
        return;
      }
      const eventsEmitter = new EventsEmitter(eventsEmitterContext);
      importSchema.parseFileBuffer(filePath, fileBuffer, dataType, eventsEmitter, (err, res) => {
        if (err) {
          callback(err);
          return;
        }
        callback(null, res.iterator, res.nbDuplicates, res.columnLabels);
      });
    }
  );
}

/* compute validation stats*/
const __computeValidationStats = (callback) => (err, iterator, nbDuplicates, columnLabels) => {
  if (err) {
    console.error(err);
    callback(err);
    return;
  }
  const globalStats = {
    withEmails: 0,
    withMobile: 0,
    withContactChannel: 0,
    withServiceProvidedAt: 0,
    withVehicleMake: 0,
    withVehicleModel: 0,
    withVehicleVIN: 0,
    withName: 0,
    withCity: 0,
    withPrice: 0,
    withOptOutMailing: 0,
    withOptOutSMS: 0,
    minServiceProvidedAt: new Date(8640000000000000),
    maxServiceProvidedAt: new Date(-8640000000000000),
    nbDuplicates,
    unknownVehicleMakes: {},
    sample: [],
    perType: {},
    columnLabels,
  };
  for (let i = 0; i < dataTypes.values().length; i++) {
    globalStats.perType[dataTypes.values()[i]] = 0;
  }
  let nb = 0;
  while (iterator.hasNext()) {
    const dataRecord = iterator.next().value;
    if (globalStats.sample.length < 20) {
      const copy = Object.assign({}, dataRecord);
      delete copy.importStats;
      if (copy.completedAt) {
        copy.completedAt = moment.tz(copy.completedAt, 'Europe/Paris').format('DD/MM/YYYY HH:mm:ss');
      }
      if (copy.vehicle && copy.vehicle.registration && copy.vehicle.registration.firstRegisteredAt) {
        copy.vehicle.registration.firstRegisteredAt = moment
          .tz(copy.vehicle.registration.firstRegisteredAt, 'Europe/Paris')
          .format('DD/MM/YYYY HH:mm:ss');
      }
      globalStats.sample.push(copy);
    }
    if (globalStats.perType[dataRecord.type]) {
      globalStats.perType[dataRecord.type]++;
    } else {
      globalStats.perType[dataRecord.type] = 1;
    }
    if (dataRecord.importStats.dataValidity.vehicle && dataRecord.importStats.dataValidity.vehicle.make) {
      globalStats.withVehicleMake++;
    }
    if (dataRecord.vehicle && dataRecord.vehicle.unknownMake) {
      globalStats.unknownVehicleMakes[dataRecord.vehicle.unknownMake] = dataRecord.vehicle.unknownMake;
    }
    if (dataRecord.importStats.dataValidity.vehicle && dataRecord.importStats.dataValidity.vehicle.model) {
      globalStats.withVehicleModel++;
    }
    if (dataRecord.vehicle && dataRecord.vehicle.vin) {
      globalStats.withVehicleVIN++;
    }
    if (dataRecord.importStats.dataValidity.completedAt) {
      globalStats.withServiceProvidedAt++;
    }
    if (
      dataRecord.importStats.dataValidity.customer &&
      dataRecord.importStats.dataValidity.customer.contactChannel &&
      dataRecord.importStats.dataValidity.customer.contactChannel.email
    ) {
      globalStats.withEmails++;
    }
    if (dataRecord.importStats.dataValidity.customer && dataRecord.importStats.dataValidity.customer.fullName) {
      globalStats.withName++;
    } else if (
      dataRecord.importStats.dataValidity.customer &&
      dataRecord.importStats.dataValidity.customer.firstName &&
      dataRecord.importStats.dataValidity.customer.lastName
    ) {
      globalStats.withName++;
    }
    if (
      dataRecord.importStats.dataValidity.customer &&
      dataRecord.importStats.dataValidity.customer.contactChannel &&
      dataRecord.importStats.dataValidity.customer.contactChannel.snailMail &&
      dataRecord.importStats.dataValidity.customer.contactChannel.snailMail.city
    ) {
      globalStats.withCity++;
    }
    if (
      dataRecord.importStats.dataValidity.customer &&
      dataRecord.importStats.dataValidity.customer.contactChannel &&
      dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone
    ) {
      globalStats.withMobile++;
    }
    if (
      (dataRecord.importStats.dataValidity.customer &&
        dataRecord.importStats.dataValidity.customer.contactChannel &&
        dataRecord.importStats.dataValidity.customer.contactChannel.email) ||
      (dataRecord.importStats.dataValidity.customer &&
        dataRecord.importStats.dataValidity.customer.contactChannel &&
        dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone)
    ) {
      globalStats.withContactChannel++;
    } else if (
      (dataRecord.importStats.dataNC.customer &&
        dataRecord.importStats.dataNC.customer.contactChannel &&
        dataRecord.importStats.dataNC.customer.contactChannel.email) ||
      (dataRecord.importStats.dataNC.customer &&
        dataRecord.importStats.dataNC.customer.contactChannel &&
        dataRecord.importStats.dataNC.customer.contactChannel.mobilePhone)
    ) {
      globalStats.withContactChannel++;
    }
    if (dataRecord.importStats.dataValidity.price) {
      globalStats.withPrice++;
    }
    if (dataRecord.importStats.dataPresence.customer.optOutMailing) {
      globalStats.withOptOutMailing++;
    }
    if (dataRecord.importStats.dataPresence.customer.optOutSMS) {
      globalStats.withOptOutSMS++;
    }
    const time = dataRecord.completedAt ? dataRecord.completedAt : new Date(0);
    if (time.getTime() > globalStats.maxServiceProvidedAt.getTime()) {
      globalStats.maxServiceProvidedAt = time;
    } else if (time.getTime() < globalStats.minServiceProvidedAt.getTime()) {
      globalStats.minServiceProvidedAt = time;
    }
    nb++;
  }

  globalStats.maxServiceProvidedAt = moment
    .tz(globalStats.maxServiceProvidedAt, 'Europe/Paris')
    .format('DD/MM/YYYY HH:mm:ss');
  globalStats.minServiceProvidedAt = moment
    .tz(globalStats.minServiceProvidedAt, 'Europe/Paris')
    .format('DD/MM/YYYY HH:mm:ss');

  globalStats.unknownVehicleMakes = Object.keys(globalStats.unknownVehicleMakes);
  globalStats.emptyContent =
    globalStats.withContactChannel === 0 || globalStats.withServiceProvidedAt === 0 || globalStats.withName === 0;
  globalStats.rows = nb;
  callback(null, {
    isValid: true,
    validationDetails: globalStats,
  });
};

const validateImportFileBufferFromJSONParser = function validateImportFileBufferFromJSONParser(
  filePath,
  fileBuffer,
  parserConfig,
  columns,
  vehicleMakes,
  dataTypesFormatter,
  importOptions,
  dataType,
  garageId,
  callback
) {
  // eslint-disable-line max-len
  parseFileBufferFromJSONParser(
    filePath,
    fileBuffer,
    parserConfig,
    columns,
    vehicleMakes,
    dataTypesFormatter,
    importOptions,
    dataType,
    garageId,
    null,
    __computeValidationStats(callback)
  ); // eslint-disable-line max-len
};

/** validate a file made to create a dataRecordsheet
callback(err,json()) - json => siValid:true|false, validationDetails:object*/
const validateImportFileBuffer = function validateImportFBuff(
  filePath,
  fileBuffer,
  importSchemaName,
  importOptions,
  dataType,
  garageId,
  callback
) {
  const eventsEmitter = new EventsEmitter(null);
  parseFileBuffer(
    filePath,
    fileBuffer,
    importSchemaName,
    importOptions,
    dataType,
    garageId,
    eventsEmitter,
    __computeValidationStats(callback)
  );
};

/** validate a file made to create a dataRecordsheet in a filestore
callback(err,json()) - json => siValid:true|false, validationDetails:object*/
const validateImportFile = function validateImportFile(
  filePath,
  fileStore,
  importSchemaName,
  importOptions,
  dataType,
  garageId,
  callback
) {
  loadFileFromFileStore(filePath, fileStore)
    .then((res) => {
      validateImportFileBuffer(filePath, res.fileBuffer, importSchemaName, importOptions, dataType, garageId, callback);
    })
    .catch((error) => {
      console.error(error);
      callback(null, {
        isValid: false,
        validationDetails: error.message,
      });
    });
};

/** parse a file on a filestore and calls back an iterator*/
function parseFileStore(filepath, fileStore, importSchemaName, importOptions, dataType, garageId, callback) {
  try {
    loadFileFromFileStore(filepath, fileStore)
      .then((res) => {
        const eventsEmitter = new EventsEmitter(null);
        parseFileBuffer(filepath, res.fileBuffer, importSchemaName, importOptions, dataType, garageId, eventsEmitter, callback);
      })
      .catch((e) => {
        callback(e);
      });
  } catch (e) {
    callback(e);
  }
}

/** Parse a datafile and generate data records */
async function generateData(models, dataFileId, useJobs = true, rawGarage, eventsEmitterContext) {
  let invalidImportStatus = false;
  let dataFile = null;
  let garage = rawGarage;
  try {
    // get datafile
    try {
      dataFile = await models.DataFile.findById(dataFileId);
      if (typeof dataFile.garageId === 'undefined') {
        throw new Error('Undefined dataFile.garageId');
      }
      if (typeof dataFile.importStatus !== 'undefined' && dataFile.importStatus !== DataFileStatus.RETRY) {
        invalidImportStatus = true;
        throw new Error(
          util.format(
            'Import already has status "%s" for DataRecord Sheet "%s"',
            dataFile.importStatus,
            dataFile.getId()
          )
        );
      }
      if (typeof dataFile.fileStore === 'undefined') {
        throw new Error('Undefined dataFile.fileStore');
      }
      if (!gsDataFileUtil.isValidFileStore(dataFile.fileStore)) {
        throw new Error(util.format('Invalid dataFile.fileStore: "%s"', dataFile.fileStore));
      }
      if (typeof dataFile.importSchemaName === 'undefined') {
        throw new Error('Undefined dataFile.importSchemaName');
      }
      garage = garage || (await models.Garage.findById(dataFile.garageId));
      if (!garage) {
        throw new Error(`Unable to fetch garage with id ${dataFile.garageId}`);
      }
      if (!garage.subscriptions) {
        throw new Error('Garage subscriptions not available for garage');
      }
    } catch (e) {
      throw e;
    }
    // update status
    dataFile = await dataFile.updateAttribute('importStatus', 'Running');

    // emit event
    await dataFile.emitAsyncEvent('import.start', { dataFileId: dataFile.getId() });

    // load parser
    const importSchemaModulePath = `./import-schema/${dataFile.importSchemaName}`;
    console.log(util.format('Importing DataRecord Sheet Import Schema module "%s" …', importSchemaModulePath));
    const importSchema = await promises.makeAsyncPrototype(importerSchema, 'loadInstance')(
      dataFile.importSchemaName,
      dataFile.importOptions,
      dataFile.garageId
    ); // eslint-disable-line max-len
    if (typeof importSchema === 'undefined') {
      throw new Error('Undefined importSchema');
    }
    if (typeof importSchema.rowImportFunctions === 'undefined') {
      throw new Error('Undefined importSchema.rowImportFunctions');
    }
    if (!_.isArray(importSchema.rowImportFunctions)) {
      throw new Error('importSchema.rowImportFunctions is not an array');
    }
    let fileBuffer = null;
    // let fileMetadata = null;
    if (dataFile.fileStore === 'memory') {
      // when we create from memory the filebuffer is already full
      fileBuffer = dataFile.fileBuffer;
      if (fileBuffer.data) {
        fileBuffer = Buffer.from(fileBuffer.data);
      }
      // fileMetadata = dataFile.fileMetadata;
    } else {
      const filePath = dataFile.filePath;
      const fileStore = dataFile.fileStore;
      const res = await loadFileFromFileStore(filePath, fileStore);
      fileBuffer = res.fileBuffer;
      // fileMetadata = res.fileMetadata;
    }

    // Read DataRecord Sheet Rows from file buffer
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);
    const parseResults = await promises.makeAsyncPrototype(importSchema, 'parseFileBuffer')(
      dataFile.filePath,
      fileBuffer,
      dataFile.dataType,
      eventsEmitter
    ); // eslint-disable-line max-len
    eventsEmitter.accumulatorEmit();
    const iterator = parseResults.iterator;
    const nbDuplicates = parseResults.nbDuplicates;
    console.log(`found ${nbDuplicates} duplicates`);
    // Import individual DataRecord Sheet Rows to their own DataRecord object
    const datas = [];
    // https://gist.github.com/jasonrhodes/2321581
    const getValue = (propertyName, object) => {
      const parts = propertyName.split('.');
      const length = parts.length;
      let property = object || this;
      for (let i = 0; i < length; i++) {
        property = property[parts[i]];
        if (!property) {
          return property;
        }
      }
      return property;
    };
    while (iterator.hasNext()) {
      const dataRecord = iterator.next().value;
      const data = await models.Data.init(dataFile.garageId, {
        type: dataRecord.type,
        garageType: (garage && garage.type) || GarageTypes.DEALERSHIP,
        raw: dataRecord.foreign.dataFileRow,
        sourceId: dataFile.getId().toString(),
        sourceType: SourceTypes.DATAFILE,
      });
      const dataValidity = dataRecord.importStats.dataValidity;
      const dataPresence = dataRecord.importStats.dataPresence;
      const dataNC = dataRecord.importStats.dataNC;
      /* eslint-disable max-len */
      data.addCustomer(
        {
          value: getValue('customer.contactChannel.email.address', dataRecord),
          isValid: getValue('customer.contactChannel.email', dataValidity),
          isNC: getValue('customer.contactChannel.email', dataNC),
        },
        {
          value: getValue('customer.contactChannel.mobilePhone.number', dataRecord),
          isValid: getValue('customer.contactChannel.mobilePhone', dataValidity),
          isNC: getValue('customer.contactChannel.mobilePhone', dataNC),
        },
        { value: getValue('customer.gender', dataRecord), isValid: getValue('customer.gender', dataValidity) },
        { value: getValue('customer.title', dataRecord), isValid: getValue('customer.title', dataValidity) },
        { value: getValue('customer.firstName', dataRecord), isValid: getValue('customer.firstName', dataValidity) },
        { value: getValue('customer.lastName', dataRecord), isValid: getValue('customer.lastName', dataValidity) },
        { value: getValue('customer.fullName', dataRecord), isValid: getValue('customer.fullName', dataValidity) },
        {
          value: getValue('customer.contactChannel.snailMail.streetAddress', dataRecord),
          isValid: getValue('customer.contactChannel.snailMail.streetAddress', dataValidity),
        },
        {
          value: getValue('customer.contactChannel.snailMail.postCode', dataRecord),
          isValid: getValue('customer.contactChannel.snailMail.postCode', dataValidity),
        },
        {
          value: getValue('customer.contactChannel.snailMail.city', dataRecord),
          isValid: getValue('customer.contactChannel.snailMail.city', dataValidity),
        },
        // notice: we can have syntaxKO but the default value FR
        {
          value: getValue('customer.contactChannel.snailMail.countryCode', dataRecord),
          isValid: getValue('customer.contactChannel.snailMail.countryCode', dataValidity),
        },
        {
          value: getValue('customer.optOutMailing', dataRecord),
          isValid: getValue('customer.optOutMailing', dataValidity),
        },
        { value: getValue('customer.optOutSMS', dataRecord), isValid: getValue('customer.optOutSMS', dataValidity) }
      );

      data.addVehicle(
        { value: getValue('vehicle.make', dataRecord), isValid: getValue('vehicle.make', dataValidity) },
        { value: getValue('vehicle.model', dataRecord), isValid: getValue('vehicle.model', dataValidity) },
        { value: getValue('vehicle.mileage', dataRecord), isValid: getValue('vehicle.mileage', dataPresence) },
        {
          value: getValue('vehicle.registration.plate', dataRecord),
          isValid: getValue('vehicle.registration.plate', dataPresence),
        },
        {
          value: getValue('vehicle.registration.countryCode', dataRecord),
          isValid: getValue('vehicle.registration.countryCode', dataPresence),
        },
        {
          value: getValue('vehicle.registration.firstRegisteredAt', dataRecord),
          isValid: getValue('vehicle.registration.firstRegisteredAt', dataValidity),
        },
        { value: getValue('vehicle.vin', dataRecord), isValid: getValue('vehicle.vin', dataValidity) }
      );
      data.addService(
        false, // isQuote
        getValue('foreign.garageProvidedFrontDeskUserName', dataRecord),
        getValue('foreign.garageProvidedFrontDeskUserTeam', dataRecord),
        getValue('customer.foreign.garageProvidedGarageId', dataRecord),
        getValue('customer.foreign.garageProvidedCustomerId', dataRecord),
        dataRecord.completedAt,
        dataRecord.billedAt,
        dataRecord.price
      );
      // Set automation values
      if (
        dataFile.importAutomation ||
        !garage.subscriptions[data.get('type')] ||
        !garage.subscriptions[data.get('type')].enabled
      ) {
        data.set('shouldSurfaceInStatistics', false);
        data.set('campaign.automationOnly', true);
      }
      /* eslint-enable max-len */
      datas.push(data);
    }

    // datas.forEach(d => console.log(JSON.stringify(d, null, 2)));
    // process.exit();

    console.log(`[generateData] Saving ${datas.length} datas`);
    const datasPerGarages = {};
    for (let d = 0; d < datas.length; d++) {
      await datas[d].save();
      if (!datasPerGarages[datas[d].garageId]) datasPerGarages[datas[d].garageId] = [];
      datasPerGarages[datas[d].garageId].push(datas[d].getId().toString());
    }
    if (useJobs) {
      console.log('[generateData] Creating AUTOMATION_ADD_DATAS_TO_CUSTOMER jobs');
      for (const garageId of Object.keys(datasPerGarages)) {
        const bulk = datasPerGarages[garageId];
        await Scheduler.insertJob(JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER, { dataIds: bulk }, new Date());
      }
    } else {
      console.log('[generateData] Updating customers');
      for (let d = 0; d < datas.length; d++) {
        await models.Customer.addData(datas[d]);
      }
      console.log('[generateData] Updating customers DONE');
    }
    dataFile.importStatus = DataFileStatus.COMPLETE;
    dataFile.importedAt = new Date();
    dataFile = await dataFile.save();
    await dataFile.emitAsyncEvent('import.complete', { dataFileId: dataFile.getId() });
    return dataFile;
  } catch (e) {
    if (!dataFile) {
      throw e;
    }
    await dataFile.emitAsyncEvent('import.failure', { dataFileId: dataFile.getId(), error: { message: e.message } });
    if (invalidImportStatus) {
      throw e;
    }
    await dataFile.updateAttribute('importStatus', 'Error');
    throw e;
  }
}
const generateDataWithCb = (models, dataFileId, useJobs, garage = null, eventsEmitterContext, cb) => {
  (async () => {
    try {
      cb(null, await generateData(models, dataFileId, useJobs, garage, eventsEmitterContext));
    } catch (e) {
      cb(e);
    }
  })();
};

module.exports = {
  validateImportFileBuffer,
  validateImportFileBufferFromJSONParser,
  validateImportFile,
  generateData,
  generateDataWithCb,
  loadFileFromFileStore,
  parseFileBuffer,
  parseFileStore,
};
