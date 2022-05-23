const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const { ContactTypes } = require('../../frontend/utils/enumV2');

const app = new TestApp();
const mutation = `mutation userSetUserPasswordReset ($userSetUserPasswordReset0id: String!) {
  userSetUserPasswordReset (id: $userSetUserPasswordReset0id) { 
    status
    statusMessage
  } 
}`;

describe('apollo::userSetUserPasswordReset', async function descr() {
  before(async function () {
    await app.reset();
  });

  it('should send email for reset password', async () => {
    const userData = Tools.random.user();
    const user = await app.models.User.create(userData);
    const variablesApollo = {
      userSetUserPasswordReset0id: user.id.toString(),
    };

    const res = await sendQuery(app, mutation, variablesApollo, user.id.toString());
    const contactExpect = await app.models.Contact.getMongoConnector().findOne({
      to: user.email,
    });
    // expect find contact type RESET_PASSWORD_EMAIL
    expect(res.data.userSetUserPasswordReset.status).equal('OK');
    expect(contactExpect.type).equal(ContactTypes.RESET_PASSWORD_EMAIL);
  });

  it('should not found user', async () => {
    const userData = Tools.random.user();
    const user = await app.models.User.create(userData);
    const variablesApollo = {
      userSetUserPasswordReset0id: '611cc39c0eb20b80ba280bd3', // fake userId
    };

    const res = await sendQuery(app, mutation, variablesApollo, user.id.toString());
    // status request should be KO
    expect(res.data.userSetUserPasswordReset.status).equal('KO');
    expect(res.data.userSetUserPasswordReset.statusMessage).equal('User with id: 611cc39c0eb20b80ba280bd3 not found.');
  });
});
