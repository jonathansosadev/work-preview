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
    totalForEmails: {
      $add: [
        projectKey('contactsCountValidEmails'),
        projectKey('contactsCountBlockedByEmail'),
        projectKey('contactsCountWrongEmails'),
        projectKey('contactsCountNotPresentEmails'),
      ],
    },
    countValidEmails: {
      $add: [projectKey('contactsCountValidEmails'), projectKey('contactsCountBlockedByEmail')],
    },
    countWrongEmails: projectKey('contactsCountWrongEmails'),
    countNotPresentEmails: projectKey('contactsCountNotPresentEmails'),
  };

  const $group = {
    _id: '$garageId',
    totalForEmails: { $sum: '$totalForEmails' },
    countValidEmails: { $sum: '$countValidEmails' },
    countWrongEmails: { $sum: '$countWrongEmails' },
    countNotPresentEmails: { $sum: '$countNotPresentEmails' },
  };

  const query = [{ $match }, { $project }, { $group }];

  try {
    return connector.aggregate(query).toArray();
  } catch (e) {
    log.error(FLO, `Fail : _aggregateKpiForValidEmails for period:  ${periodToken},  error : ${e}`);
    return [];
  }
};
