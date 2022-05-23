'use strict';

/** Import a file from S3 automation-only*/
const args = process.argv.slice(2);
if (args.length !== 5) {
  console.error('Usage import-file-automation.js fileStore filePath importSchemaName dataType garageId');
  console.error('Go to /backoffice/data-file/file-importer and fill the form to generate a valid command line');
  process.exit();
}
const app = require('../../server/server');
const [fileStore, filePath, importSchemaName, dataType, garageId] = args;
const importAutomation = true;
app.models.DataFile.importFromFileStore(
  garageId,
  fileStore,
  filePath,
  importSchemaName,
  dataType,
  importAutomation,
  (err, res) => {
    if (err) {
      console.error('Something went wrong');
      console.error(err);
    } else if (res.length !== 0) {
      console.error('Something went wrong');
      console.error(`${res.length} satisfaction campaigns created`);
    } else {
      console.log('Import done!');
    }
    process.exit();
  }
);
