const { expect, assert } = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const KpiDictionary = require('../../../common/lib/garagescore/kpi/KpiDictionary');
const garageTypes = require('../../../common/models/garage.type');
const { GarageTypes, KpiTypes, SourceTypes } = require('../../../frontend/utils/enumV2');
const sendQuery = require('../_send-query-as');
const {
  random: { garage: randomGarage, user: randomUser },
} = require('../../../common/lib/test/testtools');
const testApp = new TestApp();
const ModelFactory = require('../modelsFactories/factory');
const { gql } = require('apollo-server-express');
const moment = require('moment');

/**
 * @type ModelFactory
 */
let garageFactory, userFactory, kpiByPeriodFactory, kpiByPeriodDailyFactory;

const query = gql`
  query kpiByPeriodGetSolvedUnsatisfied($garageIds: [String], $cockpitType: String!) {
    kpiByPeriodGetSolvedUnsatisfied(garageIds: $garageIds, cockpitType: $cockpitType) {
      countUnsatisfied
      countSolvedUnsatisfied
      countSolvedAPVUnsatisfied
      countSolvedVNUnsatisfied
      countSolvedVOUnsatisfied
      countUnsatisfiedApv
      countUnsatisfiedVn
      countUnsatisfiedVo

      # percentages
      countSolvedUnsatisfiedApvPct
      countSolvedUnsatisfiedVnPct
      countSolvedUnsatisfiedVoPct
      countSolvedUnsatisfiedPct
    }
  }
`;

const generateLastMonthPeriod = () => {
  // period will be in format YYYYMM
  return parseInt(new Date().getFullYear().toString() + new Date().getMonth().toString().padStart(2, '0'), 10);
};
const generateLast10MonthPeriod = () => {
  // period will be in format YYYYMM
  return [...Array(11).keys()].map((i) =>
    parseInt(
      moment()
        .utc()
        .subtract(i + 1, 'months')
        .format('YYYYMM'),
      10
    )
  );
};

const generateDaysFromStartOfCurrentMonth = () => {
  return [...Array(moment().utc().date()).keys()].map((i) =>
    parseInt(moment().utc().startOf('month').add(i, 'day').format('YYYYMMDD'), 10)
  );
};

const generateDaysToEndOfLastYearMonth = () => {
  const day = moment().utc().date();
  const twelveMonthsAgo = moment().utc().subtract(12, 'months').set('date', day);
  const endOfMonth = moment().utc().subtract(12, 'months').endOf('month').date();
  return [twelveMonthsAgo.format('YYYYMMDD'), ...Array.from({ length: endOfMonth - day - 1 }).keys()].map((_) =>
    parseInt(twelveMonthsAgo.add(1, 'day').format('YYYYMMDD'), 10)
  );
};

const countUnsatisfiedPctFn = ({ countSolvedUnsatisfied, countUnsatisfied }) => {
  if (!countSolvedUnsatisfied && !countUnsatisfied) return 0;
  return Math.round((1000 * countSolvedUnsatisfied) / countUnsatisfied) / 10;
};

