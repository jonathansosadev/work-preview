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
const _sendQueryAs = require('./_send-query-as');
const { insertGarage, insertUser, testValues, insertGarageWithExogenousErep, insertDataExogenousReview } = require('../../common/lib/test/insert-helper');


const testApp = new TestApp();

describe('Apollo - Data Get Erep Reviews', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Test Apollo/GraphQL Route Itself', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage = await testApp.addGarage({ subscriptions: { EReputation: { enabled: true } } });

    await Promise.all(
      Array(3)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await user.addGarage(garage);

    const res = await _sendQueryAs(
      testApp,
      `
      query ErepReviews_CeDFfFIeBeJeHaFIcBHCccEbFIfCHAeD ($ErepReviews0limit: Int,$ErepReviews0skip: Int,$ErepReviews0period: String!,$ErepReviews0search: String,$ErepReviews0cockpitType: String) {
        ErepReviews (limit: $ErepReviews0limit,skip: $ErepReviews0skip,period: $ErepReviews0period,search: $ErepReviews0search,cockpitType: $ErepReviews0cockpitType) {
              Reviews {
                id,
                garageId,
                garagePublicDisplayName,
                source,
                surveyComment,
                surveyRespondedAt,
                surveyScore,
                recommend,
                surveyOriginalScore,
                surveyOriginalScale,
                customerFullName,
                publicReviewComment,
                publicReviewCommentStatus,
                publicReviewCommentRejectionReason,
                publicReviewCommentApprovedAt,
                thread {
                  text,
                  status,
                  approvedAt,
                  rejectedReason,
                  author,
                  id,
                  authorId,
                  attachment,
                  isFromOwner,
                  replies {
                    text,
                    status,
                    approvedAt,
                    rejectedReason,
                    author,
                    id,
                    authorId,
                    attachment,
                    isFromOwner,
                  }
                }
              },
              HasMore,
              Error
             }
       }
      `,
      {
        ErepReviews0period: GarageHistoryPeriods.LAST_QUARTER,
        ErepReviews0cockpitType: GarageTypes.DEALERSHIP,
        ErepReviews0limit: 10,
        ErepReviews0skip: 0,
      },
      user.getId()
    );
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.ErepReviews).to.not.be.undefined;
    expect(res.data.ErepReviews.Reviews).to.not.be.undefined;
    expect(res.data.ErepReviews.HasMore).to.not.be.undefined;
    expect(res.data.ErepReviews.Error).to.not.be.undefined;
  });

  it('Should Return Empty Array If There Is No Data To Return', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage = await testApp.addGarage({ subscriptions: { EReputation: { enabled: true } } });
    const args = {};
    const context = {};
    let result = null;

    // Adding the created garage to the user
    await user.addGarage(garage);

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.skip = 0;
    context.app = testApp;
    context.scope = { user: await user.getInstance(), godMode: false, garageIds: [garage.id], logged: true };

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(0);
    expect(result.HasMore).to.equals(false);
  });

  it('Should Return Data If At Least 1 Of My Garage Has E-Reputation Subscription And There At Least 1 Data', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const exogenousReviewsConfigurations = { Google: { token: 'TOKEN', externalId: 'ID' } };
    const garage = await testApp.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const args = {};
    const context = {};
    let result = null;

    // Saving the datas in the database
    await Promise.all(
      Array(3)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await user.addGarage(garage);

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.skip = 0;
    context.app = testApp;
    context.scope = { user: await user.getInstance(), godMode: false, garageIds: [garage.id], logged: true };

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(3);
    expect(result.HasMore).to.equals(false);
  });

  it('Should Return HasMore If At Least 1 Of My Garage Has E-Reputation Subscription And There At Least 11 Data', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const exogenousReviewsConfigurations = { Google: { token: 'TOKEN', externalId: 'ID' } };
    const garage = await testApp.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const args = {};
    const context = {};
    let result = null;

    // Saving the datas in the database
    await Promise.all(
      Array(11)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await user.addGarage(garage);

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.skip = 0;
    context.app = testApp;
    context.scope = { user: await user.getInstance(), godMode: false, garageIds: [garage.id], logged: true };

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(10);
    expect(result.HasMore).to.equals(true);
  });

  it('Should Return Requested Datas With Different Arguments', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const exogenousReviewsConfigurations = {
      Google: { token: 'TOKEN', externalId: 'ID' },
      Facebook: { token: 'TOKEN', externalId: 'ID' },
      PagesJaunes: { token: 'TOKEN', externalId: 'ID' },
    };
    const garage1 = await testApp.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const garage2 = await testApp.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const garage3 = await testApp.addGarage({
      type: GarageTypes.MOTORBIKE_DEALERSHIP,
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const args = {};
    const context = {};
    let result = null;

    // Saving the datas in the database
    await Promise.all(
      Array(6)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage1.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(5)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage2.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'PagesJaunes',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(7)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage3.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Facebook',
            garageType: GarageTypes.MOTORBIKE_DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await Promise.all(
      [garage1, garage2, garage3].map(async (garage) => {
        await user.addGarage(garage);
      })
    );

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 20;
    args.skip = 0;
    context.app = testApp;
    context.scope = {
      user: await user.getInstance(),
      godMode: false,
      garageIds: [garage1, garage2, garage3].map((garage) => garage.id),
      logged: true,
    };

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(11);
    expect(result.HasMore).to.equals(false);
    await Promise.all(
      result.Reviews.map(async (review) => {
        expect([garage1, garage2].map((g) => g.getId()).includes(review.garageId));
      })
    );

    // Testing God Mode
    args.cockpitType = GarageTypes.MOTORBIKE_DEALERSHIP;
    context.scope.godMode = true;

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(7);
    expect(result.HasMore).to.equals(false);
    await Promise.all(
      result.Reviews.map(async (review) => {
        expect([garage3].map((g) => g.getId()).includes(review.garageId));
      })
    );
  });

  it('Should Return Data Of The Time And Type Requested', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const exogenousReviewsConfigurations = {
      Google: { token: 'TOKEN', externalId: 'ID' },
      Facebook: { token: 'TOKEN', externalId: 'ID' },
      PagesJaunes: { token: 'TOKEN', externalId: 'ID' },
    };
    const garage1 = await testApp.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const garage2 = await testApp.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    const args = {};
    const context = {};
    let result = null;

    // Saving the datas in the database
    await Promise.all(
      Array(2)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage1.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date('2016-01-01'));
          await testApp.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(1)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage1.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Facebook',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(4)
        .fill(null)
        .map(async () => {
          const data = await testApp.models.Data.init(garage2.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await testApp.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await Promise.all(
      [garage1, garage2].map(async (garage) => {
        await user.addGarage(garage);
      })
    );

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.skip = 0;
    context.app = testApp;
    context.scope = {
      user: await user.getInstance(),
      godMode: false,
      garageIds: [garage1, garage2].map((garage) => garage.id),
      logged: true,
    };

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(5);
    expect(result.HasMore).to.equals(false);

    // Changing period to test
    args.period = GarageHistoryPeriods.ALL_HISTORY;

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(7);
    expect(result.HasMore).to.equals(false);

    // Changing garageId
    args.garageId = [ garage1.getId() ];

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(3);
    expect(result.HasMore).to.equals(false);

    // Changing source
    args.source = 'Google';

    // Simulating a query directly using the resolver function
    result = await ErepReviews({}, args, context);

    // Please be what we expect
    expect(result.Reviews.length).to.equals(2);
    expect(result.HasMore).to.equals(false);
  });
  it('reviews on one garage', async function () {
    const user = await insertUser(testApp);
    let garageArray = [];
    for(let i = 0; i< 10; i++) {
      garageArray.push(await insertGarageWithExogenousErep(testApp, user));
    }
    let garageToWorkOn = garageArray[0];

    const args = {};
    const context = {};
    let result = null;

    // Saving the datas in the database
    for(let i = 0; i < 3; i++) {
      insertDataExogenousReview(testApp, garageToWorkOn.id);
    }

    user.garageIds = garageArray.map((garage) => { return garage.id })
    // Adding the created garage to the user

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.garageId = [garageToWorkOn.id];
    args.skip = 0;
    context.app = testApp;
    context.scope = { user: await user.getInstance(), godMode: false, garageIds: user.garageIds, logged: true };

    // Simulating a query directly using the resolver function

    result = await ErepReviews({}, args, context);
    // Please be what we expect
    expect(result.Reviews.length).to.not.equals(0);
    for(var index in result.Reviews) {
      expect(args.garageId.includes(result.Reviews[index].garageId));
    }
  });

  it('reviews on list of garage', async function () {
    const user = await insertUser(testApp);
    let garageArray = [];
    for(let i = 0; i < 10; i++) {
      garageArray.push(await insertGarageWithExogenousErep(testApp, user));
    }
    let garage1 = garageArray[0];
    let garage2 = garageArray[1];

    const args = {};
    const context = {};
    let result = null;

    // Saving the datas in the database
    for(var i = 0; i < 3; i++) {
      insertDataExogenousReview(testApp, garage1.id);
    }
    for(var i = 0; i < 3; i++) {
      insertDataExogenousReview(testApp, garage2.id);
    }

    user.garageIds = garageArray.map((garage) => { return garage.id })
    // Adding the created garage to the user

    // Simulating args & context
    args.period = GarageHistoryPeriods.LAST_QUARTER;
    args.cockpitType = GarageTypes.DEALERSHIP;
    args.limit = 10;
    args.garageId = [garage1.id, garage2.id];
    args.skip = 0;
    context.app = testApp;
    context.scope = { user: await user.getInstance(), godMode: false, garageIds: user.garageIds, logged: true };

    // Simulating a query directly using the resolver function

    result = await ErepReviews({}, args, context);
    // Please be what we expect
    expect(result.Reviews.length).to.not.equals(0);
    for(let index in result.Reviews) {
      expect(args.garageId.includes(result.Reviews[index].garageId));
    }
  });
});
