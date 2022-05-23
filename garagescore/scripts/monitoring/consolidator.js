const async = require('async');
const momentTz = require('moment-timezone');
const readline = require('readline');

const contactType = require('../../common/models/contact.type');
const dataTypes = require('../../common/models/data/type/data-types');
const contactsConfig = require('../../common/lib/garagescore/data-campaign/contacts-config.js');
const Writable = require('stream').Writable;
const GarageIdsCompressor = require('../../common/lib/garagescore/monitoring/garage-ids-subset');
const garageStatus = require('../../common/models/garage.status.js');

const DATAFILE_SUCCESS_STATUS = 'Complete';

/**
 * The Consolidator is a class that consolidate
 * garage statistic for a given period of time.
 * It will take some interesting statistic as the number of dataFiles imported, the
 * number of surveys created, the number of contacts created, etc and it will
 * put everything in a single table.
 * To see what those tables look like, you should go see the 'consolidated-garage-statistic.json' model
 */

/**
 * CONSOLIDATION ITSELF (wow, such class, much code)
 */
class Consolidator {
  /**
   * Constructor for the Consolidator Class
   * @param app the 'express' app
   * @param startInMs the starting point in millisecond (will be rounded to midnight that day, for
   * instance if you give 123456789 which is 1985-07-25T14:05:36:153 it will be rounded to 1985-07-25T00:00:00:000
   * @param endInMs the starting point in millisecond (will be rounded to the end of that day, for
   * instance if you give 123456789 which is 1985-07-25T14:05:36:153 it will be rounded to 1985-07-25T23:59:59:999
   */
  constructor(app, startInMs = momentTz({}).valueOf(), endInMs = momentTz({}).valueOf()) {
    this._app = app;
    this._dateTimeOptions = this._generateDateTimeOptions(startInMs, endInMs);
    this._interval = null;
    this._dataFilesTreated = { val: 0, max: -1 };
    this._campaignsTreated = { val: 0, max: -1 };
    this._contactsTreated = { val: 0, max: -1 };
    this._datasTreated = { val: 0, max: -1 };
    this._printingFirstInterval = true;
    if (!this._app) {
      throw new Error('Consolidator::constructor:: the "app" argument is required');
    }
  }

  /**
   * The only public method of the class, you HAVE to call this method and this one only
   * @param cb your callback, in the classic form cb(err, result)
   */
  start(cb = null) {
    this._finalCb = cb;
    this._app.models.Garage.find({}, (errFindGarages, garages) => {
      if (errFindGarages || !garages || garages.length <= 0) {
        this._done(new Error('Unable to retrieve garages list from the DB'));
      } else {
        console.log(`Found ${garages.length} garages`);
        this._consolidateGarages(garages);
      }
    });
  }

  /**
   * Just finish the work and send it to the callback (or not)
   * @param err you know the drill
   * @param result you know the drill too
   * @private
   */
  _done(err, result, garages) {
    this._destroyDebugPrintingInterval();
    this._printDebug();
    if (this._finalCb) {
      this._finalCb(err, err ? null : this._formatResult(result, garages));
    } else {
      console.log(`No callback provided, consolidator done: ${err || 'Success'}`);
      process.exit(err ? -1 : 0);
    }
  }

  _formatResult(resultRaw, garages) {
    const excluded = [
      'numberOfGarages',
      'daysFromEpoch',
      'weeksFromEpoch',
      'monthsFromEpoch',
      'yearsFromEpoch',
      'allGarageIds',
      'publicReviewsCreated',
    ];
    const obj = resultRaw.forAll;

    for (const field of Object.keys(obj)) {
      if (excluded.indexOf(field) === -1 && field.indexOf('IdsOfGarages') >= 0) {
        const fieldNb = field.replace('IdsOfGarages', 'NbOfGarages');
        if (!obj[fieldNb]) {
          obj[fieldNb] = obj[field].length;
        }
        obj[field] = this._compressGarageIds(garages, obj[field]);
      }
    }
    obj.apvIdsOfGarages = this._compressGarageIds(garages, obj.apvIdsOfGarages);
    obj.vnIdsOfGarages = this._compressGarageIds(garages, obj.vnIdsOfGarages);
    obj.voIdsOfGarages = this._compressGarageIds(garages, obj.voIdsOfGarages);
    obj.leadIdsOfGarages = this._compressGarageIds(garages, obj.leadIdsOfGarages);
    obj.eReputationIdsOfGarages = this._compressGarageIds(garages, obj.eReputationIdsOfGarages);
    return resultRaw;
  }

  _compressGarageIds(garages, arrayToCompress) {
    const garageIds = garages.map((e) => e.id.toString());
    const idsCompressor = new GarageIdsCompressor(garageIds);

    for (const id of arrayToCompress) {
      idsCompressor.set(id);
    }
    return idsCompressor.getEncodedSubset();
  }

  _createDebugPrintingInterval() {
    this._interval = setInterval(this._printDebug.bind(this), 500);
  }

  _printDebug() {
    if (!this._printingFirstInterval) {
      readline.moveCursor(process.stdout, 0, -6);
      readline.cursorTo(process.stdout, 0);
      readline.clearScreenDown(process.stdout);
    }
    console.log('---------- Loading ----------');
    console.log(`DataFiles    : ${this._calcPrintingVal(this._dataFilesTreated)}`);
    console.log(`datas        : ${this._calcPrintingVal(this._datasTreated)}`);
    console.log(`Campaigns    : ${this._calcPrintingVal(this._campaignsTreated)}`);
    console.log(`contacts     : ${this._calcPrintingVal(this._contactsTreated)}`);
    console.log('-----------------------------');
    this._printingFirstInterval = false;
    if (
      this._isFinished(this._dataFilesTreated) &&
      this._isFinished(this._datasTreated) &&
      this._isFinished(this._campaignsTreated) &&
      this._isFinished(this._contactsTreated)
    ) {
      this._destroyDebugPrintingInterval();
    }
  }
  _isFinished(obj) {
    return obj.max !== -1 && obj.val >= obj.max;
  }
  _calcPrintingVal(obj) {
    if (obj.max === -1) {
      return 'Waiting...';
    } else if (obj.val >= obj.max) {
      return `Finished! (${obj.val})`;
    }
    return `${obj.val} / ${obj.max} (${Math.ceil((obj.val / obj.max) * 100)}%)`;
  }

