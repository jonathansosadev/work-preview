const MongoObjectID = require('mongodb').ObjectID;
const { ANASS, log } = require('../../../../../../../common/lib/util/log');
const KpiTypes = require('../../../../../../../common/models/kpi-type');
const kpiDictionary = require('../../../../../../../common/lib/garagescore/kpi/KpiDictionary');

/**
 * Performing an aggregate on datas to produce numbers displayed in Leads tab
 * https://docs.mongodb.com/manual/reference/method/db.collection.aggregate
 * Aggregate is a MongoDB operation that enables querying and treating documents on several stages
 * The aggregate I will be doing has 3 stages:
 *     - $match :   This stage is similar to a regular find.
 *                  With it I will fetch the relevant datas documents, sales converting leads for the considered period & garages
 *     - $project : this stage adds fields in the documents. I will use it to conditionally set fields to 0 or 1.
 *                  A field will take the name of the information I want to check and be set to 1 if true, 0 else
 *     - $group :   groups all documents into a set of documents defined by the key used.
 *                  I will sum the fields projected earlier, which will give me a count for each considered information
 */
module.exports = async (garages, period, dataType, connector) => {
  const garageId = Array.isArray(garages)
    ? { $in: garages.map((g) => new MongoObjectID(g.garageId)) }
    : new MongoObjectID(garages.garageId);
  const periodToken = Array.isArray(period) ? { $in: period } : period;
  const shortType = { NewVehicleSale: 'Vn', UsedVehicleSale: 'Vo', '': '' };
  const getExpr = (key, type = '') => ({ $ifNull: [`$${kpiDictionary[key + shortType[type]]}`, 0] });
  const getKpiExpr = (key) => (dataType ? { $add: dataType.map((type) => getExpr(key, type)) } : getExpr(key));

  // Setup MongoDB Matching
  const $match = {
    [kpiDictionary.garageId]: garageId,
    [kpiDictionary.period]: periodToken,
    [kpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };

  /** Setup MongoDB Projection For LEADS TAB
   * Each d0ocument that were kept from the $match stage above will then be transformed into a synthetic document.
   * This document will look like this :
   * {
   *    garageId: 'garageId transposed from the document',
   *    fieldOne: 1 or 0 depending on the condition that was specified
   *    ... other fields
   * }
   */
  const $project = {
    garageId: `$${kpiDictionary.garageId}`,
    convertedLeads: getKpiExpr('countConvertedLeads'),
    convertedTradeIns: getKpiExpr('countConvertedTradeIns'),
    convertedLeadsNewProjects: getKpiExpr('countConvertedLeadsNewProjects'),
    convertedTradeInsNewProjects: getKpiExpr('countConvertedTradeInsNewProjects'),
    convertedLeadsKnownProjects: getKpiExpr('countConvertedLeadsKnownProjects'),
    convertedTradeInsKnownProjects: getKpiExpr('countConvertedTradeInsKnownProjects'),
    convertedLeadsWonFromCompetition: getKpiExpr('countConvertedLeadsWonFromCompetition'),
    convertedTradeInsWonFromCompetition: getKpiExpr('countConvertedTradeInsWonFromCompetition'),
  };

  /** Setup MongoDB Grouping
   * The documents that were obtained from the previous $project stage will now be grouped by their garageId
   * Basically we'll be taking all documents that share the same garageId into a group
   * In a group we'll increment each field (we keep the same names) when coming across a 1, giving us our counts
   */
  const $group = { _id: '$garageId' };
  for (const projection of Object.keys($project)) {
    if (projection !== 'garageId') {
      $group[projection] = { $sum: `$${projection}` };
    }
  }

  // Fancy to get the aggregate running in Robot3T ? Print the output of the following line
  const query = [{ $match }, { $project }, { $group }];
  // Getting Aggregation Result Directly From MongoDB
  try {
    return await connector.aggregate(query).toArray();
  } catch (err) {
    log.error(ANASS, `Fail : _aggregateKpiForLeads for period:  ${periodToken},  error : ${err}`);
    return [];
  }
};
