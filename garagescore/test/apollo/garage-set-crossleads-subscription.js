const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const { expect } = chai;
const app = new TestApp();

/* test apollo request garageSetCrossLeadsSubscription*/
describe('Garage crossLeads subscriptions', () => {
  beforeEach(async function () {
    await app.reset();
  });

  it('should send error with email @garagescore', async () => {
    const user = await app.addUser({
      email: 'bob@garagescore.com',
    });
    await app.addGarage();

    const request = `
    mutation garageSetCrossLeadsSubscription {
      garageSetCrossLeadsSubscription {
        message
        status
      }
    }
    `;

    const res = await _sendQueryAs(app, request, {}, user.userId);
    // check if apollo request is nok
    expect(res.data.garageSetCrossLeadsSubscription.message).equal('GarageScore users should not click on this button');
    expect(res.data.garageSetCrossLeadsSubscription.status).equal('KO');
  });

  it('should request successfull garageSetCrossLeadsSubscription', async () => {
    await app.addUser({});
    await app.addGarage();
    const user = await app.models.User.findOne();
    const garage = await app.models.Garage.findOne();
    await app.models.User.getMongoConnector().updateOne({ _id: user.id }, { $set: { garageIds: [garage.id] } });

    const request = `
    mutation garageSetCrossLeadsSubscription {
      garageSetCrossLeadsSubscription {
        message
        status
      }
    }
    `;

    const res = await _sendQueryAs(app, request, {}, user.userId);
    const garageRes = await app.models.Garage.findOne();
    // check if apollo request is ok
    expect(res.data.garageSetCrossLeadsSubscription.status).equal('OK');
    expect(garageRes.crossLeadsConfig.enabled).equal(true);
    garageRes.crossLeadsConfig.sources.forEach((source) => {
      expect(source.enabled).to.equals(true);
    });
  });

  it('Sets the subscription to cross leads for all garages', async () => {
    const user = await app.addUser();
    const garageYes1 = await app.addGarage({ subscriptions: { CrossLeads: { enabled: false } } });
    const garageYes2 = await app.addGarage({ subscriptions: { CrossLeads: {} } });
    const garageYes3 = await app.addGarage({ subscriptions: {} });
    const garageNo1 = await app.addGarage({ subscriptions: { CrossLeads: { enabled: false } }, locale: 'es_ES' });
    const garageNo2 = await app.addGarage({
      subscriptions: { CrossLeads: { enabled: false } },
      type: 'VehicleInspection',
    });

    await user.addGarage(garageYes1);
    await user.addGarage(garageYes2);
    await user.addGarage(garageYes3);
    await user.addGarage(garageNo1);
    await user.addGarage(garageNo2);

    const request = `mutation garageSetCrossLeadsSubscription {
      garageSetCrossLeadsSubscription {
        message
        status
      }
    }`;

    const res = await _sendQueryAs(app, request, {}, user.userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetCrossLeadsSubscription).to.not.be.undefined;
    expect(res.data.garageSetCrossLeadsSubscription.status).equal('OK');

    const garageInstanceYes1 = await garageYes1.getInstance();
    const garageInstanceYes2 = await garageYes2.getInstance();
    const garageInstanceYes3 = await garageYes3.getInstance();
    const garageInstanceNo1 = await garageNo1.getInstance();
    const garageInstanceNo2 = await garageNo2.getInstance();

    expect(garageInstanceYes1.subscriptions.CrossLeads.enabled).to.be.true;
    expect(garageInstanceYes2.subscriptions.CrossLeads.enabled).to.be.true;
    expect(garageInstanceYes3.subscriptions.CrossLeads.enabled).to.be.true;
    expect(garageInstanceNo1.subscriptions.CrossLeads.enabled).not.to.be.true;
    expect(garageInstanceNo2.subscriptions.CrossLeads.enabled).not.to.be.true;
  });
});
