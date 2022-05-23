const moment = require('moment');
const { ObjectId } = require('mongodb');

const TestApp = require('../../../../../../common/lib/test/test-app');
const kpiTypes = require('../../../../../../common/models/kpi-type');
const monthlySummaryStats = require('../../../../../../common/lib/garagescore/report/monthlySummaryStats');
const timeHelper = require('../../../../../../common/lib/util/time-helper');

const chai = require('chai');
const KpiDictionary = require('../../../../../../common/lib/garagescore/kpi/KpiDictionary');

const { expect } = chai;

const app = new TestApp();
let garages = null;
/**
 * Send alert after negative reviews and with followupUnsatisfied
 */

const getPeriods = () => {
  const now = moment().subtract(1, 'month');
  const res = [];
  for (let i = 0; i < 12; i++) {
    const d = now.clone().subtract(i, 'month');
    res.push(Number(`${d.year()}${`0${d.month() + 1}`.slice(-2)}`));
  }
  return res;
};
const initKpis = async (periods) => {
  // Ok so we do it like that
  // Garages at pos 0 & 1 will be the leaders of conversions
  // Garages at pos 2 & 3 will be the leaders of satisfaction
  // Garages at pos 4 & 5 will be the leaders of problem resolution
  // Garages at pos 6 & 7 will be the leaders of valid emails
  const isLeader = (category, index) => {
    if (category === 'leads') {
      return [0, 1].includes(index);
    }
    if (category === 'satisfaction') {
      return [2, 3].includes(index);
    }
    if (category === 'problemResolution') {
      return [4, 5].includes(index);
    }
    if (category === 'validEmails') {
      return [6, 7].includes(index);
    }
    return false;
  };

  let promises = [];

  garages.forEach((garage, i) => {
    for (const period of periods) {
      promises = [
        ...promises,
        app.models.KpiByPeriod.getMongoConnector().insertOne({
          [KpiDictionary.garageId]: ObjectId(garage.id),
          [KpiDictionary.kpiType]: kpiTypes.GARAGE_KPI,
          [KpiDictionary.period]: period,
          [KpiDictionary.garageType]: 0, // Dealership

          [KpiDictionary.satisfactionCountSurveys]: 20,
          [KpiDictionary.satisfactionSumRating]: isLeader('satisfaction', i) ? 100 : 50,
          [KpiDictionary.satisfactionCountReviews]: 20,

          [KpiDictionary.contactsCountValidEmails]: isLeader('validEmails', i) ? 15 : 10,
          [KpiDictionary.contactsCountBlockedLastMonthEmail]: 0,
          [KpiDictionary.contactsCountUnsubscribedByEmail]: 0,
          [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: 20,

          [KpiDictionary.countConvertedLeads]: isLeader('leads', i) ? 10 : 5,
          [KpiDictionary.countConvertedTradeIns]: isLeader('leads', i) ? 10 : 5,

          [KpiDictionary.countUnsatisfied]: 20,
          [KpiDictionary.countUnsatisfiedClosedWithResolution]: isLeader('problemResolution', i) ? 15 : 10,
        }),
      ];
    }
  });
  const expected = {
    nLeadsTop: 12 * 10 * 2,
    scoreTop: 100 / 20,
    resolutionRateTop: 75,
    validEmailsTop: 75,
    nLeadsAvg: (12 * 2 * (10 * 2 + 5 * 8)) / 10,
    scoreAvg: ((100 / 20) * 2 + (50 / 20) * 8) / 10,
    resolutionRateAvg: (75 * 2 + 50 * 8) / 10,
    validEmailsAvg: (75 * 2 + 50 * 8) / 10,
  };

  await Promise.all(promises);
  return expected;
};

describe('Monthly summary stats', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    garages = [];
    // Create 10 garages
    for (let i = 0; i < 10; i++) {
      garages.push(await app.addGarage());
    }
  });

  it('Computes the monthly summary stats (top20% & all garages) from KPIs (static version)', async function test() {
    // 1 - Start by creating some KPIs
    const todayNumber = timeHelper.dayNumber(new Date());
    const periodsLast12M = getPeriods();
    const expected = await initKpis(periodsLast12M);

    // 2 - Launch compute of the stats
    const stats = await monthlySummaryStats.compute(app, todayNumber);
    // 2.5 - Saving in the configuration collection
    await monthlySummaryStats.save(app, stats, todayNumber);

    // 3 - Check stats
    expect(stats).not.to.be.null;
    [
      'top20Leads',
      'top20Satisfaction',
      'top20ProblemResolution',
      'top20ValidEmails',
      'avgLeads',
      'avgSatisfaction',
      'avgProblemResolution',
      'avgValidEmails',
    ].forEach((key) => {
      expect(stats[key]).not.to.be.null;
    });

    expect(stats.top20Leads[0].convertedLeads).to.equal(expected.nLeadsTop);
    expect(stats.top20Satisfaction[0].score).to.equal(expected.scoreTop);
    expect(stats.top20ProblemResolution[0].unsatisfiedResolvedRate).to.equal(expected.resolutionRateTop);
    expect(stats.top20ValidEmails[0].validEmailsRate).to.equal(expected.validEmailsTop);
    expect(stats.avgLeads[0].convertedLeads).to.equal(expected.nLeadsAvg);
    expect(stats.avgSatisfaction[0].score).to.equal(expected.scoreAvg);
    // Math.round for the 2 of them below because we end up with 55.0000000001 instead of just 55
    expect(Math.round(stats.avgProblemResolution[0].unsatisfiedResolvedRate)).to.equal(expected.resolutionRateAvg);
    expect(Math.round(stats.avgValidEmails[0].validEmailsRate)).to.equal(expected.validEmailsAvg);

    // 4- Check the config saved
    const date = moment();
    date.subtract(1, 'month');
    const month = date.month();
    const year = date.year();

    const config = await app.models.Configuration.getMongoConnector().findOne({
      reserved_field_name: 'MonthlySummary',
    });
    expect(config.monthlySummary[year][month]).not.to.be.undefined;
  });
});
