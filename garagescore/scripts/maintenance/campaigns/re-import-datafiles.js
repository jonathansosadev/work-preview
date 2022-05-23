/**
Reimport all datafiles with an importedAt of a given day
Run with the first argument DD/MM/YYYY
Or with mulitple arguments if you need to process many dates
*/
const async = require('async');
const app = require('../../../server/server');
const reImportDatafile = require('./re-import-datafile');
const moment = require('moment');
require('moment-timezone');

const DataFile = app.models.DataFile;
// return a function processing a given date
const processDateFunction = (date) => {
  return (callback) => {
    const start = date.startOf('day').toDate();
    const end = date.endOf('day').toDate();
    console.log(`[DataFiles reimport] finding datafiles between [${start} ${end}]`);
    const where = { and: [] };
    where.and.push({ importedAt: { gte: start } });
    where.and.push({ importedAt: { lte: end } });
    console.log(JSON.stringify(where));
    DataFile.find({ where, fields: { id: true } }, (errFind, dataFiles) => {
      if (errFind) {
        console.error(errFind);
        callback();
      }
      console.log(`[DataFiles reimport] ${dataFiles.length} dataFiles found`);
      async.eachSeries(
        dataFiles,
        (dataFile, next) => {
          const fct = reImportDatafile(dataFile.getId().toString());
          fct((errReimport) => {
            if (errReimport) {
              console.error(errReimport);
            }
            next();
          });
        },
        (errSeries) => {
          if (errSeries) {
            console.error(errSeries);
          }
          callback();
        }
      );
    });
  };
};

const todo = [];
for (let i = 2; i < process.argv.length; i++) {
  const date = moment.tz(process.argv[i], 'DD/MM/YYYY', 'Europe/Paris');
  todo.push(processDateFunction(date));
}
async.series(todo, (err) => {
  if (err) {
    console.error(err);
  }
  console.log('[DataFiles reimport] Bye');
  process.exit();
});