  _destroyDebugPrintingInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /**
   * Main private function, make all the hard work
   * @param garages all the database garages
   * @private
   */
  _consolidateGarages(garages) {
    const between = this._dateTimeOptions.between;
    const where = { createdAt: { between } };
    const whereData = { updatedAt: { between } };
    const whereContactType = { inq: [contactType.CAMPAIGN_EMAIL, contactType.CAMPAIGN_SMS] };
    const whereContact = { and: [{ createdAt: { between } }, { type: whereContactType }] };
    const data = this._generateEmptyDataForOneGarage(garages);
    const dataForAll = this._generateEmptyDataForAllGarages(garages);

    console.log(`$ Consolidating Data Between ${this._dateTimeOptions.start} And ${this._dateTimeOptions.end}`);
    this._createDebugPrintingInterval();
    // We create and work with the 4 streams asynchronously
    async.auto(
      {
        countDataFiles: (asyncCb) => {
          this._app.models.DataFile.count(where, (err, result) => {
            if (err) {
              asyncCb(err);
            } else {
              this._dataFilesTreated.max = result;
              asyncCb();
            }
          });
        },
        countCampaigns: (asyncCb) => {
          this._app.models.Campaign.count(where, (err, result) => {
            if (err) {
              asyncCb(err);
            } else {
              this._campaignsTreated.max = result;
              asyncCb();
            }
          });
        },
        countDatas: (asyncCb) => {
          this._app.models.Data.count(where, (err, result) => {
            if (err) {
              asyncCb(err);
            } else {
              this._datasTreated.max = result;
              asyncCb();
            }
          });
        },
        countContacts: (asyncCb) => {
          this._app.models.Contact.count(whereContact, (err, result) => {
            if (err) {
              asyncCb(err);
            } else {
              this._contactsTreated.max = result;
              asyncCb();
            }
          });
        },
        /* NOTE: If you have to debug the following please read this comment before.
         * Especially if you had an error saying : Write callback called multiple times
         * Now the findStreams that we use have a little problem, they're liars when it comes to throwing errors.
         * They will always tell you the error I mentioned above even though the actual thing is completely unrelated.
         * To debug, you've got to rewrite the involved task using find instead of findStream, that will reveal the error.
         * And don't you forget to switch back to findStream after having fixed the issue !
         */
        consolidateDataFiles: [
          'countDataFiles',
          (asyncCb) => {
            // DataFiles stream, creation and work
            const dataFilesRS = this._app.models.DataFile.findStream({ where });
            const dataFilesWS = new Writable({ objectMode: true });

            dataFilesRS.pipe(dataFilesWS);
            dataFilesRS.on('finish', () => asyncCb());
            dataFilesRS.on('error', (e) => asyncCb(`Error consolidateDataFiles readStream ${e}`));
            dataFilesWS.on('error', (e) => asyncCb(`Error consolidateDataFiles writeStream ${e}`));
            dataFilesWS._write = (dataFile, encoding, streamCb) => {
              const garageId = dataFile.garageId ? dataFile.garageId.toString() : null;

              this._fillDataFileStats(dataFile, data, garageId);
              this._fillDataFileStatsForAll(dataFile, dataForAll, garageId);
              ++this._dataFilesTreated.val;
              streamCb();
              return;
            };
          },
        ],
        consolidateCampaigns: [
          'countCampaigns',
          (asyncCb) => {
            // Campaigns stream, creation and work
            const campaignsRS = this._app.models.Campaign.findStream({ where });
            const campaignsWS = new Writable({ objectMode: true });

            campaignsRS.pipe(campaignsWS);
            campaignsRS.on('finish', () => asyncCb());
            campaignsRS.on('error', (e) => asyncCb(`Error consolidateCampaigns readStream ${e}`));
            campaignsWS.on('error', (e) => asyncCb(`Error consolidateCampaigns writeStream ${e}`));
            campaignsWS._write = (campaign, encoding, streamCb) => {
              const garageId = campaign.garageId ? campaign.garageId.toString() : null;

              this._fillCampaignStats(campaign, data, garageId);
              this._fillCampaignStatsForAll(campaign, dataForAll, garageId);
              ++this._campaignsTreated.val;
              streamCb();
              return;
            };
          },
        ],
        consolidateDatas: [
          'countDatas',
          (asyncCb) => {
            // Data stream, creation and work
            const surveysRS = this._app.models.Data.findStream({ where: whereData, order: 'updatedAt ASC' });
            const surveysWS = new Writable({ objectMode: true });

            surveysRS.pipe(surveysWS);
            surveysRS.on('finish', () => asyncCb());
            surveysRS.on('error', (e) => asyncCb(`Error consolidateDatas readStream ${e}`));
            surveysWS.on('error', (e) => asyncCb(`Error consolidateDatas writeStream ${e}`));
            surveysWS._write = (singleData, encoding, streamCb) => {
              this._fillDataStats(singleData, data, dataForAll);
              ++this._datasTreated.val;
              streamCb();
              return;
            };
          },
        ],
        consolidateContacts: [
          'countContacts',
          (asyncCb) => {
            // Contacts stream, creation and work
            const contactsRS = this._app.models.Contact.findStream({ where: whereContact });
            const contactsWS = new Writable({ objectMode: true });

            contactsRS.pipe(contactsWS);
            contactsRS.on('finish', () => asyncCb());
            contactsRS.on('error', (e) => asyncCb(`Error consolidateContacts readStream ${e}`));
            contactsWS.on('error', (e) => asyncCb(`Error consolidateContacts writeStream ${e}`));
            contactsWS._write = (contact, encoding, streamCb) => {
              const garageId = contact.payload && contact.payload.garageId ? contact.payload.garageId.toString() : null;

              this._fillContactStats(contact, data, garageId);
              this._fillContactStatsForAll(contact, dataForAll, garageId);
              ++this._contactsTreated.val;
              streamCb();
              return;
            };
          },
        ],
      },
      (err) => this._done(err, { byGarages: data, forAll: dataForAll }, garages)
    );
  }

  _addGarageIdToArrayIfDontExistAlready(array, garageId) {
    if (Array.isArray(array) && array.indexOf(garageId) === -1) {
      array.push(garageId);
    }
  }

  _incr(obj, field, garageId) {
    ++obj[field];
    this._addGarageIdToArrayIfDontExistAlready(obj[`${field}IdsOfGarages`], garageId);
  }

  _isInConfiguredTimeInterval(date) {
    const createdMoment = momentTz(date).tz('UTC');
    return createdMoment.isBetween(this._dateTimeOptions.start, this._dateTimeOptions.end, '[]');
  }
  /**
   * This function take a dateTimeOptions which contains several informations
   * like the start and the end and return which date is corresponding
   * @param dateTimeOptions required
   * @param createdAt required
   * @param updatedAt optional
   * @returns {{createdAt: boolean, updatedAt: boolean}}
   * @private
   */
  _getMatchingDayIndex(dateTimeOptions, createdAt, updatedAt) {
    const createdMoment = momentTz(createdAt).tz('UTC');
    const updatedMoment = updatedAt ? momentTz(updatedAt).tz('UTC') : null;
    const result = { createdAt: false, updatedAt: false };

    if (createdMoment.isBetween(dateTimeOptions.start, dateTimeOptions.end, '[]')) {
      result.createdAt = true;
    }
    if (updatedMoment && updatedMoment.isBetween(dateTimeOptions.start, dateTimeOptions.end, '[]')) {
      result.updatedAt = true;
    }
    return result;
  }

