const TestApp = require('../../common/lib/test/test-app');
const expect = require('chai').expect;
const sendQueryAs = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const UserAuthorization = require('../../common/models/user-autorization');

const testApp = new TestApp();

let User;
let Garage;
let user1 = Tools.random.user();
let user2 = Tools.random.user();
let user3 = Tools.random.user();
let garage1 = Tools.random.garage();
let garage2 = Tools.random.garage();
let garage3 = Tools.random.garage();
let garage4 = Tools.random.garage();
let garage5 = Tools.random.garage();
let garage6 = Tools.random.garage();
let garage7 = Tools.random.garage();
let garage8 = Tools.random.garage();
let garage9 = Tools.random.garage();

const request = `query garageGetGaragesConditions ($id: String!) {
  garageGetGaragesConditions (id: $id) {
    hasMaintenanceAtLeast
    hasVnAtLeast
    hasVoAtLeast
    hasViAtLeast
    hasLeadAtLeast
    hasCrossLeadsAtLeast
    hasAutomationAtLeast
    hasEReputationAtLeast
  }
}`;
/* TEST TO-DO, IN DEV */
describe('garageGetGaragesConditions', async function () {
  before(async function () {
    await testApp.reset();
    User = testApp.models.User;
    Garage = testApp.models.Garage;
    garage1.subscriptions = {
      active: true,
      Maintenance: {
        enabled: true,
      },
      NewVehicleSale: {
        enabled: true,
      },
      UsedVehicleSale: {
        enabled: false,
      },
      VehicleInspection: {
        enabled: true,
      },
      Lead: {
        enabled: true,
      },
      Analytics: {
        enabled: false,
      },
      EReputation: {
        enabled: true,
      },
      Automation: {
        enabled: false,
      },
      CrossLeads: {
        enabled: true,
      },
    };
    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);
    garage3 = await Garage.create(garage3);
    garage4 = await Garage.create(garage4);
    garage5 = await Garage.create(garage5);
    garage6 = await Garage.create(garage6);
    garage7 = await Garage.create(garage7);
    garage8 = await Garage.create(garage8);
    garage9 = await Garage.create(garage9);

    user1.authorization = {};
    user1.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user1.garageIds = [garage1, garage2, garage5, garage6, garage8, garage9].map((o) => o.getId());
    user1 = await User.create(user1);

    user2.authorization = {};
    user2.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = false;
    user2.garageIds = [garage1, garage3, garage4, garage7].map((o) => o.getId());
    user2 = await User.create(user2);

    user3.authorization = {};
    user3.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user3.garageIds = user2.garageIds;
    user3.garageIds = [garage5, garage8, garage9].map((o) => o.getId());
    user3 = await User.create(user3);
  });
  describe('Get a user garages conditions', async () => {
    it('should check when a user have some garages conditions equal true and some false', async function it() {
      const variables = { id: user1.id.toString() };
      const res = await sendQueryAs(testApp, request, variables);

      expect(res.errors).to.be.undefined;
      expect(res.data).to.not.be.undefined.and.to.not.be.null;
      expect(res.data).to.be.an('object').and.to.have.keys('garageGetGaragesConditions');
      expect(res.data.garageGetGaragesConditions).to.have.keys(
        'hasMaintenanceAtLeast',
        'hasVnAtLeast',
        'hasVoAtLeast',
        'hasViAtLeast',
        'hasLeadAtLeast',
        'hasCrossLeadsAtLeast',
        'hasAutomationAtLeast',
        'hasEReputationAtLeast'
      );
      expect(res.data.garageGetGaragesConditions['hasMaintenanceAtLeast']).equal(true);
      expect(res.data.garageGetGaragesConditions['hasVnAtLeast']).equal(true);
      expect(res.data.garageGetGaragesConditions['hasVoAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasViAtLeast']).equal(true);
      expect(res.data.garageGetGaragesConditions['hasLeadAtLeast']).equal(true);
      expect(res.data.garageGetGaragesConditions['hasCrossLeadsAtLeast']).equal(true);
      expect(res.data.garageGetGaragesConditions['hasAutomationAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasEReputationAtLeast']).equal(true);
    });
    it('should check when a user have all garages conditions equal false', async function it() {
      const variables = { id: user3.id.toString() };
      const res = await sendQueryAs(testApp, request, variables);

      expect(res.errors).to.be.undefined;
      expect(res.data).to.not.be.undefined.and.to.not.be.null;
      expect(res.data).to.be.an('object').and.to.have.keys('garageGetGaragesConditions');
      expect(res.data.garageGetGaragesConditions).to.have.keys(
        'hasMaintenanceAtLeast',
        'hasVnAtLeast',
        'hasVoAtLeast',
        'hasViAtLeast',
        'hasLeadAtLeast',
        'hasCrossLeadsAtLeast',
        'hasAutomationAtLeast',
        'hasEReputationAtLeast'
      );
      expect(res.data.garageGetGaragesConditions['hasMaintenanceAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasVnAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasVoAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasViAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasLeadAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasCrossLeadsAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasAutomationAtLeast']).equal(false);
      expect(res.data.garageGetGaragesConditions['hasEReputationAtLeast']).equal(false);
    });
  });
  describe('Handling errors', () => {
    it('should return a BAD_USER_INPUT error when an invalid id is sent', async function it() {
      const fakeUserId = '591960068725ce1a003e8a92';
      const variables = { id: fakeUserId };
      const res = await sendQueryAs(testApp, request, variables);

      expect(res.data).to.be.an('object').to.have.keys('garageGetGaragesConditions');
      expect(res.data['garageGetGaragesConditions']).to.be.null;
      expect(res.errors).to.not.be.undefined.and.to.not.be.null;
      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').to.have.keys('message', 'extensions', 'locations', 'path');
      expect(res.errors[0]['message']).equal(`User with id: ${fakeUserId} not found.`);
      expect(res.errors[0]['extensions']).to.have.keys('code');
      expect(res.errors[0]['extensions']['code']).equal(`BAD_USER_INPUT`);
    });
    it('should return a ForbiddenError when a user with no ACCESS_TO_COCKPIT auth try to get garages conditions', async function it() {
      const variables = { id: user2.id.toString() };
      const res = await sendQueryAs(testApp, request, variables, user2.id.toString());

      expect(res.data).to.be.an('object').to.have.keys('garageGetGaragesConditions');
      expect(res.data['garageGetGaragesConditions']).to.be.null;
      expect(res.errors).to.not.be.undefined.and.to.not.be.null;
      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').to.have.keys('message', 'extensions', 'locations', 'path');
      expect(res.errors[0]['message']).equal('Not authorized');
      expect(res.errors[0]['extensions']).to.have.keys('code');
      expect(res.errors[0]['extensions']['code']).equal(`FORBIDDEN`);
    });
  });
});
