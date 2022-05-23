const chai = require('chai');
const objectHash = require('object-hash');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');

const { expect } = chai;
const testApp = new TestApp();

const userEmail = 'user@gs.com';
let userId;
/* Get garage data from api */
describe('User cockpit history', () => {
  beforeEach(async function () {
    await testApp.reset();
    const user = await testApp.addUser({ email: userEmail, authorization: { ACCESS_TO_COCKPIT: true } });
    userId = user.userId;
  });
  it('User open a new url', async () => {
    const request = `mutation UserUpdateCockpitHistory($routeName: String!) {
      UserUpdateCockpitHistory(routeName: $routeName) {
        debugMessage
        error
        status
    }
    }`;
    let users = await testApp.users();
    let [user] = users;
    const routeName = '/cockpit-leads-team';
    const variables = { routeName };
    expect(user.lastCockpitOpenAt).to.be.undefined;
    expect(user.lastOpenAt).to.be.undefined;
    const res = await _sendQueryAs(testApp, request, variables, userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    users = await testApp.users();
    [user] = users;
    const dateDiff = Date.now() - user.lastCockpitOpenAt.getTime();
    expect(dateDiff).to.be.lessThan(1000);
  });
  it('Unautorized user open a new url', async () => {
    const user = await testApp.addUser({ email: 'bad@bad.com', authorization: { ACCESS_TO_COCKPIT: false } });
    userId = user.userId;
    const request = `mutation UserUpdateCockpitHistory($routeName: String!) {
      UserUpdateCockpitHistory(routeName: $routeName) {
        debugMessage
        error
        status
      }
    }`;
    const routeName = '/cockpit-leads-team';
    const variables = { routeName };
    const res = await _sendQueryAs(testApp, request, variables, userId);
    expect(res.data.UserUpdateCockpitHistory.status).equals('KO');
  });
  it('should not update lastCockpitOpenAt when a user open a new url from Backdoor', async () => {
    const request = `mutation UserUpdateCockpitHistory($routeName: String!, $isBackdoor : Boolean) {
      UserUpdateCockpitHistory(routeName: $routeName, isBackdoor : $isBackdoor) {
        debugMessage
        error
        status
    }
    }`;
    let users = await testApp.users();
    let [user] = users;
    const routeName = '/cockpit-leads-team';
    const variables = { routeName, isBackdoor: true };
    const res = await _sendQueryAs(testApp, request, variables, userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    users = await testApp.users();
    [user] = users;
    expect(user.lastCockpitOpenAt).to.be.undefined;
    expect(user.lastCockpitOpenWithBackdoorAt).to.be.defined;
    const dateDiff = Date.now() - user.lastCockpitOpenWithBackdoorAt.getTime();
    expect(dateDiff).to.be.lessThan(1000);
  });
});
