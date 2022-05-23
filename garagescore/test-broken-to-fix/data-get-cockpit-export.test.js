const { expect } = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../common/lib/test/test-app');
const {
  resolvers: {
    Query: { CockpitExport },
  },
} = require('../server/webservers-standalones/api/schema/start-cockpit-export');
const DataTypes = require('../common/models/data/type/data-types');
const GarageTypes = require('../common/models/garage.type');
const GarageHistoryPeriods = require('../common/models/garage-history.period');
const { ExportTypes, ExportCategories } = require('../frontend/utils/enumV2');
const _sendQueryAs = require('../test/apollo/_send-query-as');
const KpiDictionary = require('../common/lib/garagescore/kpi/KpiDictionary');
const KpiTypes = require('../common/models/kpi-type');
const KpiPeriods = require('../common/lib/garagescore/kpi/KpiPeriods');
const startExport = require('../workers/jobs/scripts/start-export');
const fieldHandler = require('../common/lib/garagescore/cockpit-exports/fields/fields-handler');

const testApp = new TestApp();

describe('Apollo - Data Get Cockpit Export', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Test Apollo/GraphQL Route Itself', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage({ type: GarageTypes.DEALERSHIP });
    const garage2 = await testApp.addGarage({ type: GarageTypes.DEALERSHIP });

    await testApp.models.KpiByPeriod.getMongoConnector().insertMany([
      {
        [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
        [KpiDictionary.garageId]: new ObjectID(garage1.id),
        [KpiDictionary.period]: KpiPeriods.fromGhPeriodToKpiPeriod(GarageHistoryPeriods.LAST_QUARTER, {}),
        [KpiDictionary.satisfactionCountReviews]: 5,
        [KpiDictionary.satisfactionCountReviewsApv]: 4,
        [KpiDictionary.satisfactionCountReviewsVn]: 1,
        [KpiDictionary.satisfactionCountReviewsVo]: 0,
        [KpiDictionary.satisfactionNPS]: 100,
        [KpiDictionary.satisfactionNPSApv]: 90,
        [KpiDictionary.satisfactionNPSVn]: 110,
        [KpiDictionary.contactsCountSurveysResponded]: 42,
        [KpiDictionary.contactsCountSurveysRespondedApv]: 10,
        [KpiDictionary.contactsCountSurveysRespondedVn]: 20,
        [KpiDictionary.contactsCountSurveysRespondedVo]: 12,
        [KpiDictionary.contactsCountSurveysRespondedPercent]: 100,
        [KpiDictionary.contactsCountSurveysRespondedPercentApv]: 100,
        [KpiDictionary.contactsCountSurveysRespondedPercentVn]: 100,
        [KpiDictionary.contactsCountSurveysRespondedPercentVo]: 100,
      },
      {
        [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
        [KpiDictionary.garageId]: new ObjectID(garage2.id),
        [KpiDictionary.period]: KpiPeriods.fromGhPeriodToKpiPeriod(GarageHistoryPeriods.LAST_QUARTER, {}),
        [KpiDictionary.satisfactionCountReviews]: 1,
        [KpiDictionary.satisfactionCountReviewsApv]: 0,
        [KpiDictionary.satisfactionCountReviewsVn]: 1,
        [KpiDictionary.satisfactionCountReviewsVo]: 0,
        [KpiDictionary.satisfactionNPS]: -50,
        [KpiDictionary.satisfactionNPSApv]: -100,
        [KpiDictionary.satisfactionNPSVn]: 0,
        [KpiDictionary.contactsCountSurveysResponded]: 100,
        [KpiDictionary.contactsCountSurveysRespondedApv]: 100,
        [KpiDictionary.contactsCountSurveysRespondedVn]: 0,
        [KpiDictionary.contactsCountSurveysRespondedVo]: 0,
        [KpiDictionary.contactsCountSurveysRespondedPercent]: 50,
        [KpiDictionary.contactsCountSurveysRespondedPercentApv]: 100,
        [KpiDictionary.contactsCountSurveysRespondedPercentVn]: 0,
        [KpiDictionary.contactsCountSurveysRespondedPercentVo]: 50,
      },
    ]);

    // Adding the created garage to the user
    await user.addGarage(garage1);
    await user.addGarage(garage2);

    const fields = [];

    for (const key of Object.keys(fieldHandler[ExportCategories.BY_GARAGES])) {
      fields.push(...fieldHandler[ExportCategories.BY_GARAGES][key]);
    }

    const res = await _sendQueryAs(
      testApp,
      `
      query CockpitExport_FJHeAaBGIAEffADGbFIGAfBCFIacDHee ($CockpitExport0exportType: String!,$CockpitExport0dataTypes: [String],$CockpitExport0garageIds: [String!],$CockpitExport0periodId: String, $CockpitExport0fields: [String!],$CockpitExport0recipients: [String!]) {
        CockpitExport (exportType: $CockpitExport0exportType,dataTypes: $CockpitExport0dataTypes,garageIds: $CockpitExport0garageIds,periodId: $CockpitExport0periodId,fields: $CockpitExport0fields,recipients: $CockpitExport0recipients) {
          email
          success
          error
         }
      }
      `,
      {
        CockpitExport0recipients: ['test@gs.com'],
        CockpitExport0exportType: ExportTypes.GARAGES,
        CockpitExport0dataTypes: ['All'],
        CockpitExport0garageIds: [garage1.id.toString(), garage2.id.toString()],
        CockpitExport0periodId: GarageHistoryPeriods.LAST_QUARTER,
        CockpitExport0fields: fields,
      },
      user.getId()
    );
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.CockpitExport).to.not.be.undefined;
    expect(res.data.CockpitExport.email).to.not.be.undefined;
    expect(res.data.CockpitExport.error).to.not.be.undefined;

    const job = await testApp.models.Job.findOne({});

    expect(job.status).to.equals('INQUEUE');
    expect(job.type).to.equals('START_EXPORT');

    await startExport(job, false);
  });

  it('Should Return Empty Array If There Is No Data To Return', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage = await testApp.addGarage();
    const args = {};
    const context = {};
    let result = null;

    // Adding the created garage to the user
    await user.addGarage(garage);

    // Simulating args & context
    args.recipients = ['test@gs.com'];
    args.exportType = ExportTypes.CONTACTS_MODIFIED;
    args.dataTypes = [DataTypes.MAINTENANCE];
    args.garageIds = [garage.id.toString()];
    args.periodId = GarageHistoryPeriods.ALL_HISTORY;
    args.fields = fieldHandler[ExportCategories.BY_DATA].COMMON;

    context.app = testApp;
    context.scope = { user: await user.getInstance(), godMode: false, garageIds: [garage.id], logged: true };

    // Simulating a query directly using the resolver function
    result = await CockpitExport({}, args, context);

    // Please be what we expect
    expect(result.email).to.contain('test@gs.com');
    expect(result.success).to.equals(true);

    const job = await testApp.models.Job.findOne({});

    expect(job.status).to.equals('INQUEUE');
    expect(job.type).to.equals('START_EXPORT');
  });
});
