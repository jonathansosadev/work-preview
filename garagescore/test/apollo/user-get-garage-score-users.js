const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');

const UserAuthorization = require('../../common/models/user-autorization');
const app = new TestApp();

const query = `query userGetGarageScoreUsers($perfManagers: Boolean, $bizDevs: Boolean) {
    userGetGarageScoreUsers(perfManagers: $perfManagers, bizDevs: $bizDevs) {
        id
        firstName
        lastName
        email
  }
}`;

/* Get garagescore users */
describe('userGetGarageScoreUsers', async function descr() {
  let User;
  let user1 = Tools.random.user();
  let user2 = Tools.random.user();
  before(async function () {
    await app.reset();
    User = app.models.User;
    user1.authorization = {};
    user1.authorization[UserAuthorization.ACCESS_TO_GREYBO] = true;
    user1 = await User.create(user1);
    user2 = await User.create(user2);

    // creation of multiple users with performers
    for (let index = 0; index < 50; index++) {
      const user = Tools.random.user();
      user.email = `testPerf${index}@garagescore.com`;
      user.isPerfMan = true;
      await User.create(user);
    }
    // creation of multiple users with bizDevs
    for (let index = 0; index < 20; index++) {
      const user = Tools.random.user();
      user.email = `testBizDev${index}@garagescore.com`;
      user.isBizDev = true;
      await User.create(user);
    }
  });

  describe('get garagescore users', () => {
    it('should return the bizDev users', async () => {
      const randomGSUserResult = Math.round(Math.random() * 19);
      const variablesApollo = {
        bizDevs: true,
      };
      const users = await sendQuery(app, query, variablesApollo, user1.id.toString());
      expect(users.errors).to.be.undefined;
      expect(users.data).to.be.an('object').which.have.keys('userGetGarageScoreUsers');
      expect(users.data.userGetGarageScoreUsers).to.be.an('array').which.have.lengthOf(20);
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult])
        .to.be.an('object')
        .which.have.keys('id', 'firstName', 'lastName', 'email');
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult].id).to.exist;
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult].email).to.exist;
    });
    it('should return the perfMan users', async () => {
      const randomGSUserResult = Math.round(Math.random() * 49);
      const variablesApollo = {
        perfManagers: true,
      };
      const users = await sendQuery(app, query, variablesApollo, user1.id.toString());
      expect(users.errors).to.be.undefined;
      expect(users.data).to.be.an('object').which.have.keys('userGetGarageScoreUsers');
      expect(users.data.userGetGarageScoreUsers).to.be.an('array').which.have.lengthOf(50);
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult])
        .to.be.an('object')
        .which.have.keys('id', 'firstName', 'lastName', 'email');
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult].id).to.exist;
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult].email).to.exist;
    });
    it('should return all users', async () => {
      const randomGSUserResult = Math.round(Math.random() * 69);
      const users = await sendQuery(app, query, null, user1.id.toString());
      expect(users.errors).to.be.undefined;
      expect(users.data).to.be.an('object').which.have.keys('userGetGarageScoreUsers');
      expect(users.data.userGetGarageScoreUsers).to.be.an('array').which.have.lengthOf(70);
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult])
        .to.be.an('object')
        .which.have.keys('id', 'firstName', 'lastName', 'email');
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult].id).to.exist;
      expect(users.data.userGetGarageScoreUsers[randomGSUserResult].email).to.exist;
    });
  });
  describe('handle errors', () => {
    it('should not allow user with no auth to access greybo', async () => {
      const variablesApollo = {
        bizDevs: true,
      };
      const users = await sendQuery(app, query, variablesApollo, user2.id.toString());
      expect(users.errors).to.be.an('array').which.have.lengthOf(1);
      expect(users.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(users.errors[0].message).to.be.equal('Not authorized');
      expect(users.errors[0].extensions).to.be.an('object').which.have.keys('code');
      expect(users.errors[0].extensions.code).to.be.equal('FORBIDDEN');
      expect(users.data).to.be.an('object').which.have.keys('userGetGarageScoreUsers');
      expect(users.data.userGetGarageScoreUsers).to.be.null;
    });
  });
});
