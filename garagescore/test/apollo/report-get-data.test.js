const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const { ObjectId } = require('mongodb');
const ReportConfigs = require('../../common/lib/garagescore/report/configuration');
const ReportFormat = require('../../common/models/report.format');
const KpiDictionary = require('../../common/lib/garagescore/kpi/KpiDictionary');

const app = new TestApp();

const query = `query reportGetData($reportId: String!) {
  reportGetData(reportId: $reportId) {
        status
        message
        data {
          garageId
          garagePublicDisplayName
          garagePublicSearchName
          garageType
          garageRatingType
          garagePublicSubscriptions {
            subscribed
            notSubscribed
          }
          countSurveyLead
          countSurveySatisfied
          countSurveyUnsatisfied
          countSurveysResponded
          countSurveysRespondedAPV
          countSurveysRespondedVN
          countSurveysRespondedVO
          countSurveyPromotor
          countSurveyDetractor
          score
          scoreAPV
          scoreVN
          scoreVO
          scoreNPS
          surveysLead {
            garageId
            dataId
            completedAt
            customerFullName
            customerEmail
            customerPhone
            surveyUpdatedAt
            vehiculeRegistrationPlate
            vehiculeRegistrationDate
            vehiculeModel
            vehiculeMake
            leadTiming
            leadType
            leadSaleType
            leadKnowVehicle
            leadVehicle
            leadTradeIn
            leadBrands
            leadEnergyType
            leadBodyType
            leadFinancing
          }
          surveysUnsatisfied {
            garageId
            dataId
            completedAt
            customerFullName
            customerCity
            surveyUpdatedAt
            surveyScore
            type
            surveyComment
            vehicleMakePublicDisplayName
            vehicleModelPublicDisplayName
            publicReviewStatus
            publicReviewCommentStatus
          }
          surveysUnsatisfiedFollowup {
            garageId
            dataId
            completedAt
            customerFullName
            garageProvidedFrontDeskUserName
            type
            surveyUpdatedAt
            followupSurveyUpdatedAt
            unsatisfactionIsRecontacted
            unsatisfactionIsResolved
            unsatisfactionIsResolutionInProgress
            unsatisfiedIsEvaluationChanged
            followupUnsatisfiedComment
          }
          surveysSatisfied {
            completedAt
            customerFullName
            customerCity
            surveyUpdatedAt
            surveyScore
            type
            surveyComment
            vehicleMakePublicDisplayName
            vehicleModelPublicDisplayName
            transactionPublicDisplayName
            publicReviewStatus
            publicReviewCommentStatus
          }
        }
      }
 }`;

async function generateReport(testApp, { user, reportConfigId, refDate }) {
  const config = ReportConfigs.get(reportConfigId);

  return testApp.models.Report.create({
    userId: user.id,
    userEmail: user.email,
    garageIds: user.garageIds,
    reportConfigId: reportConfigId,
    period: config.tokenDate(refDate),
    minDate: config.referenceDateMin(refDate),
    maxDate: config.referenceDateMax(refDate),
    config: user.reportConfigs[reportConfigId],
    format: ReportFormat.HTML,
    sendDate: null,
  });
}

async function generateUser(testApp, garageIds = []) {
  return testApp
    .addUser({
      garageIds: garageIds.map(ObjectId),
      reportConfigs: {
        daily: {
          enable: true,
          generalVue: true,
          lead: true,
          unsatisfiedApv: true,
          unsatisfiedVn: true,
          unsatisfiedVo: true,
        },
        weekly: {
          enable: true,
          generalVue: true,
          lead: true,
          unsatisfiedApv: true,
          unsatisfiedVn: true,
          unsatisfiedVo: true,
        },
        monthly: {
          enable: true,
          generalVue: true,
          lead: true,
          unsatisfiedApv: true,
          unsatisfiedVn: true,
          unsatisfiedVo: true,
          leadVn: true,
          leadVo: true,
          UnsatisfiedVI: true,
        },
      },
    })
    .then((u) => u.getInstance());
}

async function addKpis(testApp, garageId) {
  const kpiDailyPeriodsToCreate = Array.from(Array(31), (_, x) => {
    const day = (x + 1).toLocaleString('fr-FR', {
      minimumIntegerDigits: 2,
    });

    return Number(`202201${day}`);
  });

  // we add 2 periods that are not part of the month
  const extraPeriods = [20211231, 20220201];
  kpiDailyPeriodsToCreate.push(...extraPeriods);

  // [weekly report] this is the week we are testing, we give it special values
  const weeklyPeriods = kpiDailyPeriodsToCreate.filter((p) => p >= 20220103 && p <= 20220109);

  // [daily report] this is the day we are testing, we give it a special values
  const dailyPeriod = 20220112;

  const generateKpiDocument = (period) => {
    const kpiValue = () => {
      if (extraPeriods.includes(period)) {
        return 42;
      }

      if (weeklyPeriods.includes(period)) {
        return 3;
      }

      if (period === dailyPeriod) {
        return 100;
      }

      return 1;
    };

    return {
      0: new ObjectId(garageId),
      1: -1,
      2: 10,
      3: 0,
      4: period,
      6: -1,
      7: -1,
      [KpiDictionary.countLeads]: kpiValue(),
      [KpiDictionary.countUnsatisfied]: 1,
      [KpiDictionary.contactsCountSurveysResponded]: 1,
      [KpiDictionary.contactsCountSurveysRespondedApv]: 1,
      [KpiDictionary.satisfactionCountPromoters]: 1,
      [KpiDictionary.satisfactionCountDetractors]: 0,
      [KpiDictionary.satisfactionCountPassives]: 0,
      [KpiDictionary.satisfactionSumRating]: 10,
      [KpiDictionary.satisfactionCountReviews]: 1,
      [KpiDictionary.satisfactionSumRatingApv]: 10,
      [KpiDictionary.satisfactionCountReviewsApv]: 1,
    };
  };

  return testApp.models.KpiByDailyPeriod.getMongoConnector().insertMany(
    kpiDailyPeriodsToCreate.map(generateKpiDocument)
  );
}

