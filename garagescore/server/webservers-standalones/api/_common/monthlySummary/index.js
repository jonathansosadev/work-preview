const garageType = require('../../../../../common/models/garage.type');
const KpiDictionary = require('../../../../../common/lib/garagescore/kpi/KpiDictionary');
const { KpiTypes } = require('../../../../../frontend/utils/enumV2');

module.exports = {
  /**
   * calculate email rate with the same result in cockpit
   * @param {object} app app server
   * @param {Number} periodM current month like 202203
   * @return {Promise<object[]>} kpis
   */
  async emailKpi(app, periodM) {
    // retrieve garages
    const directGarage = app.models.Garage.getMongoConnector();
    const garageIds = (
      await directGarage
        .find({ type: { $in: [garageType.DEALERSHIP, garageType.AGENT, garageType.CAR_REPAIRER] } }, { _id: true })
        .toArray()
    ).map((g) => g._id);

    const query = [
      {
        $match: {
          [KpiDictionary.garageId]: { $in: garageIds },
          [KpiDictionary.period]: periodM,
          [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
        },
      },
      {
        $group: {
          _id: null,
          countValidEmails: {
            $sum: { $ifNull: [`$${KpiDictionary.contactsCountValidEmails}`, 0] },
          },
          countBlockedByEmail: {
            $sum: { $ifNull: [`$${KpiDictionary.contactsCountBlockedByEmail}`, 0] },
          },
          countWrongEmails: {
            $sum: { $ifNull: [`$${KpiDictionary.contactsCountWrongEmails}`, 0] },
          },
          countNotPresentEmails: {
            $sum: { $ifNull: [`$${KpiDictionary.contactsCountNotPresentEmails}`, 0] },
          },
        },
      },
      {
        $project: {
          validEmails: {
            $add: ['$countValidEmails', '$countBlockedByEmail'],
          },
          totalEmail: {
            $add: ['$countValidEmails', '$countBlockedByEmail', '$countWrongEmails', '$countNotPresentEmails'],
          },
        },
      },
      {
        $project: {
          count: '$validEmails',
          total: '$totalEmail',
          result: {
            $cond: [{ $gt: ['$totalEmail', 0] }, { $divide: ['$validEmails', '$totalEmail'] }, null],
          },
        },
      },
    ];

    return app.models.KpiByPeriod.getMongoConnector().aggregate(query).toArray();
  },
};
