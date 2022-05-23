const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const { AutomationCampaignStatuses } = require('../../frontend/utils/enumV2');
const timeHelper = require('../../common/lib/util/time-helper');
const TestApp = require('../../common/lib/test/test-app');
const {
  resolvers: {
    Mutation: { AutomationCampaignsSetCustomContent },
  },
} = require('../../server/webservers-standalones/api/schema/automation-campaigns-set-custom-content');
const { AutomationCampaignTargets } = require('../../frontend/utils/enumV2');

const testApp = new TestApp();

describe('Apollo - Automation Campaigns Set Custom Content', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Add new custom content', async function () {
    const user = await testApp.addUser({ email: 'user@gmail.com' });
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
        status: AutomationCampaignStatuses.IDLE,
        contactType: 'EMAIL',
        displayName: 'El Taz',
        target: AutomationCampaignTargets.M_M,
        firstRunDayNumber: 4242,
        runDayNumber: 18563,
        hidden: false,
      },
      {
        garageId: new ObjectID(garage1.id),
        status: AutomationCampaignStatuses.CANCELLED,
        contactType: 'Baz',
        displayName: 'El Taz Junior',
        target: AutomationCampaignTargets.M_UVS,
        firstRunDayNumber: 4242,
        runDayNumber: 18563,
        hidden: false,
      },
      {
        garageId: new ObjectID(garage2.id),
        status: AutomationCampaignStatuses.IDLE,
        contactType: 'EMAIL',
        displayName: 'El Taz Senior',
        target: AutomationCampaignTargets.M_M,
        firstRunDayNumber: 4242,
        runDayNumber: 18563,
        hidden: true,
      },
    ]);

    const todayDayNumber = timeHelper.dayNumber(new Date());
    // Simulating args & context
    args.target = AutomationCampaignTargets.M_M;
    args.affectedGarageIds = [garage1.id.toString()];
    args.displayName = 'TestContent';
    args.promotionalMessage = 'TestPromoMessage';
    args.themeColor = '#tested';
    args.dayNumberStart = todayDayNumber + 1;
    args.dayNumberEnd = null;
    args.noExpirationDate = true;
    context.app = testApp;
    context.scope = {
      user: await user.getInstance(),
      godMode: false,
      garageIds: [garage1.id, garage2.id],
      logged: true,
    };

    // Simulating a query directly using the resolver function
    result = await AutomationCampaignsSetCustomContent({}, args, context);
    const customContents = await testApp.models.AutomationCampaignsCustomContent.find({ where: {}, fields: {} });
    const campaigns = await testApp.models.AutomationCampaign.find({ where: {}, fields: {} });
    // Please be what we expect
    expect(customContents.length).to.equals(1);
    expect(customContents[0].displayName).to.equals('TestContent');
    expect(customContents[0].target).to.equals('M_M');
    expect(customContents[0].noExpirationDate).to.equals(true);
    expect(customContents[0].dayNumberEnd).to.equals(999999999);
    expect(campaigns.find((e) => e.displayName === 'El Taz').customContentId.toString()).to.equals(
      customContents[0].getId().toString()
    );
    expect(campaigns.find((e) => e.displayName === 'El Taz Junior').customContentId).to.equals(undefined);
    expect(campaigns.find((e) => e.displayName === 'El Taz Senior').customContentId).to.equals(undefined);
  });
});
