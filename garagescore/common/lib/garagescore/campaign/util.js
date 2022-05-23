var debug = require('debug')('garagescore:common:lib:garagescore:campaign:util'); // eslint-disable-line max-len,no-unused-vars
var moment = require('moment');
var util = require('util');

function getStandardDescription(options) {
  var standardCreateMoment = moment();

  var standardDescription = util.format(
    'Created on %s at %s - type : %s.\nBased on DataRecord Sheet with id "%s" ("%s" on %s).',
    standardCreateMoment.format('dddd, MMMM Do YYYY'),
    standardCreateMoment.format('HH:mm:ss'),
    options.campaignType,
    options.dataFile.id,
    options.dataFile.filePath,
    options.dataFile.fileStore
  );

  return standardDescription;
}

module.exports = {
  getStandardDescription: getStandardDescription,
};
