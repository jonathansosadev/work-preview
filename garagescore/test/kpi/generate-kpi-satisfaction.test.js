const { expect } = require('chai');
const moment = require('moment');

const TestApp = require('../../common/lib/test/test-app');
const generateKpis = require('../../common/lib/garagescore/daily-kpi/generate-kpis');
const { ServiceMiddleMans, ServiceCategories } = require('../../frontend/utils/enumV2');
const KpiDictionary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const FakeDatas = require('./fakeDatas');

const app = new TestApp();

async function generateDataWithRating(garageId, count) {
  const res = [];
  for (let i = 1; i <= count; i++) {
    res.push(FakeDatas.getDataWithRating(garageId, i));
  }
  await app.models.Data.getMongoConnector().insertMany(res);
}

describe('generate kpi satisfaction', () => {
  let garage;
  const todayPeriod = moment.utc().format('YYYYMMDD');

  before(async () => {
    await app.reset();
    await app.models.KpiByPeriod.dataSource.autoupdate();
    await app.models.KpiByDailyPeriod.dataSource.autoupdate();
    garage = await app.addGarage();

    // Datas with different ratings
    await generateDataWithRating(garage.id, 10);
    // Datas with different service.middleMans
    for (let service of ServiceMiddleMans.values()) {
      await app.models.Data.getMongoConnector().insertOne(FakeDatas.getDataWithServiceMiddleMans(garage.id, [service]));
    }
    // Datas with different service.categories
    for (let service of ServiceCategories.values()) {
      await app.models.Data.getMongoConnector().insertOne(FakeDatas.getDataWithServiceCategories(garage.id, [service]));
    }
    // Generate KPIs
    await generateKpis(app, { periods: [todayPeriod] });
  });

  it('should generate kpis for given period', async () => {
    const kpis = await app.models.KpiByPeriod.getMongoConnector()
      .find({ '2': { $in: [10, 21] } })
      .toArray();
    const garageId = garage.getId();
    const datas = await app.datas();

    expect(datas[0].garageId.toString()).to.equals(garageId);
    expect(kpis[0]['0'].toString()).to.equals(garageId);
    // 3 for monthly period by garages, frontDesks and ALL_USERS + 3 for lastQuarter period by garages, frontDesks and ALL_USERS
    expect(kpis.length).to.equals(6);
  });

  it('should compute satifaction kpis', async () => {
    const kpis = await app.models.KpiByPeriod.getMongoConnector()
      .find({ '2': { $in: [10, 21] } })
      .toArray();
    // satisfactionCountSurveys
    expect(kpis[0]['3000']).to.equals(28);
    // satisfactionCountReviews
    expect(kpis[0]['3001']).to.equals(28);
    // satisfactionCountPromoters
    expect(kpis[0]['3002']).to.equals(20);
    // satisfactionCountDetractors
    expect(kpis[0]['3003']).to.equals(6);
    // satisfactionCountPassives
    expect(kpis[0]['3004']).to.equals(2);
    // satisfactionSumRating
    expect(kpis[0]['3007']).to.equals(235);
  });

  it('should compute the ServiceMiddleMans kpis', async () => {
    const kpis = await app.models.KpiByPeriod.getMongoConnector().find({ '2': 10 }).toArray();
    for (let service of ServiceMiddleMans.values()) {
      const kpiNumber = KpiDictionary[ServiceMiddleMans.getPropertyFromValue(service, 'kpiByPeriodKey')];
      expect(kpis[0][kpiNumber.toString()]).not.to.be.undefined;
    }
  });

  it('should compute the ServiceCategories kpis', async () => {
    const kpis = await app.models.KpiByPeriod.getMongoConnector().find({ '2': 10 }).toArray();
    for (let service of ServiceCategories.values()) {
      const kpiNumber = KpiDictionary[ServiceCategories.getPropertyFromValue(service, 'kpiByPeriodKey')];
      expect(kpis[0][kpiNumber.toString()]).not.to.be.undefined;
    }
  });
});
