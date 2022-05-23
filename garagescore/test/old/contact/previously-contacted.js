const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');
const promises = require('../../../common/lib/util/promises');
// const defaultScenario = require('../../../common/lib/garagescore/campaign-scenario/default-scenario');
const testTool = require('../../../common/lib/test/testtools');
const campaignStatus = require('../../../common/models/data/type/campaign-status');

const expect = chai.expect;
const app = new TestApp();

/**
 * Send only one time the same campaign
 */
describe('Check filtering dataRecords', () => {
  let garage = null;
  before(async function beforeEach() {
    await app.reset();
    garage = await app.addGarage();
  });
  it('Send first time maintenance', async function test() {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: 'email-bidon@domain.fr' });
    const datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('campaign.contactScenario.firstContactedAt')).to.exist;
    const contacts = await app.contacts();
    expect(contacts.length).equal(1); // first contact + thanks
  });
  it('Do not Send second time maintenance', async function test() {
    garage.removeFilterCache();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: 'email-bidon@domain.fr' });
    const datasCampaign = await campaign.datas();
    expect(datasCampaign.length).equal(1);
    expect(datasCampaign[0].get('campaign.status')).equal(campaignStatus.BLOCKED);
    const datas = await app.datas();
    expect(datas.length).equal(2);
    expect(datas[1].get('campaign.contactStatus.previouslyContactedByEmail')).equal(true);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1); // first contact + thanks
  });
});
describe('Ignoring filters garage Example', () => {
  let garage = null;
  let firstTime = true;
  beforeEach(async function beforeEach() {
    if (!firstTime) {
      return;
    }
    firstTime = false;

    await app.reset();
    garage = await app.addGarage();
    await promises.wait(app.models.Configuration.setGarageExampleId, garage.garageId.toString());
  });
  it('Send first time maintenance', async function test() {
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: 'email-bidon@garagescore.com' });
    const contacts = await app.contacts();
    expect(contacts.length).equal(1); // first contact
  });
  it('Send second time maintenance', async function test() {
    garage.removeFilterCache();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: 'email-bidon@garagescore.com' });
    const contacts = await app.contacts();
    expect(contacts.length).equal(2); // 2 of first contact
  });
});

describe('Send contact on same mail but different data.type', () => {
  let garage = null;
  let firstTime = true;
  const mobilePhone = testTool.random.phone();
  const customerContacts = {
    email: 'email-bidon@domain.fr',
    mobilePhone,
  };

  beforeEach(async function beforeEach() {
    if (!firstTime) {
      return;
    }
    firstTime = false;

    await app.reset();
    garage = await app.addGarage();
    await promises.wait(app.models.Configuration.setGarageExampleId, garage.garageId.toString());
  });
  it('Send first time maintenance', async function test() {
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, customerContacts);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1); // first contact
  });
  it('Send second time vo', async function test() {
    garage.removeFilterCache();
    await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES, customerContacts);
    const contacts = await app.contacts();
    expect(contacts.length).equal(2); // 2 of first contact
  });
});

describe('Send contact on same phone but different data.type', () => {
  let garage = null;
  let firstTime = true;
  const mobilePhone = testTool.random.phone();
  const customerContacts = {
    email: 'email-bidon@domain.fr',
    mobilePhone,
  };

  beforeEach(async function beforeEach() {
    if (!firstTime) {
      return;
    }
    firstTime = false;

    await app.reset();
    garage = await app.addGarage();
    await promises.wait(app.models.Configuration.setGarageExampleId, garage.garageId.toString());
  });
  it('Send first time maintenance', async function test() {
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, customerContacts);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1); // first contact
  });
  it('Send second time vo', async function test() {
    garage.removeFilterCache();
    await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES, customerContacts);
    const contacts = await app.contacts();
    expect(contacts.length).equal(2); // 2 of first contact
  });
});
