const { expect } = require('chai');

const TestApp = require('../../common/lib/test/test-app');
const {
  resolvers: {
    Query: { ErepReviews },
  },
} = require('../../server/webservers-standalones/api/schema/data-get-erep-reviews');
const DataTypes = require('../../common/models/data/type/data-types');
const GarageTypes = require('../../common/models/garage.type');
const GarageHistoryPeriods = require('../../common/models/garage-history.period');
const _sendQuery = require('./_send-query');

const testApp = new TestApp();

describe('Apollo - Data Get Home B2C', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should returns something...', async function () {
    const res = await _sendQuery(
      testApp,
      `
      query dataGetHomeB2C_toto {
        dataGetHomeB2C {
          reviewsCount
          captchaSiteKey
          reviews {
            customerName
            customerCity
            transaction
            model
            rating
            garage
            comment
            date
          }
       }
      }
      `,
      {}
    );
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.dataGetHomeB2C).to.not.be.undefined;
    expect(res.data.dataGetHomeB2C.reviewsCount).to.not.be.undefined;
    expect(res.data.dataGetHomeB2C.reviews).to.not.be.undefined;
    expect(res.data.dataGetHomeB2C.reviews[0].comment).to.not.be.undefined;
  });
});
