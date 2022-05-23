const TestApp = require('../../../../../../common/lib/test/test-app');
const Tools = require('../../../../../../common/lib/test/testtools');
const KpiDictionary = require('../../../../../../common/lib/garagescore/kpi/KpiDictionary');
const { KpiTypes } = require('../../../../../../frontend/utils/enumV2');

const {
  getMonthlySummaryPayload,
} = require('../../../../../../common/lib/garagescore/report-mail/render-monthly-summary-email');

const app = new TestApp();

const chai = require('chai');
const { expect } = chai;

async function _insertKpiByPeriod(options) {
  const { garageId, period, otherKpis } = options;
  await app.models.KpiByPeriod.getMongoConnector().insertOne({
    [KpiDictionary.garageId]: garageId,
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: period,
    ...otherKpis,
  });
}

describe('render-monthly-summary-email', () => {
  let user;
  let contact;
  let garage;

  beforeEach(async () => {
    await app.reset();
    const garageTest = await app.addGarage();
    garage = await garageTest.getInstance();
    const randomUser = Tools.random.user();
    randomUser.garageIds.push(garage.id.toString());
    randomUser.reportConfigs = {};
    randomUser.reportConfigs['monthlySummary'] = {
      enable: true,
      lead: true,
      leadVn: true,
      leadVo: true,
      unsatisfiedApv: true,
      unsatisfiedVn: true,
      unsatisfiedVo: true,
      contactsApv: true,
      contactsVn: true,
      contactsVo: true,
      unsatisfiedVI: true,
      contactsVI: true,
    };

    user = await app.addUser(randomUser);

    const reportCreation = {
      userId: user.id.toString(),
      reportConfigId: 'monthlySummary',
      month: 11,
      year: 2021,
      userEmail: 'foo@bar.com',
    };
    const report = await app.models.Report.create(reportCreation);
    contact = {
      payload: {
        reportId: report.id,
      },
    };
  });

  it('compute the leads', async () => {
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202112,
      otherKpis: {
        [KpiDictionary.countConvertedLeadsVn]: 10,
        [KpiDictionary.countConvertedTradeInsVn]: 12,
        [KpiDictionary.countConvertedLeadsVo]: 4,
        [KpiDictionary.countConvertedTradeInsVo]: 6,
      },
    });
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202111,
      otherKpis: {
        [KpiDictionary.countConvertedLeadsVn]: 6,
        [KpiDictionary.countConvertedTradeInsVn]: 3,
        [KpiDictionary.countConvertedLeadsVo]: 2,
        [KpiDictionary.countConvertedTradeInsVo]: 2,
      },
    });
    const res = await getMonthlySummaryPayload(contact);
    expect(res.leads.perf).to.equal(10 + 12 + 4 + 6);
    expect(res.leads.evolution).to.equal('increase');
  });

  it('compute the satisfactions', async () => {
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202112,
      otherKpis: {
        [KpiDictionary.satisfactionCountReviews]: 10,
        [KpiDictionary.satisfactionSumRating]: 80,
        [KpiDictionary.satisfactionCountReviewsApv]: 10,
        [KpiDictionary.satisfactionSumRatingApv]: 80,
      },
    });
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202111,
      otherKpis: {
        [KpiDictionary.satisfactionCountReviews]: 10,
        [KpiDictionary.satisfactionSumRating]: 80,
        [KpiDictionary.satisfactionCountReviewsApv]: 10,
        [KpiDictionary.satisfactionSumRatingApv]: 80,
      },
    });
    const res = await getMonthlySummaryPayload(contact);
    expect(res.satisfaction.perf).to.equal(80 / 10);
    expect(res.satisfaction.evolution).to.equal('constant');
  });

  it('compute the problemResolutions', async () => {
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202112,
      otherKpis: {
        [KpiDictionary.countUnsatisfiedClosedWithResolutionApv]: 1,
        [KpiDictionary.countUnsatisfiedClosedWithResolutionVn]: 2,
        [KpiDictionary.countUnsatisfiedClosedWithResolutionVo]: 3,
        [KpiDictionary.countUnsatisfiedApv]: 10,
        [KpiDictionary.countUnsatisfiedVn]: 9,
        [KpiDictionary.countUnsatisfiedVo]: 8,
      },
    });
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202111,
      otherKpis: {
        [KpiDictionary.countUnsatisfiedClosedWithResolutionApv]: 2,
        [KpiDictionary.countUnsatisfiedClosedWithResolutionVn]: 3,
        [KpiDictionary.countUnsatisfiedClosedWithResolutionVo]: 4,
        [KpiDictionary.countUnsatisfiedApv]: 10,
        [KpiDictionary.countUnsatisfiedVn]: 9,
        [KpiDictionary.countUnsatisfiedVo]: 8,
      },
    });
    const res = await getMonthlySummaryPayload(contact);
    expect(res.problemResolution.perf).to.equal(Math.round(100 * (6 / 27)));
    expect(res.problemResolution.evolution).to.equal('decrease');
  });

  it('compute the validEmails', async () => {
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202112,
      otherKpis: {
        [KpiDictionary.contactsCountValidEmails]: 6,
        [KpiDictionary.contactsCountBlockedLastMonthEmail]: 9,
        [KpiDictionary.contactsCountUnsubscribedByEmail]: 12,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: 60,
        [KpiDictionary.contactsCountValidEmailsApv]: 2,
        [KpiDictionary.contactsCountBlockedLastMonthEmailApv]: 3,
        [KpiDictionary.contactsCountUnsubscribedByEmailApv]: 4,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsApv]: 20,
        [KpiDictionary.contactsCountValidEmailsVn]: 2,
        [KpiDictionary.contactsCountBlockedLastMonthEmailVn]: 3,
        [KpiDictionary.contactsCountUnsubscribedByEmailVn]: 4,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsVn]: 20,
        [KpiDictionary.contactsCountValidEmailsVo]: 2,
        [KpiDictionary.contactsCountBlockedLastMonthEmailVo]: 3,
        [KpiDictionary.contactsCountUnsubscribedByEmailVo]: 4,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsVo]: 20,
      },
    });
    await _insertKpiByPeriod({
      garageId: garage.id,
      period: 202111,
      otherKpis: {
        [KpiDictionary.contactsCountValidEmails]: 6,
        [KpiDictionary.contactsCountBlockedLastMonthEmail]: 9,
        [KpiDictionary.contactsCountUnsubscribedByEmail]: 12,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: 60,
        [KpiDictionary.contactsCountValidEmailsApv]: 2,
        [KpiDictionary.contactsCountBlockedLastMonthEmailApv]: 3,
        [KpiDictionary.contactsCountUnsubscribedByEmailApv]: 4,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsApv]: 20,
        [KpiDictionary.contactsCountValidEmailsVn]: 2,
        [KpiDictionary.contactsCountBlockedLastMonthEmailVn]: 3,
        [KpiDictionary.contactsCountUnsubscribedByEmailVn]: 4,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsVn]: 20,
        [KpiDictionary.contactsCountValidEmailsVo]: 2,
        [KpiDictionary.contactsCountBlockedLastMonthEmailVo]: 3,
        [KpiDictionary.contactsCountUnsubscribedByEmailVo]: 4,
        [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStatsVo]: 20,
      },
    });
    const res = await getMonthlySummaryPayload(contact);
    expect(res.validEmails.perf).to.equal(Math.round(100 * (27 / 60)));
    expect(res.validEmails.evolution).to.equal('constant');
  });
});
