/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const contactsConfig = require('../../../../common/lib/garagescore/data-campaign/contacts-config.js');

const app = new TestApp();

const contactsTools = require('./_contacts-tools')(app);
/**
Do we send thank you emails
*/
describe('Test thank you:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Send thank you email after a positive review', async function test() {
    const person = testTools.random.person();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const survey = await campaign.getSurvey();
    await survey.rate(10).submit();
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
    ];
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_thanks_1_make.key,
        nextCampaignContact: null,
        nextCampaignContactDay: null,
      },
    ];
    await contactsTools.checks(expected);
  });
});
