const moment = require('moment');
const fs = require('fs');
const { ObjectId } = require('mongodb');

const app = require('../../server/server');
const { log, TIBO } = require('../../common/lib/util/log');
const GarageStatus = require('../../common/models/garage.status');
const DataFileTypes = require('../../common/models/data-file.data-type');

const logPrefix = '[CREATE CAMPAIGNS FROM S3 - SGS] ::';

const phase = process.argv[process.argv.indexOf('--phase') + 1];
const dateStart = moment(new Date(process.argv[process.argv.indexOf('--start') + 1]));
const dateEnd = moment(new Date(process.argv[process.argv.indexOf('--end') + 1]));

app.on('booted', async function () {
  try {
    if (!phase || !dateStart || !dateEnd) {
      log.error(TIBO, `${logPrefix} ERROR :: Check Script Arguments Please`);
      process.exit(-1);
    }

    const fileContent = fs.readFileSync('./scripts/imports/phases.csv', { encoding: 'utf8', flag: 'r' });
    const garageIds = fileContent
      .split('\n')
      .filter((l) => l.split(';').pop() === phase)
      .map((l) => l.split(';').shift());

    const query = { _id: { $in: garageIds.map((id) => new ObjectId(id)) } , status: GarageStatus.RUNNING_AUTO };
    const projection = { id: '$_id', slug: true, publicDisplayName: true, dms: true };
    const garages = await app.models.Garage.getMongoConnector().find(query, { projection }).toArray();
    const dataFileType = DataFileTypes.VEHICLE_INSPECTIONS;

    while (dateStart.isSameOrBefore(dateEnd, 'day')) {
      const formattedDate = moment(dateStart).format('YYYY-MM-DD');
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
      dateStart.add(1, 'day');
    }
    process.exit(0);
  } catch (err) {
    log.error(TIBO, `${logPrefix} ERROR :: ${err}`);
    process.exit(-1);
  }
});