describe('apollo::reportGetData', () => {
  let user;
  let garage;
  let garageWithNoKpis;
  // do not put before each, thanks <3
  before(async () => {
    await app.reset();
    garage = await app.addGarage().then((g) => g.getInstance());
    garageWithNoKpis = await app.addGarage().then((g) => g.getInstance());

    user = await generateUser(app, [garage.id, garageWithNoKpis.id]);
    await addKpis(app, garage.id);
  });

  it('Should send an error if the report does not exist', async () => {
    // fake id used
    const {
      data: { reportGetData },
    } = await sendQueryAs(app, query, { reportId: '5879a2416b54381a00624943' }, user.getId());

    expect(reportGetData.status).to.equal('error');
    expect(reportGetData.message).to.equal('reportNotFound');
    expect(reportGetData.data).to.be.empty;
  });

  it("Should send an error if the user doesn't have at least one garage", async () => {
    const userWithNoGarages = await generateUser(app);

    const report = await generateReport(app, {
      user: userWithNoGarages,
      reportConfigId: 'monthly',
      refDate: new Date('2022-02-12T09:42:00'),
    });

    const {
      data: { reportGetData },
    } = await sendQueryAs(app, query, { reportId: report.id.toString() }, userWithNoGarages.id);

    expect(reportGetData.status).to.equal('error');
    expect(reportGetData.message).to.equal('noConfiguredGarage');
    expect(reportGetData.data).to.be.empty;
  });

  it("Should not send an error if the user's garages doesn't have any kpi's", async () => {
    const report = await generateReport(app, {
      user,
      reportConfigId: 'monthly',
      refDate: new Date('2022-02-12T09:42:00'),
    });

    const {
      data: { reportGetData },
    } = await sendQueryAs(app, query, { reportId: report.id.toString() }, user.id);

    expect(reportGetData.status).to.equal('success');
    expect(reportGetData.message).to.be.empty;
    // 1 garage with kpi's and 1 without
    expect(reportGetData.data).to.have.a.lengthOf(2);
  });

  it("[monthly] Should correctly aggregate all the kpi's", async () => {
    const report = await generateReport(app, {
      user,
      reportConfigId: 'monthly',
      refDate: new Date('2022-02-12T09:42:00'), // the report will be for january
    });

    const {
      data: { reportGetData },
    } = await sendQueryAs(app, query, { reportId: report.id.toString() }, user.id);

    expect(reportGetData.status).to.equal('success');
    expect(reportGetData.message).to.be.empty;
    expect(reportGetData.data).to.have.a.lengthOf(2);

    const reportData = reportGetData.data.find((doc) => doc.garageId.toString() === garage.id.toString());

    expect(reportData.countSurveyLead).to.equal(23 + 7 * 3 + 100); // 23 days with a value of 1 + 7 days with a value of 3 + 1 day with a value of 100
    expect(reportData.score).to.equal(10);
    expect(reportData.scoreNPS).to.equal(100);
  });

  it("[weekly] : Should correctly aggregate all the kpi's", async () => {
    const report = await generateReport(app, {
      user,
      reportConfigId: 'weekly',
      refDate: new Date('2022-01-14T09:42:00'), // will generate the report for the week 03/01/2022 to 09/01/2022
    });

    const {
      data: { reportGetData },
    } = await sendQueryAs(app, query, { reportId: report.id.toString() }, user.id);

    expect(reportGetData.status).to.equal('success');
    expect(reportGetData.message).to.be.empty;
    expect(reportGetData.data).to.have.a.lengthOf(2);

    const reportData = reportGetData.data.find((doc) => doc.garageId.toString() === garage.id.toString());

    expect(reportData.countSurveyLead).to.equal(7 * 3);
  });

  it("[daily] : Should correctly aggregate all the kpi's", async () => {
    const report = await generateReport(app, {
      user,
      reportConfigId: 'daily',
      refDate: new Date('2022-01-13T09:42:00'), // will generate the report for the day 12/01/2022
    });

    const {
      data: { reportGetData },
    } = await sendQueryAs(app, query, { reportId: report.id.toString() }, user.id);

    expect(reportGetData.status).to.equal('success');
    expect(reportGetData.message).to.be.empty;
    expect(reportGetData.data).to.have.a.lengthOf(2);

    const reportData = reportGetData.data.find((doc) => doc.garageId.toString() === garage.id.toString());

    expect(reportData.countSurveyLead).to.equal(100);
  });
});