const generateKpiByPeriodWithSolvedUnsatisfiedFields = ({
  garageId,
  userId,
  kpiType,
  garageType,
  period,
  sourceType,
  automationCampaignId,
  unsatisfied,
} = {}) => {
  return {
    //mandatory fields
    [KpiDictionary.garageId]: garageId || '',
    [KpiDictionary.userId]: userId || '',
    [KpiDictionary.kpiType]: kpiType || KpiTypes.GARAGE_KPI,
    [KpiDictionary.garageType]: garageType || garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
    [KpiDictionary.period]: period || generateLastMonthPeriod(), // Examples: ALL_HISTORY: 0 | YEAR: 2019 | QUARTER: 2019[1-4] | MONTH: 201903 (ADDED TO _dontEraseZero)
    [KpiDictionary.automationCampaignId]: automationCampaignId || -1,
    [KpiDictionary.sourceType]: sourceType || SourceTypes.DATAFILE,
    //unsatisfied
    [KpiDictionary.countUnsatisfied]: (unsatisfied && unsatisfied.countUnsatisfied) || 0,
    [KpiDictionary.countUnsatisfiedApv]: (unsatisfied && unsatisfied.countUnsatisfiedApv) || 0,
    [KpiDictionary.countUnsatisfiedVn]: (unsatisfied && unsatisfied.countUnsatisfiedVn) || 0,
    [KpiDictionary.countUnsatisfiedVo]: (unsatisfied && unsatisfied.countUnsatisfiedVo) || 0,
    [KpiDictionary.countUnsatisfiedClosedWithResolution]:
      (unsatisfied && unsatisfied.countUnsatisfiedClosedWithResolution) || 0,
    [KpiDictionary.countUnsatisfiedClosedWithResolutionApv]:
      (unsatisfied && unsatisfied.countUnsatisfiedClosedWithResolutionApv) || 0,
    [KpiDictionary.countUnsatisfiedClosedWithResolutionVn]:
      (unsatisfied && unsatisfied.countUnsatisfiedClosedWithResolutionVn) || 0,
    [KpiDictionary.countUnsatisfiedClosedWithResolutionVo]:
      (unsatisfied && unsatisfied.countUnsatisfiedClosedWithResolutionVo) || 0,
  };
};

const initializeModelFactories = (testApp) => {
  garageFactory = new ModelFactory(testApp.models.Garage, randomGarage);
  userFactory = new ModelFactory(testApp.models.User, randomUser);
  kpiByPeriodFactory = new ModelFactory(
    {
      create: async (data) => {
        const result = await testApp.models.KpiByPeriod.getMongoConnector().insertOne(data);
        if (!result || !result.ops || result.ops.length === 0) {
          throw new Error('Failed to create KpiByPeriod');
        }
        return result.ops[0];
      },
    },
    generateKpiByPeriodWithSolvedUnsatisfiedFields
  );
  kpiByPeriodDailyFactory = new ModelFactory(
    {
      create: async (data) => {
        const result = await testApp.models.KpiByDailyPeriod.getMongoConnector().insertOne(data);
        if (!result || !result.ops || result.ops.length === 0) {
          throw new Error('Failed to create KpiByDailyPeriod');
        }
        return result.ops[0];
      },
    },
    generateKpiByPeriodWithSolvedUnsatisfiedFields
  );
};

function generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriodsArray) {
  if (garageKpiByPeriodsArray.length === 0)
    return {
      countSolvedAPVUnsatisfied: 0,
      countSolvedUnsatisfied: 0,
      countSolvedUnsatisfiedApvPct: 0,
      countSolvedUnsatisfiedPct: 0,
      countSolvedUnsatisfiedVnPct: 0,
      countSolvedUnsatisfiedVoPct: 0,
      countSolvedVNUnsatisfied: 0,
      countSolvedVOUnsatisfied: 0,
      countUnsatisfied: 0,
      countUnsatisfiedApv: 0,
      countUnsatisfiedVn: 0,
      countUnsatisfiedVo: 0,
    };
  const countUnsatisfiedApv = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countUnsatisfiedApv] || 0,
    0
  );
  const countUnsatisfiedVn = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countUnsatisfiedVn] || 0,
    0
  );
  const countUnsatisfiedVo = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countUnsatisfiedVo] || 0,
    0
  );

  const countUnsatisfied = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + (curr[KpiDictionary.countUnsatisfied] || 0),
    0
  );

  const countSolvedAPVUnsatisfied = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countUnsatisfiedClosedWithResolutionApv] || 0,
    0
  );
  const countSolvedVNUnsatisfied = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countUnsatisfiedClosedWithResolutionVn] || 0,
    0
  );
  const countSolvedVOUnsatisfied = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countUnsatisfiedClosedWithResolutionVo] || 0,
    0
  );

  const countSolvedUnsatisfied = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + (curr[KpiDictionary.countUnsatisfiedClosedWithResolution] || 0),
    0
  );

  const countSolvedUnsatisfiedApvPct = countUnsatisfiedPctFn({
    countSolvedUnsatisfied: countSolvedAPVUnsatisfied,
    countUnsatisfied: countUnsatisfiedApv,
  });

  const countSolvedUnsatisfiedVnPct = countUnsatisfiedPctFn({
    countSolvedUnsatisfied: countSolvedVNUnsatisfied,
    countUnsatisfied: countUnsatisfiedVn,
  });
  const countSolvedUnsatisfiedVoPct = countUnsatisfiedPctFn({
    countSolvedUnsatisfied: countSolvedVOUnsatisfied,
    countUnsatisfied: countUnsatisfiedVo,
  });

  const countSolvedUnsatisfiedPct = countUnsatisfiedPctFn({
    countSolvedUnsatisfied: countSolvedUnsatisfied,
    countUnsatisfied,
  });
  return {
    countUnsatisfied,
    countUnsatisfiedApv,
    countUnsatisfiedVn,
    countUnsatisfiedVo,
    countSolvedUnsatisfied,
    countSolvedAPVUnsatisfied,
    countSolvedVOUnsatisfied,
    countSolvedVNUnsatisfied,
    countSolvedUnsatisfiedApvPct,
    countSolvedUnsatisfiedVnPct,
    countSolvedUnsatisfiedVoPct,
    countSolvedUnsatisfiedPct,
  };
}

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomunsatisfieds = () => {
  const countUnsatisfiedApv = randomInt(0, 100);
  const countUnsatisfiedVn = randomInt(0, 100);
  const countUnsatisfiedVo = randomInt(0, 100);
  const countUnsatisfied = countUnsatisfiedApv + countUnsatisfiedVn + countUnsatisfiedVo + randomInt(0, 50);

  const countUnsatisfiedClosedWithResolutionApv = randomInt(0, countUnsatisfiedApv);
  const countUnsatisfiedClosedWithResolutionVn = randomInt(0, countUnsatisfiedVn);
  const countUnsatisfiedClosedWithResolutionVo = randomInt(0, countUnsatisfiedVo);
  const partOfClosedWithResolution =
    countUnsatisfiedClosedWithResolutionApv +
    countUnsatisfiedClosedWithResolutionVn +
    countUnsatisfiedClosedWithResolutionVo;
  const countUnsatisfiedClosedWithResolution = randomInt(
    partOfClosedWithResolution,
    countUnsatisfied - partOfClosedWithResolution
  );

  return {
    countUnsatisfiedApv,
    countUnsatisfiedVn,
    countUnsatisfiedVo,
    countUnsatisfiedClosedWithResolutionApv,
    countUnsatisfiedClosedWithResolutionVn,
    countUnsatisfiedClosedWithResolutionVo,
    countUnsatisfiedClosedWithResolution,
    countUnsatisfied,
  };
};

async function generateKpiByPeriodsForGaragesAndUser(garages, user, period) {
  return kpiByPeriodFactory
    .sequence(
      garages.map((garage) => ({
        count: 1,
        fields: generateKpiByPeriodWithSolvedUnsatisfiedFields({
          garageId: garage.id,
          userId: user.id,
          garageType: garageTypes.getIntegerVersion(garage.type),
          period,
          unsatisfied: generateRandomunsatisfieds(),
        }),
      }))
    )
    .createInDB();
}

async function generateKpiByDailyPeriodsForGaragesAndUser(garages, user, period) {
  return kpiByPeriodDailyFactory
    .sequence(
      garages.map((garage) => ({
        count: 1,
        fields: generateKpiByPeriodWithSolvedUnsatisfiedFields({
          garageId: garage.id,
          userId: user.id,
          garageType: garageTypes.getIntegerVersion(garage.type),
          period,
          unsatisfied: generateRandomunsatisfieds(),
        }),
      }))
    )
    .createInDB();
}

async function generateLast12MonthsKpiByPeriods(garages, user) {
  return [
    ...(await Promise.all(
      generateLast10MonthPeriod().flatMap(
        async (period) => await generateKpiByPeriodsForGaragesAndUser(garages, user, period)
      )
    )),
    ...(await Promise.all(
      [...generateDaysFromStartOfCurrentMonth(), ...generateDaysToEndOfLastYearMonth()].flatMap(
        async (period) => await generateKpiByDailyPeriodsForGaragesAndUser(garages, user, period)
      )
    )),
  ].flatMap((kpiByPeriod) => kpiByPeriod);
}

