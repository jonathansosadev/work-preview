const { expect } = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('../apollo/_send-query-as');
const nuxtRender = require('../../common/lib/garagescore/contact/render');
const { GaragesTest, AutomationCampaignTargets, ContactTypes } = require('../../frontend/utils/enumV2');
const langDetector = require('../../common/lib/garagescore/data-review/lang-detector');
const { createCampaign } = require('./common/_utils');

const app = new TestApp();
// create required document
const initAutomationData = async (dataType, email, garageType, lang, mobilePhone, sendGDPR, target, garageTest) => {
  const user = await app.addUser({ email: 'user@custeed.com' });
  await app.models.CampaignScenario.getMongoConnector().insertOne({
    type: 'Dealership',
    followupAndEscalate: {
      ManualLead: {
        lead: {
          followup: {
            enabled: true,
            delay: 90,
          },
          escalate: {
            enabled: true,
            stage_1: 27,
            stage_2: 36,
          },
        },
      },
      ManualUnsatisfied: {
        unsatisfied: {
          followup: {
            enabled: true,
            delay: 45,
          },
          escalate: {
            enabled: true,
            stage_1: 9,
            stage_2: 27,
          },
        },
      },
      LaCentrale: {
        lead: {
          followup: {
            enabled: true,
            delay: 9,
          },
          escalate: {
            enabled: true,
            stage_1: 3,
            stage_2: 4,
          },
        },
      },
    },
  });
  const campaignScenario = await app.models.CampaignScenario.findOne();
  // create campaign with random garage for test
  const garage = {
    id: GaragesTest[garageTest],
  };
  await createCampaign(app, garage, target);
  await app.models.Garage.getMongoConnector().insertOne({
    _id: ObjectId(GaragesTest[garageTest]),
    type: GaragesTest.getProperty(garageTest, 'type'),
    publicDisplayName: GaragesTest.getProperty(garageTest, 'publicDisplayName'),
    campaignScenarioId: campaignScenario.id,
    locale: GaragesTest.getProperty(garageTest, 'locale'),
    subscriptions: {
      priceValidated: true,
      Maintenance: { enabled: true, price: 0 },
      NewVehicleSale: { enabled: true, price: 0 },
      UsedVehicleSale: { enabled: true, price: 0 },
      Automation: { enabled: true, price: 0 },
      active: true,
      AutomationApv: { enabled: false },
      AutomationVn: { enabled: false },
      AutomationVo: { enabled: false },
    },
  });
  const request = `
  mutation sendTestSurvey_DGCJDadDBFaaCdCIJbdHHHGHEDaIbCeA ($sendTestSurvey0email: String,$sendTestSurvey0mobilePhone: String,$sendTestSurvey0lang: String!,$sendTestSurvey0dataType: String!,$sendTestSurvey0garageType: String!,$sendTestSurvey0target: String,$sendTestSurvey0sendGDPR: Boolean) {
    sendTestSurvey (email: $sendTestSurvey0email,mobilePhone: $sendTestSurvey0mobilePhone,lang: $sendTestSurvey0lang,dataType: $sendTestSurvey0dataType,garageType: $sendTestSurvey0garageType,target: $sendTestSurvey0target,sendGDPR: $sendTestSurvey0sendGDPR) {
      message
      status
    }
   }
  `;
  const variables = {
    sendTestSurvey0dataType: dataType,
    sendTestSurvey0email: email,
    sendTestSurvey0garageType: garageType,
    sendTestSurvey0lang: lang,
    sendTestSurvey0mobilePhone: mobilePhone,
    sendTestSurvey0sendGDPR: sendGDPR,
    sendTestSurvey0target: target,
  };
  await _sendQueryAs(app, request, variables, user.userId);
};

