/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const contactsConfig = require('../../../../common/lib/garagescore/data-campaign/contacts-config');

const app = new TestApp();
const contactsTools = require('./_contacts-tools')(app);
/**
 DO we send sms on disableSmsWithValidEmails
 */

const specialScenario = {
  name: 'test disable sms with valid emails',
  type: 'Dealership',
  oldId: 'default',
  duration: 30,
  disableSmsWithValidEmails: 1,
  followupUnsatisfied: { enabled: true, delay: 0 },
  chains: {
    Maintenance: {
      contacts: [
        { key: 'maintenance_email_1', delay: 0 },
        { key: 'maintenance_sms_1', delay: 0 },
        { key: 'maintenance_email_2_make', delay: 0 },
        { key: 'maintenance_email_3', delay: 0 },
      ],
      thanks: {
        complete_satisfied: 'maintenance_email_thanks_1_make',
        complete_unsatisfied: 'maintenance_email_thanks_2',
        incomplete_satisfied: 'maintenance_email_thanks_3',
        incomplete_unsatisfied: 'maintenance_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: { email: '', sms: '' },
        nonRespondents: { email: '', sms: '' },
      },
    },
    NewVehicleSale: {
      contacts: [
        { key: 'sale_email_1', delay: 0 },
        { key: 'sale_sms_1', delay: 0 },
        { key: 'sale_email_2', delay: 0 },
        { key: 'sale_email_3', delay: 0 },
      ],
      thanks: {
        complete_satisfied: 'sale_email_thanks_1_make',
        complete_unsatisfied: 'sale_email_thanks_2',
        incomplete_satisfied: 'sale_email_thanks_3',
        incomplete_unsatisfied: 'sale_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: { email: '', sms: '' },
        nonRespondents: { email: '', sms: '' },
      },
    },
    UsedVehicleSale: {
      contacts: [
        { key: 'sale_email_1', delay: 0 },
        { key: 'sale_sms_1', delay: 0 },
        { key: 'sale_email_2', delay: 0 },
        { key: 'sale_email_3', delay: 0 },
      ],
      thanks: {
        complete_satisfied: 'sale_email_thanks_1_make',
        complete_unsatisfied: 'sale_email_thanks_2',
        incomplete_satisfied: 'sale_email_thanks_3',
        incomplete_unsatisfied: 'sale_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: { email: '', sms: '' },
        nonRespondents: { email: '', sms: '' },
      },
    },
  },
}; // eslint-disable-line

const setPerson = (email, mobile) => {
  const person = testTools.random.person();
  person.email = email;
  person.mobilePhone = mobile;
  return person;
};

describe('Test send on disableSmsWithValidEmails', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Not sending sms if both phone and email valid, disable = true', async function test() {
    const person = setPerson('testerino@gmail.com', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    await app.upsertDefaultScenario(specialScenario);
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_1.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_2_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_3.key },
      }, // eslint-disable-line max-len
    ];
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_3.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending sms if both phone and email valid, disable = false', async function test() {
    const person = setPerson('testerino@gmail.com', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    await app.upsertDefaultScenario(Object.assign(specialScenario, { disableSmsWithValidEmails: false }));
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_1.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_sms_1.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_2_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_3.key },
      }, // eslint-disable-line max-len
    ];
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_thanks_1.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending sms if only number valid, disable = true', async function test() {
    const person = setPerson('invalid', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_sms_1.key },
      }, // eslint-disable-line max-len
    ];
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_thanks_1.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending only sms if only number valid, disable = false', async function test() {
    const person = setPerson('invalid', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    // const scenario = disableSmsWithValidEmails(testScenario, true);
    // await garage.setScenario(scenario);
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_sms_1.key },
      }, // eslint-disable-line max-len
    ];
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_thanks_1.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Not sending sms if only email valid, disable = true', async function test() {
    const person = setPerson('testerino@gmail.com', 'invalid');
    const garage = await app.addGarage();
    await app.upsertDefaultScenario(Object.assign(specialScenario, { disableSmsWithValidEmails: true }));
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_1.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_2_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_3.key },
      }, // eslint-disable-line max-len
    ];
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_3.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
});
