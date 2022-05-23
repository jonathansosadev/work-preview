/**
 * Generate GarageSHistory for the lastQuarter and a garageId
 * GarageHistory is a model to cache calculated statistics for the 90 last days for each garage
 */
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const app = require('../../../server/server.js');
const ObjectID = require('mongodb').ObjectID;

process.argv.forEach((val) => {
  if (val === '--help') {
    console.log('');
    console.log('* Create the overAll statistics to show in light-Bi using GarageHistory Model');
    console.log('* GarageHistory is a model to cache calculated statistics for the 90 last days for each garage');
    console.log('');
    console.log('Usage node scripts/cron/garage-history/generate-last-quarter.js garageId');
    process.exit(0);
  }
});

app.on('booted', async () => {
  console.log(`Generation started : ${new Date()}`);
  try {
    const garageId = new ObjectID(process.argv[2]);
    console.log(`garageId : ${garageId}`);
    await app.models.GarageHistory.generateForPeriod(GarageHistoryPeriod.LAST_QUARTER, garageId, true);
    console.log(`Generation ended : ${new Date()}`);
  } catch (e) {
    console.log(`Error garage History generation: ${e}`);
  }
  process.exit(0);
});