  /**
   * Fill the object 'data' with statistic about one dataFile
   * @param dataFile the dataFile
   * @param data the object data to be filled
   * @param garageId the garageId for this dataFile
   * @param matchingDaysIndexes object containing which day this dataFile has been imported
   * @private
   */
  _fillDataFileStats(dataFile, data, garageId) {
    if (!garageId || !data[garageId]) {
      console.log(`Error in fillDataFileStats, bad arguments :: ${garageId}`);
      return;
    }
    ++data[garageId].importedFiles;
    ++data[garageId][`importedFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`];
    if (dataFile.dataType === 'Maintenances') {
      ++data[garageId].importedApvFiles;
      ++data[garageId][
        `importedApvFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`
      ];
    } else if (dataFile.dataType === 'MixedVehicleSales') {
      ++data[garageId].importedMixedSalesFiles;
      ++data[garageId][
        `importedMixedSalesFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`
      ];
    } else if (dataFile.dataType === 'NewVehicleSales') {
      ++data[garageId].importedVnFiles;
      ++data[garageId][`importedVnFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`];
    } else if (dataFile.dataType === 'UsedVehicleSales') {
      ++data[garageId].importedVoFiles;
      ++data[garageId][`importedVoFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`];
    } else if (dataFile.dataType === 'Mixed') {
      ++data[garageId].importedMixedFiles;
      ++data[garageId][
        `importedMixedFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`
      ];
    }
  }

  _fillDataFileStatsForAll(dataFile, data, gid) {
    const obj = data;

    this._incr(obj, 'importedFiles', gid);
    this._incr(obj, `importedFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`, gid);
    if (dataFile.dataType === 'Maintenances') {
      this._incr(obj, 'importedApvFiles', gid);
      this._incr(
        obj,
        `importedApvFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`,
        gid
      );
    } else if (dataFile.dataType === 'MixedVehicleSales') {
      this._incr(obj, 'importedMixedSalesFiles', gid);
      this._incr(
        obj,
        `importedMixedSalesFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`,
        gid
      );
    } else if (dataFile.dataType === 'NewVehicleSales') {
      this._incr(obj, 'importedVnFiles', gid);
      this._incr(
        obj,
        `importedVnFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`,
        gid
      );
    } else if (dataFile.dataType === 'UsedVehicleSales') {
      this._incr(obj, 'importedVoFiles', gid);
      this._incr(
        obj,
        `importedVoFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`,
        gid
      );
    } else if (dataFile.dataType === 'Mixed') {
      this._incr(obj, 'importedMixedFiles', gid);
      this._incr(
        obj,
        `importedMixedFilesWith${dataFile.importStatus === DATAFILE_SUCCESS_STATUS ? 'Success' : 'Error'}`,
        gid
      );
    }
  }

  /**
   * Fill the object 'data' with statistic about this campaign
   * @param campaign the campaign
   * @param data the data object to be filled
   * @param garageId the garageId for this campaign
   * @param matchingDaysIndexes object containing which day this campaign has been created
   * @private
   */
  _fillCampaignStats(campaign, data, garageId) {
    if (!garageId || !data[garageId]) {
      console.log(`Error in fillCampaignStats, bad arguments :: ${garageId}`);
      return;
    }
    ++data[garageId].createdCampaigns;
    if (campaign.type === 'Maintenance') {
      ++data[garageId].createdApvCampaigns;
    } else if (campaign.type === 'VehicleSale') {
      ++data[garageId].createdSaleCampaigns;
    }
  }

  _fillCampaignStatsForAll(campaign, data, gid) {
    const obj = data;

    this._incr(obj, 'createdCampaigns', gid);
    if (campaign.type === 'Maintenance') {
      this._incr(obj, 'createdApvCampaigns', gid);
    } else if (campaign.type === 'VehicleSale') {
      this._incr(obj, 'createdSaleCampaigns', gid);
    }
  }

