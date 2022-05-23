const DataTypes = require('../../../models/data/type/data-types');

/* Helper function that send back computed fields for a pipeline stage */
/*
usage example :
const fields = { satisfactionCountReviews: 'countSurveysResponded', satisfactionCountPromoters: 'countSurveyPromotor'};
getProjectFields(fields, excludeList = ["satisfactionCountPromoters"]);

returns:
{
  "satisfactionCountReviews": "$countSurveysResponded",
  "satisfactionCountReviewsApv": "$historyByType.Maintenance.countSurveysResponded",
  "satisfactionCountReviewsVn": "$historyByType.NewVehicleSale.countSurveysResponded",
  "satisfactionCountReviewsVo": "$historyByType.UsedVehicleSale.countSurveysResponded",
  "satisfactionCountPromoters": "$countSurveyPromotor"
}
*/
const TYPES = [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE];
// $ifNull to be able to return 0 instead of undefined/null
const divide = (a, b) => ({
  $cond: [{ $eq: [b, 0] }, 0, { $divide: [{ $ifNull: [a, 0] }, b] }],
});

function getProjectFields(fields = {}, excludeList = []) {
  const res = {};
  for (let [kpiField, ghField] of Object.entries(fields)) {
    // basic no dataType
    res[kpiField] = `$${ghField}`;
    // with dataTypes
    if (!excludeList.includes(kpiField)) {
      TYPES.forEach((type) => {
        return (res[`${kpiField}${DataTypes.getAcronymFromJobPartial(type)}`] = `$historyByType.${type}.${ghField}`);
      });
    }
  }
  return res;
}

function getGroupFields(fields = {}, excludeList = []) {
  const res = {};
  const sum = (field) => {
    return {
      $sum: { $ifNull: [`$${field}`, 0] },
    };
  };

  for (const kpiField in fields) {
    // basic no dataType
    res[kpiField] = sum(kpiField);
    // with dataTypes
    if (!excludeList.includes(kpiField)) {
      TYPES.forEach((type) => {
        const suffixed = `${kpiField}${DataTypes.getAcronymFromJobPartial(type)}`;
        res[suffixed] = sum(suffixed);
      });
    }
  }

  return res;
}

function getFinalProjectFields(fields = {}, excludeList = []) {
  const res = {};

  for (const kpiField in fields) {
    // basic no dataType
    res[kpiField] = 1;
    // with dataTypes
    if (!excludeList.includes(kpiField)) {
      TYPES.forEach((type) => {
        return (res[`${kpiField}${DataTypes.getAcronymFromJobPartial(type)}`] = 1);
      });
    }
  }
  return res;
}

function getProjectNPS() {
  return [null, ...TYPES].reduce((acc, type) => {
    acc[`satisfactionNPS${type ? DataTypes.getAcronymFromJobPartial(type) : ''}`] = {
      $multiply: [
        {
          $subtract: [
            divide(
              `$${type ? `historyByType.${type}.` : ''}countSurveyPromotor`,
              `$${type ? `historyByType.${type}.` : ''}countSurveysResponded`
            ),
            divide(
              `$${type ? `historyByType.${type}.` : ''}countSurveyDetractor`,
              `$${type ? `historyByType.${type}.` : ''}countSurveysResponded`
            ),
          ],
        },
        100,
      ],
    };
    return acc;
  }, {});
}

function getFinalProjectNPS() {
  return [null, ...TYPES].reduce((acc, type) => {
    const dataTypeAcronym = type ? DataTypes.getAcronymFromJobPartial(type) : '';
    acc[`satisfactionNPS${dataTypeAcronym}`] = {
      $multiply: [
        {
          $subtract: [
            divide(`$satisfactionCountPromoters${dataTypeAcronym}`, `$satisfactionCountReviews${dataTypeAcronym}`),
            divide(`$satisfactionCountDetractors${dataTypeAcronym}`, `$satisfactionCountReviews${dataTypeAcronym}`),
          ],
        },
        100,
      ],
    };
    return acc;
  }, {});
}

module.exports = { getProjectFields, getGroupFields, getFinalProjectFields, getProjectNPS, getFinalProjectNPS };
