const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const ObjectId = require('mongodb').ObjectID;
const app = new TestApp();

const query = `query reportKpiGetMonthlySummary($reportId: String!, $dataType: String) {
    reportKpiGetMonthlySummary(reportId: $reportId, dataType: $dataType) {
        id
        month
        year
        garages {
        garageId
        garageName
        group
        authorizations {
            leads
            satisfaction
            problemResolution
            validEmails
        }
        }
        availableDataTypes {
        leads
        satisfaction
        problemResolution
        validEmails
        }
        bestLeadsPerf
        bestSatisfactionPerf
        bestProblemResolutionPerf
        bestValidEmailsPerf
        averageLeadsPerf
        averageSatisfactionPerf
        averageProblemResolutionPerf
        averageValidEmailsPerf
        leads {
        garageId
        garageName
        convertedLeads12M {
            newProjects
            knownProjects
            wonFromCompetition
        }
        convertedLeadsM {
            newProjects
            knownProjects
            wonFromCompetition
        }
        convertedLeadsM1 {
            newProjects
            knownProjects
            wonFromCompetition
        }
        convertedLeadsM2
        convertedLeadsM3
        detailsUrl
        }
        satisfaction {
        garageId
        garageName
        surveysResponded12M
        surveysRespondedM
        surveysRespondedM1
        surveysRespondedM2
        surveysRespondedM3
        ponderatedScore12M
        ponderatedScoreM
        ponderatedScoreM1
        ponderatedScoreM2
        ponderatedScoreM3
        satisfaction12M {
            promotors
            passives
            detractors
        }
        satisfactionM {
            promotors
            passives
            detractors
        }
        satisfactionM1 {
            promotors
            passives
            detractors
        }
        detailsUrl
        }
        problemResolution {
        garageId
        garageName
        countUnsatisfied12M
        countUnsatisfiedM
        countUnsatisfiedM1
        countUnsatisfiedM2
        countUnsatisfiedM3
        unsatisfiedSolved12M
        unsatisfiedSolvedM
        unsatisfiedSolvedM1
        unsatisfiedSolvedM2
        unsatisfiedSolvedM3
        problemProcessing12M {
            noAction
            contacted
            closedWithResolution
        }
        problemProcessingM {
            noAction
            contacted
            closedWithResolution
        }
        problemProcessingM1 {
            noAction
            contacted
            closedWithResolution
        }
        detailsUrl
        }
        validEmails {
        garageId
        garageName
        totalForEmails12M
        totalForEmailsM
        totalForEmailsM1
        totalForEmailsM2
        totalForEmailsM3
        validEmails12M
        validEmailsM
        validEmailsM1
        validEmailsM2
        validEmailsM3
        emailQuality12M {
            validEmails
            wrongEmails
            missingEmails
        }
        emailQualityM {
            validEmails
            wrongEmails
            missingEmails
        }
        emailQualityM1 {
            validEmails
            wrongEmails
            missingEmails
        }
        detailsUrl
        }
        employeesRanking {
        leads {
            employeeName
            garageName
            convertedLeads12M
            convertedLeadsM
            convertedLeadsM1
        }
        problemResolution {
            employeeName
            garageName
            solvingRate12M
            solvingRateM
            solvingRateM1
        }
        }
  }
}`;

const subscriptions = {
  active: true,
  Maintenance: {
    enabled: true,
  },
  UsedVehicleSale: {
    enabled: true,
  },
  NewVehicleSale: {
    enabled: true,
  },
  Lead: {
    enabled: true,
  },
};
const reportConfigs = {
  unsatisfiedApv: true,
  unsatisfiedVn: true,
  unsatisfiedVo: true,
  unsatisfiedVI: true,
  leadVn: true,
  leadVo: true,
  contactsApv: true,
  contactsVn: true,
  contactsVo: true,
  contactsVI: true,
};