  /**
   * Fill the object 'data' with statistic about this data
   * @param singleData the data model instance
   * @param data the data object to be filled
   * @param garageId the garageId for this campaign
   * @param matchingDaysIndexes object containing which day this survey has been created or updated
   * @private
   */
  _fillDataStats(singleData, data, dataForAll) {
    const garageId = singleData.get('garageId');
    if (!garageId || !data[garageId]) {
      console.log(`Error in _fillDataStats, bad arguments :: ${garageId}`);
      return;
    }
    // fill dataRecord
    if (this._isInConfiguredTimeInterval(singleData.get('createdAt'))) {
      switch (singleData.get('type')) {
        case dataTypes.MAINTENANCE:
          ++data[garageId].dataRecordsApvCreated;
          ++dataForAll.dataRecordsApvCreated;
          if (dataForAll.dataRecordsApvCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.dataRecordsApvCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noDataRecordsApvCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noDataRecordsApvCreatedIdsOfGarages.splice(
              dataForAll.noDataRecordsApvCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        case dataTypes.NEW_VEHICLE_SALE:
          ++data[garageId].dataRecordsSaleVnCreated;
          ++dataForAll.dataRecordsSaleVnCreated;
          if (dataForAll.dataRecordsSaleVnCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.dataRecordsSaleVnCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noDataRecordsSaleVnCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noDataRecordsSaleVnCreatedIdsOfGarages.splice(
              dataForAll.noDataRecordsSaleVnCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        case dataTypes.USED_VEHICLE_SALE:
          ++data[garageId].dataRecordsSaleVoCreated;
          ++dataForAll.dataRecordsSaleVoCreated;
          if (dataForAll.dataRecordsSaleVoCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.dataRecordsSaleVoCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noDataRecordsSaleVoCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noDataRecordsSaleVoCreatedIdsOfGarages.splice(
              dataForAll.noDataRecordsSaleVoCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        case dataTypes.UNKNOWN:
          ++data[garageId].dataRecordsSaleUnknownCreated;
          ++dataForAll.dataRecordsSaleUnknownCreated;
          if (dataForAll.dataRecordsSaleUnknownCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.dataRecordsSaleUnknownCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noDataRecordsSaleUnknownCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noDataRecordsSaleUnknownCreatedIdsOfGarages.splice(
              dataForAll.noDataRecordsSaleUnknownCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        default:
          break;
      }
      if (dataForAll.dataRecordsCreatedIdsOfGarages.indexOf(garageId) === -1) {
        dataForAll.dataRecordsCreatedIdsOfGarages.push(garageId);
      }
      if (dataForAll.noDataRecordsCreatedIdsOfGarages.indexOf(garageId) >= 0) {
        dataForAll.noDataRecordsCreatedIdsOfGarages.splice(
          dataForAll.noDataRecordsCreatedIdsOfGarages.indexOf(garageId),
          1
        );
      } // eslint-disable-line max-len
    }
    // fill campaignItem
    if (
      singleData.get('campaign.campaignId') &&
      this._isInConfiguredTimeInterval(singleData.get('campaign.importedAt'))
    ) {
      switch (singleData.get('type')) {
        case dataTypes.MAINTENANCE:
          ++data[garageId].campaignItemsApvCreated;
          ++dataForAll.campaignItemsApvCreated;
          if (dataForAll.campaignItemsApvCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.campaignItemsApvCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noCampaignItemsApvCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noCampaignItemsApvCreatedIdsOfGarages.splice(
              dataForAll.noCampaignItemsApvCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        case dataTypes.NEW_VEHICLE_SALE:
          ++data[garageId].campaignItemsSaleVnCreated;
          ++dataForAll.campaignItemsSaleVnCreated;
          if (dataForAll.campaignItemsSaleVnCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.campaignItemsSaleVnCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noCampaignItemsSaleVnCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noCampaignItemsSaleVnCreatedIdsOfGarages.splice(
              dataForAll.noCampaignItemsSaleVnCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        case dataTypes.USED_VEHICLE_SALE:
          ++data[garageId].campaignItemsSaleVoCreated;
          ++dataForAll.campaignItemsSaleVoCreated;
          if (dataForAll.campaignItemsSaleVoCreatedIdsOfGarages.indexOf(garageId) === -1) {
            dataForAll.campaignItemsSaleVoCreatedIdsOfGarages.push(garageId);
          } // eslint-disable-line max-len
          if (dataForAll.noCampaignItemsSaleVoCreatedIdsOfGarages.indexOf(garageId) >= 0) {
            dataForAll.noCampaignItemsSaleVoCreatedIdsOfGarages.splice(
              dataForAll.noCampaignItemsSaleVoCreatedIdsOfGarages.indexOf(garageId),
              1
            );
          } // eslint-disable-line max-len
          break;
        case dataTypes.UNKNOWN:
        default:
          break;
      }
    }
    // fill publicReview Stats
    if (singleData.get('review') && this._isInConfiguredTimeInterval(singleData.get('review.createdAt'))) {
      ++data[garageId].publicReviewsCreated;
      ++dataForAll.publicReviewsCreated;
    }

    // fill survey Stats
    if (singleData.get('survey')) {
      if (singleData.get('survey.sendAt') && this._isInConfiguredTimeInterval(singleData.get('survey.sendAt'))) {
        ++data[garageId].createdSurveys;
        this._incr(dataForAll, 'createdSurveys', garageId);
        if (singleData.get('type') === dataTypes.MAINTENANCE) {
          data[garageId].createdApvSurveys++;
          this._incr(dataForAll, 'createdApvSurveys', garageId);
        }
        if ([dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE].includes(singleData.get('type'))) {
          data[garageId].createdSaleSurveys++;
          this._incr(dataForAll, 'createdSaleSurveys', garageId);
        }
      }
      if (
        singleData.get('survey.lastRespondedAt') &&
        this._isInConfiguredTimeInterval(singleData.get('survey.lastRespondedAt'))
      ) {
        ++data[garageId].surveysWithResult;
        this._incr(dataForAll, 'surveysWithResult', garageId);
        if (singleData.get('type') === dataTypes.MAINTENANCE) {
          data[garageId].surveysApvWithResult++;
          this._incr(dataForAll, 'surveysApvWithResult', garageId);
        }
        if ([dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE].includes(singleData.get('type'))) {
          data[garageId].surveysSaleWithResult++;
          this._incr(dataForAll, 'surveysSaleWithResult', garageId);
        }
      }
    }
    // fill followupSurveyStats
    if (singleData.get('surveyFollowupUnsatisfied')) {
      if (
        singleData.get('surveyFollowupUnsatisfied.sendAt') &&
        this._isInConfiguredTimeInterval(singleData.get('surveyFollowupUnsatisfied.sendAt'))
      ) {
        ++data[garageId].createdSurveys;
        this._incr(dataForAll, 'createdSurveys', garageId);
        if (singleData.get('type') === dataTypes.MAINTENANCE) {
          data[garageId].createdApvFollowupSurveys++;
          this._incr(dataForAll, 'createdApvFollowupSurveys', garageId);
        }
        if ([dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE].includes(singleData.get('type'))) {
          data[garageId].createdSaleFollowupSurveys++;
          this._incr(dataForAll, 'createdSaleFollowupSurveys', garageId);
        }
      }
      if (
        singleData.get('surveyFollowupUnsatisfied.lastRespondedAt') &&
        this._isInConfiguredTimeInterval(singleData.get('surveyFollowupUnsatisfied.lastRespondedAt'))
      ) {
        // eslint-disable-line max-len
        ++data[garageId].surveysWithResult;
        this._incr(dataForAll, 'surveysWithResult', garageId);
        if (singleData.get('type') === dataTypes.MAINTENANCE) {
          data[garageId].surveysApvFollowupWithResult++;
          this._incr(dataForAll, 'surveysApvFollowupWithResult', garageId);
        }
        if ([dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE].includes(singleData.get('type'))) {
          data[garageId].surveysSaleFollowupWithResult++;
          this._incr(dataForAll, 'surveysSaleFollowupWithResult', garageId);
        }
      }
    }
  }

  /**
   * Fill the object 'data' with statistic about this contact
   * @param contact the contact
   * @param data the data object to be filled
   * @param garageId the garageId for this campaign
   * @param matchingDaysIndexes object containing which day this contact has been created
   * @private
   */
  _fillContactStats(contact, data, garageId) {
    /* eslint-disable max-len */
    if (!garageId || !data[garageId]) {
      console.log(`Error in fillContactStats, bad arguments :: ${garageId}`);
      return;
    }
    if (contact.type === contactType.CAMPAIGN_EMAIL && contact.payload) {
      data[garageId].apvContacts1SentByEmail += contact.payload.key === contactsConfig.maintenance_email_1.key ? 1 : 0;
      data[garageId].apvContacts2SentByEmail += contact.payload.key === contactsConfig.maintenance_email_2.key ? 1 : 0;
      data[garageId].apvContacts3SentByEmail += contact.payload.key === contactsConfig.maintenance_email_3.key ? 1 : 0;
      data[garageId].saleContacts1SentByEmail += contact.payload.key === contactsConfig.sale_email_1.key ? 1 : 0;
      data[garageId].saleContacts2SentByEmail += contact.payload.key === contactsConfig.sale_email_2.key ? 1 : 0;
      data[garageId].saleContacts3SentByEmail += contact.payload.key === contactsConfig.sale_email_3.key ? 1 : 0;
      data[garageId].contacts1SentByEmail +=
        contact.payload.key === contactsConfig.maintenance_email_1.key ||
        contact.payload.key === contactsConfig.sale_email_1.key
          ? 1
          : 0;
      data[garageId].contacts2SentByEmail +=
        contact.payload.key === contactsConfig.maintenance_email_2.key ||
        contact.payload.key === contactsConfig.sale_email_2.key
          ? 1
          : 0;
      data[garageId].contacts3SentByEmail +=
        contact.payload.key === contactsConfig.maintenance_email_3.key ||
        contact.payload.key === contactsConfig.sale_email_3.key
          ? 1
          : 0;
      data[garageId].contactsApvSentByEmail += contact.payload.key.indexOf('sale') === -1 ? 1 : 0;
      data[garageId].contactsSaleSentByEmail += contact.payload.key.indexOf('sale') >= 0 ? 1 : 0;
      ++data[garageId].contactsSentByEmail;
    } else if (contact.type === contactType.CAMPAIGN_SMS && contact.payload) {
      data[garageId].apvContacts1SentByPhone += contact.payload.key === contactsConfig.maintenance_sms_1.key ? 1 : 0;
      data[garageId].saleContacts1SentByPhone += contact.payload.key === contactsConfig.sale_sms_1.key ? 1 : 0;
      ++data[garageId].contacts1SentByPhone;
      data[garageId].recontactsSentByPhone = 0; // Does not exist yet, waiting for new campaign scenario
    }
    if (
      (contact.type === contactType.CAMPAIGN_EMAIL || contact.type === contactType.CAMPAIGN_SMS) &&
      (contact.payload.key === contactsConfig.maintenance_email_thanks_1.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_2.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_3.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_4.key ||
        contact.payload.key === contactsConfig.maintenance_email_followup.key)
    ) {
      ++data[garageId].thanksAndFollowupsApvSent;
    }
    if (
      (contact.type === contactType.CAMPAIGN_EMAIL || contact.type === contactType.CAMPAIGN_SMS) &&
      (contact.payload.key === contactsConfig.sale_email_thanks_1.key ||
        contact.payload.key === contactsConfig.sale_email_thanks_2.key ||
        contact.payload.key === contactsConfig.sale_email_thanks_3.key ||
        contact.payload.key === contactsConfig.sale_email_thanks_4.key)
    ) {
      ++data[garageId].thanksAndFollowupsSaleSent;
    }
    if (
      (contact.type === contactType.CAMPAIGN_EMAIL || contact.type === contactType.CAMPAIGN_SMS) &&
      (contact.payload.key === contactsConfig.sale_email_thanks_1.key ||
        contact.payload.key === contactsConfig.sale_email_thanks_2.key ||
        contact.payload.key === contactsConfig.sale_email_thanks_3.key ||
        contact.payload.key === contactsConfig.sale_email_thanks_4.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_1.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_2.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_3.key ||
        contact.payload.key === contactsConfig.maintenance_email_thanks_4.key ||
        contact.payload.key === contactsConfig.maintenance_email_followup.key)
    ) {
      ++data[garageId].thanksAndFollowupsSent;
    }
    /* eslint-enable max-len */
  }

  _fillContactStatsForAll(contact, data, gid) {
    /* eslint-disable max-len */
    const obj = data;
    const n = contact.payload && contact.payload.key ? contact.payload.key : null;
    const t = contact.type || null;

    if (!gid) {
      console.log('Error in fillContactStatsForAll, bad arguments');
      return;
    }
    if (t === contactType.CAMPAIGN_EMAIL) {
      if (n === contactsConfig.maintenance_email_1.key) {
        this._incr(obj, 'apvContacts1SentByEmail', gid);
      }
      if (n === contactsConfig.maintenance_email_2.key) {
        this._incr(obj, 'apvContacts2SentByEmail', gid);
      }
      if (n === contactsConfig.maintenance_email_3.key) {
        this._incr(obj, 'apvContacts3SentByEmail', gid);
      }
      if (n === contactsConfig.sale_email_1.key) {
        this._incr(obj, 'saleContacts1SentByEmail', gid);
      }
      if (n === contactsConfig.sale_email_2.key) {
        this._incr(obj, 'saleContacts2SentByEmail', gid);
      }
      if (n === contactsConfig.sale_email_3.key) {
        this._incr(obj, 'saleContacts3SentByEmail', gid);
      }
      if (n === contactsConfig.maintenance_email_1.key || n === contactsConfig.sale_email_1.key) {
        this._incr(obj, 'contacts1SentByEmail', gid);
      }
      if (n === contactsConfig.maintenance_email_2.key || n === contactsConfig.sale_email_2.key) {
        this._incr(obj, 'contacts2SentByEmail', gid);
      }
      if (n === contactsConfig.maintenance_email_3.key || n === contactsConfig.sale_email_3.key) {
        this._incr(obj, 'contacts3SentByEmail', gid);
      }
      if (n.indexOf('sale') === -1) {
        this._incr(obj, 'contactsApvSentByEmail', gid);
      }
      if (n.indexOf('sale') >= 0) {
        this._incr(obj, 'contactsSaleSentByEmail', gid);
      }
      this._incr(obj, 'contactsSentByEmail', gid);
    } else if (t === contactType.CAMPAIGN_SMS) {
      if (n === contactsConfig.maintenance_sms_1.key) {
        this._incr(obj, 'apvContacts1SentByPhone', gid);
      }
      if (n === contactsConfig.sale_sms_1.key) {
        this._incr(obj, 'saleContacts1SentByPhone', gid);
      }
      this._incr(obj, 'contacts1SentByPhone', gid);
      obj.recontactsSentByPhone = 0; // Does not exist yet, waiting for new campaign scenario
    }
    if (
      (t === contactType.CAMPAIGN_EMAIL || t === contactType.CAMPAIGN_SMS) &&
      (n === contactsConfig.maintenance_email_thanks_1.key ||
        n === contactsConfig.maintenance_email_thanks_2.key ||
        n === contactsConfig.maintenance_email_thanks_3.key ||
        n === contactsConfig.maintenance_email_thanks_4.key ||
        n === contactsConfig.maintenance_email_followup.key)
    ) {
      this._incr(obj, 'thanksAndFollowupsApvSent', gid);
    }
    if (
      (t === contactType.CAMPAIGN_EMAIL || t === contactType.CAMPAIGN_SMS) &&
      (n === contactsConfig.sale_email_thanks_1.key ||
        n === contactsConfig.sale_email_thanks_2.key ||
        n === contactsConfig.sale_email_thanks_3.key ||
        n === contactsConfig.sale_email_thanks_4.key)
    ) {
      this._incr(obj, 'thanksAndFollowupsSaleSent', gid);
    }
    if (
      (t === contactType.CAMPAIGN_EMAIL || t === contactType.CAMPAIGN_SMS) &&
      (n === contactsConfig.sale_email_thanks_1.key ||
        n === contactsConfig.sale_email_thanks_2.key ||
        n === contactsConfig.sale_email_thanks_3.key ||
        n === contactsConfig.sale_email_thanks_4.key ||
        n === contactsConfig.maintenance_email_thanks_1.key ||
        n === contactsConfig.maintenance_email_thanks_2.key ||
        n === contactsConfig.maintenance_email_thanks_3.key ||
        n === contactsConfig.maintenance_email_thanks_4.key ||
        n === contactsConfig.maintenance_email_followup.key)
    ) {
      this._incr(obj, 'thanksAndFollowupsSent', gid);
    }
    /* eslint-enable max-len */
  }

  /**
   * Generate the object containing the global date time configuration
   * @param startInMs starting point in millisecond
   * @param endInMs ending point in millisecond
   * @returns {{}}
   * @private
   */
  _generateDateTimeOptions(startInMs, endInMs) {
    const dateTimeOptions = {};

    dateTimeOptions.start = momentTz(startInMs).tz('UTC');
    dateTimeOptions.end = momentTz(endInMs).tz('UTC');
    dateTimeOptions.epochYear = 1970;
    dateTimeOptions.between = [dateTimeOptions.start.toDate(), dateTimeOptions.end.toDate()];
    return dateTimeOptions;
  }

  /**
   * Generate an array of interval corresponding to all the day to treat between the starting point and the ending point
   * @param start a moment (moment.js)
   * @param end a moment (moment.js)
   * @returns {Array}
   * @private
   */
  _generateDatesToTreat(start, end) {
    const res = [];
    let tmpStart = start.clone();
    let tmpEnd = start.clone().add(1, 'day').hour(11).minute(59).second(59).millisecond(999);

    while (!tmpEnd.isAfter(end)) {
      res.push([tmpStart, tmpEnd]);
      tmpStart = tmpStart.clone().add(1, 'day');
      tmpEnd = tmpEnd.clone().add(1, 'day');
    }
    return res;
  }

  /**
   * Generate an empty dta object, you HAVE to modifiy this functon if you want to add
   * new field into the consolidated-garage-statistic model
   * @param garages all the garages
   * @param dateTimeOptions an object containing global configuraiton about date and time, you won't have to modifiy it
   * @returns {{}}
   * @private
   */
  _generateEmptyDataForOneGarage(garages) {
    const data = {};
    let allIds = '';

    for (const garage of garages) {
      allIds += garage.id.toString();
    }
    for (const garage of garages) {
      const garageId = garage.id.toString();
      const dataForOneGarage = {};

      // Garage Info
      dataForOneGarage.garageId = garageId;
      dataForOneGarage.status = garage.status || garageStatus.STOPPED;
      dataForOneGarage.allGarageIds = allIds;
      // Date
      dataForOneGarage.daysFromEpoch = 0;
      dataForOneGarage.weeksFromEpoch = 0;
      dataForOneGarage.monthsFromEpoch = 0;
      dataForOneGarage.yearsFromEpoch = 0;
      dataForOneGarage.hasApv = garage.isSubscribed('Maintenance'); // eslint-disable-line
      dataForOneGarage.hasVn = garage.isSubscribed('NewVehicleSale'); // eslint-disable-line
      dataForOneGarage.hasVo = garage.isSubscribed('UsedVehicleSale'); // eslint-disable-line
      dataForOneGarage.hasLead = garage.isSubscribed('Lead'); // eslint-disable-line
      dataForOneGarage.hasEReputation = garage.isSubscribed('EReputation'); // eslint-disable-line
      // Imports
      dataForOneGarage.importedFiles = 0;
      dataForOneGarage.importedFilesWithError = 0;
      dataForOneGarage.importedFilesWithSuccess = 0;
      dataForOneGarage.importedApvFiles = 0;
      dataForOneGarage.importedApvFilesWithError = 0;
      dataForOneGarage.importedApvFilesWithSuccess = 0;
      dataForOneGarage.importedMixedSalesFiles = 0;
      dataForOneGarage.importedMixedSalesFilesWithError = 0;
      dataForOneGarage.importedMixedSalesFilesWithSuccess = 0;
      dataForOneGarage.importedVnFiles = 0;
      dataForOneGarage.importedVnFilesWithError = 0;
      dataForOneGarage.importedVnFilesWithSuccess = 0;
      dataForOneGarage.importedVoFiles = 0;
      dataForOneGarage.importedVoFilesWithError = 0;
      dataForOneGarage.importedVoFilesWithSuccess = 0;
      dataForOneGarage.importedMixedFiles = 0;
      dataForOneGarage.importedMixedFilesWithError = 0;
      dataForOneGarage.importedMixedFilesWithSuccess = 0;
      // Campaigns
      dataForOneGarage.createdCampaigns = 0;
      dataForOneGarage.createdApvCampaigns = 0;
      dataForOneGarage.createdSaleCampaigns = 0;
      // Surveys
      dataForOneGarage.createdSurveys = 0;
      dataForOneGarage.surveysWithResult = 0;
      dataForOneGarage.createdApvSurveys = 0;
      dataForOneGarage.surveysApvWithResult = 0;
      dataForOneGarage.createdSaleSurveys = 0;
      dataForOneGarage.surveysSaleWithResult = 0;
      dataForOneGarage.createdApvFollowupSurveys = 0;
      dataForOneGarage.createdSaleFollowupSurveys = 0;
      dataForOneGarage.surveysApvFollowupWithResult = 0;
      dataForOneGarage.surveysSaleFollowupWithResult = 0;
      // Contacts
      dataForOneGarage.apvContacts1SentByEmail = 0;
      dataForOneGarage.apvContacts1SentByPhone = 0;
      dataForOneGarage.apvContacts2SentByEmail = 0;
      dataForOneGarage.apvContacts3SentByEmail = 0;
      dataForOneGarage.saleContacts1SentByEmail = 0;
      dataForOneGarage.saleContacts1SentByPhone = 0;
      dataForOneGarage.saleContacts2SentByEmail = 0;
      dataForOneGarage.saleContacts3SentByEmail = 0;
      dataForOneGarage.contacts1SentByEmail = 0;
      dataForOneGarage.contacts1SentByPhone = 0;
      dataForOneGarage.contacts2SentByEmail = 0;
      dataForOneGarage.contacts3SentByEmail = 0;
      dataForOneGarage.contactsApvSentByEmail = 0;
      dataForOneGarage.contactsSaleSentByEmail = 0;
      dataForOneGarage.contactsSentByEmail = 0;
      dataForOneGarage.thanksAndFollowupsApvSent = 0;
      dataForOneGarage.thanksAndFollowupsSaleSent = 0;
      dataForOneGarage.thanksAndFollowupsSent = 0;
      dataForOneGarage.recontactsSentByPhone = 0;
      //  Data Records
      dataForOneGarage.dataRecordsCreated = 0;
      dataForOneGarage.dataRecordsApvCreated = 0;
      dataForOneGarage.dataRecordsSaleCreated = 0;
      dataForOneGarage.dataRecordsSaleVnCreated = 0;
      dataForOneGarage.dataRecordsSaleVoCreated = 0;
      dataForOneGarage.dataRecordsSaleUnknownCreated = 0;
      // Campaign Items
      dataForOneGarage.campaignItemsCreated = 0;
      dataForOneGarage.campaignItemsApvCreated = 0;
      dataForOneGarage.campaignItemsSaleCreated = 0;
      dataForOneGarage.campaignItemsSaleVnCreated = 0;
      dataForOneGarage.campaignItemsSaleVoCreated = 0;
      // Public Reviews
      dataForOneGarage.publicReviewsCreated = 0;
      data[garageId] = dataForOneGarage;
    }
    return data;
  }

  /**
   * Generate an empty dta object, you HAVE to modifiy this functon if you want to add
   * new field into the consolidated-garage-statistic model
   * @param garages all our garages
   * @param dateTimeOptions an object containing global configuraiton about date and time, you won't have to modifiy it
   * @returns {{}}
   * @private
   */
  _generateEmptyDataForAllGarages(garages) {
    const data = {};
    const allIdsArray = [];
    let allIds = '';

    for (const garage of garages) {
      allIds += garage.id.toString();
      allIdsArray.push(garage.id.toString());
    }
    // Garages Info
    data.numberOfGarages = garages.length;
    data.allGarageIds = allIds;
    // Date
    data.daysFromEpoch = 0;
    data.weeksFromEpoch = 0;
    data.monthsFromEpoch = 0;
    data.yearsFromEpoch = 0;
    // Imports
    data.importedFiles = 0;
    data.importedFilesWithError = 0;
    data.importedFilesWithSuccess = 0;
    data.importedApvFiles = 0;
    data.importedApvFilesWithError = 0;
    data.importedApvFilesWithSuccess = 0;
    data.importedMixedSalesFiles = 0;
    data.importedMixedSalesFilesWithError = 0;
    data.importedMixedSalesFilesWithSuccess = 0;
    data.importedVnFiles = 0;
    data.importedVnFilesWithError = 0;
    data.importedVnFilesWithSuccess = 0;
    data.importedVoFiles = 0;
    data.importedVoFilesWithError = 0;
    data.importedVoFilesWithSuccess = 0;
    data.importedMixedFiles = 0;
    data.importedMixedFilesWithError = 0;
    data.importedMixedFilesWithSuccess = 0;
    // Campaigns
    data.createdCampaigns = 0;
    data.createdApvCampaigns = 0;
    data.createdSaleCampaigns = 0;
    // Surveys
    data.createdSurveys = 0;
    data.surveysWithResult = 0;
    data.createdApvSurveys = 0;
    data.surveysApvWithResult = 0;
    data.createdSaleSurveys = 0;
    data.surveysSaleWithResult = 0;
    data.createdApvFollowupSurveys = 0;
    data.createdSaleFollowupSurveys = 0;
    data.surveysApvFollowupWithResult = 0;
    data.surveysSaleFollowupWithResult = 0;
    // Contacts
    data.apvContacts1SentByEmail = 0;
    data.apvContacts1SentByPhone = 0;
    data.apvContacts2SentByEmail = 0;
    data.apvContacts3SentByEmail = 0;
    data.saleContacts1SentByEmail = 0;
    data.saleContacts1SentByPhone = 0;
    data.saleContacts2SentByEmail = 0;
    data.saleContacts3SentByEmail = 0;
    data.contacts1SentByEmail = 0;
    data.contacts1SentByPhone = 0;
    data.contacts2SentByEmail = 0;
    data.contacts3SentByEmail = 0;
    data.contactsApvSentByEmail = 0;
    data.contactsSaleSentByEmail = 0;
    data.contactsSentByEmail = 0;
    data.thanksAndFollowupsApvSent = 0;
    data.thanksAndFollowupsSaleSent = 0;
    data.thanksAndFollowupsSent = 0;
    data.recontactsSentByPhone = 0;
    // Imports Numbers
    data.importedFilesNbOfGarages = 0;
    data.importedFilesWithErrorNbOfGarages = 0;
    data.importedFilesWithSuccessNbOfGarages = 0;
    data.importedApvFilesNbOfGarages = 0;
    data.importedApvFilesWithErrorNbOfGarages = 0;
    data.importedApvFilesWithSuccessNbOfGarages = 0;
    data.importedMixedSalesFilesNbOfGarages = 0;
    data.importedMixedSalesFilesWithErrorNbOfGarages = 0;
    data.importedMixedSalesFilesWithSuccessNbOfGarages = 0;
    data.importedVnFilesNbOfGarages = 0;
    data.importedVnFilesWithErrorNbOfGarages = 0;
    data.importedVnFilesWithSuccessNbOfGarages = 0;
    data.importedVoFilesNbOfGarages = 0;
    data.importedVoFilesWithErrorNbOfGarages = 0;
    data.importedVoFilesWithSuccessNbOfGarages = 0;
    data.importedMixedFilesNbOfGarages = 0;
    data.importedMixedFilesWithErrorNbOfGarages = 0;
    data.importedMixedFilesWithSuccessNbOfGarages = 0;
    // Campaigns Numbers
    data.createdCampaignsNbOfGarages = 0;
    data.createdApvCampaignsNbOfGarages = 0;
    data.createdSaleCampaignsNbOfGarages = 0;
    // Surveys Numbers
    data.createdSurveysNbOfGarages = 0;
    data.surveysWithResultNbOfGarages = 0;
    data.createdApvSurveysNbOfGarages = 0;
    data.surveysApvWithResultNbOfGarages = 0;
    data.createdSaleSurveysNbOfGarages = 0;
    data.surveysSaleWithResultNbOfGarages = 0;
    data.createdApvFollowupSurveysNbOfGarages = 0;
    data.createdSaleFollowupSurveysNbOfGarages = 0;
    data.surveysApvFollowupWithResultNbOfGarages = 0;
    data.surveysSaleFollowupWithResultNbOfGarages = 0;
    // Contacts Numbers
    data.apvContacts1SentByEmailNbOfGarages = 0;
    data.apvContacts1SentByPhoneNbOfGarages = 0;
    data.apvContacts2SentByEmailNbOfGarages = 0;
    data.apvContacts3SentByEmailNbOfGarages = 0;
    data.saleContacts1SentByEmailNbOfGarages = 0;
    data.saleContacts1SentByPhoneNbOfGarages = 0;
    data.saleContacts2SentByEmailNbOfGarages = 0;
    data.saleContacts3SentByEmailNbOfGarages = 0;
    data.contacts1SentByEmailNbOfGarages = 0;
    data.contacts1SentByPhoneNbOfGarages = 0;
    data.contacts2SentByEmailNbOfGarages = 0;
    data.contacts3SentByEmailNbOfGarages = 0;
    data.contactsApvSentByEmailNbOfGarages = 0;
    data.contactsSaleSentByEmailNbOfGarages = 0;
    data.contactsSentByEmailNbOfGarages = 0;
    data.thanksAndFollowupsApvSentNbOfGarages = 0;
    data.thanksAndFollowupsSaleSentNbOfGarages = 0;
    data.thanksAndFollowupsSentNbOfGarages = 0;
    data.recontactsSentByPhoneNbOfGarages = 0;
    // Imports Ids
    data.importedFilesIdsOfGarages = [];
    data.importedFilesWithErrorIdsOfGarages = [];
    data.importedFilesWithSuccessIdsOfGarages = [];
    data.importedApvFilesIdsOfGarages = [];
    data.importedApvFilesWithErrorIdsOfGarages = [];
    data.importedApvFilesWithSuccessIdsOfGarages = [];
    data.importedMixedSalesFilesIdsOfGarages = [];
    data.importedMixedSalesFilesWithErrorIdsOfGarages = [];
    data.importedMixedSalesFilesWithSuccessIdsOfGarages = [];
    data.importedVnFilesIdsOfGarages = [];
    data.importedVnFilesWithErrorIdsOfGarages = [];
    data.importedVnFilesWithSuccessIdsOfGarages = [];
    data.importedVoFilesIdsOfGarages = [];
    data.importedVoFilesWithErrorIdsOfGarages = [];
    data.importedVoFilesWithSuccessIdsOfGarages = [];
    data.importedMixedFilesIdsOfGarages = [];
    data.importedMixedFilesWithErrorIdsOfGarages = [];
    data.importedMixedFilesWithSuccessIdsOfGarages = [];
    // Campaigns Ids
    data.createdCampaignsIdsOfGarages = [];
    data.createdApvCampaignsIdsOfGarages = [];
    data.createdSaleCampaignsIdsOfGarages = [];
    // Surveys Ids
    data.createdSurveysIdsOfGarages = [];
    data.surveysWithResultIdsOfGarages = [];
    data.createdApvSurveysIdsOfGarages = [];
    data.surveysApvWithResultIdsOfGarages = [];
    data.createdSaleSurveysIdsOfGarages = [];
    data.surveysSaleWithResultIdsOfGarages = [];
    data.createdApvFollowupSurveysIdsOfGarages = [];
    data.createdSaleFollowupSurveysIdsOfGarages = [];
    data.surveysApvFollowupWithResultIdsOfGarages = [];
    data.surveysSaleFollowupWithResultIdsOfGarages = [];
    // Contacts Ids --> The arrays will be transformed to compressed strings before inserting into DB
    data.apvContacts1SentByEmailIdsOfGarages = [];
    data.apvContacts1SentByPhoneIdsOfGarages = [];
    data.apvContacts2SentByEmailIdsOfGarages = [];
    data.apvContacts3SentByEmailIdsOfGarages = [];
    data.saleContacts1SentByEmailIdsOfGarages = [];
    data.saleContacts1SentByPhoneIdsOfGarages = [];
    data.saleContacts2SentByEmailIdsOfGarages = [];
    data.saleContacts3SentByEmailIdsOfGarages = [];
    data.contacts1SentByEmailIdsOfGarages = [];
    data.contacts1SentByPhoneIdsOfGarages = [];
    data.contacts2SentByEmailIdsOfGarages = [];
    data.contacts3SentByEmailIdsOfGarages = [];
    data.contactsApvSentByEmailIdsOfGarages = [];
    data.contactsSaleSentByEmailIdsOfGarages = [];
    data.contactsSentByEmailIdsOfGarages = [];
    data.thanksAndFollowupsApvSentIdsOfGarages = [];
    data.thanksAndFollowupsSaleSentIdsOfGarages = [];
    data.thanksAndFollowupsSentIdsOfGarages = [];
    data.recontactsSentByPhoneIdsOfGarages = [];
    // Subscriptions Info --> Arrays will be transformed into compressed string at the end
    data.apvNbOfGarages = 0;
    data.vnNbOfGarages = 0;
    data.voNbOfGarages = 0;
    data.leadNbOfGarages = 0;
    data.eReputationNbOfGarages = 0;
    data.apvIdsOfGarages = [];
    data.vnIdsOfGarages = [];
    data.voIdsOfGarages = [];
    data.leadIdsOfGarages = [];
    data.eReputationIdsOfGarages = [];
    // Data Records
    data.dataRecordsCreated = 0;
    data.dataRecordsApvCreated = 0;
    data.dataRecordsSaleCreated = 0;
    data.dataRecordsSaleVnCreated = 0;
    data.dataRecordsSaleVoCreated = 0;
    data.dataRecordsSaleUnknownCreated = 0;
    data.dataRecordsCreatedNbOfGarages = 0;
    data.dataRecordsApvCreatedNbOfGarages = 0;
    data.dataRecordsSaleCreatedNbOfGarages = 0;
    data.dataRecordsSaleVnCreatedNbOfGarages = 0;
    data.dataRecordsSaleVoCreatedNbOfGarages = 0;
    data.dataRecordsSaleUnknownCreatedNbOfGarages = 0;
    data.dataRecordsCreatedIdsOfGarages = [];
    data.dataRecordsApvCreatedIdsOfGarages = [];
    data.dataRecordsSaleCreatedIdsOfGarages = [];
    data.dataRecordsSaleVnCreatedIdsOfGarages = [];
    data.dataRecordsSaleVoCreatedIdsOfGarages = [];
    data.dataRecordsSaleUnknownCreatedIdsOfGarages = [];
    data.noDataRecordsCreatedNbOfGarages = 0;
    data.noDataRecordsApvCreatedNbOfGarages = 0;
    data.noDataRecordsSaleCreatedNbOfGarages = 0;
    data.noDataRecordsSaleVnCreatedNbOfGarages = 0;
    data.noDataRecordsSaleVoCreatedNbOfGarages = 0;
    data.noDataRecordsSaleUnknownCreatedNbOfGarages = 0;
    data.noDataRecordsCreatedIdsOfGarages = [...allIdsArray];
    data.noDataRecordsApvCreatedIdsOfGarages = [...allIdsArray];
    data.noDataRecordsSaleCreatedIdsOfGarages = [...allIdsArray];
    data.noDataRecordsSaleVnCreatedIdsOfGarages = [...allIdsArray];
    data.noDataRecordsSaleVoCreatedIdsOfGarages = [...allIdsArray];
    data.noDataRecordsSaleUnknownCreatedIdsOfGarages = [...allIdsArray];
    // Campaign Items
    data.campaignItemsCreated = 0;
    data.campaignItemsApvCreated = 0;
    data.campaignItemsSaleCreated = 0;
    data.campaignItemsSaleVnCreated = 0;
    data.campaignItemsSaleVoCreated = 0;
    data.campaignItemsCreatedNbOfGarages = 0;
    data.campaignItemsApvCreatedNbOfGarages = 0;
    data.campaignItemsSaleCreatedNbOfGarages = 0;
    data.campaignItemsSaleVnCreatedNbOfGarages = 0;
    data.campaignItemsSaleVoCreatedNbOfGarages = 0;
    data.campaignItemsCreatedIdsOfGarages = [];
    data.campaignItemsApvCreatedIdsOfGarages = [];
    data.campaignItemsSaleCreatedIdsOfGarages = [];
    data.campaignItemsSaleVnCreatedIdsOfGarages = [];
    data.campaignItemsSaleVoCreatedIdsOfGarages = [];
    data.noCampaignItemsCreatedNbOfGarages = 0;
    data.noCampaignItemsApvCreatedNbOfGarages = 0;
    data.noCampaignItemsSaleCreatedNbOfGarages = 0;
    data.noCampaignItemsSaleVnCreatedNbOfGarages = 0;
    data.noCampaignItemsSaleVoCreatedNbOfGarages = 0;
    data.noCampaignItemsCreatedIdsOfGarages = [...allIdsArray];
    data.noCampaignItemsApvCreatedIdsOfGarages = [...allIdsArray];
    data.noCampaignItemsSaleCreatedIdsOfGarages = [...allIdsArray];
    data.noCampaignItemsSaleVnCreatedIdsOfGarages = [...allIdsArray];
    data.noCampaignItemsSaleVoCreatedIdsOfGarages = [...allIdsArray];
    // Public Reviews
    data.publicReviewsCreated = 0;
    for (const g of garages) {
      if (g.subscriptions && g.status !== garageStatus.STOPPED && g.status !== '') {
        if (g.isSubscribed('Maintenance')) {
          data.apvNbOfGarages++;
          data.apvIdsOfGarages.push(g.id.toString());
        }
        if (g.isSubscribed('NewVehicleSale')) {
          data.vnNbOfGarages++;
          data.vnIdsOfGarages.push(g.id.toString());
        }
        if (g.isSubscribed('UsedVehicleSale')) {
          data.voNbOfGarages++;
          data.voIdsOfGarages.push(g.id.toString());
        }
        if (g.isSubscribed('Lead')) {
          data.leadNbOfGarages++;
          data.leadIdsOfGarages.push(g.id.toString());
        }
        if (g.isSubscribed('EReputation')) {
          data.eReputationNbOfGarages++;
          data.eReputationIdsOfGarages.push(g.id.toString());
        }
      }
    }
    return data;
  }
}

module.exports = Consolidator;
