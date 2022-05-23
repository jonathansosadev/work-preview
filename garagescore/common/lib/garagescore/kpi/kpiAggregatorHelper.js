const DataTypes = require('../../../models/data/type/data-types');
const { ObjectId } = require('mongodb');

const TYPES = [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE];

/**
 * Get fields with DataTypes accronyms
 * @param {String} field
 * @returns {object} Object for $project in aggregate
 */
function projectFields(field = '', initialCondition = {}) {
  const res = {};
  res[field] = {
    $cond: { if: initialCondition, then: 1, else: 0 },
  };

  TYPES.forEach((type) => {
    res[`${field}${DataTypes.getAcronymFromJobPartial(type)}`] = {
      $cond: {
        if: {
          $and: [
            initialCondition,
            {
              $eq: ['$type', type],
            },
          ],
        },
        then: 1,
        else: 0,
      },
    };
  });

  return res;
}

/**
 * Get Middlemans and Categories fields with DataTypes accronyms
 * @param {object} enumV2
 * @param {function} serviceCondition
 * @returns {object} Object for $project in aggregate
 */
function projectMiddleMansAndCategoriesFields(enumV2, serviceCondition) {
  if (!enumV2 || !serviceCondition) {
    console.error('projectMiddleMansAndCategoriesFields: missing required params');
    return {};
  }

  return enumV2
    .values()
    .map((service) => projectFields(enumV2.getPropertyFromValue(service, 'kpiByPeriodKey'), serviceCondition(service)))
    .reduce((acc, cv) => ({ ...acc, ...cv }));
}

/**
 * Sum all fields with their datatypes
 * @param {String[]} [fields]
 * @returns {object} Object for $group in aggregate
 */
function groupFields(fields = []) {
  const res = {};

  fields.forEach((field) => {
    res[field] = { $sum: `$${field}` };

    TYPES.forEach((type) => {
      res[`${field}${DataTypes.getAcronymFromJobPartial(type)}`] = {
        $sum: `$${field}${DataTypes.getAcronymFromJobPartial(type)}`,
      };
    });
  });

  return res;
}

/**
 * Get the ratings with datatypes
 * @param {String} field
 * @returns {object} Object for $project in aggregate
 */
function getSumRatingsFields(field = '', hasResponded = { $and: [] }) {
  const res = {};

  res[field] = {
    $cond: {
      if: {
        ...hasResponded,
      },
      then: '$review.rating.value',
      else: 0,
    },
  };

  TYPES.forEach((type) => {
    res[`${field}${DataTypes.getAcronymFromJobPartial(type)}`] = {
      $cond: {
        if: {
          $and: [...hasResponded.$and, { $eq: ['$type', type] }],
        },
        then: '$review.rating.value',
        else: 0,
      },
    };
  });

  return res;
}

/**
 * Project all fields with their datatypes
 * @param {String[]} [fields]
 * @returns {object} Object for $project in aggregate
 */
function finalProjectFields(fields = []) {
  const res = {};

  fields.forEach((field) => {
    res[field] = 1;

    TYPES.forEach((type) => {
      res[`${field}${DataTypes.getAcronymFromJobPartial(type)}`] = 1;
    });
  });

  return res;
}

/**
 * add $match on garageId condition to the query
 * @param {string[] | ObjectId[]} garageIds
 * @param {"string" | "objectId"} type - type of garageIds (string or ObjectId)
 * @returns {{} | {garageId : string | ObjectId} | {garageId : {$in : string[] | ObjectId[]}}} - $match condition
 */
function addMatchOnGarageId(garageIds = [], type = 'string') {
  const convertToType = (garageId = '') => {
    if (type === 'string') {
      return garageId.toString();
    }
    return ObjectId(garageId);
  };

  if (!garageIds || !garageIds.length) {
    return {};
  }

  if (garageIds.length === 1) {
    return { garageId: convertToType(garageIds[0]) };
  }

  return { garageId: { $in: garageIds.map(convertToType) } };
}

module.exports = {
  projectFields,
  projectMiddleMansAndCategoriesFields,
  getSumRatingsFields,
  groupFields,
  finalProjectFields,
  addMatchOnGarageId,
};
