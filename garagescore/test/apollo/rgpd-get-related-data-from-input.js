const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const samples = require('../../test/unit-test/common/lib/rgpd/_samples/samples.js');

const { expect } = chai;
const app = new TestApp();

const request = `query rgpdGetRelatedDataFromInput ($input: String!) {
  rgpdGetRelatedDataFromInput (input: $input) {
    error
    customer
    data
    contact
    billingAccounts {
      name
      RGPDContact
    }
  }
}`;
describe('Apollo - Get related datas (data, contact, customer) from input', async function descr() {
  let userId = null;
  beforeEach(async function () {
    await app.reset();
    const garage = await app.addGarage();
    const user = await app.addUser();
    userId = user.userId.toString();
    await user.addGarage(garage);
  });
  it('should get 1 customer, 1 data, 1 contact', async function it() {
    await app.models['Customer'].create(samples['Customer']);
    await app.models['Data'].create(samples['Data']);
    await app.models['Contact'].create(samples['Contact']);

    const res = (await sendQueryAs(app, request, { input: 'uneadressemailsuperoriginale@gmail.com' }, userId)).data
      .rgpdGetRelatedDataFromInput;

    expect(res.customer).equals(1);
    expect(res.data).equals(1);
    expect(res.contact).equals(1);
  });
});
