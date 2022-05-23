/** Take a transform function name, options and transform a string content*/
var tsv2csv = require('./tsv-to-csv.js');
var vsv2csv = require('./vsv-to-csv.js');
var psv2csv = require('./psv-to-csv.js');
var headerlessCsv = require('./headerless-csv.js');
var colsizeCsv = require('./colsize-csv.js');
const fixedLengthToCsv = require('./fixed-length-to-csv');

var transform = function transform(name, options, content, dataFileType) {
  if (name === 'tsv-to-csv') {
    return tsv2csv.transform(options, content);
  }
  if (name === 'vsv-to-csv') {
    return vsv2csv.transform(options, content);
  }
  if (name === 'psv-to-csv') {
    return psv2csv.transform(options, content);
  }
  if (name === 'fixedlength-to-csv') {
    return fixedLengthToCsv.transform(options, content);
  }
  if (name === 'headerless-csv') {
    return headerlessCsv.transform(options, content, dataFileType);
  }
  if (name === 'colsize-csv') {
    return colsizeCsv.transform(options, content);
  }
  return content;
};

module.exports = {
  transform: transform,
};
