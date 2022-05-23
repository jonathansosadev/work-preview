const app = require('../../../server/server');
const { TIBO, log } = require('../../../common/lib/util/log');

const CronRunner = require('../../../common/lib/cron/runner');
const setGaragesFirstDataDay = require('../../../common/lib/garagescore/garage/set-garages-first-data-day');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Met à jour les champs firstAPV, firstVN et firstVO dans les documents garage',
  forceExecution: process.argv.includes('--force'),
});

let garageIds = null;
let dataTypes = null;

process.argv.forEach((arg) => {
  if (arg === '--help') {
    console.log('For specific garages : --garageIds=id1,id2,id2,idn');
    console.log('For specific dataTypes : --dataTypes=Maintenance,NewVehicleSale');
    process.exit(0);
  }
  if (arg.includes('--garageIds=')) {
    garageIds = arg.replace('--garageIds=', '').split(',');
  }
  if (arg.includes('--dataTypes=')) {
    dataTypes = arg.replace('--dataTypes=', '').split(',');
  }
});

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    await setGaragesFirstDataDay.setFirstDataDay(garageIds, dataTypes);
    callback();
  };
  runner.run((err) => {
    if (err) {
      log.error(TIBO, `[SET GRAGARES FIRST DATA DAY] Error :: ${err}`);
    }
    process.exit(err ? -1 : 0);
  });
});
