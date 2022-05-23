const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const app = new TestApp();

let user;
const mutation = `mutation userSetFirstVisit ($firstVisit: String!, $value: Boolean!) {
  userSetFirstVisit (firstVisit: $firstVisit, value: $value) { 
    success
    error
  } 
}`;

describe('Apollo::userSetFirstVisit', async function descr() {
  before(async function () {
    await app.reset();
    const userData = Tools.random.user();
    user = await app.addUser(userData);
  });

  it('should return success = true when everything is good', async () => {
    const variables = {
      firstVisit: 'EREPUTATION',
      value: true,
    };

    const res = await sendQuery(app, mutation, variables, user.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetFirstVisit');
    expect(res.data.userSetFirstVisit).to.be.an('object').which.have.keys('success', 'error');
    expect(res.data.userSetFirstVisit.success).to.be.true;
    expect(res.data.userSetFirstVisit.error).to.be.null;
    const updatedUser = await app.models.User.getMongoConnector().findOne({ _id: user.id });
    expect(updatedUser).to.be.an('object').which.have.any.keys('firstVisit');
    expect(updatedUser.firstVisit).to.be.an('object').which.have.any.keys(variables.firstVisit);
    expect(updatedUser.firstVisit[variables.firstVisit]).to.be.equal(variables.value);
  });
  // Only field allowed for now is EREPUTATION
  it('should return an error when an unknown firstVisit field was supplied', async () => {
    const variables = {
      firstVisit: 'TEST',
      value: true,
    };

    const res = await sendQuery(app, mutation, variables, user.id.toString());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetFirstVisit');
    expect(res.data.userSetFirstVisit).to.be.an('object').which.have.keys('success', 'error');
    expect(res.data.userSetFirstVisit.success).to.be.false;
    expect(res.data.userSetFirstVisit.error).to.be.equal('Field firstVisit supplied is not allowed');
  });
});
