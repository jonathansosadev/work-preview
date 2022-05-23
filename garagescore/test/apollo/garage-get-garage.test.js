const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const app = new TestApp();
const { gql } = require('apollo-server-express');

describe('Garage get garage', () => {
  let user;
  let garageId;
  let billingAccountId;

  before(async () => {
    await app.reset();
    await app.addUser({
      authorization: {
        ACCESS_TO_GREYBO: true,
      },
    });
    const g = await app.addGarage({});
    garageId = g.id.toString();
    const billingAccount = await app.models.BillingAccount.findOne();
    billingAccountId = billingAccount.id.toString();
    user = await app.models.User.findOne();
  });

  it('Should return the right garage', async () => {
    const query = gql`
      query garageGetGarage($garageId: ID!) {
        garageGetGarage(garageId: $garageId) {
          id
        }
      }
    `;

    const bas = await app.models.BillingAccount.find();
    console.log(bas)

    const { data } = await sendQuery(
      app,
      query,
      {
        garageId,
      },
      user.id
    );

    expect(data.garageGetGarage).to.exist;
    expect(data.garageGetGarage.id.toString()).to.eql(garageId);
  });

  it('Should return the garage billing account', async () => {
    const query = gql`
      query garageGetGarage($garageId: ID!) {
        garageGetGarage(garageId: $garageId) {
          billingAccount {
            id
          }
        }
      }
    `;

    const { data } = await sendQuery(
      app,
      query,
      {
        garageId,
      },
      user.id
    );

    expect(data.garageGetGarage.billingAccount).to.exist;
    expect(data.garageGetGarage.billingAccount.id).to.eql(billingAccountId);

  });
});
