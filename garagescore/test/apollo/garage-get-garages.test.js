const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const app = new TestApp();
const { gql } = require('apollo-server-express');

describe('Garage get garages', () => {
  let userId;
  let billingAccountId;

  before(async () => {
    await app.reset();
    const u = await app.addUser({
      authorization: {
        ACCESS_TO_GREYBO: true,
      },
    });
    userId = u.id.toString();
    await app.addGarage({});
    const billingAccount = await app.models.BillingAccount.findOne();
    billingAccountId = billingAccount.id.toString();
  });

  it(`Should return an array of garages`, async () => {
    const query = gql`
      query garageGetGarages {
        garageGetGarages {
          id
          billingAccount {
            id
          }
        }
      }
    `;

    const { data } = await sendQuery(app, query, {}, userId);

    expect(data.garageGetGarages).to.exist;
    expect(data.garageGetGarages).to.be.an('array');
    expect(data.garageGetGarages[0].billingAccount).to.exist;
    expect(data.garageGetGarages[0].billingAccount.id).to.equal(billingAccountId);
  });
});
