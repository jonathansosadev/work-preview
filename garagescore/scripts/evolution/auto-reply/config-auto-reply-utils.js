const { ObjectId } = require('mongodb');
const { getFileFromCl1p } = require('../../../common/lib/util/script-files');

const SourceTypes = require('../../../common/models/data/type/source-types');
const { ANASS, log} = require('../../../common/lib/util/log');

const conditionTranslation = {
  promoteur: 'promotor',
  passif: 'neutral',
  détracteur: 'detractor',
};

const fetchConfigCSV = async (fileId) => {
  return getFileFromCl1p(fileId);
};

// To test or not to test it. That's the question
const isRowValid = (rowStr) => {
  const [garageId, garageName, source, condition, replyText] = rowStr.split(';');
  // check garageId
  if (!ObjectId.isValid(garageId)) {
    if (process.argv.includes('--debug')) {
      log.debug(ANASS, `GarageId wrong : ${garageId}`);
    }
    return false;
  }
  // check source
  const sourceSupportsAutomaticReplies =
    SourceTypes.hasValue(source) && SourceTypes.getPropertyFromValue(source, 'automaticRepliesSupported');
  if (!sourceSupportsAutomaticReplies) {
    if (process.argv.includes('--debug')) {
      log.debug(ANASS, `source ${source} NOT supported`);
    }
    return false;
  }
  // check conditions
  if (!conditionTranslation.hasOwnProperty(condition)) {
    if (process.argv.includes('--debug')) {
      log.debug(ANASS, `condition ${conditon} NOT supported`);
    }
    return false;
  }
  // check reply text
  if (!replyText.length) {
    if (process.argv.includes('--debug')) {
      log.debug(ANASS, `empty text`);
    }
    return false;
  }
  return true;
};

const fillConfigForGarage = (configJson, garageId, source, rawCondition, replyText) => {
  configJson[garageId] = configJson[garageId] || {};
  configJson[garageId][source] = configJson[garageId][source] || {};
  const condition = conditionTranslation[rawCondition];
  configJson[garageId][source][condition] = configJson[garageId][source][condition] || new Set();
  configJson[garageId][source][condition].add(replyText);
  0;
};

const convertSetsToArrays = (configJson) => {
  for (const garageId in configJson) {
    for (const source in configJson[garageId]) {
      for (const condition in configJson[garageId][source]) {
        configJson[garageId][source][condition] = Array.from(configJson[garageId][source][condition]);
      }
    }
  }
};

const getConfigJson = (rows) => {
  const configJson = {};
  for (const rowStr of rows) {
    const [garageId, garageName, source, condition, replyText] = rowStr.split(';');
    fillConfigForGarage(configJson, garageId, source, condition, replyText);
  }
  // For reply texts: Convert the sets back to Arrays
  convertSetsToArrays(configJson);
  return configJson;
};

const configCsv2json = (csv) => {
  // Get the valid rows
  const rows = csv
    .split('\n')
    .map((rowStr) => rowStr.trim())
    .filter(isRowValid);
  // Build the object
  return getConfigJson(rows);
};

module.exports = {
  fetchConfigCSV,
  configCsv2json,
};
