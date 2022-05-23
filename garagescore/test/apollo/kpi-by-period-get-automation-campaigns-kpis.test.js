const { expect } = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const AutomationCampaignType = require('../../common/models/automation-campaign.type');
const {
  resolvers: {
    Query: { AutomationCampaignsList },
  },
} = require('../../server/webservers-standalones/api/schema/kpi-by-period-get-automation-campaigns-kpis');
const GarageTypes = require('../../common/models/garage.type');
const KpiTypes = require('../../common/models/kpi-type');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');
const GarageHistoryPeriods = require('../../common/models/garage-history.period');
const { AutomationCampaignTargets } = require('../../frontend/utils/enumV2');
const KpiDictionnary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const timeHelper = require('../../common/lib/util/time-helper');

const testApp = new TestApp();

const KPI_BY_PERIOD_ONE = 42;
const KPI_BY_PERIOD_TWO = 11;

const createKpiByPeriodData = async (type, garageId, target) => {
  await testApp.models.AutomationCampaign.getMongoConnector().insertMany([
    {
      garageId: ObjectId(garageId),
      type: type,
      status: 'Bar',
      contactType: 'EMAIL',
      displayName: 'El Taz',
      target: target,
      firstRunDayNumber: 4242,
      runDayNumber: timeHelper.dayNumber(new Date()) - 7,
      hidden: false,
    },
    {
      garageId: ObjectId(garageId),
      type: type,
      status: 'Bar',
      contactType: 'MOBILE',
      displayName: 'El Taz Junior',
      target: target,
      firstRunDayNumber: 4242,
      runDayNumber: timeHelper.dayNumber(new Date()) - 666,
      hidden: false,
    },
  ]);

  const campaigns = await testApp.models.AutomationCampaign.find({});

  await testApp.models.KpiByPeriod.getMongoConnector().insertMany([
    {
      [KpiDictionnary.garageId]: ObjectId(garageId),
      [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
      [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
      [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
      [KpiDictionnary.automationCampaignId]: campaigns[campaigns.length - 2].id,//before last inserted
      [KpiDictionnary.KPI_automationCountSentSales]: KPI_BY_PERIOD_ONE,
      [KpiDictionnary.KPI_automationCountSentMaintenances]: KPI_BY_PERIOD_ONE,
      [KpiDictionnary.KPI_automationCountSentSales]: KPI_BY_PERIOD_ONE,
      [KpiDictionnary.KPI_automationCountSentMaintenances]: KPI_BY_PERIOD_ONE,
      [KpiDictionnary.KPI_automationCountConvertedSales]: KPI_BY_PERIOD_ONE,
      [KpiDictionnary.KPI_automationCountConvertedMaintenances]: KPI_BY_PERIOD_ONE,
    },
    {
      [KpiDictionnary.garageId]: ObjectId(garageId),
      [KpiDictionnary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
      [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
      [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
      [KpiDictionnary.automationCampaignId]: campaigns[campaigns.length - 1].id,//last inserted
      [KpiDictionnary.KPI_automationCountSentSales]: KPI_BY_PERIOD_TWO,
      [KpiDictionnary.KPI_automationCountSentMaintenances]: KPI_BY_PERIOD_TWO,
      [KpiDictionnary.KPI_automationCountSentSales]: KPI_BY_PERIOD_TWO,
      [KpiDictionnary.KPI_automationCountSentMaintenances]: KPI_BY_PERIOD_TWO,
      [KpiDictionnary.KPI_automationCountConvertedSales]: KPI_BY_PERIOD_TWO,
      [KpiDictionnary.KPI_automationCountConvertedMaintenances]: KPI_BY_PERIOD_TWO,
    },
  ]);
};
describe('Apollo - Kpi By Period Get Automation Campaigns Kpis', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Return Automation KPIs for AUTOMATION_MAINTENANCE', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage();

    // Adding the created garage to the user
    await user.addGarage(garage1);
    await createKpiByPeriodData(
      AutomationCampaignType.AUTOMATION_MAINTENANCE,
      garage1.id,
      AutomationCampaignTargets.M_M
    );
    // Simulating args & context
    const args = {
      period: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.DEALERSHIP,
      type: AutomationCampaignType.AUTOMATION_MAINTENANCE,
      orderBy: 'KPI_automationTotalConverted',
      order: 'DESC',
      search: '',
    };
    const context = {
      app: testApp,
      scope: {
        user: await user.getInstance(),
        godMode: true,
        garageIds: [garage1.id],
        logged: true,
      },
    };
    // Simulating a query directly using the resolver function
    const [result] = await AutomationCampaignsList({}, args, context);
    // Please be what we expect
    expect(result._id).to.equals(AutomationCampaignTargets.M_M);
    expect(result.KPI_automationTotalConverted).to.equals(KPI_BY_PERIOD_ONE + KPI_BY_PERIOD_TWO);
    expect(result.KPI_automationTotalSent).to.equals(KPI_BY_PERIOD_ONE + KPI_BY_PERIOD_TWO);
    expect(result.KPI_automationCountSentEmail).to.equals(KPI_BY_PERIOD_ONE);
    expect(result.KPI_automationCountSentSms).to.equals(KPI_BY_PERIOD_TWO);
    expect(result.KPI_automationCountConvertedEmail).to.equals(KPI_BY_PERIOD_ONE);
    expect(result.KPI_automationCountConvertedSms).to.equals(KPI_BY_PERIOD_TWO);
  });

  it('Should Return Automation KPIs with two garages', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage();
    const garage2 = await testApp.addGarage();

    // Adding the created garage to the user
    await user.addGarage(garage1);
    await user.addGarage(garage2);
    await createKpiByPeriodData(
      AutomationCampaignType.AUTOMATION_MAINTENANCE,
      garage1.id,
      AutomationCampaignTargets.M_M
    );
    await createKpiByPeriodData(
      AutomationCampaignType.AUTOMATION_MAINTENANCE,
      garage2.id,
      AutomationCampaignTargets.M_M
    );
    // Simulating args & context
    const args = {
      period: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.DEALERSHIP,
      garageId: [garage1.id, garage2.id],
      type: AutomationCampaignType.AUTOMATION_MAINTENANCE,
      orderBy: 'KPI_automationTotalConverted',
      order: 'DESC',
      search: '',
    };
    const context = {
      app: testApp,
      scope: {
        user: await user.getInstance(),
        godMode: true,
        garageIds: [garage1.id, garage2.id],
        logged: true,
      },
    };
    // Simulating a query directly using the resolver function
    const [result] = await AutomationCampaignsList({}, args, context);

    // Please be what we expect
    expect(result.KPI_automationTotalConverted).to.equals(2 * (KPI_BY_PERIOD_ONE + KPI_BY_PERIOD_TWO));
    expect(result.KPI_automationTotalSent).to.equals(2 * (KPI_BY_PERIOD_ONE + KPI_BY_PERIOD_TWO));
    expect(result.KPI_automationCountSentEmail).to.equals(2 * (KPI_BY_PERIOD_ONE));
    expect(result.KPI_automationCountSentSms).to.equals(2 * (KPI_BY_PERIOD_TWO));
    expect(result.KPI_automationCountConvertedEmail).to.equals(2 * (KPI_BY_PERIOD_ONE));
    expect(result.KPI_automationCountConvertedSms).to.equals(2 * (KPI_BY_PERIOD_TWO));
  });

  return;
  it('Should Return Automation KPIs for AUTOMATION_VEHICLE_SALE', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage();
    // Adding the created garage to the user
    await user.addGarage(garage1);
    await createKpiByPeriodData(
      AutomationCampaignType.AUTOMATION_VEHICLE_SALE,
      garage1.id,
      AutomationCampaignTargets.VS_M_6
    );
    // Simulating a query directly using the resolver function
    const args = {
      period: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.DEALERSHIP,
      type: AutomationCampaignType.AUTOMATION_VEHICLE_SALE,
      orderBy: 'KPI_automationTotalConverted',
      order: 'DESC',
      search: '',
    };
    const context = {
      app: testApp,
      scope: {
        user: await user.getInstance(),
        godMode: true,
        garageIds: [garage1.id],
        logged: true,
      },
    };
    const [result] = await AutomationCampaignsList({}, args, context);
    // Please be what we expect
    expect(result._id).to.equals(AutomationCampaignTargets.VS_M_6);
    expect(result.KPI_automationTotalConverted).to.equals(KPI_BY_PERIOD_ONE + KPI_BY_PERIOD_TWO);
    expect(result.KPI_automationTotalSent).to.equals(KPI_BY_PERIOD_ONE + KPI_BY_PERIOD_TWO);
    expect(result.KPI_automationCountSentEmail).to.equals(KPI_BY_PERIOD_ONE);
    expect(result.KPI_automationCountSentSms).to.equals(KPI_BY_PERIOD_TWO);
    expect(result.KPI_automationCountConvertedEmail).to.equals(KPI_BY_PERIOD_ONE);
    expect(result.KPI_automationCountConvertedSms).to.equals(KPI_BY_PERIOD_TWO);
  });
});
