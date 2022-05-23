const TestApp = require('../../../common/lib/test/test-app');
const testTools = require('../../../common/lib/test/testtools');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const BlackListReason = require('../../../common/models/black-list-reason');
const chai = require('chai');
const moment = require('moment');

const expect = chai.expect;
/* eslint-disable no-unused-expressions */
const app = new TestApp();
/**
Do we send the first contacts ?
*/
describe('Test contacts black list:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Blacklist for unsubscribe and block sending a second campaign', async function test() {
    const person = testTools.random.person();
    person.email = 'toto@tata.com';
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1);
    expect(contacts[0].type).equal('CAMPAIGN_EMAIL');
    await app.blackListContact(contacts[0], BlackListReason.USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL);
    const blackListItems = await app.blackListItems();
    expect(blackListItems.length).equal(1);
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.contact.email.isUnsubscribed')).equal(true);
    expect(datas[0].get('campaign.contactStatus.emailStatus')).equal('Unsubscribed');
    // hack to not be considered as previouslyContact in the next campaign
    datas[0].set('campaign.contactScenario.firstContactedAt', moment().subtract(2, 'months').toDate());
    await datas[0].save();
    garage.removeFilterCache();
    const campaign2 = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: person.email });
    const datasCampaign = await campaign2.datas();
    expect(datasCampaign.length).equal(1);
    const data = await app.datas();
    expect(data.length).equal(2);
    expect(data[1].get('campaign.contactStatus.previouslyUnsubscribedByEmail')).equal(true);
    const contacts2 = await app.contacts();
    expect(contacts2.length).equal(1);
  });
  it('Blacklist for complain and block sending a second campaign', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1);
    expect(contacts[0].type).equal('CAMPAIGN_EMAIL');
    await app.blackListContact(contacts[0], BlackListReason.USER_COMPLAINED_BY_EMAIL);
    const blackListItems = await app.blackListItems();
    expect(blackListItems.length).equal(1);
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.contact.email.isComplained')).equal(true);
    expect(datas[0].get('campaign.contactStatus.emailStatus')).equal('Unsubscribed');
    // hack to not be considered as previouslyContact in the next campaign
    datas[0].set('campaign.contactScenario.firstContactedAt', moment().subtract(2, 'months').toDate());
    await datas[0].save();
    garage.removeFilterCache();
    const campaign2 = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: person.email });
    const datasCampaign = await campaign2.datas();
    expect(datasCampaign.length).equal(1);
    const data = await app.datas();
    expect(data.length).equal(2);
    expect(data[1].get('campaign.contactStatus.previouslyComplainedByEmail')).equal(true);
    const contacts2 = await app.contacts();
    expect(contacts2.length).equal(1);
  });
  it('Blacklist for drop and block sending a second campaign', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1);
    expect(contacts[0].type).equal('CAMPAIGN_EMAIL');
    await app.blackListContact(contacts[0], BlackListReason.USER_EMAIL_ON_DROPPED);
    const blackListItems = await app.blackListItems();
    expect(blackListItems.length).equal(1);
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.contact.email.isDropped')).equal(true);
    expect(datas[0].get('campaign.contactStatus.emailStatus')).equal('Dropped');
    // hack to not be considered as previouslyContact in the next campaign
    datas[0].set('campaign.contactScenario.firstContactedAt', moment().subtract(2, 'months').toDate());
    await datas[0].save();
    garage.removeFilterCache();
    const campaign2 = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, { email: person.email });
    const datasCampaign = await campaign2.datas();
    expect(datasCampaign.length).equal(1);
    const data = await app.datas();
    expect(data.length).equal(2);
    expect(data[1].get('campaign.contactStatus.previouslyDroppedEmail')).equal(true);
    const contacts2 = await app.contacts();
    expect(contacts2.length).equal(2);
  });
  it('Blacklist for drop and see if hasBeenContactedByEmail is updated', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1);
    expect(contacts[0].type).equal('CAMPAIGN_EMAIL');
    await app.blackListContact(contacts[0], BlackListReason.USER_EMAIL_ON_DROPPED);
    const blackListItems = await app.blackListItems();
    expect(blackListItems.length).equal(1);
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.contact.email.isDropped')).equal(true);
    expect(datas[0].get('campaign.contactStatus.hasBeenContactedByEmail')).equal(false);
  });
  it('Blacklist for drop after revision', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const contacts = await app.contacts();
    expect(contacts.length).equal(1);
    expect(contacts[0].type).equal('CAMPAIGN_EMAIL');
    let datas = await app.datas();
    expect(datas.length).equal(1);
    datas[0].customer_revise('contact.email', 'uuuu@tata.gs');
    await datas[0].save();
    await app.blackListContact(contacts[0], BlackListReason.USER_EMAIL_ON_DROPPED);
    const blackListItems = await app.blackListItems();
    expect(blackListItems.length).equal(1);
    datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('customer.contact.email.isDropped')).equal(false);
    expect(datas[0].get('customer.contact.email.isOriginalDropped')).equal(true);
    expect(datas[0].get('campaign.contactStatus.emailStatus')).equal('Valid');
  });
});
