/* eslint-disable */
var debug = require('debug')('garagescore:common:lib:garagescore:campaign:creator'); // eslint-disable-line max-len,no-unused-vars
var gsDataFileUtil = require('../data-file/util');
var gsDataFileImporter = require('../data-file/lib/importer');
var campaignCreationSchema = require('./campaign-creation-schema');
var app = require('../../../../server/server');
var async = require('async');
const GarageProcessingContext = require('../monitoring/internal-events/contexts/garage-processing-context');
const timeHelper = require('../../util/time-helper');
const campaignType = require('../../../models/campaign.type');
/** get DataFile garage */

var _getGarage = function (dataFile, callback) {
  if (typeof dataFile.garageId === 'undefined') {
    callback(new Error('Undefined dataFile.garageId'));
  }
  app.models.Garage.findById(dataFile.garageId, function (err, garage) {
    if (err) {
      callback(err);
      return;
    }
    if (typeof garage === 'undefined') {
      callback(new Error('Undefined garage'));
    }
    callback(null, garage);
  });
};
/** Create campaigns from an imported  datafile with data records*/
var createCampaignsFromDataFile = function (dataFile, callback) {
  _getGarage(dataFile, function (e1, garage) {
    if (e1) {
      callback(e1);
      return;
    }
    gsDataFileUtil.ensureValidForCampaignCreation(dataFile, function (e2) {
      if (e2) {
        callback(e2);
        return;
      }
      garage.getCampaignScenario(function (errScenario, scenario) {
        if (errScenario) {
          callback(errScenario);
          return;
        }
        let creationSchema = campaignCreationSchema(scenario);
        /** #3747 check if campagn scenario is empty */
        let contacts = 0;
        if (scenario.chains) {
          [
            campaignType.MAINTENANCE,
            campaignType.VEHICLE_SALE,
            campaignType.NEW_VEHICLE_SALE,
            campaignType.USED_VEHICLE_SALE,
            campaignType.VEHICLE_INSPECTION,
          ].forEach((type) => {
            contacts +=
              (scenario.chains[type] && scenario.chains[type].contacts && scenario.chains[type].contacts.length) || 0;
          });
        }
        if (contacts === 0) {
          callback();
          return;
        }
        let generateCampaignFromDatas = creationSchema.generateCampaignFromDatas;
        generateCampaignFromDatas(dataFile.toObject(), async function (e3, campaigns, ignored) {
          if (e3) {
            callback(e3, null, ignored);
            return;
          }
          if (
            (!campaigns || !campaigns.length) &&
            ignored &&
            ignored.length &&
            ignored.every(
              (i) =>
                i[0] === creationSchema.dataRejectionReasons.NO_CONTACT_CHANNEL ||
                i[0] === creationSchema.dataRejectionReasons.DROPPED_WITH_NO_ALTERNATIVE
            )
          ) {
            await dataFile.updateAttribute('noContactableData', true);
          }
          callback(null, campaigns, ignored);
        });
      });
    });
  });
};

/** Create a datafile for one garage from pushed files in s3 and import it*/
var createCampaignsFromPath = function (garage, filePath, dataType, date, callback) {
  var dataFile = {};
  dataFile.fileStore = 'S3';
  dataFile.filePath = filePath;
  dataFile.garageId = garage.id;
  dataFile.dataType = dataType;

  dataFile.importSchemaName = garage.importSchema && garage.importSchema.path;

  dataFile.importOptions = garage.importSchema && garage.importSchema.options;

  app.models.DataFile.create(dataFile, function (errCreate, createdDataFile) {
    if (errCreate) {
      callback(errCreate);
      return;
    }
    var dataFileId = createdDataFile.getId().toString();
    debug('[DataFileCreator] DataFile Created id:%s.', createdDataFile.getId());
    const eventsEmitterContext = GarageProcessingContext.create(
      garage.id.toString(),
      dataType,
      timeHelper.dayNumber(new Date(date))
    );
    gsDataFileImporter.generateDataWithCb(app.models, dataFileId, true, garage, eventsEmitterContext, function (
      importErr,
      savedDataFile
    ) {
      if (importErr) {
        callback(new Error(importErr));
        return;
      }
      debug('[DataFileCreator] Datafile Imported');
      createCampaignsFromDataFile(savedDataFile, callback);
    });
  });
};
/** Re-import dataFile */
var reImportDataFile = function (dataFileId, callback) {
  debug('[DataFileCreator] Reimport DataFile id:%s.', dataFileId);
  const useJobs = true;
  const garage = null;
  const eventsEmitterContext = null;
  gsDataFileImporter.generateDataWithCb(app.models, dataFileId, useJobs, garage, eventsEmitterContext, function (
    importErr,
    savedDataFile
  ) {
    if (importErr) {
      callback(importErr);
      return;
    }
    debug('[DataFileCreator] Datafile Reimported');
    createCampaignsFromDataFile(savedDataFile, (errCreate) => {
      if (errCreate) {
        console.error(errCreate.message, dataFileId);
      }
      callback();
    });
  });
};
/** Re-import existing datafile with a specific status*/
var reImportDataFileWithStatus = function (status, callback) {
  app.models.DataFile.find({ where: { status } }, function (errFind, dataFiles) {
    if (errFind) {
      callback(errFind);
      return;
    }
    async.forEachSeries(
      dataFiles,
      (dataFile, next) => {
        var dataFileId = dataFile.getId().toString();
        reImportDataFile(dataFileId, (importErr) => {
          if (importErr) {
            console.error('[DataFileCreator] Datafile NOT Imported');
            console.error(importErr.message);
          }
          next();
          return;
        });
      },
      (err) => {
        callback(err);
      }
    );
  });
};

module.exports = {
  createCampaignsFromDataFile: createCampaignsFromDataFile,
  reImportDataFileWithStatus: reImportDataFileWithStatus,
  reImportDataFile: reImportDataFile,
  createCampaignsFromPath: createCampaignsFromPath,
};
