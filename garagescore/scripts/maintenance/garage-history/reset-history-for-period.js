/**
 * Generate All garagesHistory for periods that will be shown on cockpit
 */
var GarageHistoryPeriod = require('../../../common/models/garage-history.period');
var periodId;
var garageId;
process.argv.forEach(function (val, index) {
  if (val === '--help') {
    console.log('');
    console.log('* Create the overAll statistics to show in light-Bi using GarageHistory Model');
    console.log('* GarageHistory is a model to cache calculated statistics for the 90 last days for each garage');
    console.log('');
    console.log('Usage node bin/dataRecordStatistic/generateAllGaragesHistory.js --period-id lastQuarter --garage-Id ');
    process.exit(0);
  }
  if (val === '--period-id') {
    if (!GarageHistoryPeriod.isValidPeriod(process.argv[index + 1])) {
      console.error('Invalid period id ' + process.argv[index + 1]);
      process.exit(-1);
    }
    periodId = process.argv[index + 1];
  }
  if (val === '--garage-id') {
    garageId = process.argv[index + 1];
  }
});

if (!periodId) {
  console.error('Error :No periodId');
  process.exit(-1);
}

var app = require('../../../server/server.js');

app.on('booted', async () => {
  console.log('Generation started : ' + new Date());
  try {
    if (garageId) {
      await app.models.GarageHistory.generateForPeriod(periodId, garageId, true);
    } else {
      await app.models.GarageHistory.generateForGarages(periodId, null, true);
    }
    console.log('Generation ended : ' + new Date());
    console.log('garage History generation done !');
    process.exit();
  } catch (e) {
    console.log('Error garage History generation: ' + e);
    process.exit();
  }
});
