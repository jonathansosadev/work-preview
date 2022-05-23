/** Create campaign for one garge given a specific date n the format DD/MM/YYYY*/

const async = require('async');
const moment = require('moment');
require('moment-timezone');
const app = require('../../../server/server');
const date = moment(process.argv[2], 'DD/MM/YYYY');
const gIds = process.argv[3];

const garageIds = gIds.split(',').map((g) => g.trim());

console.log('[Campaigns creation for ' + new Date(date) + ' on ' + garageIds.length + ' garages] start');

async function main() {
  for (const garageId of garageIds) {
    try {
      console.log('Processing ' + garageId);
      await app.models.Garage.requestDailyImportsForGarage(garageId, date.toDate());
    } catch (e) {
      console.error(err);
    }
  }
  process.exit();
}

main();
