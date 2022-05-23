const { expect } = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../common/lib/test/test-app');
const {
  resolvers: {
    Query: { AutomationKpis },
  },
} = require('../../server/webservers-standalones/api/schema/automation-campaign-get-kpis');
const GarageTypes = require('../../common/models/garage.type');
const KpiTypes = require('../../common/models/kpi-type');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');
const GarageHistoryPeriods = require('../../common/models/garage-history.period');
const KpiDictionnary = require('../../common/lib/garagescore/kpi/KpiDictionary');

const testApp = new TestApp();

describe('Apollo - Automation Campaign Get Kpis', async function () {
  const AUTOMATION_COUNT_GARAGE_1 = 42;
  const AUTOMATION_COUNT_GARAGE_2 = 11;

  beforeEach(async function () {
    await testApp.reset();

    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage();
    const garage2 = await testApp.addGarage();
    // Adding the created garage to the user
    await user.addGarage(garage1);
    await user.addGarage(garage2);


    await testApp.models.KpiByPeriod.getMongoConnector().insertMany([
      {
        [KpiDictionnary.garageId]: new ObjectID(garage1.id),
        [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
        [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
        [KpiDictionnary.KPI_automationCountSentSales]: AUTOMATION_COUNT_GARAGE_1,
        [KpiDictionnary.KPI_automationCountSentMaintenances]: AUTOMATION_COUNT_GARAGE_1,
        [KpiDictionnary.KPI_automationCountOpenedMaintenances]: AUTOMATION_COUNT_GARAGE_1,
        [KpiDictionnary.KPI_automationCountConvertedSales]: AUTOMATION_COUNT_GARAGE_1,
        [KpiDictionnary.KPI_automationCountConvertedMaintenances]: AUTOMATION_COUNT_GARAGE_1,
      },
      {
        [KpiDictionnary.garageId]: new ObjectID(garage2.id),
        [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
        [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
        [KpiDictionnary.KPI_automationCountSentSales]: AUTOMATION_COUNT_GARAGE_2,
        [KpiDictionnary.KPI_automationCountSentMaintenances]: AUTOMATION_COUNT_GARAGE_2,
        [KpiDictionnary.KPI_automationCountOpenedMaintenances]: AUTOMATION_COUNT_GARAGE_2,
        [KpiDictionnary.KPI_automationCountConvertedSales]: AUTOMATION_COUNT_GARAGE_2,
        [KpiDictionnary.KPI_automationCountConvertedMaintenances]: AUTOMATION_COUNT_GARAGE_2,
      },
    ]);

    this.currentTest.data = {
      user,
      garage1,
      garage2,
      context: {
        app : testApp,
        scope: {
          user: await user.getInstance(),
          godMode: true,
          garageIds: [garage1.id, garage2.id],
          logged: true,
        }
      }
    }

  });

  it('Should Return Automation KPIs for all garages', async function () {
    const {
      user,
      garage1,
      garage2,
      context
    } = this.test.data;

    // Simulating args & context
    const args = {
      period : GarageHistoryPeriods.LAST_QUARTER,
      cockpitType : GarageTypes.DEALERSHIP,
      limit : 10,
      skip : 0
    };

    // Simulating a query directly using the resolver function
    let result = await AutomationKpis({}, args, context);

    // Please be what we expect
    expect(result.KPI_automationCountSentSales).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountSentMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountOpenedMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountConvertedSales).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountConvertedMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
  });

  it('Should Return Automation KPIs for one garage', async function () {
    const {
      user,
      garage1,
      garage2,
      context
    } = this.test.data;

    // Simulating args & context
    const args = {
      period : GarageHistoryPeriods.LAST_QUARTER,
      cockpitType : GarageTypes.DEALERSHIP,
      limit : 10,
      skip : 0,
      garageId : [garage1.id]
    };

    // Simulating a query directly using the resolver function
    let result = await AutomationKpis({}, args, context);

    // Please be what we expect
    expect(result.KPI_automationCountSentSales).to.equals(AUTOMATION_COUNT_GARAGE_1);
    expect(result.KPI_automationCountSentMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1);
    expect(result.KPI_automationCountOpenedMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1);
    expect(result.KPI_automationCountConvertedSales).to.equals(AUTOMATION_COUNT_GARAGE_1);
    expect(result.KPI_automationCountConvertedMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1);
  });

  it('Should Return Automation KPIs for a list of garages', async function () {
    const {
      user,
      garage1,
      garage2,
      context
    } = this.test.data;

    // Simulating args & context
    const args = {
      period : GarageHistoryPeriods.LAST_QUARTER,
      cockpitType : GarageTypes.DEALERSHIP,
      limit : 10,
      skip : 0,
      garageId : [garage1.id, garage2.id]
    };

    // Simulating a query directly using the resolver function
    let result = await AutomationKpis({}, args, context);

    // Please be what we expect
    expect(result.KPI_automationCountSentSales).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountSentMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountOpenedMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountConvertedSales).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
    expect(result.KPI_automationCountConvertedMaintenances).to.equals(AUTOMATION_COUNT_GARAGE_1 + AUTOMATION_COUNT_GARAGE_2);
  });
});
