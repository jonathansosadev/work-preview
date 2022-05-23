/**
 related to issue #689
 */
var async = require('async');
var app = require('../../../server/server.js');

app.on('booted', function () {
  console.log('Clean started : ' + new Date());
  app.models.GarageHistory.getDoubles(function (err, res) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('count doubles ' + res.length);
    async.eachSeries(
      res,
      function (double, cb) {
        app.models.GarageHistory.destroyById(double.ids[1], cb);
      },
      function (err0) {
        if (err0) {
          console.error(err0);
          process.exit(-1);
        }
        console.log('Clean ended : ' + new Date());
        process.exit(0);
      }
    );
  });
});