/* Get report monthly summary from api */
describe('reportKpiGetMonthlySummary', async function descr() {
  let report;
  let garage;
  let user1 = Tools.random.user();
  before(async function () {
    await app.reset();
    user1.garageIds = [];
    garage = await app.models.Garage.create({
      type: 'Dealership',
      slug: 'nc',
      publicDisplayName: 'Smart Etoile 10 Troyes',
      securedDisplayName: 'Smart Etoile 10 Troyes',
      brandNames: ['Audi'],
      ratingType: 'rating',
      certificateWording: 'appointment',
      hideDirectoryPage: true,
      disableAutoAllowCrawlers: false,
      updateFrequency: 'never',
      status: 'RunningAuto',
      group: 'Chopard',
      enrichScriptEnabled: false,
      automaticBillingBillNow: false,
      postOnGoogleMyBusiness: true,
      locale: 'fr_FR',
      timezone: 'Europe/Paris',
      subscriptions: subscriptions,
    });
    user1.garageIds.push(garage.id);
    user1.reportConfigs = { monthlySummary: reportConfigs };
    user1 = await app.models.User.create(user1);
    // create document kpiByperiod for test
    const kpiByPeriod = {
      0: ObjectId(garage.id),
      2: 21,
      4: 201601,
      6: 0,
      1: user1.id,
      3: 0,
      2310: 10,
      2210: 8,
      2320: 10,
      2220: 8,
    };
    const kpiByPeriodForUnsatisfied = {
      0: ObjectId(garage.id),
      2: 20,
      4: 201601,
      6: 0,
      1: user1.id,
      3: 0,
      10101: 10,
      10301: 8,
      10201: 10,
      2220: 8,
      10110: 8,
      10210: 8,
    };
    await app.models.KpiByPeriod.create(kpiByPeriod);
    await app.models.KpiByPeriod.create(kpiByPeriodForUnsatisfied);

    const reportCreation = {
      userId: user1.id.toString(),
      reportConfigId: 'monthly',
      period: '2016-month12',
      month: 12,
      year: 2016,
      config: {
        enable: true,
        generalVue: true,
        lead: true,
        unsatisfiedApv: false,
        unsatisfiedVn: true,
        unsatisfiedVo: false,
      },
    };
    report = await app.models.Report.create(reportCreation);
  });

  describe('should return a valid summary', () => {
    it('should return a valid summary with a value for solvingRateM1 equal null', async () => {
      const variablesApollo = {
        reportId: report.id.toString(),
        dataType: 'allServices',
      };
      const resp = await sendQuery(app, query, variablesApollo);
      expect(resp.errors).to.be.undefined;
      expect(resp.data).to.exist;
      expect(resp.data.reportKpiGetMonthlySummary).to.be.an('object');
      expect(resp.data.reportKpiGetMonthlySummary.id).equal(report.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.year).equal(report.year);
      expect(resp.data.reportKpiGetMonthlySummary.month).equal(report.month);
      expect(resp.data.reportKpiGetMonthlySummary.averageLeadsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.averageProblemResolutionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.averageSatisfactionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.averageValidEmailsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestLeadsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestProblemResolutionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestSatisfactionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestValidEmailsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.garages).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.garages.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.garages[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.leads).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.leads.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.leads[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.problemResolution).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.problemResolution.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.problemResolution[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.satisfaction).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.satisfaction.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.satisfaction[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.validEmails).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.validEmails.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.validEmails[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes)
        .to.be.an('object')
        .to.have.keys('leads', 'problemResolution', 'satisfaction', 'validEmails');
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.problemResolution)
        .to.be.an('array')
        .to.have.a.lengthOf(3);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.problemResolution).to.have.members([
        'Maintenance',
        'NewVehicleSale',
        'UsedVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.leads).to.be.an('array').to.have.a.lengthOf(2);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.leads).to.have.members([
        'NewVehicleSale',
        'UsedVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.satisfaction)
        .to.be.an('array')
        .to.have.a.lengthOf(3);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.satisfaction).to.have.members([
        'Maintenance',
        'UsedVehicleSale',
        'NewVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.validEmails)
        .to.be.an('array')
        .to.have.a.lengthOf(3);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.validEmails).to.have.members([
        'Maintenance',
        'UsedVehicleSale',
        'NewVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking)
        .to.be.an('object')
        .to.have.keys('leads', 'problemResolution');
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads).to.be.an('array').to.have.a.lengthOf(1);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].employeeName).equal(user1.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].garageName).equal(garage.publicDisplayName);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].convertedLeads12M).equal(36);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].convertedLeadsM).equal(36);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].convertedLeadsM1).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].employeeName).equal(
        user1.firstName.concat(' ', user1.lastName)
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].garageName).equal(
        garage.publicDisplayName
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].solvingRate12M).equal(
        57.14285714285714
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].solvingRateM).equal(
        57.14285714285714
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].solvingRateM1).to.be.null;
    });

    it('should return a valid summary', async () => {
      const variablesApollo = {
        reportId: report.id.toString(),
        dataType: 'allServices',
      };
      await app.models.KpiByPeriod.create({
        0: ObjectId(garage.id),
        2: 20,
        4: 201512,
        6: 0,
        1: user1.id,
        3: 0,
        10101: 10,
        10301: 8,
        10201: 10,
        2220: 8,
        10110: 8,
        10210: 8,
      });
      const resp = await sendQuery(app, query, variablesApollo);
      expect(resp.errors).to.be.undefined;
      expect(resp.data).to.exist;
      expect(resp.data.reportKpiGetMonthlySummary).to.be.an('object');
      expect(resp.data.reportKpiGetMonthlySummary.id).equal(report.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.year).equal(report.year);
      expect(resp.data.reportKpiGetMonthlySummary.month).equal(report.month);
      expect(resp.data.reportKpiGetMonthlySummary.averageLeadsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.averageProblemResolutionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.averageSatisfactionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.averageValidEmailsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestLeadsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestProblemResolutionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestSatisfactionPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.bestValidEmailsPerf).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.garages).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.garages.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.garages[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.leads).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.leads.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.leads[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.problemResolution).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.problemResolution.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.problemResolution[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.satisfaction).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.satisfaction.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.satisfaction[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.validEmails).to.be.an('array');
      expect(resp.data.reportKpiGetMonthlySummary.validEmails.length).equal(1);
      expect(resp.data.reportKpiGetMonthlySummary.validEmails[0].garageId).equal(garage.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes)
        .to.be.an('object')
        .to.have.keys('leads', 'problemResolution', 'satisfaction', 'validEmails');
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.problemResolution)
        .to.be.an('array')
        .to.have.a.lengthOf(3);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.problemResolution).to.have.members([
        'Maintenance',
        'NewVehicleSale',
        'UsedVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.leads).to.be.an('array').to.have.a.lengthOf(2);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.leads).to.have.members([
        'NewVehicleSale',
        'UsedVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.satisfaction)
        .to.be.an('array')
        .to.have.a.lengthOf(3);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.satisfaction).to.have.members([
        'Maintenance',
        'UsedVehicleSale',
        'NewVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.validEmails)
        .to.be.an('array')
        .to.have.a.lengthOf(3);
      expect(resp.data.reportKpiGetMonthlySummary.availableDataTypes.validEmails).to.have.members([
        'Maintenance',
        'UsedVehicleSale',
        'NewVehicleSale',
      ]);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking)
        .to.be.an('object')
        .to.have.keys('leads', 'problemResolution');
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads).to.be.an('array').to.have.a.lengthOf(1);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].employeeName).equal(user1.id.toString());
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].garageName).equal(garage.publicDisplayName);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].convertedLeads12M).equal(36);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].convertedLeadsM).equal(36);
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.leads[0].convertedLeadsM1).to.be.null;
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].employeeName).equal(
        user1.firstName.concat(' ', user1.lastName)
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].garageName).equal(
        garage.publicDisplayName
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].solvingRate12M).equal(
        57.14285714285714
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].solvingRateM).equal(
        57.14285714285714
      );
      expect(resp.data.reportKpiGetMonthlySummary.employeesRanking.problemResolution[0].solvingRateM1).equal(
        57.14285714285714
      );
    });
  });
  describe('should handle errors correctly', () => {
    it('should return an error when a wrong reportId is passed', async () => {
      const variablesApollo = {
        reportId: '60643c0f863c1c306b762310', // Fake reportId
        dataType: 'allServices',
      };
      const resp = await sendQuery(app, query, variablesApollo);
      expect(resp.data).to.be.an('object');
      expect(resp.data.reportKpiGetMonthlySummary).to.be.null;
      expect(resp.errors).to.be.an('array').to.have.a.lengthOf(1);
      expect(resp.errors[0]).to.be.an('object').to.have.keys('message', 'locations', 'path', 'extensions');
      expect(resp.errors[0].message).equal('Invalid reportId : 60643c0f863c1c306b762310');
      expect(resp.errors[0].extensions).to.be.an('object').to.have.keys('code');
      expect(resp.errors[0].extensions['code']).equal('BAD_USER_INPUT');
    });
  });
});
