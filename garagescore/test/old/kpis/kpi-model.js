const TestApp = require('../../../common/lib/test/test-app');

const MongoObjectID = require('mongodb').ObjectID;
const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();

const kpiTypes = require('../../../common/models/kpi-type');

describe('KPI model', () => {
  beforeEach(async () => {
    await app.reset();
  });

  it('Kpi Model - Should create a document and fetch it correctly', async function test() {
    const fooId = new MongoObjectID();
    await app.models.KpiByPeriod.create({
      garageId: fooId,
      kpiType: kpiTypes.GARAGE_KPI,
      period: 0,
      garageType: 0,
      countLeads: 42,
    });
    const kpiFound = await app.models.KpiByPeriod.findOne({ where: { garageId: fooId, period: 0, countLeads: 42 } });

    expect(kpiFound).to.not.be.undefined;
    expect(kpiFound).to.not.be.null;
    expect(kpiFound.garageId.toString()).equals(fooId.toString());
    expect(kpiFound.period).equals(0);
    expect(kpiFound.countLeads).equals(42);
  });

  it('Kpi Model - Should create a document, update it and fetch it correctly', async function test() {
    const fooId = new MongoObjectID();
    await app.models.KpiByPeriod.create({
      garageId: fooId,
      kpiType: kpiTypes.GARAGE_KPI,
      period: 0,
      garageType: 0,
      countLeads: 42,
    });
    let kpiFound = await app.models.KpiByPeriod.findOne({ where: { garageId: fooId, period: 0, countLeads: 42 } });

    kpiFound.countLeads++;
    kpiFound.countUnsatisfied++;
    await kpiFound.save();
    kpiFound = await app.models.KpiByPeriod.findOne({ where: { garageId: fooId, period: 0, countLeads: 43 } });
    expect(kpiFound).to.not.be.undefined;
    expect(kpiFound).to.not.be.null;
    expect(kpiFound.garageId.toString()).equals(fooId.toString());
    expect(kpiFound.period).equals(0);
    expect(kpiFound.countLeads).equals(43);
    expect(kpiFound.countUnsatisfied).equals(1);
  });

  it('Kpi Model - Should create 2 documents, and fetch it with OrderBy correctly', async function test() {
    await app.models.KpiByPeriod.create({
      garageId: 'foo',
      kpiType: kpiTypes.GARAGE_KPI,
      period: 0,
      garageType: 0,
      countLeads: 42,
    });
    await app.models.KpiByPeriod.create({
      garageId: 'foo2',
      kpiType: kpiTypes.GARAGE_KPI,
      period: 0,
      garageType: 0,
      countLeads: 84,
    });

    let kpisFound = await app.models.KpiByPeriod.find({ order: 'countLeads ASC' });
    expect(kpisFound).to.not.be.undefined;
    expect(kpisFound.length).to.equals(2);
    expect(kpisFound[0].countLeads).to.equals(42);
    expect(kpisFound[1].countLeads).to.equals(84);
    kpisFound = await app.models.KpiByPeriod.find({ order: 'countLeads DESC' });
    expect(kpisFound).to.not.be.undefined;
    expect(kpisFound.length).to.equals(2);
    expect(kpisFound[0].countLeads).to.equals(84);
    expect(kpisFound[1].countLeads).to.equals(42);
  });
});
