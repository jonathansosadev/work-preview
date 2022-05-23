const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const { ObjectID } = require('mongodb');
const app = new TestApp();

const mutation = `mutation userSetUpdateOne($id: ID!, $addGarages: [String],    $removeGarages: [String], $civility: String, $firstName: String, $lastName: String, $email: String, $phone: String, $mobilePhone: String, $businessName: String, $address: String, $postCode: String, $job: String, $city: String, $alertsUnsatisfiedVn: Boolean, $alertsUnsatisfiedVo: Boolean,
        $alertsUnsatisfiedVI: Boolean,
        $alertsUnsatisfiedMaintenance: Boolean,
        $alertsLeadApv: Boolean,
        $alertsLeadVn: Boolean,
        $alertsLeadVo: Boolean,
        $alertsExogenousNewReview: Boolean,
        $alertsEscalationUnsatisfiedMaintenance: Boolean,
        $alertsEscalationUnsatisfiedVn: Boolean,
        $alertsEscalationUnsatisfiedVo: Boolean,
        $alertsEscalationUnsatisfiedVi: Boolean,
        $alertsEscalationLeadMaintenance: Boolean,
        $alertsEscalationLeadVn: Boolean,
        $alertsEscalationLeadVo: Boolean,

        $reportConfigsDailyUnsatisfiedApv: Boolean,
        $reportConfigsDailyUnsatisfiedVn: Boolean,
        $reportConfigsDailyUnsatisfiedVo: Boolean,
        $reportConfigsDailyUnsatisfiedVI: Boolean,
        $reportConfigsDailyLeadVn: Boolean,
        $reportConfigsDailyLeadVo: Boolean,

        $reportConfigsWeeklyUnsatisfiedApv: Boolean,
        $reportConfigsWeeklyUnsatisfiedVn: Boolean,
        $reportConfigsWeeklyUnsatisfiedVo: Boolean,
        $reportConfigsWeeklyUnsatisfiedVI: Boolean,
        $reportConfigsWeeklyLeadVn: Boolean,
        $reportConfigsWeeklyLeadVo: Boolean,

        $reportConfigsMonthlyUnsatisfiedApv: Boolean,
        $reportConfigsMonthlyUnsatisfiedVn: Boolean,
        $reportConfigsMonthlyUnsatisfiedVo: Boolean,
        $reportConfigsMonthlyUnsatisfiedVI: Boolean,
        $reportConfigsMonthlyLeadVn: Boolean,
        $reportConfigsMonthlyLeadVo: Boolean,

        $reportConfigsMonthlySummaryUnsatisfiedApv: Boolean,
        $reportConfigsMonthlySummaryUnsatisfiedVn: Boolean,
        $reportConfigsMonthlySummaryUnsatisfiedVo: Boolean,
        $reportConfigsMonthlySummaryUnsatisfiedVI: Boolean,
        $reportConfigsMonthlySummaryLeadVn: Boolean,
        $reportConfigsMonthlySummaryLeadVo: Boolean,
        $reportConfigsMonthlySummaryContactsApv: Boolean,
        $reportConfigsMonthlySummaryContactsVn: Boolean,
        $reportConfigsMonthlySummaryContactsVo: Boolean,
        $reportConfigsMonthlySummaryContactsVI: Boolean,

        $ACCESS_TO_WELCOME: Boolean,
        $ACCESS_TO_SATISFACTION: Boolean,
        $ACCESS_TO_UNSATISFIED: Boolean,
        $ACCESS_TO_LEADS: Boolean,
        $ACCESS_TO_AUTOMATION: Boolean,
        $ACCESS_TO_CONTACTS: Boolean,
        $ACCESS_TO_E_REPUTATION: Boolean,
        $ACCESS_TO_ESTABLISHMENT: Boolean,
        $ACCESS_TO_TEAM: Boolean,
        $role: String) {
    userSetUpdateOne (id: $id, addGarages: $addGarages,    removeGarages: $removeGarages, civility: $civility, firstName: $firstName, lastName: $lastName, email: $email, phone: $phone, mobilePhone: $mobilePhone, businessName: $businessName, address: $address, postCode: $postCode, job: $job, city: $city, alertsUnsatisfiedVn: $alertsUnsatisfiedVn, alertsUnsatisfiedVo: $alertsUnsatisfiedVo,
        alertsUnsatisfiedVI: $alertsUnsatisfiedVI,
        alertsUnsatisfiedMaintenance: $alertsUnsatisfiedMaintenance,
        alertsLeadApv: $alertsLeadApv,
        alertsLeadVn: $alertsLeadVn,
        alertsLeadVo: $alertsLeadVo,
        alertsExogenousNewReview: $alertsExogenousNewReview,
        alertsEscalationUnsatisfiedMaintenance: $alertsEscalationUnsatisfiedMaintenance,
        alertsEscalationUnsatisfiedVn: $alertsEscalationUnsatisfiedVn,
        alertsEscalationUnsatisfiedVo: $alertsEscalationUnsatisfiedVo,
        alertsEscalationUnsatisfiedVi: $alertsEscalationUnsatisfiedVi,
        alertsEscalationLeadMaintenance: $alertsEscalationLeadMaintenance,
        alertsEscalationLeadVn: $alertsEscalationLeadVn,
        alertsEscalationLeadVo: $alertsEscalationLeadVo,

        reportConfigsDailyUnsatisfiedApv: $reportConfigsDailyUnsatisfiedApv,
        reportConfigsDailyUnsatisfiedVn: $reportConfigsDailyUnsatisfiedVn,
        reportConfigsDailyUnsatisfiedVo: $reportConfigsDailyUnsatisfiedVo,
        reportConfigsDailyUnsatisfiedVI: $reportConfigsDailyUnsatisfiedVI,
        reportConfigsDailyLeadVn: $reportConfigsDailyLeadVn,
        reportConfigsDailyLeadVo: $reportConfigsDailyLeadVo,

        reportConfigsWeeklyUnsatisfiedApv: $reportConfigsWeeklyUnsatisfiedApv,
        reportConfigsWeeklyUnsatisfiedVn: $reportConfigsWeeklyUnsatisfiedVn,
        reportConfigsWeeklyUnsatisfiedVo: $reportConfigsWeeklyUnsatisfiedVo,
        reportConfigsWeeklyUnsatisfiedVI: $reportConfigsWeeklyUnsatisfiedVI,
        reportConfigsWeeklyLeadVn: $reportConfigsWeeklyLeadVn,
        reportConfigsWeeklyLeadVo: $reportConfigsWeeklyLeadVo,

        reportConfigsMonthlyUnsatisfiedApv: $reportConfigsMonthlyUnsatisfiedApv,
        reportConfigsMonthlyUnsatisfiedVn: $reportConfigsMonthlyUnsatisfiedVn,
        reportConfigsMonthlyUnsatisfiedVo: $reportConfigsMonthlyUnsatisfiedVo,
        reportConfigsMonthlyUnsatisfiedVI: $reportConfigsMonthlyUnsatisfiedVI,
        reportConfigsMonthlyLeadVn: $reportConfigsMonthlyLeadVn,
        reportConfigsMonthlyLeadVo: $reportConfigsMonthlyLeadVo,

        reportConfigsMonthlySummaryUnsatisfiedApv: $reportConfigsMonthlySummaryUnsatisfiedApv,
        reportConfigsMonthlySummaryUnsatisfiedVn: $reportConfigsMonthlySummaryUnsatisfiedVn,
        reportConfigsMonthlySummaryUnsatisfiedVo: $reportConfigsMonthlySummaryUnsatisfiedVo,
        reportConfigsMonthlySummaryUnsatisfiedVI: $reportConfigsMonthlySummaryUnsatisfiedVI,
        reportConfigsMonthlySummaryLeadVn: $reportConfigsMonthlySummaryLeadVn,
        reportConfigsMonthlySummaryLeadVo: $reportConfigsMonthlySummaryLeadVo,
        reportConfigsMonthlySummaryContactsApv: $reportConfigsMonthlySummaryContactsApv,
        reportConfigsMonthlySummaryContactsVn: $reportConfigsMonthlySummaryContactsVn,
        reportConfigsMonthlySummaryContactsVo: $reportConfigsMonthlySummaryContactsVo,
        reportConfigsMonthlySummaryContactsVI: $reportConfigsMonthlySummaryContactsVI,

        ACCESS_TO_WELCOME: $ACCESS_TO_WELCOME,
        ACCESS_TO_SATISFACTION: $ACCESS_TO_SATISFACTION,
        ACCESS_TO_UNSATISFIED: $ACCESS_TO_UNSATISFIED,
        ACCESS_TO_LEADS: $ACCESS_TO_LEADS,
        ACCESS_TO_AUTOMATION: $ACCESS_TO_AUTOMATION,
        ACCESS_TO_CONTACTS: $ACCESS_TO_CONTACTS,
        ACCESS_TO_E_REPUTATION: $ACCESS_TO_E_REPUTATION,
        ACCESS_TO_ESTABLISHMENT: $ACCESS_TO_ESTABLISHMENT,
        ACCESS_TO_TEAM: $ACCESS_TO_TEAM,
        role: $role) {
        status
        message
        user {
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
          role
          city
          subscriptionStatus
          isPriorityProfile
          isGod
          isDefaultTicketManagerSomewhere
          defaultManagerGaragesIds
          allGaragesAlerts  {
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
          authorization  {
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
          reportConfigs  {
            daily {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              UnsatisfiedVI
              leadVn
              leadVo
            },
            weekly {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              UnsatisfiedVI
              leadVn
              leadVo
            },
            monthly {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              UnsatisfiedVI
              leadVn
              leadVo
            },
            monthlySummary  {
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
          }
        }
  }
}`;
let user = Tools.random.user();
let userToConnect = Tools.random.user();
let userWithSameEmail = Tools.random.user();
userWithSameEmail.email = 'test@test.com';
let usersWithSameMobilePhone = Tools.random.user();
usersWithSameMobilePhone.mobilePhone = '0708090102';
user.garageIds = [];
let garage;
const fields = ['user', 'message', 'status'];
describe('userSetUpdateOne', async function descr() {
  before(async function () {
    await app.reset();
    user = await app.addUser(user);
    userToConnect = await app.addUser(userToConnect);
    await app.addUser(userWithSameEmail);
    await app.addUser(usersWithSameMobilePhone);
    garage = await app.addGarage();
  });
  it('should return status equal false when no user was found with the provided id', async () => {
    const variable = {
      id: new ObjectID().toString(),
    };
    const { data, errors } = await _sendQueryAs(app, mutation, variable, userToConnect.getId());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.any.keys('userSetUpdateOne');
    expect(data.userSetUpdateOne).to.be.an('object').which.have.keys(fields);
    expect(data.userSetUpdateOne.message).to.be.equal(`userNotFound|${variable.id}`);
    expect(data.userSetUpdateOne.status).to.be.false;
  });
  it('should return status equal false when a user with the same phoneNumber', async () => {
    const variable = {
      id: user.id.toString(),
      mobilePhone: '0708090102',
    };
    const { data, errors } = await _sendQueryAs(app, mutation, variable, userToConnect.getId());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('userSetUpdateOne');
    expect(data.userSetUpdateOne).to.be.an('object').which.have.keys(fields);
    expect(data.userSetUpdateOne.message).to.be.equal(`mobileTaken|${variable.mobilePhone}`);
    expect(data.userSetUpdateOne.status).to.be.false;
  });
  it('should return status equal false when a user with the same email', async () => {
    const variable = {
      id: user.id.toString(),
      email: 'test@test.com',
    };
    const { data, errors } = await _sendQueryAs(app, mutation, variable, userToConnect.getId());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('userSetUpdateOne');
    expect(data.userSetUpdateOne).to.be.an('object').which.have.keys(fields);
    expect(data.userSetUpdateOne.message).to.be.equal(`emailTaken|${variable.email}`);
    expect(data.userSetUpdateOne.status).to.be.false;
  });
  it('should update basic user param and return the updated user', async () => {
    const variable = {
      id: user.id.toString(),
      civility: 'Mr',
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.fr',
      phone: '0908090102',
      mobilePhone: '0709080605',
      businessName: '',
      address: '12 allée random',
      postCode: '75008',
      job: '',
      city: 'Paris',
      alertsUnsatisfiedVn: false,
      alertsUnsatisfiedVo: false,
      alertsUnsatisfiedVI: false,
      alertsUnsatisfiedMaintenance: false,
      alertsLeadApv: true,
      alertsLeadVn: false,
      alertsLeadVo: false,
      alertsExogenousNewReview: false,
      alertsEscalationUnsatisfiedMaintenance: false,
      alertsEscalationUnsatisfiedVn: true,
      alertsEscalationUnsatisfiedVo: false,
      alertsEscalationUnsatisfiedVi: false,
      alertsEscalationLeadMaintenance: false,
      alertsEscalationLeadVn: false,
      alertsEscalationLeadVo: false,

      reportConfigsDailyUnsatisfiedApv: false,
      reportConfigsDailyUnsatisfiedVn: false,
      reportConfigsDailyUnsatisfiedVo: false,
      reportConfigsDailyUnsatisfiedVI: false,
      reportConfigsDailyLeadVn: false,
      reportConfigsDailyLeadVo: false,

      reportConfigsWeeklyUnsatisfiedApv: false,
      reportConfigsWeeklyUnsatisfiedVn: false,
      reportConfigsWeeklyUnsatisfiedVo: false,
      reportConfigsWeeklyUnsatisfiedVI: false,
      reportConfigsWeeklyLeadVn: false,
      reportConfigsWeeklyLeadVo: false,

      reportConfigsMonthlyUnsatisfiedApv: false,
      reportConfigsMonthlyUnsatisfiedVn: false,
      reportConfigsMonthlyUnsatisfiedVo: false,
      reportConfigsMonthlyUnsatisfiedVI: false,
      reportConfigsMonthlyLeadVn: false,
      reportConfigsMonthlyLeadVo: true,

      reportConfigsMonthlySummaryUnsatisfiedApv: false,
      reportConfigsMonthlySummaryUnsatisfiedVn: false,
      reportConfigsMonthlySummaryUnsatisfiedVo: false,
      reportConfigsMonthlySummaryUnsatisfiedVI: false,
      reportConfigsMonthlySummaryLeadVn: false,
      reportConfigsMonthlySummaryLeadVo: false,
      reportConfigsMonthlySummaryContactsApv: false,
      reportConfigsMonthlySummaryContactsVn: false,
      reportConfigsMonthlySummaryContactsVo: false,
      reportConfigsMonthlySummaryContactsVI: false,

      ACCESS_TO_WELCOME: false,
      ACCESS_TO_SATISFACTION: false,
      ACCESS_TO_UNSATISFIED: false,
      ACCESS_TO_LEADS: false,
      ACCESS_TO_AUTOMATION: false,
      ACCESS_TO_CONTACTS: false,
      ACCESS_TO_E_REPUTATION: true,
      ACCESS_TO_ESTABLISHMENT: false,
      ACCESS_TO_TEAM: false,
      role: 'Admin',
    };
    const { data, errors } = await _sendQueryAs(app, mutation, variable, userToConnect.getId());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('userSetUpdateOne');
    expect(data.userSetUpdateOne).to.be.an('object').which.have.keys(fields);
    expect(data.userSetUpdateOne.message).to.be.equal(`user Updated !`);
    expect(data.userSetUpdateOne.status).to.be.true;
    [
      'id',
      'civility',
      'firstName',
      'lastName',
      'email',
      'phone',
      'mobilePhone',
      'businessName',
      'address',
      'postCode',
      'jobcity',
      'role',
    ].forEach((basicParam) => {
      expect(data.userSetUpdateOne.user[basicParam]).to.be.equal(variable[basicParam]);
    });
    [
      'ACCESS_TO_WELCOME',
      'ACCESS_TO_SATISFACTION',
      'ACCESS_TO_UNSATISFIED',
      'ACCESS_TO_LEADS',
      'ACCESS_TO_AUTOMATION',
      'ACCESS_TO_CONTACTS',
      'ACCESS_TO_E_REPUTATION',
      'ACCESS_TO_ESTABLISHMENT',
      'ACCESS_TO_TEAM',
    ].forEach((auth) => {
      expect(data.userSetUpdateOne.user.authorization[auth]).to.be.equal(variable[auth]);
    });
    expect(data.userSetUpdateOne.user['isGod']).to.be.false;
  });
  it('should add a garage to the garages of a user', async () => {
    const variable = {
      id: user.id.toString(),
      addGarages: [garage.id.toString()],
    };
    const { errors, data } = await _sendQueryAs(app, mutation, variable, userToConnect.getId());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('userSetUpdateOne');
    expect(data.userSetUpdateOne).to.be.an('object').which.have.keys(fields);
    expect(data.userSetUpdateOne.message).to.be.equal(`user Updated !`);
    expect(data.userSetUpdateOne.status).to.be.true;
    expect(data.userSetUpdateOne.user).to.be.an('object').which.have.any.keys(Object.keys(variable));
    expect(data.userSetUpdateOne.user.garageIds).to.be.an('array').lengthOf(1);
    expect(data.userSetUpdateOne.user.garageIds[0]).to.be.equal(garage.id.toString());
  });
  it('should remove a garage to the garages of a user', async () => {
    const variable = {
      id: user.id.toString(),
      removeGarages: [garage.id.toString()],
    };
    const userToUpdate = await app.models.User.getMongoConnector().findOne({ _id: user.id });
    expect(userToUpdate).to.be.an('object').which.have.any.keys('garageIds');
    expect(userToUpdate.garageIds).to.be.an('array').lengthOf(1);
    expect(userToUpdate.garageIds[0].toString()).to.be.equal(garage.id.toString());

    const { data, errors } = await _sendQueryAs(app, mutation, variable, userToConnect.getId());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('userSetUpdateOne');
    expect(data.userSetUpdateOne).to.be.an('object').which.have.keys(fields);
    expect(data.userSetUpdateOne.message).to.be.equal(`user Updated !`);
    expect(data.userSetUpdateOne.status).to.be.true;
    expect(data.userSetUpdateOne.user).to.be.an('object').which.have.any.keys(Object.keys(variable));
    expect(data.userSetUpdateOne.user.garageIds).to.be.an('array').lengthOf(0);
  });
});
