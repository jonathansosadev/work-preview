const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const samples = require('../../test/unit-test/common/lib/rgpd/_samples/samples.js');
const { getDeepFieldValue: deep } = require('../../frontend/utils/object');
const app = new TestApp();

const mutation = `mutation rgpdSetAnonymizeFromInput ($input: String!) {
  rgpdSetAnonymizeFromInput (input: $input) { 
    error
  } 
}`;

describe('Apollo - Anonymize datas (data, contact, customer) from input', async function () {
  let userId = null;
  beforeEach(async function () {
    await app.reset();
    const garage = await app.addGarage();
    const user = await app.addUser();
    userId = user.userId.toString();
    await user.addGarage(garage);
  });

  it('should anonymize 1 contact, 1 data and 1 customer from a email', async function () {
    await app.models['Data'].create(samples['Data']);
    await app.models['Customer'].create(samples['Customer']);
    await app.models['Contact'].create(samples['Contact']);

    const dataId = (await app.models['Data'].getMongoConnector().findOne({}))._id;
    await app.models['Contact'].getMongoConnector().updateOne({}, { $set: { 'payload.dataId': dataId } });
    await app.models['Customer'].getMongoConnector().updateOne({}, { $set: { dataIds: [dataId] } });

    const res = (await sendQueryAs(app, mutation, { input: 'uneadressemailsuperoriginale@gmail.com' }, userId)).data
      .rgpdSetAnonymizeFromInput;
    expect(res.error).to.be.null;
    const [customer, data, contact] = [
      await app.models['Customer'].getMongoConnector().findOne(),
      await app.models['Data'].getMongoConnector().findOne({}),
      await app.models['Contact'].getMongoConnector().findOne(),
    ];

    expect(deep(customer, 'index')[1].v).equals('email_c03aff7eddb4f782074e603f5fce6560@gmail.com');
    expect(deep(contact, 'recipient')).equals('recipient_e6c8cdc400694490ea861e6dbef1e759');
    expect(deep(data, 'customer.contact.email.value')).equals('email_21ad0bd836b90d08f4cf640b4c298e7c@test.com');
  });
});
