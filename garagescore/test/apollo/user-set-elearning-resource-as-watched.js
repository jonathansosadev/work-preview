const chai = require('chai');
const objectHash = require('object-hash');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');

const { expect } = chai;
const testApp = new TestApp();

const learningResources = {
  resourcesByProduct: [
    {
      product: 'XLeads',
      resources: [{ title: 'vid1', url: 'url1' }],
    },
  ],
};
/* Get garage data from api */
describe('Elearning resources analytics', () => {
  it('Set resources as watched', async () => {
    await testApp.reset();
    const userEmail = 'user@gs.com';
    const user = await testApp.addUser({ email: userEmail });
    const request = `mutation ElearningResourceWatched($url: String!) {
      ElearningResourceWatched(url: $url) {
      status
    }
    }`;
    const url = '/toto';
    const variables = { url };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.ElearningResourceWatched).to.not.be.undefined;
    expect(res.data.ElearningResourceWatched.status).equal(true);
    await _sendQueryAs(testApp, request, variables, user.userId); // send again to check later if we dont make duplicates in db
    const users = await testApp.users({ email: userEmail });
    const resources = users[0].elearning.resources.filter((r) => r.url === url);
    expect(resources).to.not.be.undefined;
    expect(resources.length).equal(1);
    expect(resources[0].lastWatchAt).to.not.be.undefined;
    expect(Math.floor(resources[0].lastWatchAt / 10000)).equal(Math.floor(Date.now() / 10000)); // check dates are almost equals
  });
});
