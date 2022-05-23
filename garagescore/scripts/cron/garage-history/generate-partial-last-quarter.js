/**
 * Generate GarageSHistory for the lastQuarter
 * GarageHistory is a model to cache calculated statistics for the 90 last days for each garage
 */
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const CronRunner = require('../../../common/lib/cron/runner');
const promises = require('../../../common/lib/util/promises');
const app = require('../../../server/server.js');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.HOURLY,
  description: 'Mettre à jours les stats consolidé (garageHistory) pour les 90 derniers jours.',
});
let frequency = 1;

process.argv.forEach((val, index) => {
  if (val === '--frequency') {
    frequency = parseInt(process.argv[index + 1], 10);
    if (!frequency) {
      throw new Error(`invalid frequency ${frequency}`);
    }
  }
  if (val === '--help') {
    console.log('');
    console.log('* Create the overAll statistics to show in light-Bi using GarageHistory Model');
    console.log('* GarageHistory is a model to cache calculated statistics for the 90 last days for each garage');
    console.log('');
    console.log('Usage scripts/cron/garage-history/generate-partial-last-quarter.js');
    process.exit(0);
  }
});
console.log(`Frequency : ${frequency}`);

async function execution(options) {
  if (new Date().getHours() > 21 || new Date().getHours() < 7) {
    console.log(`LAST_QUARTER: execution skipped at night ${new Date()}`);
    return;
  }
  console.log(`Generation started : ${new Date()}`);
  const garages = await promises.wait((cb) => app.models.Garage.find({ fields: { id: true } }, cb));
  let executed = 0;
  let i;
  const intervalExec = setInterval(() => console.log(`Process ${parseInt((i / garages.length) * 100, 10)}%`), 30000);
  for (i = 0; i < garages.length; i++) {
    const garage = garages[i];
    if (parseInt(garage.getId().toString().substr(-8), 16) % frequency === options.executionStepNumber % frequency) {
      await app.models.GarageHistory.generateForPeriod(GarageHistoryPeriod.LAST_QUARTER, garage.getId(), true);
      executed++;
    }
  }
  clearInterval(intervalExec);
  console.log(`LAST_QUARTER: executed garages ${executed}`);
  console.log(`Generation ended : ${new Date()}`);
}

app.on('booted', () => {
  runner.execute = function execute(options, callback) {
    if (!options.executionStepNumber) {
      callback(new Error('option.executionStepNumber not found'));
      return;
    }
    execution(options)
      .then((res) => callback(null, res))
      .catch(callback);
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
