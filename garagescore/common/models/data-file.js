const app = require('../../server/server');
const debug = require('debug')('garagescore:common:models:data-file'); // eslint-disable-line max-len,no-unused-vars
const gsDataFileImporter = require('../lib/garagescore/data-file/lib/importer');
const gsDataFileUtil = require('../lib/garagescore/data-file/util');
const gsCampaignCreator = require('../lib/garagescore/campaign/creator');
const moment = require('moment');
const gsDataFileDataTypes = require('./data-file.data-type');
const DataFileStatus = require('./data-file.status.js');
const config = require('config');
const { JS, log } = require('../lib/util/log');
const GarageProcessingContext = require('../lib/garagescore/monitoring/internal-events/contexts/garage-processing-context');

function validatesSupportedFileStore(errorCallback) {
  if (!gsDataFileUtil.isValidFileStore(this.fileStore)) {
    errorCallback();
  }
}

module.exports = function DataFileDefinition(DataFile) {
  /*
   * Validators
   */

  DataFile.validate('fileStore', validatesSupportedFileStore);

  DataFile.validatesPresenceOf('garageId');
  if (config.get('campaign.datafile.filePath.unique')) {
    DataFile.validatesUniquenessOf('filePath');
  }

  /*
   * Static Methods
   */

  /*
   * Delete a datafile with an error status
   */
  DataFile.removeDataFileInError = function removeDataFileInError(dataFileId, callback) {
    // eslint-disable-line no-param-reassign
    DataFile.findById(dataFileId, (err, dataFile) => {
      if (err) {
        callback(err);
        return;
      }
      if (!dataFile) {
        callback(new Error('Datafile not found'));
        return;
      }
      if (dataFile.status !== 'Error' && dataFile.importStatus !== DataFileStatus.ERROR) {
        callback(new Error('Datafile not in error'));
        return;
      }
      DataFile.destroyById(dataFileId, callback);
    });
  };
  // find all but without the buffer
  DataFile.findLatest = function findLatest(where, callback) {
    // eslint-disable-line no-param-reassign
    const f = { order: 'createdAt DESC', limit: 10 };
    if (where) {
      try {
        f.where = JSON.parse(where);
      } catch (errParse) {
        callback(errParse);
        return;
      }
    }
    DataFile.find(f, (err, datafiles) => {
      if (err) {
        callback(err);
        return;
      }
      const df = datafiles.map((d) => ({
        status: d.status,
        importStatus: d.importStatus,
        importSchemaName: d.importSchemaName,
        dataType: d.dataType,
        fileStore: d.fileStore,
        filePath: d.filePath,
        fileBufferLength: d.fileBuffer ? d.fileBuffer.length : 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        garageId: d.garageId,
        archived: d.archived,
        id: d.id,
      }));
      callback(null, df);
    });
  };

  // used by import from file or memory
  // create a datafile, generate the data a create a campaign
  const _import = function _import(garage, garageId, msheet, importOptions, importAutomation, useJobs, callback) {
    msheet.importOptions = importOptions; // eslint-disable-line no-param-reassign
    msheet.importAutomation = importAutomation; // eslint-disable-line no-param-reassign
    DataFile.create(msheet, (err, dataFile) => {
      if (err) {
        callback(err);
        return;
      }

      const dataFileId = dataFile.getId();
      const dataFileBeginDate = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const dataFileEndDate = dataFileBeginDate;
      app.models.Garage.emitEvent(
        garage,
        'data-file-push.complete',
        {
          garageId,
          dataFileId,
          dataFileBeginDate, // TODO with manual import, this value should not be here
          dataFileEndDate, // TODO with manual import, this value should not be here
        },
        (emitEventErr, emittedEvent) => {
          if (emitEventErr) {
            console.error(emitEventErr);
            callback(emitEventErr);
            return;
          }
          debug(emittedEvent);
          debug('[importFromFileStore] Import DataFile');

          const eventsEmitterContext = GarageProcessingContext.create(garage.id.toString(), msheet.dataType);
          gsDataFileImporter.generateDataWithCb(
            app.models,
            dataFileId,
            useJobs,
            garage,
            eventsEmitterContext,
            (importErr, savedDataFile) => {
              if (importErr) {
                console.error(importErr);
                callback(importErr);
                return;
              }
              gsCampaignCreator.createCampaignsFromDataFile(savedDataFile, callback);
            }
          );
        }
      );
    });
  };

  /* Create a new dataFile based on a file in a file store and import it,
   * with one or various campaigns ready to be ran */
  DataFile.importFromFileStore = function importFromFileStore(
    garageId,
    fileStore,
    filePath,
    gsImportSchema,
    dataType,
    importAutomation,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    // check if garage exist
    app.models.Garage.findById(garageId, (getByIdErr, garage) => {
      if (getByIdErr) {
        callback(getByIdErr);
        return;
      }
      if (!gsDataFileDataTypes.isSupported(dataType)) {
        callback(new Error(`${dataType} not supported`));
        return;
      }
      const now = new Date();
      const msheet = {
        status: 'New',
        fileStore,
        filePath,
        garageId,
        createdAt: now,
        importSchemaName: gsImportSchema,
        dataType,
      };
      debug(`[importFromFileStore] Import DataFile linked from ${filePath}`);
      // create new DataFile
      _import(
        garage,
        garageId,
        msheet,
        garage.importSchema && garage.importSchema.options,
        importAutomation,
        false,
        callback
      );
    });
  };

  /**
   * Update customer Information from a sourcefile
   * @param garageId
   * @param fileStore
   * @param filePath
   * @param gsImportSchema
   * @param importOptions
   * @param dataType
   * @param callback Function
   */
  DataFile.fixFormFileStore = function fixFormFileStore(
    garageId,
    dataFileId,
    fileStore,
    filePath,
    gsImportSchema,
    importOptions,
    dataType,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    callback(new Error('Not re-implemented'));
  };

  /* Create a new dataFile based on a string content (must be in ut8 and in the Generic/csv-ddmmyyyy format) and import it,
   * with a campaign ready to be ran */
  DataFile.importFromString = function importFromString(garageId, dataType, csvContent, callback) {
    // eslint-disable-line no-param-reassign, max-len
    // TODO use a dynamic parser
    const gsImportSchema = 'Generic/csv-ddmmyyyy';
    const fileStore = 'memory';
    const filePath = `mem${new Date().getTime()}`;
    // string to buffer
    const buffer = Buffer.from(csvContent, 'utf8');
    gsDataFileImporter.validateImportFileBuffer(
      'no-path.csv',
      buffer,
      gsImportSchema,
      {},
      dataType,
      garageId,
      (errValidate, validateResults) => {
        if (errValidate) {
          callback(errValidate);
          return;
        }
        if (!validateResults.isValid) {
          callback(new Error(validateResults.validationDetails));
          return;
        }
        if (validateResults.validationDetails.emptyContent) {
          log.error(JS, 'importFromString Empty content');
          log.error(JS, JSON.stringify(validateResults, null, 2));
          callback(new Error('Empty content'));
          return;
        }
        // check if garage exist
        app.models.Garage.findById(garageId, (getByIdErr, garage) => {
          if (getByIdErr) {
            callback(getByIdErr);
            return;
          }
          if (!garage) {
            callback(new Error(`Garage ${garageId} not found`));
            return;
          }
          const now = new Date();
          const msheet = {
            status: 'New',
            fileStore,
            fileBuffer: buffer,
            filePath,
            garageId,
            createdAt: now,
            importSchemaName: gsImportSchema,
            dataType,
          };
          debug('[importFromString] Create DataFile from string');
          _import(garage, garageId, msheet, {}, false, false, callback);
        });
      }
    );
  };

  /** validate a file made to create a dataFile in a file store
   callback(err,json()) - json => siValid:true|false, validationDetails:object*/
  DataFile.validateImportFile = function validateImportFile(
    filePath,
    fileStore,
    importSchemaName,
    importOptions,
    dataType,
    garageId,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    gsDataFileImporter.validateImportFile(filePath, fileStore, importSchemaName, importOptions, dataType, garageId, callback);
  };

  DataFile.getCreatedCampaigns = function getCreatedCampaigns({ dataFileId, fields }, callback) {
    app.models.Campaign.find({ where: { dataFileId }, fields }, callback);
  };
  DataFile.prototype.getCreatedCampaigns = function getCreatedCampaigns(callback) {
    DataFile.getCreatedCampaigns({ dataFileId: this.getId().toString() }, callback);
  };

  /** Reimport all datafiles from s3 with a specific status */
  DataFile.reImportDataFileWithStatus = function reImportDataFileWithStatus(status, callback) {
    gsCampaignCreator.reImportDataFileWithStatus(status, callback);
  };
  /** Reimport one datafile from s3 with a specific dataFileId */
  DataFile.reImportDataFile = function reImportDataFile(dataFileId, callback) {
    gsCampaignCreator.reImportDataFile(dataFileId, callback);
  };
  // all datas with this datafile id
  DataFile.prototype.datas = function datas(callback) {
    DataFile.app.models.Data.getDataFromDataFile(this.getId().toString(), callback);
  };
};