describe('KpiByPeriod::GetGarageSolvedUnsatisfied testing suite', () => {
  beforeEach(async () => {
    await testApp.reset();
    initializeModelFactories(testApp);
  });

  it('should return correct Kpi by period results for specified garageIds', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });
    const garageKpiByPeriods = await generateLast12MonthsKpiByPeriods(garages, user);
    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages.map((garage) => garage.id.toString()),
      },
      user.id.toString()
    );
    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    expect(kpiByPeriodGetSolvedUnsatisfied).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriods)
    );
  });

  it('should only use users garages if no garageIds is provided', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const garages2 = await garageFactory.count(2).createInDB();
    const user2 = await userFactory.createInDB({
      garageIds: garages2.map((garage) => garage.id),
    });
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });

    await generateLast12MonthsKpiByPeriods(garages, user);
    const garageKpiByPeriods = await generateLast12MonthsKpiByPeriods(garages2, user2);

    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
      },
      user2.id.toString()
    );
    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    expect(kpiByPeriodGetSolvedUnsatisfied).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriods)
    );
  });

  it('should take only last 12 months as period by default', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });
    const garageKpiByPeriodsWith12MonthPeriod = await generateLast12MonthsKpiByPeriods(garages, user);

    //here we generateKpiByPeriod with a wrong period
    await kpiByPeriodFactory
      .sequence(
        garages.map((garage) => ({
          count: 1,
          fields: generateKpiByPeriodWithSolvedUnsatisfiedFields({
            garageId: garage.id,
            userId: user.id,
            garageType: garageTypes.getIntegerVersion(garage.type),
            period: '201701',
            unsatisfied: {
              countUnsatisfied: 10,
              countUnsatisfiedApv: 2,
              countUnsatisfiedVn: 3,
              countUnsatisfiedVo: 2,
              countUnsatisfiedClosedWithResolutionApv: 2,
              countUnsatisfiedClosedWithResolutionVn: 3,
              countUnsatisfiedClosedWithResolutionVo: 1,
              countUnsatisfiedClosedWithResolution: 6,
            },
          }),
        }))
      )
      .createInDB();

    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages.map((garage) => garage.id.toString()),
      },
      user.id.toString()
    );
    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    expect(kpiByPeriodGetSolvedUnsatisfied).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriodsWith12MonthPeriod)
    );
  });

  it.skip("should return computed result for all garages if it's a god user", async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });
    // need to have +1000 garages to be in godMode
    const garages2 = await garageFactory.count(1001).createInDB();
    const user2 = await userFactory.createInDB({
      garageIds: garages2.map((garage) => garage.id),
      email: 'testuser@garagescore.com', //god mode condition
      godMode: true,
    });

    const garageKpiByPeriods = await generateLast12MonthsKpiByPeriods(garages, user);
    const garageKpiByPeriodsForUser2 = await generateLast12MonthsKpiByPeriods(garages2, user2);

    const result = await sendQuery(testApp, query, { cockpitType: GarageTypes.DEALERSHIP }, user2.id.toString());
    let { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    expect(kpiByPeriodGetSolvedUnsatisfied).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse([...garageKpiByPeriods, ...garageKpiByPeriodsForUser2])
    );
  });

  it.skip("should return KpiByPeriod for one garage id if GarageIds is specified even if it's a god user", async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });
    // need to have +1000 garages to be in godMode
    const garages2 = await garageFactory.count(1001).createInDB();
    const user2 = await userFactory.createInDB({
      garageIds: garages2.map((garage) => garage.id),
      email: 'testuser@garagescore.com',
      godMode: true,
    });

    // here we generateKpiByPeriod with a user not god
    await generateLast12MonthsKpiByPeriods(garages, user);
    const garageKpiByPeriodsForUser2 = await generateLast12MonthsKpiByPeriods(garages2, user2);

    // returns only one garage KpiByPeriod if GarageId is specified even if it's a god user
    const result2 = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages2[0].id.toString(),
      },
      user2.id.toString()
    );

    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result2;
    expect(kpiByPeriodGetSolvedUnsatisfied).to.be.an('object');

    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(
        garageKpiByPeriodsForUser2.filter((kpi) => kpi[KpiDictionary.garageId].toString() === garages2[0].id.toString())
      )
    );
  });

  it('should return correct Kpis with specific cockpit type', async () => {
    const garages = [await garageFactory.createInDB()];
    const motorBikeGarages = [
      await garageFactory.createInDB({
        type: GarageTypes.MOTORBIKE_DEALERSHIP,
      }),
    ];

    const user = await userFactory.createInDB({
      garageIds: [...garages.map((garage) => garage.id), ...motorBikeGarages.map((garage) => garage.id)],
    });

    const garageKpiByPeriods = await generateLast12MonthsKpiByPeriods(garages, user);
    const motorBikeGarageKpiByPeriods = await generateLast12MonthsKpiByPeriods(motorBikeGarages, user);

    let dealershipKpiByPeriodResult = await sendQuery(
      testApp,
      query,
      { cockpitType: GarageTypes.DEALERSHIP },
      user.id.toString()
    );
    let { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = dealershipKpiByPeriodResult;

    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriods)
    );

    const motorBikeKpiByPeriodResult = await sendQuery(
      testApp,
      query,
      { cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP },
      user.id.toString()
    );
    ({ data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = motorBikeKpiByPeriodResult);

    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(motorBikeGarageKpiByPeriods)
    );
  });

  it('should return correct Kpis with specific garageIds for one garage', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });
    const garageKpiByPeriods = await generateLast12MonthsKpiByPeriods([garages[0]], user);
    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: garages[0].id.toString(),
      },
      user.id.toString()
    );
    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    expect(kpiByPeriodGetSolvedUnsatisfied).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriods)
    );
  });

  it('should return 0 for each count if user has no garage and no garageIds is specified', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: [],
    });
    await generateLast12MonthsKpiByPeriods(garages, user);
    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
      },
      user.id.toString()
    );

    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    assert.deepEqual(kpiByPeriodGetSolvedUnsatisfied, {
      countSolvedAPVUnsatisfied: 0,
      countSolvedUnsatisfied: 0,
      countSolvedUnsatisfiedApvPct: 0,
      countSolvedUnsatisfiedPct: 0,
      countSolvedUnsatisfiedVnPct: 0,
      countSolvedUnsatisfiedVoPct: 0,
      countSolvedVNUnsatisfied: 0,
      countSolvedVOUnsatisfied: 0,
      countUnsatisfied: 0,
      countUnsatisfiedApv: 0,
      countUnsatisfiedVn: 0,
      countUnsatisfiedVo: 0,
    });
  });

  it('should not return kpis if user has no garage but garageIds is specified', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: [],
    });
    const [firstGarage] = garages;
    await generateLast12MonthsKpiByPeriods([firstGarage], user);
    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        garageIds: firstGarage.id.toString(),
      },
      user.id.toString()
    );

    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    assert.deepEqual(kpiByPeriodGetSolvedUnsatisfied, generateExpectedSolvedUnsatisfiedKpisResponse([]));
  });

  it('should correctly compute for last year rolling period', async () => {
    const garages = await garageFactory.count(1).createInDB();
    const user = await userFactory.createInDB({
      garageIds: [garages].map((garage) => garage.id),
    });
    const garageKpiByPeriods = await generateLast12MonthsKpiByPeriods([garages], user);

    const result = await sendQuery(
      testApp,
      query,
      {
        cockpitType: GarageTypes.DEALERSHIP,
        periodId: 'last12Month',
      },
      user.id.toString()
    );
    const { data: { kpiByPeriodGetSolvedUnsatisfied } = {} } = result;
    assert.deepEqual(
      kpiByPeriodGetSolvedUnsatisfied,
      generateExpectedSolvedUnsatisfiedKpisResponse(garageKpiByPeriods)
    );
  });
});
