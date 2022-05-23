const KpiDictionary = require('../../kpi/KpiDictionary');
const KPI_DAILY_PERIODS = require('../../../../../frontend/utils/models/kpi-daily-periods');
const AsyncPool = require('../../../../../scripts/migration/scopes/asyncPool');
const { ObjectId, MongoClient } = require('mongodb');
const config = require('config');
const moment = require('moment');
const Logger = require('../../../../../scripts/maintenance/kpi/utils/_logger');

//TODO: remove after MEP
const MEP = {
  mep: false,
  client: null,
  temporaryCollectionName: 'kpiByPeriod_temporary',
};

function generateMatch(dailyPeriodsTokens = [], garageIds = []) {
  const matchGarageId = {};

  if (garageIds.length) {
    matchGarageId[KpiDictionary.garageId] =
      garageIds.length === 1 ? ObjectId(garageIds[0]) : { $in: garageIds.map(ObjectId) };
  }

  return {
    ...matchGarageId,
    [KpiDictionary.period]: { $in: dailyPeriodsTokens },
  };
}

function generateGroup(lastQuarter = false) {
  return {
    _id: {
      [KpiDictionary.garageId]: `$${KpiDictionary.garageId}`,
      [KpiDictionary.userId]: `$${KpiDictionary.userId}`,
      [KpiDictionary.kpiType]: `$${KpiDictionary.kpiType}`,
      [KpiDictionary.garageType]: `$${KpiDictionary.garageType}`,
      ...(!lastQuarter && { [KpiDictionary.period]: { $toInt: { $divide: [`$${KpiDictionary.period}`, 100] } } }),
      [KpiDictionary.sourceType]: `$${KpiDictionary.sourceType}`,
      [KpiDictionary.automationCampaignId]: `$${KpiDictionary.automationCampaignId}`,
    },
    ...KpiDictionary.accumulativeKeys.reduce(
      (acc, key) => ({ ...acc, [KpiDictionary[key]]: { $sum: `$${KpiDictionary[key]}` } }),
      {}
    ),
  };
}

function generateProject(lastQuarter = false) {
  return {
    _id: false,
    [KpiDictionary.garageId]: `$_id.${KpiDictionary.garageId}`,
    [KpiDictionary.userId]: `$_id.${KpiDictionary.userId}`,
    [KpiDictionary.kpiType]: `$_id.${KpiDictionary.kpiType}`,
    [KpiDictionary.garageType]: `$_id.${KpiDictionary.garageType}`,
    [KpiDictionary.period]: lastQuarter ? { $toInt: '10' } : `$_id.${KpiDictionary.period}`,
    [KpiDictionary.sourceType]: `$_id.${KpiDictionary.sourceType}`,
    [KpiDictionary.automationCampaignId]: `$_id.${KpiDictionary.automationCampaignId}`,
    ...KpiDictionary.accumulativeKeys.reduce(
      (acc, key) => ({
        ...acc,
        [KpiDictionary[key]]: {
          $cond: [{ $gt: [`$${KpiDictionary[key]}`, 0] }, `$${KpiDictionary[key]}`, '$$REMOVE'],
        },
      }),
      {}
    ),
  };
}

function mergeInKpiByPeriod(app, { $match = {}, $group = {}, $project = {} } = {}) {
  return app.models.KpiByDailyPeriod.getMongoConnector()
    .aggregate(
      [
        { $match },
        { $group },
        { $project },
        {
          $merge: {
            into: MEP.mep ? MEP.temporaryCollectionName : 'kpiByPeriod',
            on: [
              `${KpiDictionary.garageId}`,
              `${KpiDictionary.userId}`,
              `${KpiDictionary.kpiType}`,
              `${KpiDictionary.garageType}`,
              `${KpiDictionary.period}`,
              `${KpiDictionary.sourceType}`,
              `${KpiDictionary.automationCampaignId}`,
            ],
            whenMatched: 'replace',
            whenNotMatched: 'insert',
          },
        },
      ],
      {
        allowDiskUse: true,
        cursor: {},
      }
    )
    .toArray();
}

module.exports = async function generateMonthlyKpiFromDaily(
  app,
  dailyPeriodsTokens = [],
  garageIds = [],
  mep = false,
  endMep = false
) {
  // TODO: remove after the MEP
  if (mep) {
    MEP.mep = true;
    Logger.info(`Preparing temporary collection ${MEP.temporaryCollectionName}`);
    MEP.client = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
    const DB = MEP.client.db();

    // create temporary collection
    if (!(await DB.listCollections({ name: MEP.temporaryCollectionName }).hasNext())) {
      await DB.createCollection(MEP.temporaryCollectionName);
      Logger.success(`${MEP.temporaryCollectionName} created `);

      const originalConnector = app.models.KpiByPeriod.getMongoConnector();
      const originalIndexes = await originalConnector.indexes();

      // add the unique index needed for the $merge if it doesn't exist
      if (!originalIndexes.find(({ unique, name }) => unique && name === 'dontEraseZero')) {
        originalIndexes.push({
          v: 2,
          unique: true,
          key: {
            '0': -1,
            '1': -1,
            '2': -1,
            '3': -1,
            '4': -1,
            '6': -1,
            '7': -1,
          },
          name: 'dontEraseZero',
        });
      }

      await DB.collection(MEP.temporaryCollectionName).createIndexes(originalIndexes);
      Logger.success(`${MEP.temporaryCollectionName} indexes have been set`);
    }
  }

  const buckets = [];

  const groupedByMonth = dailyPeriodsTokens.reduce((acc, period) => {
    const monthly = `${period}`.slice(0, 6);
    if (monthly in acc) {
      acc[monthly].push(period);
    } else {
      acc[monthly] = [period];
    }
    return acc;
  }, {});

  for (const monthlyPeriod in groupedByMonth) {
    const bucket = {
      periodName: monthlyPeriod,
      periods: groupedByMonth[monthlyPeriod].sort((a, b) => Number(a) - Number(b)),
    };
    buckets.push(bucket);
  }

  const lastQuarterPeriodsTokens = KPI_DAILY_PERIODS.getPeriodsFromKpiPeriodToken(10)
    .map((p) => p.token)
    .sort((a, b) => Number(a) - Number(b));

  if (lastQuarterPeriodsTokens.every((p) => dailyPeriodsTokens.includes(p))) {
    buckets.push({
      periodName: 'lastQuarter',
      periods: lastQuarterPeriodsTokens,
    });
  }

  let count = 0;
  await AsyncPool(10, buckets, async ({ periodName, periods }) => {
    const isLastQuarter = periodName === 'lastQuarter';

    await mergeInKpiByPeriod(app, {
      $match: generateMatch(periods, garageIds),
      $group: generateGroup(isLastQuarter),
      $project: generateProject(isLastQuarter),
    });
    Logger.success(`Period : ${periodName} (${++count} / ${buckets.length})`);
  });

  //TODO: remove after the MEP
  if (mep && endMep) {
    // rename original collection
    const backupName = `kpiByPeriod_${moment().format('YYYY-MM-DD')}`;
    await MEP.client.db().collection('kpiByPeriod').rename(backupName);
    Logger.success('-----------------------------------------------------');
    Logger.success(`Collection kpiByPeriod renamed to ${backupName}`);

    // rename temporary collection
    await MEP.client.db().collection(MEP.temporaryCollectionName).rename('kpiByPeriod');
    Logger.success(`Collection ${MEP.temporaryCollectionName} renamed to kpiByPeriod`);

    // close connection
    await MEP.client.close();
  }
};
