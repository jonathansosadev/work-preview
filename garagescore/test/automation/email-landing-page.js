const TestApp = require('../../common/lib/test/test-app');
const chai = require('chai');
const i18nRequire = require('../../common/lib/garagescore/i18n/i18n');

const expect = chai.expect;
const app = new TestApp();

describe('Automation landing page', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Should have the same content email', function test() {
    const langages = ['fr', 'es', 'ca'];
    for (const lang of langages) {
      let landingPage = new i18nRequire('pages/public/automation-campaign/index', { locale: lang, from: 'frontend' });
      let AutomationCampaignEmail = new i18nRequire('components/emails/pages/automation/AutomationCampaignEmail', { locale: lang, from: 'frontend' });
      
      AutomationCampaignEmail = AutomationCampaignEmail.jsonContent[AutomationCampaignEmail.jsonPathTranslation];
      landingPage = landingPage.jsonContent[landingPage.jsonPathTranslation];
      for (const key of Object.keys(AutomationCampaignEmail)) {
        const isEqual = AutomationCampaignEmail[key] === landingPage[key];
        if (!isEqual) {
          throw new Error(`content language ${lang.toUpperCase()} with key ${key} is not equal with index.json`);
        }
        expect(isEqual).equal(true);
      }
    }
  });
});
