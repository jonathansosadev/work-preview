const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataTypes = require('../../../../common/models/data-file.data-type');
const chai = require('chai');
const moment = require('moment');

/* eslint-disable no-unused-expressions */
const expect = chai.expect;
const app = new TestApp();

/**
 Do we send the first contacts ?
 */
describe('Test contacts sent:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Send SMS if email nc', async function test() {
    const person = testTools.random.person();
    person.email = 'nc@nc.com';
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataTypes.MAINTENANCES, person);
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.contact.email.isNC')).equal(true);
    expect(datas[0].get('campaign.contactStatus.emailStatus')).equal('Empty');
    const contacts = await app.contacts();
    expect(contacts.length).equal(1);
    expect(contacts[0].type).equal('CAMPAIGN_SMS');
  });
});
