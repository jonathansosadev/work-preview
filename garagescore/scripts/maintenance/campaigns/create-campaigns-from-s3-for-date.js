/** Create campaign for every garges given a specific date n the format DD/MM/YYYY*/

var moment = require('moment');
require('moment-timezone');
var app = require('../../../server/server');
var date = moment(process.argv[2], 'DD/MM/YYYY');
console.log('[Campaigns creation ' + date + '] start');
app.models.Garage.requestDailyImportsForDate(date.toDate()).then(() => {
  console.log('[Campaigns creation ' + date + '] end');
  process.exit();
});
