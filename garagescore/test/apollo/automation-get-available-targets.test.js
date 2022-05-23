const { expect } = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../common/lib/test/test-app');
const {
  resolvers: {
    Query: { AutomationAvailableTargets },
  },
} = require('../../server/webservers-standalones/api/schema/automation-get-available-targets');
const { AutomationCampaignTargets } = require('../../frontend/utils/enumV2');

const testApp = new TestApp();

const makeRequest = async (args = {}) => {
  const user = await testApp.addUser({ email: 'user@custeed.com' });
  const garage1 = await testApp.addGarage({
    subscriptions: {
      Maintenance: {
        enabled: true,
      },
      NewVehicleSale: {
        enabled: true,
      },
      UsedVehicleSale: {
        enabled: false,
      },
      Automation: {
        enabled: true,
      },
    },
  });
  const garage2 = await testApp.addGarage({
    subscriptions: {
      UsedVehicleSale: {
        enabled: false,
      },
      Automation: {
        enabled: false,
      },
    },
  });
  const context = {};
  let result = null;

  // Adding the created garage to the user
  await user.addGarage(garage1);
  await user.addGarage(garage2);

  // Simulating args & context
  context.app = testApp;
  context.scope = {
    user: await user.getInstance(),
    godMode: true,
    garageIds: [garage1.id, garage2.id],
    logged: true,
  };

  // Simulating a query directly using the resolver function
  return AutomationAvailableTargets({}, args, context);
};

describe('Apollo - Automation Campaign Get Available Targets', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Return Expected a list of Target  AUTOMATION_MAINTENANCE and AUTOMATION_VEHICLE_SALE', async function () {
    const result = await makeRequest({ dataType: 'AUTOMATION_MAINTENANCE' });

    // Please be what we expect
    AutomationCampaignTargets.keys()
      .filter(
        (key) =>
          AutomationCampaignTargets.getProperty(key, 'active') &&
          AutomationCampaignTargets.getProperty(key, 'leadDataType') === 'AUTOMATION_MAINTENANCE'
      )
      .forEach((key) => {
        expect(!!result.find((target) => target.id === key)).to.equals(true);
      });

    // Please be what we expect
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.M_M)).to.equals(true);
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.M_M_23)).to.equals(true);
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.M_M_35)).to.equals(true);
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.VS_M_11)).to.equals(true);
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.M_UVS)).to.equals(true);
  });
  it('Should Return Expected Target List VehicleSale with Maintenance', async function () {
    const result = await makeRequest({ dataType: 'AUTOMATION_VEHICLE_SALE' });

    // Please be what we expect
    AutomationCampaignTargets.keys()
      .filter(
        (key) =>
          AutomationCampaignTargets.getProperty(key, 'active') &&
          AutomationCampaignTargets.getProperty(key, 'leadDataType') === 'AUTOMATION_VEHICLE_SALE'
      )
      .forEach((key) => {
        expect(!!result.find((target) => target.id === key)).to.equals(true);
      });

    // Please be what we expect
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.M_M)).to.equals(true);
    expect(!!result.find((target) => target.id === AutomationCampaignTargets.VS_M_11)).to.equals(true);
  });
  it('should return empty array if no argument', async function () {
    const result = await makeRequest();

    expect(result.length).to.equals(0);
  });
});
