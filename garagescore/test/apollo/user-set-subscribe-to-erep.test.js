const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const UserAuthorization = require('../../common/models/user-autorization');
const AlertTypes = require('../../common/models/alert.types');
const GarageSubscriptions = require('../../common/models/garage.subscription.type');

const app = new TestApp();

let user;
let garage = Tools.random.garage();
garage.locale = 'ca_ES';
let garage2 = Tools.random.garage();
garage2.locale = 'ca_ES';
const mutation = `mutation userSetSubscribeToErep {
  userSetSubscribeToErep { 
    success
    message
    unauthorized
  } 
}`;

describe('Apollo::userSetSubscribeToErep', async function descr() {
  before(async function () {
    await app.reset();
    garage = await app.addGarage(garage);
    garage2 = await app.addGarage(garage2);
    const userData = Tools.random.user();
    userData.job = 'Actionnaire / Président';
    userData.garageIds = [garage.id];
    user = await app.addUser(userData);
  });

  it('should set subscription to erep for the user to true', async () => {
    const res = await sendQuery(app, mutation, {}, user.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetSubscribeToErep');
    expect(res.data.userSetSubscribeToErep).to.be.an('object').which.have.keys('success', 'message', 'unauthorized');
    expect(res.data.userSetSubscribeToErep.success).to.be.true;
    expect(res.data.userSetSubscribeToErep.message).to.be.null;
    expect(res.data.userSetSubscribeToErep.unauthorized).to.be.false;
    const updatedUser = await app.models.User.getMongoConnector().findOne(
      { _id: user.id },
      { projection: { authorization: true, authRequest: true, allGaragesAlerts: true } }
    );
    expect(updatedUser).to.be.an('object').which.have.any.keys('authorization', 'authRequest', 'allGaragesAlerts');
    expect(updatedUser.authorization).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
    expect(updatedUser.authorization[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.true;
    expect(updatedUser.authRequest).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
    expect(updatedUser.authRequest[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.false;
    expect(updatedUser.allGaragesAlerts).to.be.an('object').which.have.any.keys(AlertTypes.EXOGENOUS_NEW_REVIEW);
    expect(updatedUser.allGaragesAlerts[AlertTypes.EXOGENOUS_NEW_REVIEW]).to.be.true;
    const updatedGarage = await app.models.Garage.getMongoConnector().findOne(
      { _id: garage.id },
      { projection: { subscriptions: true } }
    );
    expect(updatedGarage).to.be.an('object').which.have.any.keys('subscriptions');
    expect(updatedGarage.subscriptions).to.be.an('object').which.have.any.keys(GarageSubscriptions.E_REPUTATION);
    expect(updatedGarage.subscriptions[GarageSubscriptions.E_REPUTATION])
      .to.be.an('object')
      .which.have.any.keys('price', 'enabled');
    expect(updatedGarage.subscriptions[GarageSubscriptions.E_REPUTATION].price).to.be.equal(20);
    expect(updatedGarage.subscriptions[GarageSubscriptions.E_REPUTATION].enabled).to.be.true;
  });
  it('should not allow subscription to erep for a GS user', async () => {
    let custeedUser = Tools.random.user();
    custeedUser.email = 'test@custeed.com';
    custeedUser = await app.addUser(custeedUser);
    const res = await sendQuery(app, mutation, {}, custeedUser.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetSubscribeToErep');
    expect(res.data.userSetSubscribeToErep).to.be.an('object').which.have.keys('success', 'message', 'unauthorized');
    expect(res.data.userSetSubscribeToErep.success).to.be.false;
    expect(res.data.userSetSubscribeToErep.message).to.be.equal('errorGarageScoreUser');
    expect(res.data.userSetSubscribeToErep.unauthorized).to.be.true;
    const updatedUser = await app.models.User.getMongoConnector().findOne(
      { _id: custeedUser.id },
      { projection: { authorization: true } }
    );
    expect(updatedUser).to.be.an('object').which.have.any.keys('authorization');
    expect(updatedUser.authorization).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
    expect(updatedUser.authorization[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.false;
  });
  // PriorityProfile means manager like user ' job
  it('should not allow subscription to erep for a user who is not a priorityProfile', async () => {
    let notPriorityProfile = Tools.random.user();
    notPriorityProfile.job = 'test';
    notPriorityProfile = await app.addUser(notPriorityProfile);
    const res = await sendQuery(app, mutation, {}, notPriorityProfile.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetSubscribeToErep');
    expect(res.data.userSetSubscribeToErep).to.be.an('object').which.have.keys('success', 'message', 'unauthorized');
    expect(res.data.userSetSubscribeToErep.success).to.be.true;
    expect(res.data.userSetSubscribeToErep.message).to.be.null;
    expect(res.data.userSetSubscribeToErep.unauthorized).to.be.true;
    const updatedUser = await app.models.User.getMongoConnector().findOne(
      { _id: notPriorityProfile.id },
      { projection: { authorization: true } }
    );
    expect(updatedUser).to.be.an('object').which.have.any.keys('authorization');
    expect(updatedUser.authorization).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
    expect(updatedUser.authorization[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.false;
  });

  it('should set subscription to erep for a user to true with multiple garages', async () => {
    const userData = Tools.random.user();
    userData.job = 'Actionnaire / Président';
    userData.garageIds = [garage.id, garage2.id];
    const userWithMultipleGarages = await app.addUser(userData);
    const res = await sendQuery(app, mutation, {}, userWithMultipleGarages.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetSubscribeToErep');
    expect(res.data.userSetSubscribeToErep).to.be.an('object').which.have.keys('success', 'message', 'unauthorized');
    expect(res.data.userSetSubscribeToErep.success).to.be.true;
    expect(res.data.userSetSubscribeToErep.message).to.be.null;
    expect(res.data.userSetSubscribeToErep.unauthorized).to.be.false;
    const updatedUser = await app.models.User.getMongoConnector().findOne(
      { _id: userWithMultipleGarages.id },
      { projection: { authorization: true, authRequest: true, allGaragesAlerts: true } }
    );
    expect(updatedUser).to.be.an('object').which.have.any.keys('authorization', 'authRequest', 'allGaragesAlerts');
    expect(updatedUser.authorization).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
    expect(updatedUser.authorization[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.true;
    expect(updatedUser.authRequest).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
    expect(updatedUser.authRequest[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.false;
    expect(updatedUser.allGaragesAlerts).to.be.an('object').which.have.any.keys(AlertTypes.EXOGENOUS_NEW_REVIEW);
    expect(updatedUser.allGaragesAlerts[AlertTypes.EXOGENOUS_NEW_REVIEW]).to.be.true;
    const updatedGarages = await app.models.Garage.getMongoConnector()
      .find({ _id: { $in: [garage.id, garage2.id] } }, { projection: { subscriptions: true } })
      .toArray();
    for (const garageSub of updatedGarages) {
      expect(garageSub).to.be.an('object').which.have.any.keys('subscriptions');
      expect(garageSub.subscriptions).to.be.an('object').which.have.any.keys(GarageSubscriptions.E_REPUTATION);
      expect(garageSub.subscriptions[GarageSubscriptions.E_REPUTATION])
        .to.be.an('object')
        .which.have.any.keys('price', 'enabled');
      expect(garageSub.subscriptions[GarageSubscriptions.E_REPUTATION].price).to.be.equal(20);
      expect(garageSub.subscriptions[GarageSubscriptions.E_REPUTATION].enabled).to.be.true;
    }
  });
  it('should set subscription to erep for multiple users for the same garage', async () => {
    const userData = Tools.random.user();
    userData.job = 'Actionnaire / Président';
    userData.garageIds = [garage.id];
    const user2 = await app.addUser(userData);
    const res = await sendQuery(app, mutation, {}, user2.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetSubscribeToErep');
    expect(res.data.userSetSubscribeToErep).to.be.an('object').which.have.keys('success', 'message', 'unauthorized');
    expect(res.data.userSetSubscribeToErep.success).to.be.true;
    expect(res.data.userSetSubscribeToErep.message).to.be.null;
    expect(res.data.userSetSubscribeToErep.unauthorized).to.be.false;
    const updatedUsers = await app.models.User.getMongoConnector()
      .find(
        { _id: { $in: [user.id, user2.id] } },
        { projection: { authorization: true, authRequest: true, allGaragesAlerts: true } }
      )
      .toArray();
    for (const userAccess of updatedUsers) {
      expect(userAccess).to.be.an('object').which.have.any.keys('authorization', 'authRequest', 'allGaragesAlerts');
      expect(userAccess.authorization).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
      expect(userAccess.authorization[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.true;
      expect(userAccess.authRequest).to.be.an('object').which.have.any.keys(UserAuthorization.ACCESS_TO_E_REPUTATION);
      expect(userAccess.authRequest[UserAuthorization.ACCESS_TO_E_REPUTATION]).to.be.false;
      expect(userAccess.allGaragesAlerts).to.be.an('object').which.have.any.keys(AlertTypes.EXOGENOUS_NEW_REVIEW);
      expect(userAccess.allGaragesAlerts[AlertTypes.EXOGENOUS_NEW_REVIEW]).to.be.true;
    }

    const updatedGarage = await app.models.Garage.getMongoConnector().findOne(
      { _id: garage.id },
      { projection: { subscriptions: true } }
    );
    expect(updatedGarage).to.be.an('object').which.have.any.keys('subscriptions');
    expect(updatedGarage.subscriptions).to.be.an('object').which.have.any.keys(GarageSubscriptions.E_REPUTATION);
    expect(updatedGarage.subscriptions[GarageSubscriptions.E_REPUTATION])
      .to.be.an('object')
      .which.have.any.keys('price', 'enabled');
    expect(updatedGarage.subscriptions[GarageSubscriptions.E_REPUTATION].price).to.be.equal(20);
    expect(updatedGarage.subscriptions[GarageSubscriptions.E_REPUTATION].enabled).to.be.true;
  });
});
