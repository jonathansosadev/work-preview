const TestApp = require('../../../../common/lib/test/test-app');
const AutomationCampaignChannelTypes = require('../../../../common/models/automation-campaign-channel.type');

const chai = require('chai');
const expect = chai.expect;

const app = new TestApp();
describe('AutomationCampaign', () => {
  beforeEach(async () => {
    await app.waitAppBoot(); // cannot access the model before boot
  });

  it('getNewCampaignObject i18n', async () => {
    const garageId = 'garageId';
    const target = 'M_M';
    const contactType = AutomationCampaignChannelTypes.EMAIL;
    const locale = 'es-ES';
    const o = app._models().AutomationCampaign.getNewCampaignObject(garageId, target, contactType, locale);
    expect(o.displayName).equals('Recordatorio taller 12 meses, clientes posventa');
  });
});