describe('Automation email', async function () {
  const dataType = 'AUTOMATION';
  const email = 'bob@lefou.com';
  const garageType = 'Dealership';
  const mobilePhone = '';
  const sendGDPR = true;
  const target = AutomationCampaignTargets.M_M;
  before(async function () {
    await nuxtRender.setTestMode();
  });
  beforeEach(async function () {
    await app.reset();
  });

  it('Should be French email type AUTOMATION_CAMPAIGN_EMAIL ', async function () {
    const lang = 'fr';
    // send survey email automation
    await initAutomationData(dataType, email, garageType, lang, mobilePhone, sendGDPR, target, 'GARAGE_DUPONT');
    const automationCampaignEmail = await app.models.Contact.findOne({
      where: { type: ContactTypes.AUTOMATION_CAMPAIGN_EMAIL },
    });
    // render email
    const contactRenderedEmail = await automationCampaignEmail.render();
    const detectedLanguage = langDetector(contactRenderedEmail.textBody);
    // expect french language
    expect(detectedLanguage).equal('fr');
  });
  it('Should be French email type AUTOMATION_GDPR_EMAIL ', async function () {
    const lang = 'fr';
    // send survey email automation
    await initAutomationData(dataType, email, garageType, lang, mobilePhone, sendGDPR, target, 'GARAGE_DUPONT');
    const automationCampaignEmail = await app.models.Contact.findOne({
      where: { type: ContactTypes.AUTOMATION_GDPR_EMAIL },
    });
    // render email
    const contactRenderedEmail = await automationCampaignEmail.render();
    const detectedLanguage = langDetector(contactRenderedEmail.textBody);
    // expect french language
    expect(detectedLanguage).equal('fr');
  });
  it('Should be Spanish email type AUTOMATION_CAMPAIGN_EMAIL', async function () {
    const lang = 'es';
    // send survey email automation
    await initAutomationData(dataType, email, garageType, lang, mobilePhone, sendGDPR, target, 'GARAGE_DEL_BOSQUE');
    const automationCampaignEmail = await app.models.Contact.findOne({
      where: { type: ContactTypes.AUTOMATION_CAMPAIGN_EMAIL },
    });
    // render email
    const contactRenderedEmail = await automationCampaignEmail.render();
    const detectedLanguage = langDetector(contactRenderedEmail.textBody);
    // expect spanish language
    expect(detectedLanguage).equal('es');
  });
  it('Should be Spanish email type AUTOMATION_GDPR_EMAIL', async function () {
    const lang = 'es';
    // send survey email automation
    await initAutomationData(dataType, email, garageType, lang, mobilePhone, sendGDPR, target, 'GARAGE_DEL_BOSQUE');
    const automationCampaignEmail = await app.models.Contact.findOne({
      where: { type: ContactTypes.AUTOMATION_GDPR_EMAIL },
    });
    // render email
    const contactRenderedEmail = await automationCampaignEmail.render();
    const detectedLanguage = langDetector(contactRenderedEmail.textBody);
    // expect spanish language
    expect(detectedLanguage).equal('es');
  });
  it('Should be Catalan email type AUTOMATION_CAMPAIGN_EMAIL', async function () {
    const lang = 'ca';
    // send survey email automation
    await initAutomationData(dataType, email, garageType, lang, mobilePhone, sendGDPR, target, 'GARAGE_NORD');
    const automationCampaignEmail = await app.models.Contact.findOne({
      where: { type: ContactTypes.AUTOMATION_CAMPAIGN_EMAIL },
    });
    // render email
    const contactRenderedEmail = await automationCampaignEmail.render();
    const detectedLanguage = langDetector(contactRenderedEmail.textBody);
    // langDetector detect Spanish langage, catalan don't exist node_modules/languagedetect/lib/ISO639.js
    expect(detectedLanguage).equal('es');
  });
  it('Should be Catalan email type AUTOMATION_GDPR_EMAIL', async function () {
    const lang = 'ca';
    // send survey email automation
    await initAutomationData(dataType, email, garageType, lang, mobilePhone, sendGDPR, target, 'GARAGE_NORD');
    const automationCampaignEmail = await app.models.Contact.findOne({
      where: { type: ContactTypes.AUTOMATION_GDPR_EMAIL },
    });
    // render email
    const contactRenderedEmail = await automationCampaignEmail.render();
    const detectedLanguage = langDetector(contactRenderedEmail.textBody);
    // langDetector detect Spanish langage, catalan don't exist node_modules/languagedetect/lib/ISO639.js
    expect(detectedLanguage).equal('es');
  });
});
