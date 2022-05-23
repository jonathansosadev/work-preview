const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const app = new TestApp();

const mutation = `mutation userSetAddUser($garages: [ID]!, $newUserEmail: String!, $newUserFirstName: String, $newUserLastName: String, $newUserJob: String!, $newUserRole: String!) {
    userSetAddUser(garages: $garages, newUserEmail: $newUserEmail, newUserFirstName: $newUserFirstName, newUserLastName: $newUserLastName, newUserJob: $newUserJob, newUserRole: $newUserRole) {
      message
      status
      emailSentTo
      user {
          id
          email
      }
    }
  }`;

/* Delete user child from api */
describe('apollo::userSetAddUser', async function descr() {
  let User;
  let Garage;
  let user1 = Tools.random.user();
  let user2 = Tools.random.user(); // im a god
  let user3 = Tools.random.user();
  let garage1 = Tools.random.garage();
  let garage2 = Tools.random.garage();
  let garage3 = Tools.random.garage();
  let garage4 = Tools.random.garage();
  before(async function () {
    await app.reset();
    User = app.models.User;
    Garage = app.models.Garage;
    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);
    garage3 = await Garage.create(garage3);
    garage4 = await Garage.create(garage4);
    user1.garageIds = [garage1.getId().toString()];
    user1 = await User.create(user1);
    user2.job = 'Direction de la communication groupe';
    user2.garageIds = [garage1, garage2, garage3, garage4].map((garage) => garage.getId().toString());
    user2 = await User.create(user2);
    user3 = await User.create(user3);
  });
  describe('add a user', () => {
    it('should add a user', async () => {
      const newUserEmail = 'test@test.fr';
      const variablesApollo = {
        newUserEmail,
        newUserFirstName: 'Test',
        newUserLastName: 'Test',
        newUserJob: 'tester',
        newUserRole: 'Admin',
        garages: [],
      };

      const user = await sendQuery(app, mutation, variablesApollo, user1.id.toString());

      expect(user.errors).to.be.undefined;
      expect(user.data).to.be.an('object').which.have.keys('userSetAddUser');
      expect(user.data.userSetAddUser).to.be.an('object').which.have.keys('message', 'status', 'emailSentTo', 'user');
      expect(user.data.userSetAddUser.message).to.be.equal('userAdded');
      expect(user.data.userSetAddUser.status).to.be.equal('OK');
      expect(user.data.userSetAddUser.emailSentTo).to.null;
      expect(user.data.userSetAddUser.user).to.be.an('object').which.have.keys('id', 'email');
      expect(user.data.userSetAddUser.user.id).to.not.be.null;
      expect(user.data.userSetAddUser.user.email).to.be.equal(newUserEmail);
    });
    it('should set Admin role', async () => {
      const newUserEmail = 'test@test.fr';
      const variablesApollo = {
        newUserEmail,
        newUserRole: 'Admin',
        newUserJob: 'Custeed',
        garages: [],
      };

      await sendQuery(app, mutation, variablesApollo, user1.id.toString());
      const createdUser = await app.models.User.getMongoConnector().findOne({ email: newUserEmail });
      expect(createdUser.role).to.be.equal('Admin');
    });
  });

  describe('Handling KO cases', () => {
    it('should refuses creation of a user with wrong email', async () => {
      const newUserEmail = '3';
      const variablesApollo = {
        newUserEmail,
        newUserFirstName: 'Test',
        newUserLastName: 'Test',
        newUserJob: 'tester',
        newUserRole: 'User',
        garages: [],
      };

      const user = await sendQuery(app, mutation, variablesApollo, user1.id.toString());

      expect(user.errors).to.be.undefined;
      expect(user.data).to.be.an('object').which.have.keys('userSetAddUser');
      expect(user.data.userSetAddUser).to.be.an('object').which.have.keys('message', 'status', 'emailSentTo', 'user');
      expect(user.data.userSetAddUser.message).to.be.equal(
        'The `User` instance is not valid. Details: `email` is invalid (value: "3").'
      );
      expect(user.data.userSetAddUser.status).to.be.equal('KO');
      expect(user.data.userSetAddUser.emailSentTo).to.be.equal(newUserEmail);
      expect(user.data.userSetAddUser.user).to.be.null;
    });

    it('should refuses creation of a user when it already exists', async () => {
      const newUserEmail = 'test@test.fr';
      const variablesApollo = {
        newUserEmail,
        newUserFirstName: 'Test',
        newUserLastName: 'Test',
        newUserJob: 'tester',
        newUserRole: 'User',
        garages: [],
      };

      await sendQuery(app, mutation, variablesApollo, user1.id.toString());
      const user = await sendQuery(app, mutation, variablesApollo, user1.id.toString());

      expect(user.errors).to.be.undefined;
      expect(user.data).to.be.an('object').which.have.keys('userSetAddUser');
      expect(user.data.userSetAddUser).to.be.an('object').which.have.keys('message', 'status', 'emailSentTo', 'user');
      expect(user.data.userSetAddUser.message).to.be.equal('userAlreadyExists');
      expect(user.data.userSetAddUser.status).to.be.equal('OK');
      expect(user.data.userSetAddUser.emailSentTo).to.be.equal(newUserEmail);
      expect(user.data.userSetAddUser.user).to.be.null;
    });
  });
});
