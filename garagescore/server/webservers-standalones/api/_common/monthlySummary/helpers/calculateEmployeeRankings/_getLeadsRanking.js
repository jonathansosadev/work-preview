const MongoObjectID = require('mongodb').ObjectID;
const { ANASS, log } = require('../../../../../../../common/lib/util/log');
const KpiTypes = require('../../../../../../../common/models/kpi-type');
const kpiDictionary = require('../../../../../../../common/lib/garagescore/kpi/KpiDictionary');

module.exports = async (garages, periods, dataType, connector) => {
  const garageId = Array.isArray(garages)
    ? { $in: garages.map((g) => new MongoObjectID(g.garageId)) }
    : new MongoObjectID(garages.garageId);
  const shortType = { NewVehicleSale: 'Vn', UsedVehicleSale: 'Vo', '': '' };
  const getExpr = (key, type = '') => ({ $ifNull: [`$${kpiDictionary[key + shortType[type]]}`, 0] });
  const getKpiExpr = (key) => (dataType ? { $add: dataType.map((type) => getExpr(key, type)) } : getExpr(key));

  // Setup MongoDB Matching
  const $match = {
    [kpiDictionary.garageId]: garageId,
    [kpiDictionary.period]: periods.M,
    [kpiDictionary.kpiType]: KpiTypes.FRONT_DESK_USER_KPI, // Because it's for unsatisfied
    [kpiDictionary.userId]: { $ne: 'ALL_USERS' },
  };

  /** Setup MongoDB Projection For LEADS TAB */
  const $project = {
    userId: `$${kpiDictionary.userId}`,
    garageId: `$${kpiDictionary.garageId}`,
    convertedLeadsM: { $add: [getKpiExpr('countConvertedLeads'), getKpiExpr('countConvertedTradeIns')] },
  };

  /** Setup MongoDB Grouping */
  const $group = {
    _id: '$userId',
    garageId: { $first: '$garageId' },
    employeeName: { $first: '$userId' },
    convertedLeadsM: { $sum: '$convertedLeadsM' },
  };

  /*
    Keeping the 25 highest number of conversions for this month. We'll refine and keep the 5 best later.
    Why keeping more than 5 ? If we ever have ex-aequo employees, we need another deciding factor.
    Why not keeping them all and do the $limit later ? Performance !
  */
  const sortLimit1 = [{ $sort: { convertedLeadsM: -1 } }, { $limit: 25 }];

  /* $lookup enables us to retrieve another document, works like an outer join for those familiar with SQL */
  const $lookups = [
    {
      /* 1st lookup, retreiving the number of conversions for this month */
      $lookup: {
        from: 'kpiByPeriod', // Yes we can join from the same collection
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Matching the USER_KPI for this user on this month
                  { $eq: [`$${kpiDictionary.userId}`, '$$userId'] },
                  { $in: [`$${kpiDictionary.garageId}`, garageId.$in] },
                  {
                    $in: [`$${kpiDictionary.period}`, periods['12M']],
                  },
                  { $eq: [`$${kpiDictionary.kpiType}`, KpiTypes.FRONT_DESK_USER_KPI] },
                ],
              },
            },
          },
          {
            $project: {
              // Extracting the number of conversions = countConvertedLeads + countConvertedTradeIns
              convertedLeads12M: {
                $ifNull: [{ $add: [getKpiExpr('countConvertedLeads'), getKpiExpr('countConvertedTradeIns')] }, 0],
              },
            },
          },
          {
            $group: {
              _id: null,
              convertedLeads12M: { $sum: '$convertedLeads12M' },
            },
          },
        ],
        as: 'lookup12M',
      },
    },
    {
      /* 2nd lookup, retreiving the number of conversions for last month */
      $lookup: {
        from: 'kpiByPeriod',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Matching the USER_KPI for this user on last month
                  { $eq: [`$${kpiDictionary.userId}`, '$$userId'] },
                  { $in: [`$${kpiDictionary.garageId}`, garageId.$in] },
                  { $eq: [`$${kpiDictionary.period}`, periods.M1] },
                  { $eq: [`$${kpiDictionary.kpiType}`, KpiTypes.FRONT_DESK_USER_KPI] },
                ],
              },
            },
          },
          {
            $project: {
              // Extracting the number of conversions = countConvertedLeads + countConvertedTradeIns
              convertedLeadsM1: {
                $ifNull: [{ $add: [getKpiExpr('countConvertedLeads'), getKpiExpr('countConvertedTradeIns')] }, 0],
              },
            },
          },
        ],
        as: 'lookupM1',
      },
    },
  ];

  /*
    We use $replaceRoot to merge the flatten the documents.
    Having $root.convertedLeadsM instead of $root.lookupM.convertedLeadsM
    Then we remove lookupUser, lookup12M and lookupM1 from the documents
  */
  const $replaceRoot = {
    newRoot: {
      $mergeObjects: [{ $arrayElemAt: ['$lookup12M', 0] }, { $arrayElemAt: ['$lookupM1', 0] }, '$$ROOT'],
    },
  };
  const $project2 = {
    lookupUser: 0,
    lookup12M: 0,
    lookupM1: 0,
  };
  /* Eliminating employees having 0 conversions */
  const $match2 = { convertedLeads12M: { $gt: 0 } };

  /*
    Keeping the 5 best employees for this month.
    In case of ex-aequo, taking 12 last months and the last month into consideration
  */
  const sortLimit2 = [
    { $sort: { convertedLeadsM: -1, convertedLeads12M: -1, convertedLeadsM1: -1 } }, // The order of keys is important here
    { $limit: 5 },
  ];

  // Fancy to get the aggregate running in Robot3T ? Print the output of the following line
  const query = [
    { $match },
    { $project },
    { $group },
    ...sortLimit1,
    ...$lookups,
    { $replaceRoot },
    { $project: $project2 },
    { $match: $match2 },
    ...sortLimit2,
  ];
  // Getting Aggregation Result Directly From MongoDB
  try {
    return await connector.aggregate(query).toArray();
  } catch (err) {
    log.error(ANASS, `Fail :_getLeadsRanking error : ${err}`);
    return [];
  }
};
