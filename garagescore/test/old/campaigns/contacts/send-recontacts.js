/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const contactsConfig = require('../../../../common/lib/garagescore/data-campaign/contacts-config.js');
const timeHelper = require('../../../../common/lib/util/time-helper');
const ContactTypes = require('../../../../common/models/contact.type');
const chai = require('chai');
const expect = chai.expect;

const app = new TestApp();

const contactsTools = require('./_contacts-tools')(app);
/**
Do we send recontacts emails/sms
*/
describe('Test recontact:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  // create for the garage a scenario with recontact sms

  const _setRecontacts = async (sms, email = null, google) => {
    app.defaultScenario.chains.Maintenance.recontacts = {
      enabled: true,
      dayOfNextMonth: 10,
      respondents: {
        sms,
        email,
      },
      nonRespondents: {
        sms,
        email,
      },
    };
    if (google) {
      app.defaultScenario.chains.Maintenance.recontacts.google = google;
    }
    await app.upsertDefaultScenario({});
  };

  it('Send SMS Recontact respondent when survey has NOT been responded', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await _setRecontacts(contactsConfig.custom_mercedes_maintenance_recontact_sms.key);
    // const scenario = await setupRecontactScenario(garage);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await campaign.sendReContacts();
    const nextCampaignContactDay = timeHelper.daysAfterNow(6);
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.maintenance_email_1_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.custom_mercedes_maintenance_recontact_sms.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        customer: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_1_make.key,
        nextCampaignContact: contactsConfig.maintenance_email_2_make.key,
        nextCampaignContactDay,
        recontactedAt: new Date(),
      },
    ];
    await contactsTools.checks(expected);
  });

  it('Send SMS Recontact respondent when survey has been partially responded', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    // const scenario = await setupRecontactScenario(garage);
    await _setRecontacts(contactsConfig.custom_mercedes_maintenance_recontact_sms.key);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(10).submit(false);
    await campaign.sendReContacts();
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
        payload: { key: contactsConfig.maintenance_email_thanks_1_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.custom_mercedes_maintenance_recontact_sms.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        customer: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_thanks_1_make.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
        recontactedAt: new Date(),
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Send SMS Mercedes Recontact respondent when survey has NOT been responded', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await _setRecontacts(
      contactsConfig.custom_mercedes_maintenance_recontact_sms.key,
      contactsConfig.custom_mercedes_maintenance_recontact_email_respondent.key
    );
    // const scenario = await setupMercedesScenario(garage);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await campaign.sendReContacts();
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
        payload: { key: contactsConfig.custom_mercedes_maintenance_recontact_email_respondent.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfig.custom_mercedes_maintenance_recontact_sms.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        customer: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_1_make.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
        recontactedAt: new Date(),
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Send EMAIL Recontact to customer', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    await _setRecontacts(
      contactsConfig.custom_mercedes_maintenance_recontact_sms.key,
      contactsConfig.custom_mercedes_maintenance_recontact_email_respondent.key
    );

    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await campaign.sendReContacts();
    const contact = await app.models.Contact.getMongoConnector().findOne({
      type: ContactTypes.CAMPAIGN_EMAIL,
      'payload.key': 'custom_mercedes_maintenance_recontact_email_respondent',
    });
    // should create contact document
    expect(contact.type).equal(ContactTypes.CAMPAIGN_EMAIL);
    expect(contact.payload.key).equal('custom_mercedes_maintenance_recontact_email_respondent');
  });
  it('Send EMAIL Recontact Google write review to customer', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    const google = {
      email: contactsConfig.recontact_email_google_write_review.key,
    };
    await _setRecontacts(null, null, google);

    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    // set customer to become promotor
    await app.models.Data.getMongoConnector().updateOne(
      { 'customer.contact.email.value': person.email },
      { $set: { 'review.rating.value': 9 } }
    );

    await campaign.sendReContacts();
    const contact = await app.models.Contact.getMongoConnector().findOne({
      type: ContactTypes.CAMPAIGN_EMAIL,
      'payload.key': contactsConfig.recontact_email_google_write_review.key,
    });
    // should create contact document
    expect(contact.type).equal(ContactTypes.CAMPAIGN_EMAIL);
    expect(contact.payload.key).equal(contactsConfig.recontact_email_google_write_review.key);
  });
  it('not send EMAIL Recontact Google write review if customer is not promotor', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    const google = {
      email: contactsConfig.recontact_email_google_write_review.key,
    };
    await _setRecontacts(null, null, google);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    // set customer to become detractor
    await app.models.Data.getMongoConnector().updateOne(
      { 'customer.contact.email.value': person.email },
      { $set: { 'review.rating.value': 1 } }
    );

    await campaign.sendReContacts();
    const contact = await app.models.Contact.getMongoConnector().findOne({
      type: ContactTypes.CAMPAIGN_EMAIL,
      'payload.key': contactsConfig.recontact_email_google_write_review.key,
    });
    // should not create contact document
    expect(contact).equal(null);
  });
});
