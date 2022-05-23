const { expect } = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../common/lib/test/test-app');
const {
  resolvers: {
    Query: { AutomationGaragesList },
  },
} = require('../../server/webservers-standalones/api/schema/kpi-by-period-get-automation-campaigns-garages-kpis');
const GarageTypes = require('../../common/models/garage.type');
const KpiTypes = require('../../common/models/kpi-type');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');
const GarageHistoryPeriods = require('../../common/models/garage-history.period');
const { AutomationCampaignStatuses } = require('../../frontend/utils/enumV2');
const KpiDictionnary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const timeHelper = require('../../common/lib/util/time-helper');
const AutomationCampaignChannels = require('../../common/models/automation-campaign-channel.type');
const AutomationCampaignsTypes = require('../../common/models/automation-campaign.type');

const testApp = new TestApp();

describe('Apollo - Kpi By Period Get Automation Campaigns Garages Kpis', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Return Automation KPIs', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const subscriptions = { active: true, Automation: { enabled: true } };
    const garage1 = await testApp.addGarage(subscriptions);
    const garage2 = await testApp.addGarage(subscriptions);
    const args = {};
    const context = {};

    // Adding the created garage to the user
    await user.addGarage(garage1);

    await testApp.models.AutomationCampaign.getMongoConnector().insertMany([
      {
        garageId: new ObjectID(garage1.id),
        type: AutomationCampaignsTypes.AUTOMATION_MAINTENANCE,
        status: AutomationCampaignStatuses.RUNNING,
        contactType: AutomationCampaignChannels.EMAIL,
        displayName: 'El Taz',
        target: 'ACQUIRED',
        firstRunDayNumber: 4242,
        runDayNumber:
          timeHelper.dayNumber(GarageHistoryPeriods.getPeriodMinDate(GarageHistoryPeriods.LAST_QUARTER)) + 10,
        hidden: false,
      },
      {
        garageId: new ObjectID(garage1.id),
        type: AutomationCampaignsTypes.AUTOMATION_MAINTENANCE,
        status: AutomationCampaignStatuses.CANCELLED,
        contactType: AutomationCampaignChannels.EMAIL,
        displayName: 'El Taz Junior',
        target: 'ACQUIRED',
        firstRunDayNumber: 4242,
        runDayNumber:
          timeHelper.dayNumber(GarageHistoryPeriods.getPeriodMinDate(GarageHistoryPeriods.LAST_QUARTER)) + 30,
        hidden: false,
      },
      {
        garageId: new ObjectID(garage2.id),
        type: AutomationCampaignsTypes.AUTOMATION_MAINTENANCE,
        status: AutomationCampaignStatuses.RUNNING,
        contactType: AutomationCampaignChannels.EMAIL,
        displayName: 'El Taz Senior',
        target: 'ACQUIRED',
        firstRunDayNumber: 4242,
        runDayNumber: timeHelper.dayNumber(GarageHistoryPeriods.getPeriodMinDate(GarageHistoryPeriods.LAST_QUARTER)),
        hidden: false,
      },
    ]);

    const campaigns = await testApp.models.AutomationCampaign.find({});

    await testApp.models.KpiByPeriod.getMongoConnector().insertMany([
      {
        [KpiDictionnary.garageId]: new ObjectID(garage1.id),
        [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
        [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
        [KpiDictionnary.automationCampaignId]: campaigns[0].id,
        [KpiDictionnary.KPI_automationCountTargetedSales]: 40,
        [KpiDictionnary.KPI_automationCountTargetedMaintenances]: 40,
        [KpiDictionnary.KPI_automationCountSentSales]: 20,
        [KpiDictionnary.KPI_automationCountSentMaintenances]: 20,
        [KpiDictionnary.KPI_automationCountOpenedMaintenances]: 10,
        [KpiDictionnary.KPI_automationCountConvertedSales]: 5,
        [KpiDictionnary.KPI_automationCountConvertedMaintenances]: 5,
      },
      {
        [KpiDictionnary.garageId]: new ObjectID(garage1.id),
        [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
        [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
        [KpiDictionnary.automationCampaignId]: campaigns[1].id,
        [KpiDictionnary.KPI_automationCountTargetedSales]: 10,
        [KpiDictionnary.KPI_automationCountTargetedMaintenances]: 10,
        [KpiDictionnary.KPI_automationCountSentSales]: 5,
        [KpiDictionnary.KPI_automationCountSentMaintenances]: 5,
        [KpiDictionnary.KPI_automationCountOpenedMaintenances]: 2,
        [KpiDictionnary.KPI_automationCountConvertedSales]: 1,
        [KpiDictionnary.KPI_automationCountConvertedMaintenances]: 1,
      },
      {
        [KpiDictionnary.garageId]: new ObjectID(garage2.id),
        [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
        [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
        [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
        [KpiDictionnary.automationCampaignId]: campaigns[2].id,
        [KpiDictionnary.KPI_automationCountTargetedSales]: 3,
        [KpiDictionnary.KPI_automationCountTargetedMaintenances]: 3,
        [KpiDictionnary.KPI_automationCountSentSales]: 3,
        [KpiDictionnary.KPI_automationCountSentMaintenances]: 3,
        [KpiDictionnary.KPI_automationCountOpenedMaintenances]: 3,
        [KpiDictionnary.KPI_automationCountConvertedSales]: 3,
        [KpiDictionnary.KPI_automationCountConvertedMaintenances]: 3,
      },
    ]);

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.skip = 0;
    args.type = AutomationCampaignsTypes.AUTOMATION_MAINTENANCE;
    args.order = 'DESC';
    args.orderBy = 'KPI_automationCountConvertedMaintenances';
    context.app = testApp;
    context.scope = {
      user: await user.getInstance(),
      godMode: false,
      garageIds: [garage1.id, garage2.id],
      logged: true,
    };

    // Simulating a query directly using the resolver function
    const resultMaintenance = await AutomationGaragesList({}, args, context);
    args.type = AutomationCampaignsTypes.AUTOMATION_VEHICLE_SALE;
    const resultSales = await AutomationGaragesList({}, args, context);
    // Please be what we expect
    // result for Maintenance KPI
    expect(resultMaintenance[0].automationCountCampaigns).to.equals(2);
    expect(resultMaintenance[0].KPI_automationCountSentMaintenances).to.equals(20 + 5);
    expect(resultMaintenance[0].KPI_automationCountOpenedMaintenances).to.equals(10 + 2);
    expect(resultMaintenance[0].KPI_automationCountConvertedMaintenances).to.equals(5 + 1);
    expect(resultMaintenance[0].KPI_automationCountSentSales).to.equals(0);
    expect(resultMaintenance[0].KPI_automationCountConvertedSales).to.equals(0);

    expect(resultMaintenance[1].automationCountCampaigns).to.equals(1);
    expect(resultMaintenance[1].KPI_automationCountSentMaintenances).to.equals(3);
    expect(resultMaintenance[1].KPI_automationCountOpenedMaintenances).to.equals(3);
    expect(resultMaintenance[1].KPI_automationCountConvertedMaintenances).to.equals(3);
    expect(resultMaintenance[1].KPI_automationCountSentSales).to.equals(0);
    expect(resultMaintenance[1].KPI_automationCountConvertedSales).to.equals(0);
    // result for Sales KPI
    expect(resultSales[0].automationCountCampaigns).to.equals(0);
    expect(resultSales[0].KPI_automationCountSentMaintenances).to.equals(0);
    expect(resultSales[0].KPI_automationCountOpenedMaintenances).to.equals(0);
    expect(resultSales[0].KPI_automationCountConvertedMaintenances).to.equals(0);
    expect(resultSales[0].KPI_automationCountSentSales).to.equals(25);
    expect(resultSales[0].KPI_automationCountConvertedSales).to.equals(6);

    expect(resultSales[1].automationCountCampaigns).to.equals(0);
    expect(resultSales[1].KPI_automationCountSentMaintenances).to.equals(0);
    expect(resultSales[1].KPI_automationCountOpenedMaintenances).to.equals(0);
    expect(resultSales[1].KPI_automationCountConvertedMaintenances).to.equals(0);
    expect(resultSales[1].KPI_automationCountSentSales).to.equals(3);
    expect(resultSales[1].KPI_automationCountConvertedSales).to.equals(3);

    args.garageId = [garage1.id, garage2.id];
    const resultMany = await AutomationGaragesList({}, args, context);
    expect(resultMany.length).to.equals(2);
  });
});

describe('Apollo - AutomationGaragesList search', async function () {
  let context = {};
  let args = {
    period: GarageHistoryPeriods.LAST_QUARTER,
    cockpitType: GarageTypes.DEALERSHIP,
    limit: 10,
    skip: 0,
    order: 'DESC',
    orderBy: 'automationCountSent',
  };
  beforeEach(async function () {
    await testApp.reset();
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage({ publicDisplayName: 'garageTest1', externalId: 'test1_12345' });
    const garage2 = await testApp.addGarage({ publicDisplayName: 'garageTest2', externalId: 'garageTest2' });
    const garage3 = await testApp.addGarage({ publicDisplayName: 'garageTest3', externalId: 'test3_123' });
    const garage4 = await testApp.addGarage({ publicDisplayName: 'garageTest4', externalId: 'garageTest4' });

    await testApp.models.AutomationCampaign.getMongoConnector().insertMany([
      {
        garageId: new ObjectID(garage1.id),
      },
      {
        garageId: new ObjectID(garage2.id),
      },
      {
        garageId: new ObjectID(garage3.id),
      },
      {
        garageId: new ObjectID(garage4.id),
      },
    ]);

    const campaigns = await testApp.models.AutomationCampaign.find({});
    const baseKpi = {
      [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
      [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
      [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
      [KpiDictionnary.automationCampaignId]: campaigns[0].id,
      [KpiDictionnary.KPI_automationCountTargetedSales]: 40,
      [KpiDictionnary.KPI_automationCountTargetedMaintenances]: 40,
      [KpiDictionnary.KPI_automationCountSentSales]: 20,
      [KpiDictionnary.KPI_automationCountSentMaintenances]: 20,
      [KpiDictionnary.KPI_automationCountOpenedMaintenances]: 10,
      [KpiDictionnary.KPI_automationCountConvertedSales]: 5,
      [KpiDictionnary.KPI_automationCountConvertedMaintenances]: 5,
    };
    await testApp.models.KpiByPeriod.getMongoConnector().insertMany([
      {
        [KpiDictionnary.garageId]: new ObjectID(garage1.id),
        ...baseKpi,
      },
      {
        [KpiDictionnary.garageId]: new ObjectID(garage2.id),
        ...baseKpi,
      },
      {
        [KpiDictionnary.garageId]: new ObjectID(garage3.id),
        ...baseKpi,
      },
      {
        [KpiDictionnary.garageId]: new ObjectID(garage4.id),
        ...baseKpi,
      },
    ]);
    context.app = testApp;
    context.scope = {
      user: await user.getInstance(),
      godMode: false,
      garageIds: [garage1.id, garage2.id, garage3.id, garage4.id],
      logged: true,
    };
  });

  it('An empty search should return all garages', async function () {
    args.search = '';

    let result = await AutomationGaragesList({}, args, context);

    expect(result.length).to.equals(4);
  });

  it('should return only the correct garage when searching a publicDisplayName ', async function () {
    args.search = 'garageTest1';

    let result = await AutomationGaragesList({}, args, context);

    expect(result.length).to.equals(1);
    expect(result[0].garagePublicDisplayName).to.equal('garageTest1');
  });

  it('should return only the correct garage when searching with a externalId ', async function () {
    args.search = 'test3_123';

    let result = await AutomationGaragesList({}, args, context);

    expect(result.length).to.equals(1);
    expect(result[0].garagePublicDisplayName).to.equal('garageTest3');
    expect(result[0].externalId).to.equal('test3_123');
  });

  it('should not return return duplicates when publicDisplayName and externalId are the same', async function () {
    args.search = 'garageTest4';

    let result = await AutomationGaragesList({}, args, context);

    expect(result.length).to.equals(1);
    expect(result[0].garagePublicDisplayName).to.equal('garageTest4');
    expect(result[0].externalId).to.equal('garageTest4');
  });
});
