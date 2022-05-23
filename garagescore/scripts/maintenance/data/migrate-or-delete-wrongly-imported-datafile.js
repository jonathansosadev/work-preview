const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');
const timeHelper = require('../../../common/lib/util/time-helper.js'); // eslint-disable-line
const { ObjectID } = require('mongodb');

const _usage = () => {
  console.log(
    '* Usage : node scripts/maintenance/data/migrate-or-delete-wrongly-imported-datafile.js --dataFilePath import-todo/seat-chalons-en-champagne/garagescore_vn_J-100.csv --migrateToGarageId 5GEJZGAUE57ZB --managerId rgezjgrejzhgrez'
  );
  console.log('--dataFilePath: the path of the datafile that imported the datas to remove/migrate, optional');
  console.log('--from: datas removed will be filtered from this date (service.providedAt) (included), optional');
  console.log('--to: datas removed will be filtered before this date (service.providedAt) (excluded), optional');
  console.log('--vehicleMake: datas removed will be filtered by vehicle.make.value, optional');
  console.log('--garageId: datas removed will be filtered with the garageId, optional');
  console.log(
    '--dataType: datas removed will be filtered from this dataType (NewVehicleSale, UsedVehicleSale, Maintenance), optional'
  );
  console.log(
    '--migrateToGarageId (If this is present, all the datas will be transferred to this garage. else, the data will be deleted)'
  );
  console.log(
    '--migrateWithManagerId: (only with migrateToGarageId) lead/unsatisfied default ticket manager, optional'
  );
  console.log(
    '--frontDeskGarageId: datas removed will be filtered by service.frontDeskGarageId, optional'
  );
  console.log('');
  process.exit(0);
};

const _parseArgs = (args) => ({
  dataFilePath: args.includes('--dataFilePath') ? args[args.indexOf('--dataFilePath') + 1] : undefined, // List of dataIds to process
  garageId: args.includes('--garageId') ? new ObjectID(args[args.indexOf('--garageId') + 1]) : undefined, // Origin Garage, optional
  vehicleMake: args.includes('--vehicleMake') ? args[args.indexOf('--vehicleMake') + 1] : undefined, // targeted make, optional
  migrationGarageId: args.includes('--migrateToGarageId')
    ? new ObjectID(args[args.indexOf('--migrateToGarageId') + 1])
    : undefined, // Destination Garage, optional
  migrationManagerId: args.includes('--migrateWithManagerId')
    ? new ObjectID(args[args.indexOf('--migrateWithManagerId') + 1])
    : undefined, // ticket manager, optional
  from: args.includes('--from') ? new Date(args[args.indexOf('--from') + 1]) : undefined, // datas removed will be filtered from this dayNumber, optional
  to: args.includes('--to') ? new Date(args[args.indexOf('--to') + 1]) : undefined, // datas removed will be filtered before this dayNumber, optional
  dataType: args.includes('--dataType') ? args[args.indexOf('--dataType') + 1] : undefined, // datas removed will be filtered from this dataType (NewVehicleSale, UsedVehicleSale, Maintenance), optional
  frontDeskGarageId: args.includes('--frontDeskGarageId') ? args[args.indexOf('--frontDeskGarageId') + 1] : undefined, // targeted DMS internal code
});

app.on('booted', async () => {
  try {
    log.info(FED, 'Fix datas imported on a wrong garage');
    if (process.argv.includes('--help') || process.argv.length < 3) _usage();
    const {
      dataFilePath,
      garageId,
      from,
      to,
      dataType,
      vehicleMake,
      migrationGarageId,
      migrationManagerId,
      frontDeskGarageId,
    } = _parseArgs(process.argv);
    if (!dataFilePath && !garageId) {
      log.info(FED, 'Need either a dataFilePath or a garageId');
      _usage();
    }
    await app.models.Customer.deleteOrMigrateDatasToAnotherGarage({
      dataFilePath,
      garageId,
      from,
      to,
      type: dataType,
      vehicleMake,
      migrationGarageId,
      migrationManagerId,
      frontDeskGarageId,
    });
  } catch (e) {
    log.error(FED, JSON.stringify(e));
  }

  process.exit(0);
});
