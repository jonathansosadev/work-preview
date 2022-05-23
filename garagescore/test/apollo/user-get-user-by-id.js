const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const { UserRoles } = require('../../frontend/utils/enumV2.js');

const app = new TestApp();

async function createUserWithAllAuthorization(options = {}) {
  return app.addUser({
    ...options,
    authorization: {
      ACCESS_TO_COCKPIT: true,
      ACCESS_TO_SATISFACTION: true,
      ACCESS_TO_UNSATISFIED: true,
      ACCESS_TO_LEADS: true,
      ACCESS_TO_CONTACTS: true,
      ACCESS_TO_E_REPUTATION: true,
      ACCESS_TO_ESTABLISHMENT: true,
      ACCESS_TO_TEAM: true,
      ACCESS_TO_ADMIN: true,
      ACCESS_TO_DARKBO: true,
      ACCESS_TO_GREYBO: true,
      WIDGET_MANAGEMENT: true,
      ACCESS_TO_WELCOME: true,
      ACCESS_TO_AUTOMATION: true,
    },
  });
}

let User;
let Garage;
let user1 = Tools.random.user();
let user2 = Tools.random.user(); // im a god
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

const query = `query userGetUserById($userId: String!) {
    userGetUserById(userId: $userId) {
      id
      garageIds
      lastName
      firstName
      email
      civility
      phone
      mobilePhone
      businessName
      address
      postCode
      job
      city
      subscriptionStatus
      isGod
      defaultManagerGaragesIds
      allGaragesAlerts {
        UnsatisfiedVI
        UnsatisfiedVo
        UnsatisfiedVn
        UnsatisfiedMaintenance
        LeadApv
        LeadVn
        LeadVo
        ExogenousNewReview
        EscalationUnsatisfiedMaintenance
        EscalationUnsatisfiedVn
        EscalationUnsatisfiedVo
        EscalationUnsatisfiedVi
        EscalationLeadMaintenance
        EscalationLeadVn
        EscalationLeadVo
      },
      authorization {
        ACCESS_TO_COCKPIT
        ACCESS_TO_ADMIN
        ACCESS_TO_WELCOME
        ACCESS_TO_SATISFACTION
        ACCESS_TO_UNSATISFIED
        ACCESS_TO_LEADS
        ACCESS_TO_AUTOMATION
        ACCESS_TO_CONTACTS
        ACCESS_TO_E_REPUTATION
        ACCESS_TO_ESTABLISHMENT
        ACCESS_TO_TEAM
        ACCESS_TO_DARKBO
        ACCESS_TO_GREYBO
        WIDGET_MANAGEMENT
      },
      reportConfigs {
        daily {
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          UnsatisfiedVI
          leadVn
          leadVo
        }
        weekly{
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          UnsatisfiedVI
          leadVn
          leadVo
        }
        monthly{
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          UnsatisfiedVI
          leadVn
          leadVo
        }
        monthlySummary {
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          unsatisfiedVI
          leadVn
          leadVo
          contactsApv
          contactsVn
          contactsVo
          contactsVI
        }
      },
  }
}`;

/* Get user data from api */
describe('userGetUserById', async function descr() {
  let rootUser;
  let rootUserId;
  before(async function () {
    await app.waitAppBoot();
    await app.reset();
    rootUser = await createUserWithAllAuthorization();
    rootUserId = rootUser.userId.toString();
    User = app.models.User;
    Garage = app.models.Garage;
    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);
    garage3 = await Garage.create(garage3);
    garage4 = await Garage.create(garage4);
    garage5 = await Garage.create(garage5);
    garage6 = await Garage.create(garage6);
    garage7 = await Garage.create(garage7);
    garage8 = await Garage.create(garage8);
    garage9 = await Garage.create(garage9);

    user1.garageIds = [garage1, garage2, garage5, garage6, garage8, garage9].map((o) => o.getId());
    user1.role = UserRoles.SUPER_ADMIN;
    user1 = await User.create(user1);

    user2.garageIds = [garage1, garage2, garage3, garage4, garage5, garage6, garage7, garage8, garage9].map((o) =>
      o.getId().toString()
    );
    user2.email = 'user2@garagescore.com';
    user2.city = 'Paris';
    user2.role = UserRoles.SUPER_ADMIN;
    user2.allGaragesAlerts = {
      UnsatisfiedVI: true,
      UnsatisfiedVo: false,
      UnsatisfiedVn: true,
      UnsatisfiedMaintenance: false,
      LeadApv: true,
      LeadVn: false,
      LeadVo: true,
    };
    user2.authorization = {
      ACCESS_TO_COCKPIT: false,
      ACCESS_TO_WELCOME: true,
    };
    user2.reportConfigs = {
      daily: {
        UnsatisfiedVI: true,
        leadVn: false,
        leadVo: true,
      },
      weekly: {
        unsatisfiedApv: true,
        unsatisfiedVn: false,
        unsatisfiedVo: true,
        UnsatisfiedVI: false,
      },
      monthly: {
        unsatisfiedApv: true,
        unsatisfiedVn: false,
        unsatisfiedVo: true,
      },
      monthlySummary: {
        unsatisfiedApv: true,
        unsatisfiedVn: false,
        unsatisfiedVo: true,
        unsatisfiedVI: false,
        leadVn: true,
      },
    };
    user2 = await User.create(user2);
    user3 = await User.create(user3);
  });

  describe('get user', () => {
    it("current logged user doesn't have shared garage with the other one", async () => {
      const variablesApollo = {
        userId: user2.id.toString(),
      };
      const respond = await sendQuery(app, query, variablesApollo, user3.id.toString());
      expect(respond.errors[0].message).equal('Not authorized');
    });
    it('checking if user get his profile', async () => {
      const variablesApollo = {
        userId: user2.id.toString(),
      };
      const profile = await sendQuery(app, query, variablesApollo, user2.id.toString());
      expect(profile.errors).to.be.undefined;
      expect(profile.data.userGetUserById.id).to.be.not.null;
      expect(profile.data.userGetUserById.id.toString()).equal(user2.id.toString());
      expect(profile.data.userGetUserById.isGod).to.be.false;
      expect(profile.data.userGetUserById.city).equal(user2.city);
      expect(profile.data.userGetUserById.garageIds)
        .to.be.an('array')
        .to.have.members([...user2.garageIds]);
      expect(profile.data.userGetUserById.allGaragesAlerts.length).equal(user2.allGaragesAlerts.length);
      expect(profile.data.userGetUserById.allGaragesAlerts['UnsatisfiedVI']).to.be.true;
      expect(profile.data.userGetUserById.allGaragesAlerts['EscalationLeadVo']).to.be.null;
      expect(profile.data.userGetUserById.authorization['ACCESS_TO_COCKPIT']).to.be.false;
      expect(profile.data.userGetUserById.authorization['ACCESS_TO_SATISFACTION']).to.be.null;
      expect(profile.data.userGetUserById.reportConfigs).to.have.keys('daily', 'weekly', 'monthly', 'monthlySummary');
      expect(profile.data.userGetUserById.reportConfigs['monthlySummary']).to.have.property('unsatisfiedApv', true);
    });
  });
});
