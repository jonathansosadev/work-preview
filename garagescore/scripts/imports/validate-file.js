'use strict';

/** Validate a file in S3 */
const args = process.argv.slice(2);
if (args.length !== 5) {
  console.error('Usage validate-file.js fileStore filePath importSchemaName dataType garageId');
  console.error('Go to /backoffice/data-file/file-importer and fill the form to generate a valid command line');
  process.exit();
}
const app = require('../../server/server');
const [fileStore, filePath, importSchemaName, dataType, garageId] = args;
const importOptions = '{}';
app.models.DataFile.validateImportFile(filePath, fileStore, importSchemaName, importOptions, dataType, garageId, (err, res) => {
  if (res.validationDetails) {
    // clean
    delete res.validationDetails.sample;
    delete res.validationDetails.columnLabels;
  }
  console.log(JSON.stringify({ err, res }, null, 2));
  process.exit();
});
