const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const app = new TestApp();
const { gql } = require('apollo-server-express');

describe('BillingAccount get billingAccount', () => {
  let user;
  let billingAccountId;
  let garageId;

  before(async () => {
    await app.reset();
    await app.addUser({
      authorization: {
        ACCESS_TO_GREYBO: true,
      },
    });
    // addGarage also add a billing account
    const g = await app.addGarage({});
    garageId = g.id.toString();
    user = await app.models.User.findOne();
    const billingAccount = await app.models.BillingAccount.findOne();
    billingAccountId = billingAccount.id.toString();
  });

  it('Should return the right billingAccount', async () => {
    const query = gql`
      query billingAccountGetBillingAccount($billingAccountId: ID!) {
        billingAccountGetBillingAccount(billingAccountId: $billingAccountId) {
          id
        }
      }
    `;

    const { data } = await sendQuery(
      app,
      query,
      {
        billingAccountId,
      },
      user.id
    );

    expect(data.billingAccountGetBillingAccount).to.exist;
    expect(data.billingAccountGetBillingAccount.id.toString()).to.eql(billingAccountId);
  });

  it('Should return the billingAccount garages', async () => {
    const query = gql`
      query billingAccountGetBillingAccount($billingAccountId: ID!) {
        billingAccountGetBillingAccount(billingAccountId: $billingAccountId) {
          id
          garages {
            id
          }
        }
      }
    `;

    const { data } = await sendQuery(
      app,
      query,
      {
        billingAccountId,
      },
      user.id
    );

    expect(data.billingAccountGetBillingAccount.garages).to.exist;
    expect(data.billingAccountGetBillingAccount.garages).to.deep.include({ id: garageId });
  });
});
