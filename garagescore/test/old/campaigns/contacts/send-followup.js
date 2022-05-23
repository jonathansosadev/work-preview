/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const contactsConfigs = require('../../../../common/lib/garagescore/data-campaign/contacts-config.js');
const promises = require('../../../../common/lib/util/promises');
const chai = require('chai');
const renderer = require('../../../../common/lib/garagescore/contact/render-campaign-contact');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const LeadTypes = require('../../../../common/models/data/type/lead-types');
const leadSaleTypes = require('../../../../common/models/data/type/lead-sale-types');
const leadTimings = require('../../../../common/models/data/type/lead-timings');

const expect = chai.expect;
const app = new TestApp();
const contactsTools = require('./_contacts-tools')(app);

const setPerson = (email, mobile) => {
  const person = testTools.random.person();
  person.email = email;
  person.mobilePhone = mobile;
  return person;
};
/**
 Do we send followups?
 */
describe('Test followupUnsatisfied:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Send thank you and followupUnsatisfied emails after a negative Maintenance review', async function test() {
    const person = testTools.random.person();
    person.email = 'toto@gmail.com';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
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
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Send thank you and followupUnsatisfied emails after a negative Sale review', async function test() {
    const person = testTools.random.person();
    person.email = 'toto@gmail.com';
    const garage = await app.addGarage({ googlePlaceId: 'toto', googleCampaignActivated: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
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
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending sms followupUnsatisfied if email invalid', async function test() {
    const person = setPerson('invalid email', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    // await garage.setScenario(testScenario);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
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
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending sms followupUnsatisfied if email invalid sales', async function test() {
    const person = setPerson('invalid email', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
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
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending sms if email invalid and scenario no sms sale', async function test() {
    const person = setPerson('invalid email', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
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
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Sending sms if email invalid and scenario no sms maintenance', async function test() {
    const person = setPerson('invalid email', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
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
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
  it('Check maintenance followupUnsatisfied sms content', async function test() {
    await app.allowContactsRender();
    const person = setPerson('invalid email', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    // await garage.setScenario(testScenario);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    await campaign.sendNextContacts();
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();
    const datas = await app.datas();
    const garages = await app.garages();
    const content = await promises.makeAsync(renderer.renderContactForData)(
      datas[0],
      garages[0],
      'maintenance_sms_followup',
      null
    );
    expect(content.body).is.not.undefined;
    expect(content.body.indexOf(datas[0].surveyFollowupUnsatisfied.urls.baseShort) >= 0).equals(
      true,
      'followupUnsatisfied url not found'
    );
    expect(content.body.indexOf(datas[0].survey.urls.baseShort) < 0).equals(true, 'wrong survey url found');
  });
  it('Check sale followupUnsatisfied sms content', async function test() {
    const person = setPerson('invalid email', '+33 6 50 79 67 13');
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    // await garage.setScenario(testScenario);
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    await campaign.sendNextContacts();
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();
    const datas = await app.datas();
    const garages = await app.garages();
    const content = await promises.makeAsync(renderer.renderContactForData)(
      datas[0],
      garages[0],
      'sale_sms_followup',
      null
    );
    expect(content.body).is.not.null;
    expect(content.body).is.not.undefined;
    expect(content.body.indexOf(datas[0].surveyFollowupUnsatisfied.urls.baseShort) >= 0).equals(
      true,
      'followupUnsatisfied url not found'
    );
    expect(content.body.indexOf(datas[0].survey.urls.baseShort) < 0).equals(true, 'wrong survey url found');
  });
  it('Send lead and unsatisfied at the same time', async function test() {
    // TODORealMEP : ask Simon bout that (doesn't pass when removing await in jobs[0].run)

    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).setLead(LeadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.NEW_VEHICLE_SALE).submit();
    await campaign.sendNextContacts();
    const jobs = await app.jobs({
      where: { $or: [{ type: JobTypes.SEND_LEAD_FOLLOWUP }, { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP }] },
    });
    await jobs[0].run();
    await jobs[1].run();
    // await new Promise(resolve => setTimeout(resolve, 200)); // wait because we didnt use await before
    const datas = await app.datas();
    expect(datas[0].surveyFollowupLead.sendAt).to.not.be.null;
    expect(datas[0].surveyFollowupUnsatisfied.sendAt).to.not.be.null;
    expect(datas[0].surveyFollowupLead.urls.baseShort).to.be.string;
    expect(datas[0].surveyFollowupUnsatisfied.urls.baseShort).to.be.string;
  });
});
