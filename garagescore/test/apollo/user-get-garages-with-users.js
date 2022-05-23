const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');

const { expect } = chai;
const testApp = new TestApp();

async function createUserWithAllAuthorization(options = {}) {
  return testApp.addUser({
    ...options,
    authorization: {
      ACCESS_TO_COCKPIT: true,
      ACCESS_TO_SATISFACTION: true,
      ACCESS_TO_UNSATISFIED: true,
      ACCESS_TO_LEADS: true,
      ACCESS_TO_CONTACTS: true,
      ACCESS_TO_E_REPUTATION: true,
      ACCESS_TO_ESTABLISHMENT: true,
      ACCESS_TO_TEAM: true,
      ACCESS_TO_ADMIN: true,
      ACCESS_TO_DARKBO: true,
      ACCESS_TO_GREYBO: true,
      WIDGET_MANAGEMENT: true,
      ACCESS_TO_WELCOME: true,
      ACCESS_TO_AUTOMATION: true,
    },
  });
}

const request = `query userGetGaragesAndAgents ($id: String!) {
  userGetGaragesAndAgents (id: $id) {
    id
    type
    publicDisplayName
    slug
  }
}`;
/* Get garage data from api */
describe('userGetGaragesAndAgents', async function descr() {
  let userId = null;
  const nbGarages = 10;
  const garages = [];
  beforeEach(async function () {
    this.timeout(9999999);
    await testApp.reset();
    for (const i of new Array(nbGarages)) {
      const g = await testApp.addGarage();
      garages.push(g);
    }
    const user = await createUserWithAllAuthorization({});
    for (const g of garages) {
      await user.addGarage(g);
    }
    userId = user.userId.toString();
  });
  it('user with garages list', async function it() {
    const variables = { id: userId };
    const res = await _sendQueryAs(testApp, request, variables, userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.userGetGaragesAndAgents).to.not.be.undefined;
    expect(res.data.userGetGaragesAndAgents.length).equals(nbGarages);
  });
});
