const chai = require('chai');
const path = require('path');

const moment = require('moment');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');
const GarageHistoryPeriod = require('../../common/models/garage-history.period');

const {
  fromGhPeriodToChartGhPeriods,
  fromGhPeriodToChartKpiPeriods,
} = require('../../server/webservers-standalones/api/_common/chart-generate-periods');

const expect = chai.expect;
const app = new TestApp();

function buildQuery(fields) {
  return `query kpiByPeriodGetChartData($periodId: String!, $kpiType: Int!, $cockpitType: String, $garageId: [String], $userId: String, $dataType: String, $frontDeskUserName: String, $campaignType: String) {
    kpiByPeriodGetChartData (periodId: $periodId, kpiType: $kpiType, cockpitType: $cockpitType, garageId: $garageId, userId: $userId, dataType: $dataType, frontDeskUserName: $frontDeskUserName, campaignType: $campaignType) {
        ${fields}
      }
   }`;
}

function convertToGHFormat(kpiPeriod) {
  return moment(kpiPeriod, 'YYYYMM').format(GarageHistoryPeriod.MONTHLY_FORMAT);
}

describe('Compute periods for charts : function fromGhPeriodToChartKpiPeriods and fromGhPeriodToChartGhPeriods', () => {
  it('CURRENT_YEAR', async () => {
    const periodId = KpiPeriods.GH_CURRENT_YEAR;
    const refDate = new Date('may 19, 2020 20:42:00');
    const kpiPeriods = fromGhPeriodToChartKpiPeriods(periodId, refDate);
    const expected = [201905, 201906, 201907, 201908, 201909, 201910, 201911, 201912, 202001, 202002, 202003, 202004];

    expect(kpiPeriods).to.have.lengthOf(12);
    expect(kpiPeriods).to.deep.equal(expected);

    const ghPeriods = fromGhPeriodToChartGhPeriods(periodId, refDate);
    expect(ghPeriods).to.deep.equal(expected.map((kpiPeriod) => convertToGHFormat(kpiPeriod)));
  });

  it('ALL_HISTORY', async () => {
    const periodId = KpiPeriods.GH_ALL_HISTORY;
    const refDate = new Date('may 19, 2020 20:42:00');
    const kpiPeriods = fromGhPeriodToChartKpiPeriods(periodId, refDate);
    const expected = [201905, 201906, 201907, 201908, 201909, 201910, 201911, 201912, 202001, 202002, 202003, 202004];
    expect(kpiPeriods).to.have.lengthOf(12);
    expect(kpiPeriods).to.deep.equal(expected);

    const ghPeriods = fromGhPeriodToChartGhPeriods(periodId, refDate);
    expect(ghPeriods).to.deep.equal(expected.map((kpiPeriod) => convertToGHFormat(kpiPeriod)));
  });

  //include current month
  it('LAST_QUARTER', async () => {
    const periodId = KpiPeriods.GH_LAST_QUARTER;
    const refDate = new Date('may 12, 2020 20:42:00');
    const kpiPeriods = fromGhPeriodToChartKpiPeriods(periodId, refDate);
    const expected = [201905, 201906, 201907, 201908, 201909, 201910, 201911, 201912, 202001, 202002, 202003, 202004];

    expect(kpiPeriods).to.have.lengthOf(12);
    expect(kpiPeriods).to.deep.equal(expected);

    const ghPeriods = fromGhPeriodToChartGhPeriods(periodId, refDate);
    expect(ghPeriods).to.deep.equal(expected.map((kpiPeriod) => convertToGHFormat(kpiPeriod)));
  });

  it('YEARLY_REGEX', async () => {
    const periodId = '2020';
    const kpiPeriods = fromGhPeriodToChartKpiPeriods(periodId);
    const expected = [202012, 202011, 202010, 202009, 202008, 202007, 202006, 202005, 202004, 202003, 202002, 202001];
    expect(kpiPeriods).to.have.lengthOf(12);
    expect(kpiPeriods).to.deep.equal(expected);

    const ghPeriods = fromGhPeriodToChartGhPeriods(periodId);
    expect(ghPeriods).to.deep.equal(expected.map((kpiPeriod) => convertToGHFormat(kpiPeriod)));
  });

  it('MONTHLY_REGEX', async () => {
    const periodId = '2020-month05';
    const kpiPeriods = fromGhPeriodToChartKpiPeriods(periodId);
    const expected = [201906, 201907, 201908, 201909, 201910, 201911, 201912, 202001, 202002, 202003, 202004, 202005];
    expect(kpiPeriods).to.have.lengthOf(12);
    expect(kpiPeriods).to.deep.equal(expected);

    const ghPeriods = fromGhPeriodToChartGhPeriods(periodId);
    expect(ghPeriods).to.deep.equal(expected.map((kpiPeriod) => convertToGHFormat(kpiPeriod)));
  });

  it('QUARTER_REGEX', async () => {
    const periodId = '2020-quarter1';
    const kpiPeriods = fromGhPeriodToChartKpiPeriods(periodId);
    const expected = [201904, 201905, 201906, 201907, 201908, 201909, 201910, 201911, 201912, 202001, 202002, 202003];
    expect(kpiPeriods).to.have.lengthOf(12);
    expect(kpiPeriods).to.deep.equal(expected);

    const ghPeriods = fromGhPeriodToChartGhPeriods(periodId);
    expect(ghPeriods).to.deep.equal(expected.map((kpiPeriod) => convertToGHFormat(kpiPeriod)));
  });
});

describe('apollo::kpiByPeriodGetChartData', () => {
  let allGarages;
  let user;
  beforeEach(async function beforeEach() {
    await app.reset();
    // create datas for test
    await app.restore(path.resolve(`${__dirname}/dumps/analytics-v2/garage.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/analytics-v2/kpiByPeriod-202101.dump`));
    allGarages = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true } })
      .toArray();

    await app.addUser({ garageIds: allGarages.map(({ _id }) => _id) });
    user = await app.models.User.findOne({});
    await app._models().AccessToken.create({
      ttl: 9999999999,
      created: new Date(),
      userId: user.getId(),
    });
  });
});
