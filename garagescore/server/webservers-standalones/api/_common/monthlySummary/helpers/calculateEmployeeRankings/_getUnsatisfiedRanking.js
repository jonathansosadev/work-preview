const MongoObjectID = require('mongodb').ObjectID;
const { ANASS, log } = require('../../../../../../../common/lib/util/log');
const KpiTypes = require('../../../../../../../common/models/kpi-type');
const kpiDictionary = require('../../../../../../../common/lib/garagescore/kpi/KpiDictionary');

module.exports = async (garages, periods, dataType, connector) => {
  const garageId = Array.isArray(garages)
    ? { $in: garages.map((g) => new MongoObjectID(g.garageId)) }
    : new MongoObjectID(garages.garageId);
  const shortType = { Maintenance: 'Apv', NewVehicleSale: 'Vn', UsedVehicleSale: 'Vo', '': '' };
  const getExpr = (key, type = '') => ({ $ifNull: [`$${kpiDictionary[key + shortType[type]]}`, 0] });
  const getKpiExpr = (key) => (dataType ? { $add: dataType.map((type) => getExpr(key, type)) } : getExpr(key));

  // Setup MongoDB Matching
  const $match = {
    [kpiDictionary.garageId]: garageId,
    [kpiDictionary.period]: periods.M,
    [kpiDictionary.kpiType]: KpiTypes.USER_KPI, // Because it's for unsatisfied
    [kpiDictionary.userId]: { $ne: 'ALL_USERS' },
  };

  if (dataType && dataType.length) {
    $match.$or = dataType.map((type) => {
      const cond = {};
      cond[kpiDictionary[`countUnsatisfied${shortType[type || '']}`]] = { $gt: 0 };
      return cond;
    });
  } else {
    $match[kpiDictionary.countUnsatisfied] = { $gt: 0 };
  }

  /** Setup MongoDB Grouping */
  const $group = {
    _id: `$${kpiDictionary.userId}`,
    garageId: { $first: `$${kpiDictionary.garageId}` },
    countUnsatisfied: { $sum: getKpiExpr('countUnsatisfied') },
    countUnsatisfiedResolved: { $sum: getKpiExpr('countUnsatisfiedClosedWithResolution') },
  };

  /** Setup MongoDB Projection For PROBLEM RESOLUTION TAB */
  const $project = {
    garageId: '$garageId',
    solvingRateM: {
      $multiply: [{ $divide: ['$countUnsatisfiedResolved', '$countUnsatisfied'] }, 100],
    },
  };

  /*
    Keeping the 25 highest number of conversions for this month. We'll refine and keep the 5 best later.
    Why keeping more than 5 ? If we ever have ex-aequo employees, we need another deciding factor.
    Why not keeping them all and do the $limit later ? Performance !
  */
  const sortLimit1 = [{ $sort: { solvingRateM: -1 } }, { $limit: 25 }];

  /* $lookup enables us to retrieve another document, works like an outer join for those familiar with SQL */
  const $lookups = [
    {
      /* 1st $lookup, find user with its _id, and then extract its fullName */
      $lookup: {
        from: 'User',
        let: { userId: '$_id' },
        pipeline: [
          // Matching User._id with the userId variable we declared above
          { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
          {
            $project: {
              // Extracting the employeeName which is User.fullName || `${User.firstName} ${User.lastName}`
              employeeName: {
                $ifNull: [
                  '$fullName',
                  { $concat: [{ $ifNull: ['$firstName', ''] }, ' ', { $ifNull: ['$lastName', ''] }] },
                ],
              },
            },
          },
        ],
        as: 'lookupUser',
      },
    },
    {
      /* 2nd lookup, retreiving the resolution rate for this month */
      $lookup: {
        from: 'kpiByPeriod',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  // Matching the USER_KPI for this user on this month
                  { $eq: [`$${kpiDictionary.userId}`, '$$userId'] },
                  {
                    $in: [`$${kpiDictionary.period}`, periods['12M']],
                  },
                  { $eq: [`$${kpiDictionary.kpiType}`, KpiTypes.USER_KPI] },
                  dataType // This one avoids dividing by 0
                    ? {
                        $or: dataType.map((type) => ({
                          $gt: [`$${kpiDictionary[`countUnsatisfied${shortType[type || '']}`]}`, 0],
                        })),
                      }
                    : { $gt: [`$${kpiDictionary.countUnsatisfied}`, 0] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              countUnsatisfied: { $sum: getKpiExpr('countUnsatisfied') },
              countUnsatisfiedResolved: { $sum: getKpiExpr('countUnsatisfiedClosedWithResolution') },
            },
          },
          {
            $project: {
              solvingRate12M: {
                $multiply: [{ $divide: ['$countUnsatisfiedResolved', '$countUnsatisfied'] }, 100],
              },
            },
          },
        ],
        as: 'lookup12M',
      },
    },
    {
      /* 3rd lookup, retreiving the resolution rate for last month */
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
                  { $eq: [`$${kpiDictionary.period}`, periods.M1] },
                  { $eq: [`$${kpiDictionary.kpiType}`, KpiTypes.USER_KPI] },
                  dataType // This one avoids dividing by 0
                    ? {
                        $or: dataType.map((type) => ({
                          $gt: [`$${kpiDictionary[`countUnsatisfied${shortType[type || '']}`]}`, 0],
                        })),
                      }
                    : { $gt: [`$${kpiDictionary.countUnsatisfied}`, 0] },
                ],
              },
            },
          },
          {
            $project: {
              // Extracting the resolution rate = 100 * sum(unsatisfiedResolved) / sum(unsatisfied)
              solvingRateM1: {
                $multiply: [
                  {
                    $divide: [
                      { $sum: getKpiExpr('countUnsatisfiedClosedWithResolution') },
                      { $sum: getKpiExpr('countUnsatisfied', true) },
                    ],
                  },
                  100,
                ],
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
    Then we remove lookupUser, lookupM and lookupM1 from the documents
  */
  const $replaceRoot = {
    newRoot: {
      $mergeObjects: [
        { $arrayElemAt: ['$lookupUser', 0] },
        { $arrayElemAt: ['$lookup12M', 0] },
        { $arrayElemAt: ['$lookupM1', 0] },
        '$$ROOT',
      ],
    },
  };
  const $project2 = {
    lookupUser: 0,
    lookup12M: 0,
    lookupM1: 0,
  };
  /*
    Keeping the 5 best employees for this month.
    In case of ex-aequo, taking 12 last months and the last month into consideration
  */
  const sortLimit2 = [
    { $sort: { solvingRateM: -1, solvingRate12M: -1, solvingRateM1: -1 } }, // The order of keys is important here
    { $limit: 5 },
  ];

  // Fancy to get the aggregate running in Robot3T ? Print the output of the following line
  const query = [
    { $match },
    { $group },
    { $project },
    ...sortLimit1,
    ...$lookups,
    { $replaceRoot },
    { $project: $project2 },
    ...sortLimit2,
  ];
  // Getting Aggregation Result Directly From MongoDB
  try {
    return await connector.aggregate(query).toArray();
  } catch (err) {
    log.error(ANASS, `Fail : _getUnsatisfiedRanking   error : ${err}`);
    return [];
  }
};
