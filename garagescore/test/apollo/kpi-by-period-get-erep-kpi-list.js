const chai = require('chai');
const path = require('path');
const { ObjectId } = require('mongodb');

const KpiDictionary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const KpiTypes = require('../../common/models/kpi-type');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');

const expect = chai.expect;
const app = new TestApp();

describe('apollo::kpiByPeriodGetList', () => {
  let allGarages;
  let godUser;
  let garage1;
  let garage2;

  const query = `query kpiByPeriodGetErepKpiList($period: String!,$garageId: [String],$cockpitType: String,$orderBy: String,$order: String,$skip: Int,$limit: Int,$search: String) {
    kpiByPeriodGetErepKpiList (period: $period,garageId: $garageId,cockpitType: $cockpitType,orderBy: $orderBy,order: $order,skip: $skip,limit: $limit,search: $search) {
          kpiList {
            garageId
            externalId
            garagePublicDisplayName
          }
          hasMore
         }
   }`;

  beforeEach(async function beforeEach() {
    await app.reset();
    // create datas for test
    await app.restore(path.resolve(`${__dirname}/dumps/garage-kpi-by-period-list.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/user-kpiByPeriod-list.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/kpiByPeriod-list.dump`));
    allGarages = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true } })
      .toArray();

    let garageKpis = await app.models.KpiByPeriod.getMongoConnector()
      .find(
        {},
        {
          projection: {
            [KpiDictionary.garageId]: true,
          },
        }
      )
      .toArray();

    garageKpis = garageKpis
      .map(function (item) {
        return item[KpiDictionary.garageId].toString();
      })
      .filter(function (item, pos, arr) {
        return arr.indexOf(item) === pos;
      });

    garage1 = garageKpis[0];
    godUser = await app.addUser({ garageIds: allGarages.map(({ _id }) => _id) });

    // we need the indexes for the hint
    await app.models.KpiByPeriod.getMongoConnector().createIndex({ 0: -1 }, { name: 'garageId' });
    await app.models.KpiByPeriod.getMongoConnector().createIndex({ 4: -1 }, { name: 'period' });
  });

  it('kpiByPeriodGetErepKpiList : can search with publicDisplayName (view: e-reputation/garages)', async () => {
    // apollo request
    const variablesApollo = {
      period: 'lastQuarter',
      garageId: null,
      cockpitType: 'Dealership',
      orderBy: 'scoreNPS',
      order: 'DESC',
      skip: 0,
      limit: 10,
      search: 'Garage Dupont',
    };

    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList.length).to.equal(1);
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList[0].garagePublicDisplayName).to.equal('Garage Dupont');
  });

  it('kpiByPeriodGetErepKpiList : can search with externalId (view: e-reputation/garages)', async () => {
    // apollo request
    const variablesApollo = {
      period: 'lastQuarter',
      garageId: null,
      cockpitType: 'Dealership',
      orderBy: 'scoreNPS',
      order: 'DESC',
      skip: 0,
      limit: 10,
      search: 'GarageScore',
    };

    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList.length).to.equal(1);
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList[0].garagePublicDisplayName).to.equal('Garage Dupont');
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList[0].externalId).to.equal('GarageScore');
  });

  it('kpiByPeriodGetErepKpiList : should not return duplicates (view: e-reputation/garages)', async () => {
    // apollo request
    const variablesApollo = {
      period: 'lastQuarter',
      garageId: null,
      cockpitType: 'Dealership',
      orderBy: 'scoreNPS',
      order: 'DESC',
      skip: 0,
      limit: 10,
      search: 'Garage',
    };

    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList.length).to.equal(1);
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList[0].garagePublicDisplayName).to.equal('Garage Dupont');
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList[0].externalId).to.equal('GarageScore');
  });

  // https://docs.mongodb.com/manual/reference/operator/aggregation/sort/
  it('kpiByPeriodGetErepKpiList : sort should be consistent even if fields are duplicated/missing', async () => {
    await app.reset();

    const garagesFixtures = Array.from(Array(11), (_, i) => ({
      _id: new ObjectId(),
      externalId: `externalId-${i}`,
      publicDisplayName: `garage-${i}`,
      slug: `slug-${i}`,
    }));
    let { insertedIds: garageIds } = await app.models.Garage.getMongoConnector().insertMany(garagesFixtures);
    garageIds = Object.values(garageIds);

    const kpisFixtures = garageIds.map((garageId) => ({
      [KpiDictionary.garageId]: garageId,
      [KpiDictionary.kpiType]: 10,
      [KpiDictionary.garageType]: 0,
      [KpiDictionary.period]: 10,
    }));
    await app.models.KpiByPeriod.getMongoConnector().insertMany(kpisFixtures);

    const godUser = await app.addUser({ garageIds });

    // apollo request with order by scoreNPS empty (save for all docs)
    const variablesApollo = {
      period: 'lastQuarter',
      orderBy: 'scoreNPS',
      order: 'DESC',
      cockpitType: 'Dealership',
      garageId: null,
      skip: 0,
      limit: 10,
      search: '',
    };

    // idk the best way to unit test mongo sort consistency ...
    // the problem was detected when using skip on doc with same orderBy field value (empty) issue #4703
    // here we test if 2 queries return the same list in the same order
    // There is still a chance that the test would pass event if the sort isn't consistent
    const [queryRes, queryBisRes] = await Promise.all(
      Array.from(Array(2), () => sendQueryAs(app, query, variablesApollo, godUser.getId()))
    );
    expect(
      queryRes.data.kpiByPeriodGetErepKpiList.kpiList.map((kpi) => kpi.garageId).toString() ===
        queryBisRes.data.kpiByPeriodGetErepKpiList.kpiList.map((kpi) => kpi.garageId).toString()
    ).to.equal(true);
  });

  it('kpiByPeriodGetErepKpiList : one garage', async () => {
    // apollo request
    const variablesApollo = {
      period: 'lastQuarter',
      garageId: [garage1.toString()],
      cockpitType: 'Dealership',
      orderBy: 'scoreNPS',
      order: 'DESC',
      skip: 0,
      limit: 10,
    };

    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList.length).to.equal(1);
    expect(queryRes.data.kpiByPeriodGetErepKpiList.kpiList[0].garageId).to.equal(garage1.toString());
  });
});
