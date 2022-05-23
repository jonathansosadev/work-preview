const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const GarageHistoryPeriods = require('../../common/models/garage-history.period');
const { AutomationCampaignStatuses } = require('../../frontend/utils/enumV2');
const timeHelper = require('../../common/lib/util/time-helper');
const TestApp = require('../../common/lib/test/test-app');
const {
  resolvers: {
    Mutation: { AutomationCampaignsToggleStatus },
  },
} = require('../../server/webservers-standalones/api/schema/automation-campaigns-toggle-status');
const { AutomationCampaignTargets } = require('../../frontend/utils/enumV2');

const testApp = new TestApp();

describe('Apollo - Automation Campaigns Toggle Status', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Activate Campaigns For Given Garages', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage();
    const garage2 = await testApp.addGarage();
    const args = {};
    const context = {};
    let result = null;

    // Adding the created garage to the user
    await user.addGarage(garage1);
    await user.addGarage(garage2);

    await testApp.models.AutomationCampaign.getMongoConnector().insertMany([
      {
        garageId: new ObjectID(garage1.id),
        type: 'Foo',
        status: AutomationCampaignStatuses.IDLE,
        contactType: 'Baz',
        displayName: 'El Taz',
        target: AutomationCampaignTargets.M_M,
        firstRunDayNumber: 4242,
        runDayNumber:
          timeHelper.dayNumber(GarageHistoryPeriods.getPeriodMinDate(GarageHistoryPeriods.LAST_QUARTER)) + 10,
        hidden: false,
      },
      {
        garageId: new ObjectID(garage1.id),
        type: 'Foz',
        status: AutomationCampaignStatuses.CANCELLED,
        contactType: 'Baz',
        displayName: 'El Taz Junior',
        target: AutomationCampaignTargets.M_UVS,
        firstRunDayNumber: 4242,
        runDayNumber:
          timeHelper.dayNumber(GarageHistoryPeriods.getPeriodMinDate(GarageHistoryPeriods.LAST_QUARTER)) + 30,
        hidden: false,
      },
      {
        garageId: new ObjectID(garage2.id),
        type: 'Foz',
        status: AutomationCampaignStatuses.IDLE,
        contactType: 'Zob',
        displayName: 'El Taz Senior',
        target: AutomationCampaignTargets.M_M,
        firstRunDayNumber: 4242,
        runDayNumber: timeHelper.dayNumber(GarageHistoryPeriods.getPeriodMinDate(GarageHistoryPeriods.LAST_QUARTER)),
        hidden: true,
      },
    ]);

    // Simulating args & context
    args.target = AutomationCampaignTargets.M_M;
    args.garageIds = [garage1.id.toString(), garage2.id.toString()];
    args.status = AutomationCampaignStatuses.RUNNING;
    context.app = testApp;
    context.scope = {
      user: await user.getInstance(),
      godMode: false,
      garageIds: [garage1.id, garage2.id],
      logged: true,
    };

    // Simulating a query directly using the resolver function
    result = await AutomationCampaignsToggleStatus({}, args, context);

    // Please be what we expect
    expect(result.length).to.equals(2);
    expect(result[0].status).to.equals(AutomationCampaignStatuses.RUNNING);
    expect(result[1].status).to.equals(AutomationCampaignStatuses.CANCELLED);
  });
});
