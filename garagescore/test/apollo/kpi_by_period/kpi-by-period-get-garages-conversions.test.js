const { expect, assert } = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const KpiDictionary = require('../../../common/lib/garagescore/kpi/KpiDictionary');
const garageTypes = require('../../../common/models/garage.type');
const { GarageTypes, KpiTypes } = require('../../../frontend/utils/enumV2');
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
let garageFactory, userFactory, kpiByPeriodFactory, kpiByDailyPeriodFactory;

const query = gql`
  query kpiByPeriodGetGaragesConversions($garageIds: [String], $cockpitType: String!, $periodId: String) {
    kpiByPeriodGetGaragesConversions(garageIds: $garageIds, cockpitType: $cockpitType, periodId: $periodId) {
      countConversionsVO
      countConversionsVN
      countConversionsLeads
      countConversionsTradeins
      countConversions
      countLeads

      countConversionsPct
      countConvertedLeadsPct
      countConversionsTradeInsPct
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
  return [twelveMonthsAgo.format('YYYYMMDD'), ...Array.from({ length: endOfMonth - day - 1 }).keys()].map(() =>
    parseInt(twelveMonthsAgo.add(1, 'day').format('YYYYMMDD'), 10)
  );
};

const countConversionsPctFn = ({ countConversions, countLeadsPotentialSales }) => {
  if (!countConversions && !countLeadsPotentialSales) return 0;
  return Math.round((1000 * countConversions) / countLeadsPotentialSales) / 10;
};

const generateKpiByPeriodWithConversionsFields = ({
  garageId,
  userId,
  kpiType,
  garageType,
  period,
  automationCampaignId,
  conversions,
} = {}) => {
  return {
    //mandatory fields
    [KpiDictionary.garageId]: garageId || '',
    [KpiDictionary.userId]: userId || '',
    [KpiDictionary.kpiType]: kpiType || KpiTypes.GARAGE_KPI,
    [KpiDictionary.garageType]: garageType || garageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
    [KpiDictionary.period]: period || generateLastMonthPeriod(), // Examples: ALL_HISTORY: 0 | YEAR: 2019 | QUARTER: 2019[1-4] | MONTH: 201903 (ADDED TO _dontEraseZero)
    [KpiDictionary.automationCampaignId]: automationCampaignId || -1,
    //conversions
    [KpiDictionary.countConvertedLeadsVo]: (conversions && conversions.countConvertedLeadsVo) || 0,
    [KpiDictionary.countConvertedLeadsVn]: (conversions && conversions.countConvertedLeadsVn) || 0,
    [KpiDictionary.countConvertedTradeIns]: (conversions && conversions.countConvertedTradeIns) || 0,
    [KpiDictionary.countConvertedLeads]: (conversions && conversions.countConvertedLeads) || 0,
    [KpiDictionary.countLeadsPotentialSales]: (conversions && conversions.countLeadsPotentialSales) || 0,
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
    generateKpiByPeriodWithConversionsFields
  );
  kpiByDailyPeriodFactory = new ModelFactory(
    {
      create: async (data) => {
        const result = await testApp.models.KpiByDailyPeriod.getMongoConnector().insertOne(data);
        if (!result || !result.ops || result.ops.length === 0) {
          throw new Error('Failed to create KpiByDailyPeriod');
        }
        return result.ops[0];
      },
    },
    generateKpiByPeriodWithConversionsFields
  );
};

function generateExpectedConversionKpisResponse(garageKpiByPeriodsArray) {
  if (garageKpiByPeriodsArray.length === 0) return {};
  const countConversionsVO = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countConvertedLeadsVo] || 0,
    0
  );
  const countConversionsVN = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countConvertedLeadsVn] || 0,
    0
  );
  const countConversionsTradeins = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countConvertedTradeIns] || 0,
    0
  );
  const countConversionsLeads = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countConvertedLeads] || 0,
    0
  );
  const countLeadsPotentialSales = garageKpiByPeriodsArray.reduce(
    (acc, curr) => acc + curr[KpiDictionary.countLeadsPotentialSales] || 0,
    0
  );
  const countConversions = garageKpiByPeriodsArray.reduce(
    (acc, curr) =>
      acc + (curr[KpiDictionary.countConvertedLeads] || 0) + (curr[KpiDictionary.countConvertedTradeIns] || 0),
    0
  );
  const countConversionsPct = countConversionsPctFn({
    countConversions,
    countLeadsPotentialSales,
  });

  const countConvertedLeadsPct = countConversionsPctFn({
    countConversions: countConversionsLeads,
    countLeadsPotentialSales,
  });
  const countConversionsTradeInsPct = countConversionsPctFn({
    countConversions: countConversionsTradeins,
    countLeadsPotentialSales,
  });
  return {
    countConversions,
    countConversionsTradeins,
    countConversionsVO,
    countConversionsVN,
    countConversionsLeads,
    countLeads: countLeadsPotentialSales,
    countConversionsPct,
    countConvertedLeadsPct,
    countConversionsTradeInsPct,
  };
}

const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const generateRandomConversions = () => {
  const countConvertedLeadsVo = randomInt(0, 100);
  const countConvertedLeadsVn = randomInt(0, 100);
  const countConvertedTradeIns = randomInt(0, 100);
  return {
    countConvertedLeadsVo,
    countConvertedLeadsVn,
    countConvertedTradeIns,
    countLeadsClosedWithSale: countConvertedLeadsVo + countConvertedLeadsVn + countConvertedTradeIns,
    countConvertedLeads: countConvertedLeadsVo + countConvertedLeadsVn,
    countConvertedLeadsClosed: countConvertedLeadsVo + countConvertedLeadsVn + countConvertedTradeIns,
    countLeadsPotentialSales: countConvertedLeadsVo + countConvertedLeadsVn + countConvertedTradeIns + randomInt(0, 50),
  };
};

async function generateKpiByPeriodsForGaragesAndUser(garages, user, period) {
  return kpiByPeriodFactory
    .sequence(
      garages.map((garage) => ({
        count: 1,
        fields: generateKpiByPeriodWithConversionsFields({
          garageId: garage.id,
          userId: user.id,
          garageType: garageTypes.getIntegerVersion(garage.type),
          period,
          conversions: generateRandomConversions(),
        }),
      }))
    )
    .createInDB();
}

async function generateKpiByDailyPeriodsForGaragesAndUser(garages, user, period) {
  return kpiByDailyPeriodFactory
    .sequence(
      garages.map((garage) => ({
        count: 1,
        fields: generateKpiByPeriodWithConversionsFields({
          garageId: garage.id,
          userId: user.id,
          garageType: garageTypes.getIntegerVersion(garage.type),
          period,
          conversions: generateRandomConversions(),
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

describe('KpiByPeriod::GetGarageConversions testing suite', () => {
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
    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    expect(kpiByPeriodGetGaragesConversions).to.be.an('object');
    assert.deepEqual(kpiByPeriodGetGaragesConversions, generateExpectedConversionKpisResponse(garageKpiByPeriods));
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
    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    expect(kpiByPeriodGetGaragesConversions).to.be.an('object');
    assert.deepEqual(kpiByPeriodGetGaragesConversions, generateExpectedConversionKpisResponse(garageKpiByPeriods));
  });

  it('should take only last 12 months as period by default', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const user = await userFactory.createInDB({
      garageIds: garages.map((garage) => garage.id),
    });
    const garageKpiByPeriodsWith12MonthPeriod = await generateKpiByPeriodsForGaragesAndUser(garages, user);

    //here we generateKpiByPeriod with a wrong period
    await kpiByPeriodFactory
      .sequence(
        garages.map((garage) => ({
          count: 1,
          fields: generateKpiByPeriodWithConversionsFields({
            garageId: garage.id,
            userId: user.id,
            garageType: garageTypes.getIntegerVersion(garage.type),
            period: '201701',
            conversions: {
              countConvertedLeadsVo: 1,
              countConvertedLeadsVn: 2,
              countConvertedTradeIns: 1,
              countLeadsClosedWithSale: 4,
              countConvertedLeads: 3,
              countConvertedLeadsClosed: 4,
              countLeads: 5,
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
    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    expect(kpiByPeriodGetGaragesConversions).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetGaragesConversions,
      generateExpectedConversionKpisResponse(garageKpiByPeriodsWith12MonthPeriod)
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
    let { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    expect(kpiByPeriodGetGaragesConversions).to.be.an('object');
    assert.deepEqual(
      kpiByPeriodGetGaragesConversions,
      generateExpectedConversionKpisResponse([...garageKpiByPeriods, ...garageKpiByPeriodsForUser2])
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

    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result2;
    expect(kpiByPeriodGetGaragesConversions).to.be.an('object');

    assert.deepEqual(
      kpiByPeriodGetGaragesConversions,
      generateExpectedConversionKpisResponse(
        garageKpiByPeriodsForUser2.filter((kpi) => kpi[KpiDictionary.garageId].toString() === garages2[0].id.toString())
      )
    );
  });

  it('should return correct Kpis with specific cockpit type', async () => {
    const garages = await garageFactory.count(5).createInDB();
    const motorBikeGarages = await garageFactory.count(5).createInDB({
      type: GarageTypes.MOTORBIKE_DEALERSHIP,
    });

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
    let { data: { kpiByPeriodGetGaragesConversions } = {} } = dealershipKpiByPeriodResult;

    assert.deepEqual(kpiByPeriodGetGaragesConversions, generateExpectedConversionKpisResponse(garageKpiByPeriods));

    const motorBikeKpiByPeriodResult = await sendQuery(
      testApp,
      query,
      { cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP },
      user.id.toString()
    );
    ({ data: { kpiByPeriodGetGaragesConversions } = {} } = motorBikeKpiByPeriodResult);

    assert.deepEqual(
      kpiByPeriodGetGaragesConversions,
      generateExpectedConversionKpisResponse(motorBikeGarageKpiByPeriods)
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
    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    expect(kpiByPeriodGetGaragesConversions).to.be.an('object');
    assert.deepEqual(kpiByPeriodGetGaragesConversions, generateExpectedConversionKpisResponse(garageKpiByPeriods));
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

    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    assert.deepEqual(kpiByPeriodGetGaragesConversions, {
      countConversions: 0,
      countConversionsLeads: 0,
      countConversionsPct: 0,
      countConversionsTradeInsPct: 0,
      countConversionsTradeins: 0,
      countConversionsVN: 0,
      countConversionsVO: 0,
      countConvertedLeadsPct: 0,
      countLeads: 0,
    });
  });

  it("shouldn't return kpis if user has no garage but garageIds is specified", async () => {
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

    const { data: { kpiByPeriodGetGaragesConversions } = {} } = result;
    assert.deepEqual(kpiByPeriodGetGaragesConversions, {
      countConversions: 0,
      countConversionsLeads: 0,
      countConversionsPct: 0,
      countConversionsTradeInsPct: 0,
      countConversionsTradeins: 0,
      countConversionsVN: 0,
      countConversionsVO: 0,
      countConvertedLeadsPct: 0,
      countLeads: 0,
    });
  });
});
