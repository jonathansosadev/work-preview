const { expect } = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const { SourceTypes } = require('../../frontend/utils/enumV2');
const { KpiTypes } = require('../../frontend/utils/enumV2');
const {
  resolvers: {
    Query: { ErepKpis },
  },
} = require('../../server/webservers-standalones/api/schema/kpi-by-period-get-erep-kpis');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');
const KpiDictionary = require('../../common/lib/garagescore/kpi/KpiDictionary');

const { insertGarage, insertUser } = require('../../common/lib/test/insert-helper');

const testApp = new TestApp();

const generateKpiDocumentForGoogle = async (period, garageId, ratings = []) => {
  return testApp.models.KpiByPeriod.getMongoConnector().insertOne({
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.garageId]: new ObjectId(garageId),
    [KpiDictionary.period]: KpiPeriods.fromGhPeriodToKpiPeriod(period),
    [KpiDictionary.erepSumRatingGoogle]: ratings.reduce((a, b) => a + b, 0),
    [KpiDictionary.erepCountHasRatingGoogle]: ratings.length,
    [KpiDictionary.erepCountReviewsGoogle]: ratings.length,
  });
};

const average = (nums = []) => nums.reduce((acc, val) => acc + val, 0) / nums.length;

describe('Apollo - Kpi By Period Get Erep Kpis', async function () {
  const period = '2022-month01';
  let user = null;
  let garage1 = null;
  let garage2 = null;
  const ratings1 = [6, 8, 10];
  const ratings2 = [2, 4, 6, 8, 10];

  before(async function () {
    await testApp.reset();
    user = await insertUser(testApp);
    garage1 = await insertGarage(testApp, user);
    garage2 = await insertGarage(testApp, user);

    //insert test documents
    await generateKpiDocumentForGoogle(period, garage1.id, ratings1);
    await generateKpiDocumentForGoogle(period, garage2.id, ratings2);

    // we need the indexes for the hint
    await testApp.models.KpiByPeriod.getMongoConnector().createIndex({ 0: -1 }, { name: 'garageId' });
    await testApp.models.KpiByPeriod.getMongoConnector().createIndex({ 4: -1 }, { name: 'period' });
  });

  it('Should Return excellent score for one garage', async function () {
    const args = {
      period: KpiPeriods.fromKpiPeriodToGhPeriod(period),
      garageId: [garage1.id],
      source: 'Google',
    };

    const context = {
      app: testApp,
      scope: {
        user: await user.getInstance(),
        godMode: true,
        logged: true,
      },
    };
    // Simulating a query directly using the resolver function
    const [result] = await ErepKpis({}, args, context);

    expect(result.source).to.equals('Google');
    expect(result.countReviews).to.equals(ratings1.length);
    expect(result.rating).to.equals(average(ratings1));
    expect(result.countDetractors).to.equals(0);
    expect(result.countDetractorsWithoutResponse).to.equals(0);
  });

  it('Should Return average score based on two garage calculation', async function () {
    const args = {
      period: KpiPeriods.fromKpiPeriodToGhPeriod(period),
      garageId: [garage1.id, garage2.id],
      source: 'Google',
    };

    const context = {
      app: testApp,
      scope: {
        user: await user.getInstance(),
        godMode: true,
        logged: true,
      },
    };
    // Simulating a query directly using the resolver function
    const [result] = await ErepKpis({}, args, context);

    expect(result.source).to.equals(SourceTypes.GOOGLE);
    expect(result.countReviews).to.equals(ratings1.length + ratings2.length);

    // should NOT be equal to the average of averages
    expect(result.rating).to.not.equals(average([average(ratings1), average(ratings2)]));

    expect(result.rating).to.equals(average([...ratings1, ...ratings2]));
  });
});
