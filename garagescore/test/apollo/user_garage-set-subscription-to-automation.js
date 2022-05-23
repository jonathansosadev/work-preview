const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('apollo::SubscribeToAutomation (user_garage-set-subscription-to-automation)', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Sets the subscription to automation for all garages', async () => {
    const user = await testApp.addUser();
    const garageYes1 = await testApp.addGarage({ subscriptions: { Automation: { enabled: false } } });
    const garageYes2 = await testApp.addGarage({ subscriptions: { Automation: {} } });
    const garageYes3 = await testApp.addGarage({ subscriptions: {} });
    const garageYes4 = await testApp.addGarage({ subscriptions: { Automation: { enabled: false } }, locale: 'es_ES' });
    const garageYes5 = await testApp.addGarage({ subscriptions: { Automation: { enabled: false } }, locale: 'ca_ES' });
    const garageNo1 = await testApp.addGarage({ subscriptions: { Automation: { enabled: false } }, locale: 'nl_NL' });
    const garageNo2 = await testApp.addGarage({
      subscriptions: { Automation: { enabled: false } },
      type: 'VehicleInspection',
    });

    await user.addGarage(garageYes1);
    await user.addGarage(garageYes2);
    await user.addGarage(garageYes3);
    await user.addGarage(garageYes4);
    await user.addGarage(garageYes5);
    await user.addGarage(garageNo1);
    await user.addGarage(garageNo2);

    const request = `mutation SubscribeToAutomation {
      SubscribeToAutomation {
        message
        status
      }
    }`;

    const res = await _sendQueryAs(testApp, request, {}, user.userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.SubscribeToAutomation).to.not.be.undefined;
    expect(res.data.SubscribeToAutomation.status).equal('OK');

    const garageInstanceYes1 = await garageYes1.getInstance();
    const garageInstanceYes2 = await garageYes2.getInstance();
    const garageInstanceYes3 = await garageYes3.getInstance();
    const garageInstanceYes4 = await garageYes4.getInstance();
    const garageInstanceYes5 = await garageYes5.getInstance();
    const garageInstanceNo1 = await garageNo1.getInstance();
    const garageInstanceNo2 = await garageNo2.getInstance();

    expect(garageInstanceYes1.subscriptions.Automation.enabled).to.be.true;
    expect(garageInstanceYes2.subscriptions.Automation.enabled).to.be.true;
    expect(garageInstanceYes3.subscriptions.Automation.enabled).to.be.true;
    expect(garageInstanceYes4.subscriptions.Automation.enabled).to.be.true;
    expect(garageInstanceYes5.subscriptions.Automation.enabled).to.be.true;
    expect(garageInstanceNo1.subscriptions.Automation.enabled).not.to.be.true;
    expect(garageInstanceNo2.subscriptions.Automation.enabled).not.to.be.true;
  });
});
