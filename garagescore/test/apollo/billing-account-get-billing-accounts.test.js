const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const app = new TestApp();
const { gql } = require('apollo-server-express');

describe('BillingAccount get billingAccounts', () => {
  let userId;

  before(async () => {
    await app.reset();
    const u = await app.addUser({
      authorization: {
        ACCESS_TO_GREYBO: true,
      },
    });
    userId = u.id.toString();
    // the following helper also create a default billingAccount
    await app.addGarage({});
  });

  it(`Should return all billingAccounts`, async () => {
    const query = gql`
      query billingAccountGetBillingAccounts {
        billingAccountGetBillingAccounts {
          id
        }
      }
    `;

    const { data } = await sendQuery(app, query, {}, userId);

    expect(data.billingAccountGetBillingAccounts).to.exist;
    expect(data.billingAccountGetBillingAccounts.length).to.eql(1);
    data.billingAccountGetBillingAccounts.forEach((billingAccount) => {
      expect(billingAccount.id).to.exist;
    });
  });
});
