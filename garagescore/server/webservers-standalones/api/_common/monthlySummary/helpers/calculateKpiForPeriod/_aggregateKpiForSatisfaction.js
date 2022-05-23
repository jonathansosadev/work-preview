const { ObjectId } = require('mongodb');
const KpiDictionary = require('../../../../../../../common/lib/garagescore/kpi/KpiDictionary');
const { KpiTypes, DataTypes } = require('../../../../../../../frontend/utils/enumV2');
const { FLO, log } = require('../../../../../../../common/lib/util/log');

module.exports = async (garages, period, dataTypes, connector) => {
  const garageId = Array.isArray(garages)
    ? { $in: garages.map((g) => ObjectId(g.garageId)) }
    : ObjectId(garages.garageId);
  const periodToken = Array.isArray(period) ? { $in: period } : period;
  const projectKey = (key) => {
    return dataTypes && dataTypes.length
      ? {
          $add: dataTypes.map((type) => ({
            $ifNull: [`$${KpiDictionary[`${key}${DataTypes.getPropertyFromValue(type, 'acronym')}`]}`, 0],
          })),
        }
      : { $ifNull: [`$${KpiDictionary[key]}`, 0] };
  };

  const $match = {
    [KpiDictionary.garageId]: garageId,
    [KpiDictionary.period]: periodToken,
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    ponderatedScore: projectKey('satisfactionSumRating'),
    countSurveysResponded: projectKey('satisfactionCountReviews'),
    countSurveyPromotor: projectKey('satisfactionCountPromoters'),
    countSurveyPassive: projectKey('satisfactionCountPassives'),
    countSurveyDetractor: projectKey('satisfactionCountDetractors'),
  };

  const $group = {
    _id: '$garageId',
    countSurveysResponded: { $sum: '$countSurveysResponded' },
    countSurveyPromotor: { $sum: '$countSurveyPromotor' },
    countSurveyPassive: { $sum: '$countSurveyPassive' },
    countSurveyDetractor: { $sum: '$countSurveyDetractor' },
    ponderatedScore: {
      $sum: '$ponderatedScore',
    },
  };

  const query = [{ $match }, { $project }, { $group }];

  try {
    return connector.aggregate(query).toArray();
  } catch (e) {
    log.error(FLO, `Fail : _aggregateKpiForSatisfaction for period:  ${periodToken},  error : ${e}`);
    return [];
  }
};
