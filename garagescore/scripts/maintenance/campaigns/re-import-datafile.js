/**
Reimport one datafile from its id
*/
const async = require('async');
require('moment-timezone');
const dataFileStatus = require('../../../common/models/data-file.status');

const app = require('../../../server/server');

const DataFile = app.models.DataFile;

// return a function processing a given dataFileId
const processDataFile = (dataFileId) => {
  return (callback) => {
    console.log(`[DataFile reimport] Process ${dataFileId}`);
    DataFile.findById(dataFileId, async (errFind, dataFile) => {
      if (errFind) {
        console.error(errFind.message);
        callback(errFind);
        return;
      }
      if (!dataFile) {
        console.error('No dataFile found', dataFileId);
        callback();
        return;
      }
      // clean customers and datas
      await app.models.Customer.deleteOrMigrateDatasToAnotherGarage({ dataFilePath: dataFile.filePath });
      // set temporary status
      const oldStatus = dataFile.status;
      const oldImportStatus = dataFile.importStatus;
      const oldImportedAt = dataFile.importedAt;
      const reimportStatus = `REIMPORT_${Date.now()}`;
      dataFile.status = reimportStatus; // eslint-disable-line
      dataFile.importStatus = dataFileStatus.RETRY; // eslint-disable-line
      dataFile.save((updateErr) => {
        if (updateErr) {
          console.error(updateErr.message);
          callback(updateErr);
        }
        // reimport
        DataFile.reImportDataFile(dataFileId, (err) => {
          if (err) {
            console.error(err);
          }
          console.log(`[DataFile reimport] ${dataFileId} Done`);
          // go back to former status
          DataFile.findById(dataFileId, (find2Err, dataFile) => {
            if (find2Err) {
              console.error(find2Err.message);
              callback(find2Err);
              return;
            }
            dataFile.status = oldStatus; // eslint-disable-line
            dataFile.importStatus = oldImportStatus; // eslint-disable-line
            dataFile.reimportStatus = reimportStatus; // eslint-disable-line
            dataFile.importedAt = oldImportedAt; // eslint-disable-line
            dataFile.save((update2Err) => {
              if (update2Err) {
                console.error(update2Err.message);
                callback(update2Err);
                return;
              }
              callback();
              return;
            });
          });
        });
      });
    });
  };
};
module.exports = processDataFile;
if (require.main === module) {
  const todo = [];
  for (let i = 2; i < process.argv.length; i++) {
    todo.push(processDataFile(process.argv[i]));
  }
  async.series(todo, (err) => {
    if (err) {
      console.error(err);
    }
    console.log('[DataFile reimport] Bye');
    process.exit();
  });
}
