const expect = require('chai').expect;
const TestApp = require('../../../../../common/lib/test/test-app');
const Anonymizator = require('../../../../../common/lib/rgpd/anonymizator.js');
const samples = require('./_samples/samples.js');
const { getDeepFieldValue: deep } = require('../../../../../frontend/utils/object');
const { maskPhone, maskEmail, maskCustom } = require('../../../../../common/lib/rgpd/collections/_utils.js');

const app = new TestApp();

describe('Anonymization', function () {
  beforeEach(async function () {
    await app.reset();
  });

  it('should test maskphone', async () => {
    expect(maskPhone('+33 6 12 34 56 78')).equals('+33887654321');
  });

  it('should test maskEmail', async () => {
    expect(maskEmail('bb@test.com')).equals('email_21ad0bd836b90d08f4cf640b4c298e7c@test.com');
  });

  it('should test maskCustom', async () => {
    // maskCustom('firstName'); -> too complicated to test
  });

  it('should get customers which will get anonymized', async () => {
    const collection = 'Customer';

    await app.models[collection].create(samples[collection]);
    const Model = app.models[collection].getMongoConnector();
    const before = await Model.findOne({});
    const customers = await Anonymizator[collection]({ email: before.email }, { dataIds: true }, false);
  });

  it('should Anonymize a Data', async () => {
    const collection = 'Data';

    await app.models[collection].create(samples[collection]);
    const Model = app.models[collection].getMongoConnector();

    const before = await Model.findOne({});
    expect(deep(before, 'customer.contact.email.value')).equals('bb@test.com');
    expect(deep(before, 'customer.fullName.value')).equals('Philippe Robert');

    await Anonymizator[collection]({ dataIds: [before._id] }, null, true);
    const after = await Model.findOne({});
    expect(deep(after, 'customer.contact.email.value')).equals('email_21ad0bd836b90d08f4cf640b4c298e7c@test.com');
    expect(deep(after, 'customer.contact.mobilePhone.value')).equals('+33887654321');
    expect(deep(after, 'customer.fullName.value')).equals('fullName_1bd0a6267c3344d6a7ce340bb70865b9');
    expect(deep(after, 'customer.firstName.value')).equals('firstName_f7f861681aecb18f4c96fa62eabb43ee');
    expect(deep(after, 'customer.lastName.value')).equals('lastName_4ffe35db90d94c6041fb8ddf7b44df29');
  });

  it('should Anonymize a Contact', async () => {
    const collection = 'Contact';

    await app.models[collection].create(samples[collection]);
    const Model = app.models[collection].getMongoConnector();

    const before = await Model.findOne({});
    expect(deep(before, 'to')).equals('uneadressemailsuperoriginale@gmail.com');
    expect(deep(before, 'recipient')).equals('Jean Richard');

    await Anonymizator[collection]({ dataIds: [before.payload.dataId] }, null, true);
    const after = await Model.findOne({});
    expect(deep(after, 'to')).equals('email_c03aff7eddb4f782074e603f5fce6560@gmail.com');
    expect(deep(after, 'recipient')).equals('recipient_e6c8cdc400694490ea861e6dbef1e759');
  });

  it('should Anonymize a Customer', async function () {
    const collection = 'Customer';

    await app.models[collection].create(samples[collection]);
    const Model = app.models[collection].getMongoConnector();

    const before = await Model.findOne({});
    expect(deep(before, 'email')).equals('uneadressemailsuperoriginale@gmail.com');
    expect(deep(before, 'phone')).equals('+33612345678');
    expect(deep(before, 'fullName')).equals('Simon Ménard');

    expect(deep(before, 'emailList')[0]).equals('uneadressemailsuperoriginale@gmail.com');
    expect(deep(before, 'phoneList')[0]).equals('+33612345678');

    expect(deep(before, 'index')[1].v).equals('uneadressemailsuperoriginale@gmail.com');

    await Anonymizator[collection]({ email: before.email }, null, true);
    const after = await Model.findOne({});
    expect(deep(after, 'email')).equals('email_c03aff7eddb4f782074e603f5fce6560@gmail.com');
    expect(deep(after, 'phone')).equals('+33887654321');
    expect(deep(after, 'fullName')).equals('fullName_fc941d4d52c09bb6578a7688a8745fdf');

    expect(deep(after, 'emailList')[0]).equals('email_c03aff7eddb4f782074e603f5fce6560@gmail.com');
    expect(deep(after, 'phoneList')[0]).equals('+33887654321');

    expect(deep(after, 'index')[1].v).equals('email_c03aff7eddb4f782074e603f5fce6560@gmail.com');
  });
});
