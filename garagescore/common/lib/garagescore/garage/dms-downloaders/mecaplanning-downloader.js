const _ = require('lodash');
const debug = require('debug')('garagescore:common:lib:garagescore:garage:uploaders:mecaPlanning-downloader'); // eslint-disable-line max-len,no-unused-vars
const soap = require('soap');
const moment = require('moment');
const util = require('util');
const gsDataFileDataTypes = require('../../../../models/data-file.data-type');
const getWorkFileItemValueForColumnName = require('./-get-work-file-item-value-for-column-name');
const mecaplanningColums = require('./-mecaplanning-columns');
const importerSchema = require('../../data-file/importer-schema');
const csvUtil = require('../../../csv/util');
const s3Uploader = require('./s3-uploader');
const { log, JS } = require('../../../util/log');

/*
 * Pull Work Files from MecaPlanning SOAP service,
 * Flatten them to DataRecord Sheet File Rows
 */
const soapRequest = function (
  garage,
  dmsConfig,
  configMecaPlanning,
  minimumDataRecordFinishDate,
  maximumDataRecordFinishDate,
  dataType,
  callback
) {
  soap.createClient(configMecaPlanning.wsdlUrl, { wsdl_options: { timeout: 300000 } }, (errCreate, soapClient) => {
    // change timeout to 5 minutes
    if (errCreate) {
      callback(errCreate);
      return;
    }
    /*
     * MecaPlanning accepts queries on DateBegin for their WorkFileItem object
     * We are interested in DataRecords with a particular finish date.
     * Therefore, we query for 7 more days before minimumDataRecordFinishDate
     * otherwise we might miss dataRecords that last more than a day.
     */
    const getWorkFilesByDateArgs = {
      EntId: configMecaPlanning.EntId,
      EntKey: configMecaPlanning.EntKey,
      DMSId: configMecaPlanning.DMSId,
      DateBegin: moment(minimumDataRecordFinishDate, 'YYYY-MM-DD').subtract(7, 'days').format('YYYY-MM-DD'),
      DateEnd: moment(maximumDataRecordFinishDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
    };
    if (typeof configMecaPlanning.ProviderName !== 'undefined')
      getWorkFilesByDateArgs.ProviderName = configMecaPlanning.ProviderName;
    // eslint-disable-next-line max-len
    log.info(
      JS,
      `[pullMecaplanning] Pulling MecaPlanning Work Files feed of Garage ${garage.publicDisplayName}, for period ${minimumDataRecordFinishDate} → ${maximumDataRecordFinishDate}.`
    );
    soapClient.IWSDialogservice.IWSDialogPort.getWorkFilesByDate(getWorkFilesByDateArgs, (getErr, result) => {
      // , raw, soapHeader) {
      if (getErr) {
        callback(getErr);
        return;
      }
      // eslint-disable-next-line max-len
      log.info(
        JS,
        `[pullMecaplanning] Pulled MecaPlanning Work Files feed of Garage ${garage.publicDisplayName}, for period ${minimumDataRecordFinishDate} → ${maximumDataRecordFinishDate}.`
      );
      if (typeof result === 'undefined') {
        callback(new Error('Undefined getWorkFilesByDate result'));
        return;
      }
      if (typeof result.return === 'undefined') {
        callback(new Error('Undefined getWorkFilesByDate result.return'));
        return;
      }
      if (typeof result.return.attributes === 'undefined') {
        callback(new Error('Undefined getWorkFilesByDate result.return.attributes'));
        return;
      }

      if (typeof result.return.item === 'undefined') {
        log.error(JS, 'Undefined result.return.item, no work file to process');
        callback(null, []);
        return;
      }

      log.info(JS, '[pullMecaplanning] Flattening MecaPlanning Work Files feed to DataRecord Sheet File Rows…');

      const minimumDataRecordFinishDateMoment = moment(minimumDataRecordFinishDate, 'YYYY-MM-DD');
      const maximumDataRecordFinishDateMoment = moment(maximumDataRecordFinishDate, 'YYYY-MM-DD');

      const dataFileFileRows = [];
      try {
        _.each(result.return.item, (workFileItem) => {
          /*
           * The expected format of each MecaPlanning workFileItem as returned by the soap module is:
           * {
           *   workFileItem:
           *     {
           *       attributes: { id: '46', 'xsi:type': 'NS2:TWorkFile' },
           *       InternalSitId: { attributes: { 'xsi:type': 'xsd:int' }, '$value': 2 },
           *       InternalRecId: { attributes: { 'xsi:type': 'xsd:int' }, '$value': 13 },
           *       InternalAteId: { attributes: { 'xsi:type': 'xsd:int' }, '$value': 2 },
           *       …
           *     }
           * }
           *
           * However sometimes, for empty workFileItems, the following is instead returned:
           * {
           *   workFileItem: { id: '46', 'xsi:type': 'NS2:TWorkFile' }
           * }
           *
           * To skip those, workFiltItems that do not show an “attributes” property are skipped.
           */

          if (typeof workFileItem.attributes === 'undefined') {
            debug(
              'Skipping Work File Item with no attributes property:',
              util.inspect(workFileItem, { length: null, colors: true })
            );
          } else {
            const dataFileFileRow = [];
            _.each(dmsConfig.dataFileFileColumnNames, (columnName) => {
              const value = getWorkFileItemValueForColumnName(workFileItem, columnName);
              dataFileFileRow.push(value);
            });
            // Only include rows for which first value (ie. siteId) matches garage
            const sitIdIndex = _.indexOf(dmsConfig.dataFileFileColumnNames, dmsConfig.siteIdColumnName);
            if (
              typeof configMecaPlanning.SitId !== 'undefined' &&
              typeof dataFileFileRow[sitIdIndex] !== 'undefined' &&
              dataFileFileRow[sitIdIndex].toString() === configMecaPlanning.SitId.toString()
            ) {
              // Only include rows for which status date matches our window
              const statusDateIndex = _.indexOf(dmsConfig.dataFileFileColumnNames, dmsConfig.statusDateColumnName);
              const statusDate = dataFileFileRow[statusDateIndex];
              if (typeof statusDate !== 'undefined') {
                const statusDateMoment = moment(dataFileFileRow[statusDateIndex], dmsConfig.statusDateColumnFormat);
                if (
                  statusDateMoment.isBetween(minimumDataRecordFinishDateMoment, maximumDataRecordFinishDateMoment) ||
                  statusDateMoment.isSame(minimumDataRecordFinishDateMoment) ||
                  statusDateMoment.isSame(maximumDataRecordFinishDateMoment)
                ) {
                  dataFileFileRows.push(dataFileFileRow);
                } else {
                  log.debug(JS, `not including because status date: ${statusDateMoment}`);
                }
              } else {
                log.debug(JS, `not including because undefined statusDate: ${JSON.stringify(workFileItem)}`);
              }
            }
          }
        });
      } catch (err) {
        callback(err, null);
        return;
      }
      callback(null, dataFileFileRows);
    });
  });
};

/** pull data from mecaplanning for one garage/date/dataType and copy them to s3 */
const pushToS3 = function (garage, date, dataType, callback) {
  if (!gsDataFileDataTypes.isSupported(dataType)) {
    callback(Error(`${dataType} not supported`));
    return;
  }
  if (!_.isFunction(callback)) {
    callback(Error('`callback` is not a function'));
    return;
  }
  if (_.isUndefined(garage)) {
    callback(Error('Undefined `garage`'));
    return;
  }
  const configMecaPlanning = garage.dms && garage.dms[dataType] && garage.dms[dataType].MecaPlanning;
  if (!configMecaPlanning) {
    callback(new Error('Garage does not use MecaPlanning or do not have any MecaPlanning configuration'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.wsdlUrl)) {
    callback(new Error('Undefined `wsdlUrl`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.EntId)) {
    callback(new Error('Undefined `EntId`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.EntKey)) {
    callback(new Error('Undefined `EntKey`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.DMSId)) {
    callback(new Error('Undefined `DMSId`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.SitId)) {
    callback(new Error('Undefined `SitId`'));
    return;
  }

  // TODO ??? a different date for different datatype ?
  const minimumDataRecordFinishDate = moment(date).subtract(1, 'day').format('YYYY-MM-DD');
  const maximumDataRecordFinishDate = minimumDataRecordFinishDate;
  const importSchemaPath = 'MecaPlanning/mecaplanning';
  importerSchema.loadInstance(importSchemaPath, null, garage.id, (e, importSchema) => {
    if (e) {
      callback(e);
      return;
    }
    if (!importSchema) {
      callback(new Error(`Schema [${importSchemaPath}] not found`));
      return;
    }
    const dmsConfig = {};
    // Guarantee presence of all columns required for import
    dmsConfig.dataFileFileColumnNames = _.union(
      importSchema.getColumnNames(),
      importSchema.getForeignColumnNames(),
      mecaplanningColums
    );

    dmsConfig.siteIdColumnName = 'Site.SitId'; // V_1-0-0-6, V_1-0-0-12
    dmsConfig.statusDateColumnName = 'RdvStateList.[last].RdvStateDateHeure'; // V_1-0-0-6, V_1-0-0-12
    dmsConfig.statusDateColumnFormat = 'DD/MM/YYYY'; // V_1-0-0-6, V_1-0-0-12

    soapRequest(
      garage,
      dmsConfig,
      configMecaPlanning,
      minimumDataRecordFinishDate,
      maximumDataRecordFinishDate,
      dataType,
      (soapErr, dataFileFileRows) => {
        if (soapErr) {
          log.error(JS, `pushToS3 error ${soapErr.message} on ${garage.publicDisplayName}`);
          callback(soapErr);
          return;
        }
        log.info(
          JS,
          `[pullMecaplanning] Flattened MecaPlanning Work Files feed to %d DataRecord Sheet File Rows. ${dataFileFileRows.length}`
        );
        const csvFieldDelimiter = ';';
        const csvLineDelimiter = '\n';
        const dataFileFileContent = [
          dmsConfig.dataFileFileColumnNames.map(csvUtil.toSafeCsvValue).join(csvFieldDelimiter),
        ]
          .concat(_.map(dataFileFileRows, (dataRow) => dataRow.map(csvUtil.toSafeCsvValue).join(csvFieldDelimiter)))
          .join(csvLineDelimiter);
        log.info(JS, '[pullMecaplanning] Uploading to S3');
        s3Uploader(dataFileFileContent, garage, date, dataType, callback);
      }
    );
  });
};
/** (for debug) callback the csv instead of pushing to s3 */
const getCsv = function (garage, minimumDataRecordFinishDate, maximumDataRecordFinishDate, dataType, callback) {
  if (!gsDataFileDataTypes.isSupported(dataType)) {
    callback(Error(`${dataType} not supported`));
    return;
  }
  if (!_.isFunction(callback)) {
    callback(Error('`callback` is not a function'));
    return;
  }
  if (_.isUndefined(garage)) {
    callback(Error('Undefined `garage`'));
    return;
  }
  const configMecaPlanning = garage.dms && garage.dms[dataType] && garage.dms[dataType].MecaPlanning;
  if (!configMecaPlanning) {
    callback(new Error('Garage does not use MecaPlanning or do not have any MecaPlanning configuration'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.wsdlUrl)) {
    callback(new Error('Undefined `wsdlUrl`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.EntId)) {
    callback(new Error('Undefined `EntId`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.EntKey)) {
    callback(new Error('Undefined `EntKey`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.DMSId)) {
    callback(new Error('Undefined `DMSId`'));
    return;
  }
  if (_.isUndefined(configMecaPlanning.SitId)) {
    callback(new Error('Undefined `SitId`'));
    return;
  }

  const importSchemaPath = 'MecaPlanning/mecaplanning';
  importerSchema.loadInstance(importSchemaPath, null, (e, importSchema) => {
    if (e) {
      callback(e);
      return;
    }
    if (!importSchema) {
      callback(new Error(`Schema [${importSchemaPath}] not found`));
      return;
    }
    const dmsConfig = {};
    // Guarantee presence of all columns required for import
    dmsConfig.dataFileFileColumnNames = _.union(
      importSchema.getColumnNames(),
      importSchema.getForeignColumnNames(),
      mecaplanningColums
    );

    dmsConfig.siteIdColumnName = 'Site.SitId'; // V_1-0-0-6, V_1-0-0-12
    dmsConfig.statusDateColumnName = 'RdvStateList.[last].RdvStateDateHeure'; // V_1-0-0-6, V_1-0-0-12
    dmsConfig.statusDateColumnFormat = 'DD/MM/YYYY'; // V_1-0-0-6, V_1-0-0-12

    soapRequest(
      garage,
      dmsConfig,
      configMecaPlanning,
      minimumDataRecordFinishDate,
      maximumDataRecordFinishDate,
      dataType,
      (soapErr, dataFileFileRows) => {
        if (soapErr) {
          log.error(JS, `getCsv error ${soapErr.message} on ${garage.publicDisplayName}`);
          callback(soapErr);
          return;
        }
        log.info(
          JS,
          `[pullMecaplanning] Flattened MecaPlanning Work Files feed to %d DataRecord Sheet File Rows. ${dataFileFileRows.length}`
        );
        const csvFieldDelimiter = ';';
        const csvLineDelimiter = '\n';
        const dataFileFileContent = [
          dmsConfig.dataFileFileColumnNames.map(csvUtil.toSafeCsvValue).join(csvFieldDelimiter),
        ]
          .concat(_.map(dataFileFileRows, (dataRow) => dataRow.map(csvUtil.toSafeCsvValue).join(csvFieldDelimiter)))
          .join(csvLineDelimiter);
        callback(null, dataFileFileContent);
      }
    );
  });
};
module.exports = { pushToS3, getCsv };
