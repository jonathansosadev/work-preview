'use strict';
/**
Get all the datafiles in error today
Take their garageId and dataType before deleting them
run requestdaily... for each of them
===> campaigns will not be created => the script is useless while we use the hook (the program exit before the campaign creator)
*/

var moment = require('moment');
require('moment-timezone');
var async = require('async');

var app = require('../../../server/server');
var DataFile = app.models.DataFile;
var Garage = app.models.Garage;

var d = moment.tz(new Date(), 'Europe/Paris');
var today = d.startOf('day').toDate();
DataFile.find({ where: { importStatus: 'Error', createdAt: { gte: today } } }, function (findErr, datafiles) {
  if (findErr) {
    console.error(findErr);
    process.exit();
  }
  var pairs = [];
  for (var i = 0; i < datafiles.length; i++) {
    pairs.push({
      id: datafiles[i].id,
      garageId: datafiles[i].garageId,
      dataType: datafiles[i].dataType,
      dataFilePath: datafiles[i].filePath,
    });
  }
  console.log('[DataFile retry] ' + pairs.length + ' datafiles in errors today');
  var OK = [];
  var KO = [];
  async.forEachOfSeries(
    pairs,
    async function (pair, p, next) {
      console.log('[DataFile retry] ' + pair.garageId + ' ' + pair.dataType);
      await app.models.Customer.deleteOrMigrateDatasToAnotherGarage({ dataFilePath: pairs.dataFilePath });
      DataFile.destroyById(pair.id, function (errDel) {
        if (errDel) {
          console.error(errDel);
          KO.push(pair.garageId + '(' + pair.dataType + ')');
          next();
          return;
        }
        Garage.requestDailyImportsForGarageDataTypeAndDate(pair.garageId, pair.dataType, new Date(), function (e) {
          if (e) {
            console.error(e);
            KO.push(pair.garageId + '(' + pair.dataType + ')');
            next();
            return;
          }
          OK.push(pair.garageId + '(' + pair.dataType + ')');
          next();
        });
      });
    },
    function (errTotal) {
      if (errTotal) {
        console.error(errTotal);
      }
      console.log('[DataFile retry] OK ' + JSON.stringify(OK));
      console.log('[DataFile retry] KO ' + JSON.stringify(KO));
      console.log('[DataFile retry] done');
      process.exit();
    }
  );
});
