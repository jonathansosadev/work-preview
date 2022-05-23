/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataTypes = require('../../../../common/models/data-file.data-type');
const contactsConfigs = require('../../../../common/lib/garagescore/data-campaign/contacts-config');
const dataManager = require('../../../../server/routes/backoffice/data-manager.js');

const app = new TestApp();

const contactsTools = require('./_contacts-tools')(app);

/**
 Do we cancel followups when needed?
 */
describe('Test FollowupUnsatisfied Cancellation:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Cancel followupUnsatisfied Email if a negative Maintenance review becomes positive', async function () {
    const person = testTools.random.person();
    person.email = 'toto@gmail.com';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    const campaign = await garage.runNewCampaign(dataTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    await survey.rate(9).submit();
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.maintenance_email_1_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.maintenance_email_thanks_2.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfigs.maintenance_email_thanks_2.key,
        nextCampaignContact: null,
      },
    ];
    await contactsTools.checks(expected, true);
  });

  it('Cancel followupUnsatisfied Email if a negative Sale review becomes positive', async function () {
    const person = testTools.random.person();
    person.email = 'toto@gmail.com';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    const campaign = await garage.runNewCampaign(dataTypes.NEW_VEHICLE_SALES, person);
    const survey = await campaign.getSurvey();
    await survey.dataType(dataTypes.NEW_VEHICLE_SALE).rate(0).submit();
    await survey.dataType(dataTypes.NEW_VEHICLE_SALE).rate(9).submit();
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.sale_email_1.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.sale_email_thanks_2.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfigs.sale_email_thanks_2.key,
        nextCampaignContact: null,
      },
    ];
    await contactsTools.checks(expected, true);
  });

  it('Cancel followupUnsatisfied SMS if a negative Maintenance review becomes positive', async function () {
    const person = testTools.random.person();
    person.email = 'jarbaje';
    person.mobilePhone = '+33 6 09 92 12 12';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    const campaign = await garage.runNewCampaign(dataTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    await survey.rate(9).submit();
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.maintenance_sms_1.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfigs.maintenance_sms_1.key,
        nextCampaignContact: null,
      },
    ];
    await contactsTools.checks(expected, true);
  });

  it('Cancel followupUnsatisfied SMS if a negative Sale review becomes positive', async function () {
    const person = testTools.random.person();
    person.email = 'jarbaje';
    person.mobilePhone = '+33 6 09 92 12 12';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    const campaign = await garage.runNewCampaign(dataTypes.NEW_VEHICLE_SALES, person);
    const survey = await campaign.getSurvey();
    await survey.dataType(dataTypes.NEW_VEHICLE_SALE).rate(0).submit();
    await survey.rate(9).submit();
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.sale_sms_1.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfigs.sale_sms_1.key,
        nextCampaignContact: null,
      },
    ];
    await contactsTools.checks(expected, true);
  });

  it('Cancel followupUnsatisfied Email if the review becomes hidden from statistics', async function () {
    const person = testTools.random.person();
    person.email = 'toto@gmail.com';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    const campaign = await garage.runNewCampaign(dataTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    const datas = await app.datas();
    const req = { params: { dataId: datas[0].id }, query: { switchTo: false } };
    await dataManager.switchShouldSurfaceInStatistics(app, req, { json: console.log });
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.maintenance_email_1_make.key },
      }, // eslint-disable-line max-len
      {
        type: 'CAMPAIGN_EMAIL',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.maintenance_email_thanks_2.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfigs.maintenance_email_thanks_2.key,
        nextCampaignContact: null,
      },
    ];
    await contactsTools.checks(expected, true);
  });

  it('Cancel followupUnsatisfied SMS if the review becomes hidden from statistics', async function () {
    const person = testTools.random.person();
    person.email = 'jarbaje';
    person.mobilePhone = '+33 6 09 92 12 12';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: false });
    const campaign = await garage.runNewCampaign(dataTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    const datas = await app.datas();
    const req = { params: { dataId: datas[0].id }, query: { switchTo: false } };
    await dataManager.switchShouldSurfaceInStatistics(app, req, { json: console.log });
    const expected = {};
    expected.contacts = [
      {
        type: 'CAMPAIGN_SMS',
        recipient: person.fullName,
        status: 'Waiting',
        payload: { key: contactsConfigs.maintenance_sms_1.key },
      }, // eslint-disable-line max-len
    ];
    expected.datas = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfigs.maintenance_sms_1.key,
        nextCampaignContact: null,
      },
    ];
    await contactsTools.checks(expected, true);
  });
});
