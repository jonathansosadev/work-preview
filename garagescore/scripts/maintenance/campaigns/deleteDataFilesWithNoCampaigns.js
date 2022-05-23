'use strict';

/** Delete datafiles created today or another day with no campaign */

var moment = require('moment');
require('moment-timezone');
var async = require('async');
var { ObjectID } = require('mongodb');
var app = require('../../../server/server');
var DataFile = app.models.DataFile;
var Campaign = app.models.Campaign;
var day = process.argv.length > 2 ? moment(process.argv[2], 'DD/MM/YYYY') : new Date();
var garageId = process.argv.length > 3 && process.argv[3];
var d = moment.tz(day, 'Europe/Paris');
var todayStart = d.startOf('day').toDate();
var todayEnd = d.endOf('day').toDate();
var where = {
  and: [{ createdAt: { gte: todayStart } }, { createdAt: { lt: todayEnd } }],
};
console.log(garageId);
if (garageId) {
  where.garageId =
    garageId.indexOf(',') > 0
      ? { inq: garageId.split(',').map((g) => new ObjectID(g.trim())) }
      : new ObjectID(garageId);
}
console.log(JSON.stringify(where, null, 2));
DataFile.find({ where, fields: { id: 1 } }, function (findErr, datafiles) {
  if (findErr) {
    console.error(findErr);
    process.exit();
  }
  var datafilesIds = datafiles.map(function (df) {
    return df.id.toString();
  });
  console.log(datafilesIds.length + ' datafiles found');

  Campaign.find({ where, fields: { id: 1, dataFileId: 1 } }, function (findErr2, campaigns) {
    if (findErr2) {
      console.error(findErr2);
      process.exit();
    }
    console.log('(' + campaigns.length + ' campaigns found)');

    var remove = function (e) {
      var i = datafilesIds.indexOf(e);
      if (i > -1) {
        datafilesIds.splice(i, 1);
      }
    };
    campaigns.forEach(function (c) {
      remove(c.dataFileId);
    });
    console.log(datafilesIds.length + ' datafiles found without campaigns to be destroyed');

    async.forEachOfSeries(
      datafilesIds,
      function (datafilesId, p, next) {
        DataFile.destroyById(datafilesId, next);
      },
      function (e) {
        if (e) {
          console.error(e);
        }
        console.log('Done');
        process.exit();
      }
    );
  });
});
