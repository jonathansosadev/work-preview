const MongoObjectId = require('mongodb').ObjectID;
const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const { UserRoles } = require('../../frontend/utils/enumV2.js');
const UserAuthorization = require('../../common/models/user-autorization');
const app = new TestApp();

const mutation = `mutation userSetDeleteUser($userId: String!) {
    userSetDeleteUser(userId: $userId) {
        statusReason
        status
  }
}`;

/* Delete user child from api */
describe('userSetDeleteUser', async function descr() {
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
    user1.authorization = {};
    user1.role = UserRoles.ADMIN;
    user1 = await User.create(user1);
    user2.job = 'Direction de la communication groupe';
    user2.garageIds = [garage1, garage2, garage3, garage4].map((garage) => garage.getId().toString());
    user2 = await User.create(user2);
    user3 = await User.create(user3);
  });
  describe('Handling error', () => {
    it('should not find user with noexistent id', async () => {
      const variablesApollo = {
        userId: new MongoObjectId().toString(),
      };
      const user = await sendQuery(app, mutation, variablesApollo, user1.id.toString());
      expect(user.errors).to.be.undefined;
      expect(user.data).to.be.an('object').which.have.keys('userSetDeleteUser');
      expect(user.data.userSetDeleteUser).to.be.an('object').which.have.keys('statusReason', 'status');
      expect(user.data.userSetDeleteUser.statusReason).equal('userNotFound');
      expect(user.data.userSetDeleteUser.status).equal('KO');
    });
    it('should not delete user superAdmin when logged user is a admin', async () => {
      const variablesApollo = {
        userId: user3.id.toString(),
      };
      const user = await sendQuery(app, mutation, variablesApollo, user2.id.toString());
      expect(user.data).to.be.an('object').which.have.keys('userSetDeleteUser');
      expect(user.data.userSetDeleteUser).to.be.null;
      expect(user.errors).to.be.an('array').to.have.lengthOf(1);
      expect(user.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(user.errors[0].message).equal('Not authorized');
    });
    it('should not allow a user to delete a user when he has no common garages', async () => {
      // const variablesApollo = {
      //   userId: user3.id.toString(),
      // };
      // const user = await sendQuery(app, mutation, variablesApollo, user1.id.toString());
      // expect(user.errors).to.be.undefined;
      // expect(user.data).to.be.an('object').which.have.keys('userSetDeleteUser');
      // expect(user.data.userSetDeleteUser).to.be.an('object').which.have.keys('statusReason', 'status');
      // expect(user.data.userSetDeleteUser.statusReason).equal('isNotYourChild');
      // expect(user.data.userSetDeleteUser.status).equal('KO');
    });
  });
  describe('delete user with common garages', () => {
    it('should delete a user', async () => {
      const variablesApollo = {
        userId: user2.id.toString(),
      };

      const user = await sendQuery(app, mutation, variablesApollo, user1.id.toString());
      expect(user.errors).to.be.undefined;
      expect(user.data).to.be.an('object').which.have.keys('userSetDeleteUser');
      expect(user.data.userSetDeleteUser).to.be.an('object').which.have.keys('statusReason', 'status');
      expect(user.data.userSetDeleteUser.statusReason).equal('deletedWithSuccess');
      expect(user.data.userSetDeleteUser.status).equal('OK');
    });
  });
});
