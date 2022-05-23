const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const app = new TestApp();

const query = `query userGetUserTemporaryPassword ($userGetUserTemporaryPassword0id: String!) { 
  userGetUserTemporaryPassword (id: $userGetUserTemporaryPassword0id) {
    password 
  } 
}`;

describe('apollo::userGetUserTemporaryPassword', async function descr() {
  before(async function () {
    await app.reset();
  });

/** Use Redis, disabled 
  it('should send temporay password for connect as', async () => {
    const userData = Tools.random.user();
    userData.email = 'tryme@custeed.com';
    const user = await app.models.User.create(userData);
    const variablesApollo = {
      userGetUserTemporaryPassword0id: user.id.toString(),
    };
    const res = await sendQuery(app, query, variablesApollo, user.id.toString());
    const password = parseInt(res.data.userGetUserTemporaryPassword.password, 10);
    // should get password number like 7658
    expect(typeof password).equal('number');
  });
*/
  it('should forbidden request for no garagescore/custeed user', async () => {
    const userData = Tools.random.user();
    const user = await app.models.User.create(userData);
    const variablesApollo = {
      userGetUserTemporaryPassword0id: user.id.toString(),
    };

    const res = await sendQuery(app, query, variablesApollo, user.id.toString());
    // throw message include "Not authorized" if user is not garagescore/custeed email
    expect(res.errors.toString().includes('Not authorized')).equal(true);
  });
});
