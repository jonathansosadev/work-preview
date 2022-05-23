const TestApp = require('../../../common/lib/test/test-app');
const testTools = require('../../../common/lib/test/testtools');
const ContactTypes = require('../../../common/models/contact.type');
const AlertTypes = require('../../../common/models/alert.types');
const gsAPI = require('../../../common/lib/garagescore/api/public-api');

const chai = require('chai');
const expect = chai.expect;
const app = new TestApp();

/**
 * Send alert after exogenous reviews have been added
 */
describe('Send alerts on new exogenous review:', () => {
  let garage = null;
  const googleExternalId = 'accounts/111518281035316778357/locations/4265459932460275560';
  beforeEach(async function beforeEach() {
    await app.reset();
    const user = await app.addUser({ email: testTools.random.email() });
    garage = await app.addGarage({
      type: 'Dealership',
      exogenousReviewsConfigurations: {
        Google: {
          connectedBy: 'marketing@oxylio.com',
          error: '',
          token: '1/P03Pp5veOzGyb1nn5cAocuiRuysY6TmtmlPWH9wvgmwBBycvLszBAeg26gKUW9uo',
          externalId: googleExternalId,
          lastError: '2020-07-04T10:03:31.347Z',
          lastRefresh: '2019-08-12T07:31:13.998Z',
          lastFetch: '2020-07-15T02:53:24.736Z',
        },
      },
      disableAutoAllowCrawlers: false,
      status: 'RunningAuto',
      locale: 'fr_FR',
    });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ ExogenousNewReview: true });
  });
  it('Do not send alert the first ever time exogenous reviews are created on the garage', async () => {
    // create reviews for test
    const reviewsToAdd = {
      sourceType: 'Google',
      method: 'FULL',
      reviews: [
        {
          id: `${googleExternalId}/reviews/1`,
          text: 'service is ok',
        },
        {
          id: `${googleExternalId}/reviews/2`,
          text: 'price is expensive',
        },
        {
          id: `${googleExternalId}/reviews/3`,
          text: 'Am I happy ? Dunno...',
        },
      ],
    };
    // add reviews
    await gsAPI.addReviews(garage.id, reviewsToAdd);
    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(0);
  });
  it('Send alert on new exogenous reviews', async () => {
    // First batch, shouldn't fire alerts
    const firstReviews = {
      sourceType: 'Google',
      method: 'FULL',
      reviews: [
        {
          id: `${googleExternalId}/reviews/1`,
          text: 'service is ok',
        },
        {
          id: `${googleExternalId}/reviews/2`,
          text: 'price is expensive',
        },
        {
          id: `${googleExternalId}/reviews/3`,
          text: 'Am I happy ? Dunno...',
        },
      ],
    };
    // add reviews batch 1
    await gsAPI.addReviews(garage.id, firstReviews);
    await app.sendAlerts();
    const contacts1 = await app.contacts();
    expect(contacts1.length).equal(0);

    // Second batch, should send the alerts
    const nextReviews = {
      sourceType: 'Google',
      method: 'FULL',
      reviews: [
        {
          id: `${googleExternalId}/reviews/4`,
          text: 'Nice service',
        },
        {
          id: `${googleExternalId}/reviews/5`,
          text: 'Hefty price !',
        },
      ],
    };
    // add reviews batch 2
    await gsAPI.addReviews(garage.id, nextReviews);
    await app.sendAlerts();
    const contacts2 = await app.contacts();
    expect(contacts2.length).equal(2);
    expect(contacts2[0].type).equal(ContactTypes.ALERT_EMAIL);
    expect(contacts2[0].payload.alertType).equal(AlertTypes.EXOGENOUS_NEW_REVIEW);
    expect(contacts2[1].type).equal(ContactTypes.ALERT_EMAIL);
    expect(contacts2[1].payload.alertType).equal(AlertTypes.EXOGENOUS_NEW_REVIEW);
  });
  it('Does not send alert on duplicate exogenous reviews', async () => {
    // First batch, shouldn't fire alerts
    const firstReviews = {
      sourceType: 'Google',
      method: 'FULL',
      reviews: [
        {
          id: `${googleExternalId}/reviews/1`,
          text: 'service is ok',
        },
        {
          id: `${googleExternalId}/reviews/2`,
          text: 'price is expensive',
        },
        {
          id: `${googleExternalId}/reviews/3`,
          text: 'Am I happy ? Dunno...',
        },
      ],
    };
    // add reviews batch 1
    await gsAPI.addReviews(garage.id, firstReviews);
    await app.sendAlerts();
    const contacts1 = await app.contacts();
    expect(contacts1.length).equal(0);

    // Second batch, shouldn't send alerts because those are duplicates
    const nextReviews = {
      sourceType: 'Google',
      method: 'FULL',
      reviews: [
        {
          id: `${googleExternalId}/reviews/1`,
          text: 'service is ok',
        },
        {
          id: `${googleExternalId}/reviews/2`,
          text: 'price is expensive',
        },
        {
          id: `${googleExternalId}/reviews/3`,
          text: 'Am I happy ? Dunno...',
        },
      ],
    };
    // add reviews batch 2
    await gsAPI.addReviews(garage.id, nextReviews);
    await app.sendAlerts();
    const contacts2 = await app.contacts();
    expect(contacts2.length).equal(0);
  });
});
