const { SourceTypes } = require('../../../../frontend/utils/enumV2');

const SourceTypesEnum = { ...SourceTypes };
const types = SourceTypesEnum.keys();
const { log, FED } = require('../../../lib/util/log');

SourceTypesEnum.isExogenous = function (source) {
  if (!source) throw new Error('source argument (ex: Google) is missing');
  if (!SourceTypesEnum.hasValue(source)) throw new Error(`${source} is not a SourceType Enum`);
  const type = types.find((key) => SourceTypesEnum[key] === source);
  return SourceTypesEnum.getProperty(type, 'isExogenous');
};

SourceTypesEnum.getValue = function (sourceTypeLowerCase) {
  const value = types.find((key) => {
    if (SourceTypesEnum[key].toLowerCase() === sourceTypeLowerCase.toLowerCase()) return key;
  });
  return SourceTypesEnum[value];
};

/*
 * Filter the source types array according to the input property
 * @param property {string} The filtered property
 * @returns {Array} Returns the source type values that have the filtered property to true
 */
SourceTypesEnum.getSourceTypesFromProperty = function (property) {
  return types
    .filter((key) => {
      if (SourceTypesEnum.getProperty(key, property)) return key;
    })
    .map((source) => SourceTypesEnum[source]);
};

SourceTypesEnum.canHaveALeadOrUnsatisfiedTicket = function () {
  return SourceTypesEnum.getSourceTypesFromProperty('canHaveALeadOrUnsatisfiedTicket');
};

SourceTypesEnum.supportedDealershipSources = function () {
  return SourceTypesEnum.getSourceTypesFromProperty('isDealership');
};

SourceTypesEnum.supportedCrossLeadsSources = function () {
  return SourceTypesEnum.getSourceTypesFromProperty('supportedCrossLeadsSources');
};

SourceTypesEnum.supportedManualSources = function () {
  return SourceTypesEnum.getSourceTypesFromProperty('manualLeadSource');
};

SourceTypesEnum.supportedExogenousSources = function () {
  return types
    .filter((key) => {
      return SourceTypesEnum.getProperty(key, 'isExogenous') ? true : false;
    })
    .map((source) => SourceTypesEnum[source]);
};

SourceTypesEnum.isLeadTicketSupported = function (source) {
  return [
    SourceTypesEnum.DATAFILE,
    SourceTypesEnum.MANUAL_LEAD,
    SourceTypesEnum.AUTOMATION,
    ...SourceTypesEnum.supportedCrossLeadsSources(),
  ].includes(source);
};

SourceTypesEnum.getCategory = function (sourceType) {
  const category = types.find((key) => {
    if (SourceTypesEnum[key] === sourceType) return key;
  });
  return category && SourceTypesEnum.getProperty(category, 'category');
};

SourceTypesEnum.saleType = function (sourceType) {
  // Get default saleType according to the source type
  const saleType = types.find((key) => {
    if (SourceTypesEnum[key] === sourceType) return key;
  });
  return SourceTypesEnum.getProperty(saleType, 'saleType');
};

SourceTypesEnum.typeToInt = function (type) {
  // for kpis
  const key = types.find((key) => SourceTypesEnum[key] === type);
  if (!key) {
    log.error(FED, `Type ${type} is not in enum ${key}.`);
  }
  return SourceTypesEnum.getProperty(key, 'intValue');
};

SourceTypesEnum.intToType = function (int) {
  const intValue = types.find((key) => {
    if (SourceTypesEnum.getProperty(key, 'intValue') === int) return key;
  });
  return SourceTypesEnum[intValue];
};

module.exports = SourceTypesEnum;
