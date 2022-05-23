const moment = require('moment');

const app = require('../../../server/server');
const { log, TIBO } = require('../../../common/lib/util/log');
const GarageStatus = require('../../../common/models/garage.status');
const DataFileTypes = require('../../../common/models/data-file.data-type');
const CronRunner = require('../../../common/lib/cron/runner');

const dataFileType = process.argv[process.argv.indexOf('--dataFileType') + 1];

const logPrefix = '[CREATE CAMPAIGNS FROM S3] ::';
const timeHelper = require('../../../common/lib/util/time-helper');

if (!DataFileTypes.isSupported(dataFileType)) {
  log.error(TIBO, `${logPrefix} ERROR :: UNSUPPORTED DATAFILE TYPE ${dataFileType}`);
  process.exit(-1);
}

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: `Créer les campagnes depuis S3 pour les DataFiles de type ${dataFileType}`,
  forceExecution: process.argv.includes('--force'),
});
runner.path += ` --dataFileType ${dataFileType}`;

app.on('booted', function () {
  runner.execute = async function (options, callback) {
    try {
      const dayNumber = (options && options.executionStepNumber) || timeHelper.todayDayNumber();
      const dateOfExecution = timeHelper.dayNumberToDate(dayNumber);

      const query = { status: GarageStatus.RUNNING_AUTO, [`dms.${dataFileType}.fileSuffix`]: { $ne: null } };
      const projection = { id: '$_id', slug: true, publicDisplayName: true, dms: true };
      const garages = await app.models.Garage.getMongoConnector().find(query, { projection }).toArray();
      const formattedDate = moment(dateOfExecution).format('YYYY-MM-DD');
      const createdDataFiles = [];

      log.info(TIBO, `${logPrefix} INFO :: ${garages.length} Garages To Process`);
      log.info(TIBO, `${logPrefix} INFO :: Processing For Date ${formattedDate}`);

      for (const garage of garages) {
        const context = `Garage ${garage.id.toString()} For Type ${dataFileType}`;
        try {
          log.info(TIBO, `${logPrefix} INFO :: Processing ${context}`);
          const res = await app.models.Garage.importDMSDataFromS3(garage.id.toString(), formattedDate, dataFileType);
          if (res) {
            log.info(TIBO, `${logPrefix} INFO :: Created ${res.length} DataFiles For ${context}`);
            createdDataFiles.push(...res);
          } else {
            log.warning(TIBO, `${logPrefix} WARNING :: No DataFiles Created For ${context}`);
          }
        } catch (e) {
          log.error(TIBO, `${logPrefix} ERROR :: In Context ${context} :: ${e}`);
        }
      }

      log.info(TIBO, `${logPrefix} INFO :: Done ! ${createdDataFiles.length} DataFiles Created !`);

      callback();
    } catch (err) {
      log.error(TIBO, `${logPrefix} ERROR :: ${err}`);
      callback(err);
    }
  };

  runner.run(function (err) {
    if (err) {
      log.error(TIBO, `${logPrefix} ERROR :: ${err}`);
    }
    process.exit(err ? -1 : 0);
  });
});
