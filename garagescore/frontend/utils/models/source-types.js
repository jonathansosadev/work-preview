import {
  SourceTypes
} from '../enumV2';

const SourcesTypesEnum = {...SourceTypes};
const types = SourcesTypesEnum.keys();

SourcesTypesEnum.isExogenous = function (source) {
  if (!source) throw new Error('source argument (ex: Google) is missing');
  if (!SourceTypesEnum.hasValue(source)) throw new Error(`${source} is not a SourceType Enum`);  
  const type = types.find((key) => SourceTypesEnum[key] === source);
  return SourceTypesEnum.getProperty(type, 'isExogenous');
};

SourcesTypesEnum.getValue = function (sourceTypeLowerCase) {
  const value = types.find((key) => {
    if (SourcesTypesEnum[key].toLowerCase() === sourceTypeLowerCase.toLowerCase()) return key;
  })
  return SourcesTypesEnum[value];
};

SourcesTypesEnum.canHaveALeadOrUnsatisfiedTicket = function () {
  return types.filter((key) => {
      if (SourcesTypesEnum.getProperty(key, 'canHaveALeadOrUnsatisfiedTicket')) return key;
    })
    .map((source) => SourcesTypesEnum[source]);
};

SourcesTypesEnum.supportedCrossLeadsSources = function () {
  return types.filter((key) => {
      if (SourcesTypesEnum.getProperty(key, 'supportedCrossLeadsSources')) return key;
    })
    .map((source) => SourcesTypesEnum[source]);
};

SourcesTypesEnum.getCategory = function (sourceType) {
  const category = types.find((key) => {
    if (SourcesTypesEnum[key] === sourceType) return key;
  });
  return SourcesTypesEnum.getProperty(category, 'category');
};

SourcesTypesEnum.saleType = function (sourceType) {
  // Get default saleType according to the source type
  const saleType = types.find((key) => {
    if (SourcesTypesEnum[key] === sourceType) return key;
  });
  return SourcesTypesEnum.getProperty(saleType, 'saleType');
};

SourcesTypesEnum.typeToInt = function (type) {
  // for kpis
  const typeToInt = types.find((key) => {
    if (SourcesTypesEnum[key] === type) return key;
  });
  return SourcesTypesEnum.getProperty(typeToInt, 'intValue');
};

SourcesTypesEnum.intToType = function (int) {
  const intValue = types.find((key) => {
    if (SourcesTypesEnum.getProperty(key, 'intValue') === int) return key;
  });
  return SourcesTypesEnum[intValue];
};

export default SourcesTypesEnum;
