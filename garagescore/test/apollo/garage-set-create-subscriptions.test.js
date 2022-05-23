const momentTz = require('moment-timezone');
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
    // add garage with empty subscriptions
    await app.addGarage({ subscriptions: {} });
    user = await app.models.User.findOne();
    garage = await app.models.Garage.findOne();
    billingAccount = await app.models.BillingAccount.findOne();
    garageId = garage.id.toString();
    billingAccountId = billingAccount.id.toString();
  });

  it('Should create subscriptions', async () => {
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
    const dateStart = momentTz().tz('UTC').date(billingAccount.billingDate);

    const mutation = gql`
      mutation garageSetCreateSubscriptions(
        $garageId: ID!
        $billingAccountId: ID!
        $subscriptions: garageSetCreateSubscriptionsInput!
      ) {
        garageSetCreateSubscriptions(
          garageId: $garageId
          billingAccountId: $billingAccountId
          subscriptions: $subscriptions
        ) {
          priceValidated
          Maintenance {
            enabled
            price
          }
          NewVehicleSale {
            enabled
            price
          }
          UsedVehicleSale {
            enabled
            price
          }
          Lead {
            enabled
            price
          }
          EReputation {
            enabled
            price
          }
          VehicleInspection {
            enabled
            price
          }
          Analytics {
            enabled
            price
          }
          CrossLeads {
            enabled
            price
            included
            unitPrice
            restrictMobile
            minutePrice
          }
          Automation {
            enabled
            price
            included
            every
          }
          active
          dateEnd
          dateStart
          setup {
            enabled
            price
            monthOffset
            billDate
            alreadyBilled
          }
          users {
            included
            maximumTotalPriceForUsers
            price
          }
          contacts {
            bundle
            included
            every
            price
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
        subscriptions: {
          ...subscriptions,
          dateStart,
        },
      },
      user.id
    );

    const subscriptionsObject = data.garageSetCreateSubscriptions;
    expect(subscriptionsObject.active).to.be.true;
    expect(subscriptionsObject.dateStart.toString()).to.equal(new Date(dateStart).toString());
    expect(subscriptionsObject.setup).to.deep.equal(subscriptions.setup);
    expect(subscriptionsObject.users).to.deep.equal(subscriptions.users);
    expect(subscriptionsObject.contacts).to.deep.equal(subscriptions.contacts);
    expect(subscriptionsObject.Maintenance).to.deep.equal(subscriptions.Maintenance);
    expect(subscriptionsObject.NewVehicleSale).to.deep.equal(subscriptions.NewVehicleSale);
    expect(subscriptionsObject.UsedVehicleSale).to.deep.equal(subscriptions.UsedVehicleSale);
    expect(subscriptionsObject.VehicleInspection).to.deep.equal(subscriptions.VehicleInspection);
    expect(subscriptionsObject.Lead).to.deep.equal(subscriptions.Lead);
    expect(subscriptionsObject.EReputation).to.deep.equal(subscriptions.EReputation);
    expect(subscriptionsObject.Analytics).to.deep.equal(subscriptions.Analytics);
    expect(subscriptionsObject.CrossLeads).to.deep.equal(subscriptions.CrossLeads);
    expect(subscriptionsObject.Automation).to.deep.equal(subscriptions.Automation);
    expect(subscriptionsObject.AutomationApv).to.deep.equal(subscriptions.AutomationApv);
    expect(subscriptionsObject.AutomationVn).to.deep.equal(subscriptions.AutomationVn);
    expect(subscriptionsObject.AutomationVo).to.deep.equal(subscriptions.AutomationVo);
    subscriptions = subscriptionsObject;
  });
});
