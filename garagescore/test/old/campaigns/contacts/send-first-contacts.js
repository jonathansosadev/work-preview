const chai = require('chai');
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const contactsConfig = require('../../../../common/lib/garagescore/data-campaign/contacts-config.js');
const timeHelper = require('../../../../common/lib/util/time-helper');
/* eslint-disable no-unused-expressions */
const app = new TestApp();
const contactsTools = require('./_contacts-tools')(app);

const expect = chai.expect;
/**
Do we send the first contacts ?
*/
describe('Test contacts sent:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  // test
  it('Send first contact after campaign creation', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_1_make.key },
      },
    ]; // eslint-disable-line max-len
    const nextCampaignContactDay = timeHelper.daysAfterNow(6);
    expected.datas = [
      {
        customer: contactsTools.customer(person),
        foreign: { garageId: garage.garageId },
        lastCampaignContactSent: contactsConfig.maintenance_email_1_make.key,
        nextCampaignContact: contactsConfig.maintenance_email_2_make.key,
        hasBeenContactedByEmail: true,
        hasBeenContactedByPhone: false,
        nextCampaignContactDay,
        firstContactByEmailDay: timeHelper.todayDayNumber(),
        firstContactByPhoneDay: nextCampaignContactDay,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Send second contact after the first one', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await campaign.sendNextContacts();
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_1_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_2_make.key },
      }, // eslint-disable-line max-len
    ]; // eslint-disable-line max-len
    expected.datas = [
      {
        customer: contactsTools.customer(person),
        foreign: { garageId: garage.garageId },
        lastCampaignContactSent: contactsConfig.maintenance_email_2_make.key,
        nextCampaignContact: contactsConfig.maintenance_email_3.key,
        nextCampaignContactDay: timeHelper.daysAfterNow(19),
        hasBeenContactedByEmail: true,
        hasBeenContactedByPhone: false,
        firstContactByEmailDay: timeHelper.todayDayNumber(),
        firstContactByPhoneDay: timeHelper.todayDayNumber(),
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Schedules the first SMS & Email contacts with the proper delay', async function test() {
    const person = testTools.random.person();
    // Creating a garage with an APV delay of 20 days
    const garageOptions = { firstContactDelay: { Maintenance: { value: 20 } } };
    const garage = await app.addGarage(garageOptions);
    // Create a new campaign
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const datas = await campaign.datas();
    // Checking the scheduled email & sms
    const nextCampaignContact = datas[0].campaign.contactScenario.nextCampaignContactDay;
    const firstContactEmail = datas[0].campaign.contactScenario.firstContactByEmailDay;
    const firstContactSMS = datas[0].campaign.contactScenario.firstContactByPhoneDay;
    expect(nextCampaignContact).to.equals(timeHelper.daysAfterNow(20));
    expect(firstContactEmail).to.equals(timeHelper.daysAfterNow(20));
    expect(firstContactSMS).to.equals(timeHelper.daysAfterNow(20));
  });
});
