const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const app = new TestApp();
const { gql } = require('apollo-server-express');

describe('Garage set subscriptions', () => {
  let user;
  let garage;
  let billingAccount;
  let garageId;
  let billingAccountId;
  let subscriptions;

  before(async () => {
    await app.reset();
    await app.addUser({
      authorization: {
        ACCESS_TO_GREYBO: true,
      },
    });
    subscriptions = {
      setup: {
        enabled: true,
        price: 200,
        monthOffset: 1,
        billDate: new Date(1639339200000),
        alreadyBilled: false,
      },
      users: { included: 3, price: 3, maximumTotalPriceForUsers: 100 },
      contacts: { bundle: false, included: 0, every: 0, price: 0.2 },
      Maintenance: { enabled: false, price: 78 },
      NewVehicleSale: { enabled: false, price: 0 },
      UsedVehicleSale: { enabled: false, price: 0 },
      VehicleInspection: { enabled: false, price: 0 },
      Lead: { enabled: false, price: 39 },
      EReputation: { enabled: false, price: 20 },
      Analytics: { enabled: false, price: 0 },
      CrossLeads: {
        enabled: false,
        price: 42,
        unitPrice: 19,
        included: 2,
        restrictMobile: false,
        minutePrice: 0.15,
      },
      Automation: {
        enabled: false,
        price: 69,
        every: 0.2,
        included: 0,
      },
    };
    await app.addGarage({ subscriptions });
    user = await app.models.User.findOne();
    garage = await app.models.Garage.findOne();
    billingAccount = await app.models.BillingAccount.findOne();
    garageId = garage.id.toString();
    billingAccountId = billingAccount.id.toString();
  });

  it('Should update subscriptions', async () => {
    subscriptions.Automation.enabled = true;
    const mutation = gql`
      mutation garageSetUpdateSubscriptions(
        $garageId: ID!
        $billingAccountId: ID!
        $subscriptions: garageSetUpdateSubscriptionsInput!
      ) {
        garageSetUpdateSubscriptions(
          garageId: $garageId
          billingAccountId: $billingAccountId
          subscriptions: $subscriptions
        ) {
          Automation {
            enabled
          }
        }
      }
    `;

    const { data } = await sendQuery(
      app,
      mutation,
      {
        garageId,
        billingAccountId,
        subscriptions,
      },
      user.id
    );

    const subscriptionsObject = data.garageSetUpdateSubscriptions;
    expect(subscriptionsObject.Automation.enabled).to.be.true;
    subscriptions = subscriptionsObject;
  });
});
