const { expect } = require('chai');
const { ObjectId } = require('mongodb');

const TestApp = require('../../../../../../../common/lib/test/test-app');

const {
  DataTypes,
  LeadSaleTypes,
  ExportPeriods,
  ExportTypes,
  AutomationCampaignTargets,
} = require('../../../../../../../frontend/utils/enumV2');
const GarageTypes = require('../../../../../../../common/models/garage.type');
const GarageHistoryPeriods = require('../../../../../../../common/models/garage-history.period');
const queryGenerators = require('../../../../../../../common/lib/garagescore/cockpit-exports/queries/query-generators');
const { todayDayNumber, dayNumber } = require('../../../../../../../common/lib/util/time-helper');

const testApp = new TestApp();

describe('CockpitExports - Query Generators', async function () {
  let garage, custeedUser, regularUser, allGarages;
  before(async function () {
    await testApp.reset();
    garage = await testApp.addGarage({ type: GarageTypes.DEALERSHIP });
    custeedUser = await testApp.addUser({ email: 'user@custeed.com' });
    regularUser = await testApp.addUser({ email: 'user@wanadoo.fr' });

    allGarages = await Promise.all(
      Array(50)
        .fill(null)
        .map(async () => testApp.addGarage({ type: GarageTypes.DEALERSHIP }))
    );

    [custeedUser, regularUser] = await Promise.all([custeedUser.getInstance(), regularUser.getInstance()]);

    custeedUser.garageIds = allGarages.map((garage) => garage.getId());
    regularUser.garageIds = allGarages.slice(0, 10).map((garage) => garage.getId());

    custeedUser.isGod = () => true;
  });

  it('Should Generate Correponding Mongo Query From Filters For GARAGES', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: [new ObjectId(), new ObjectId()],
      dataTypes: ['Apv', 'All'],
    };

    const custeedUserQuery = queryGenerators.garagesQueryGenerator(filters1);

    expect(custeedUserQuery).to.be.an.array;
    expect(custeedUserQuery.length).to.be.equals(5);
  });

  it('Should Generate Correponding Mongo Query From Filters For FRONT_DESK_USERS', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: [new ObjectId(), new ObjectId()],
      dataTypes: ['Apv', 'All'],
    };

    const custeedUserQuery = queryGenerators.garagesQueryGenerator(filters1);

    expect(custeedUserQuery).to.be.an.array;
    expect(custeedUserQuery.length).to.be.equals(5);
  });

  it('Should Generate Correponding Mongo Query From Filters For SATISFACTION', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['VN', 'VO'],
    };

    const custeedUserQuery = queryGenerators.satisfactionQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.satisfactionQueryGenerator(filters2);

    expect(custeedUserQuery.where.type).to.not.be.undefined;
    expect(custeedUserQuery.where.garageId.$in).to.be.an.array;

    expect(regularUserQuery.where.type.$in.length).to.be.equals(2);
    expect(regularUserQuery.where.garageId.$in.length).to.equals(2);
  });

  it('Should Generate Correponding Mongo Query From Filters For CONTACTS', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['VN', 'VO'],
    };

    const custeedUserQuery = queryGenerators.contactsQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.contactsQueryGenerator(filters2);

    expect(custeedUserQuery.where.type.$ne).to.be.equals(DataTypes.UNKNOWN);
    expect(custeedUserQuery.where.garageId.$in).to.be.an.array;

    expect(regularUserQuery.where.type.$in.length).to.be.equals(2);
    expect(regularUserQuery.where.garageId.$in.length).to.equals(2);
  });

  it('Should Generate Correponding Mongo Query From Filters For CONTACTS_MODIFIED', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['VN', 'VO'],
    };

    const custeedUserQuery = queryGenerators.contactsModifiedQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.contactsModifiedQueryGenerator(filters2);

    expect(custeedUserQuery.where.type.$ne).to.be.equals(DataTypes.UNKNOWN);
    expect(custeedUserQuery.where.garageId.$in).to.be.an.array;

    expect(regularUserQuery.where.type.$in.length).to.be.equals(2);
    expect(regularUserQuery.where.garageId.$in.length).to.equals(2);
  });

  it('Should Generate Correponding Mongo Query From Filters For UNSATISFIED', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['VN', 'VO'],
    };

    const custeedUserQuery = queryGenerators.unsatisfiedQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.unsatisfiedQueryGenerator(filters2);

    expect(custeedUserQuery.where.type).to.be.undefined;
    expect(custeedUserQuery.where.garageId.$in).to.be.an.array;

    expect(regularUserQuery.where.type.$in.length).to.be.equals(2);
    expect(regularUserQuery.where.garageId.$in.length).to.equals(2);
  });

  it('Should Generate Correponding Mongo Query From Filters For EREPUTATION', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['VN', 'VO'],
    };

    const custeedUserQuery = queryGenerators.ereputationQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.ereputationQueryGenerator(filters2);

    expect(custeedUserQuery.where.type).to.be.equals(DataTypes.EXOGENOUS_REVIEW);
    expect(custeedUserQuery.where.garageId.$in).to.be.an.array;

    expect(regularUserQuery.where.type).to.be.equals(DataTypes.EXOGENOUS_REVIEW);
    expect(regularUserQuery.where.garageId.$in.length).to.equals(2);
  });

  it('Should Generate Correponding Mongo Query From Filters For LEADS', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: ['Foo', 'Bar'],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: ['Foo', 'Bar'],
      dataTypes: [LeadSaleTypes.UNKNOWN, LeadSaleTypes.MAINTENANCE],
    };

    const custeedUserQuery = queryGenerators.leadsQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.leadsQueryGenerator(filters2);

    expect(custeedUserQuery.where.type).to.be.undefined;
    expect(custeedUserQuery.where['leadTicket.saleType']).to.be.undefined;
    expect(custeedUserQuery.where.garageId.$in).to.be.an.array;

    expect(regularUserQuery.where.type).to.be.undefined;
    expect(regularUserQuery.where['leadTicket.saleType'].$in.length).to.be.equals(3);
    expect(regularUserQuery.where['leadTicket.saleType'].$in).to.contain(LeadSaleTypes.UNKNOWN);
    expect(regularUserQuery.where['leadTicket.saleType'].$in).to.contain(null);
    expect(regularUserQuery.where['leadTicket.saleType'].$in).to.contain(LeadSaleTypes.MAINTENANCE);
    expect(regularUserQuery.where.garageId.$in.length).to.equals(2);
  });

  it('Should Generate Correponding Mongo Query From Filters For FORWARDED_LEADS', async function () {
    const filters1 = {
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      garageIds: [garage.getId().toString()],
      dataTypes: ['Apv', 'All'],
    };
    const filters2 = {
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      garageIds: [garage.getId().toString()],
      dataTypes: [LeadSaleTypes.UNKNOWN, LeadSaleTypes.MAINTENANCE],
    };

    const custeedUserQuery = queryGenerators.forwardedLeadsQueryGenerator(filters1);
    const regularUserQuery = queryGenerators.forwardedLeadsQueryGenerator(filters2);

    expect(custeedUserQuery.where.type).to.be.undefined;
    expect(custeedUserQuery.where['leadTicket.saleType']).to.be.undefined;
    expect(custeedUserQuery.where.garageId).to.be.undefined;
    expect(custeedUserQuery.where['source.garageId']).to.be.not.undefined;

    expect(regularUserQuery.where.type).to.be.undefined;
    expect(regularUserQuery.where['leadTicket.saleType'].$in.length).to.be.equals(3);
    expect(regularUserQuery.where['leadTicket.saleType'].$in).to.contain(LeadSaleTypes.UNKNOWN);
    expect(regularUserQuery.where['leadTicket.saleType'].$in).to.contain(null);
    expect(regularUserQuery.where['leadTicket.saleType'].$in).to.contain(LeadSaleTypes.MAINTENANCE);
    expect(regularUserQuery.where.garageId).to.be.undefined;
    expect(regularUserQuery.where['source.garageId'].$in.length).to.be.equals(1);
  });

  it('Should Generate Correponding Mongo Query From Filters For AUTOMATION_RGPD', async function () {
    const filters1 = {
      exportType: 'AUTOMATION_RGPD',
      periodId: ExportPeriods.LAST_QUARTER,
      garageIds: [garage.getId().toString()],
    };
    const filters2 = {
      exportType: 'AUTOMATION_RGPD',
      periodId: null,
      startPeriodId: '2021-month01',
      endPeriodId: '2021-month12',
      garageIds: [garage.getId().toString()],
    };

    const lastQuarterQuery = queryGenerators.automationRgpdQueryGenerator(filters1);
    const queryBetweenPeriod = queryGenerators.automationRgpdQueryGenerator(filters2);

    const expectLastQuarterNumber = todayDayNumber() - 90;
    const expectStart = dayNumber(new Date('2020-12-31T00:00:00.000Z'));
    const expectEnd = dayNumber(new Date('2021-12-31T00:00:00.000Z'));
    // expect today - 90
    expect(lastQuarterQuery[0].$match.$and[0].campaignRunDay.$gt).equal(expectLastQuarterNumber);
    // expect day number from date 2020-12-31 to 2021-12-31
    expect(queryBetweenPeriod[0].$match.$and[0].campaignRunDay.$gt).equal(expectStart);
    expect(queryBetweenPeriod[0].$match.$and[1].campaignRunDay.$lt).equal(expectEnd);
  });

  it('Should Generate Correponding Mongo Query From Filters For AUTOMATION_CAMPAIGN', async function () {
    const filters1 = {
      exportType: ExportTypes.AUTOMATION_CAMPAIGN,
      periodId: ExportPeriods.LAST_QUARTER,
      garageIds: [garage.getId().toString()],
      selectedAutomationCampaigns: [AutomationCampaignTargets.M_M],
    };
    const filters2 = {
      exportType: ExportTypes.AUTOMATION_CAMPAIGN,
      periodId: null,
      startPeriodId: '2021-month01',
      endPeriodId: '2021-month12',
      garageIds: [garage.getId().toString()],
      selectedAutomationCampaigns: [AutomationCampaignTargets.M_M],
    };

    const lastQuarterQuery = queryGenerators.automationCampaignQueryGenerator(filters1);
    const queryBetweenPeriod = queryGenerators.automationCampaignQueryGenerator(filters2);

    const expectLastQuarterNumber = todayDayNumber() - 90;
    const expectStart = dayNumber(new Date('2020-12-31T00:00:00.000Z'));
    const expectEnd = dayNumber(new Date('2021-12-31T00:00:00.000Z'));
    const lastQuarterGroupExpect = lastQuarterQuery[lastQuarterQuery.length - 1];
    const queryBetweenPeriodGroupExpect = queryBetweenPeriod[queryBetweenPeriod.length - 1];
    // expect today - 90
    expect(lastQuarterGroupExpect.$group.runDayNumber.$first.lt).equal(todayDayNumber() + 1);
    expect(lastQuarterGroupExpect.$group.runDayNumber.$first.gt).equal(expectLastQuarterNumber);
    // expect day number from date 2020-12-31 to 2021-12-31
    expect(queryBetweenPeriodGroupExpect.$group.runDayNumber.$first.gt).equal(expectStart);
    expect(queryBetweenPeriodGroupExpect.$group.runDayNumber.$first.lt).equal(expectEnd);
  });
});
