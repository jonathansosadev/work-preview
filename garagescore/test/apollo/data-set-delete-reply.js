const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const googleStubs = require('../../common/lib/test/test-app/mock-google-deleteReplies');
const facebookStubs = require('../../common/lib/test/test-app/mock-facebook-deleteReply');

let user;
let Data;
let dataGoogle;
let dataFacebook;
let dataWithFakeToken;
let garageWithFakeToken;
let review;
const generateData = async (Data, garageId, sourceType, review = {}) => {
  return await Data.create({
    garageId,
    type: 'Maintenance',
    source: {
      sourceId: '10155005575114364',
      type: sourceType,
    },
    review,
  });
};

const threadId = new ObjectID().toString();
describe('Apollo::dataSetDeleteReply', async function () {
  beforeEach(async function () {
    await app.reset();
    googleStubs.reset();
    facebookStubs.reset();
    Data = app.models.Data;
    googleStubs.on();
    facebookStubs.on();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });

    const garage = await app.addGarage({
      exogenousReviewsConfigurations: {
        Facebook: {
          externalId: 'externalidkjbfsvnsqvl',
          token: 'thisisavalidtokenbelieveme',
        },
        Google: {
          token: 'thisisavalidtokenbelieveme',
        },
      },
    });

    garageWithFakeToken = await app.addGarage({
      exogenousReviewsConfigurations: {
        Google: {
          externalId: '56789',
          token: 'error',
        },
      },
    });

    review = {
      createdAt: new Date(),
      rating: {
        value: 10,
      },
      comment: {
        text: 'Très bonne réactivité et réparation immédiate sans rendez-vous pour filtre à carburant',
      },
      reply: {
        text: 'this a reply',
        thread: [
          { id: threadId, text: 'this a reply in a thread' },
          { id: new ObjectID().toString(), text: 'this is another reply in a thread' },
        ],
      },
    };
    dataGoogle = await generateData(Data, garage.id, 'Google', review);

    dataFacebook = await generateData(Data, garage.id, 'Facebook', review);

    dataWithFakeToken = await generateData(Data, garageWithFakeToken.id, 'Facebook', review);
  });

  afterEach(async function () {
    googleStubs.off();
    facebookStubs.off();
  });

  it('should return a confirmation result for a deleted google reply', async function () {
    const request = `mutation dataSetDeleteReply($reviewId: ID!, $exogenous: Boolean, $commentId: ID) {
      dataSetDeleteReply(reviewId: $reviewId, exogenous: $exogenous, commentId: $commentId) {
        status
        message
      }
    }`;

    const variables = {
      reviewId: dataGoogle.getId().toString(),
      exogenous: true,
    };
    const dataBeforeDeletion = await Data.getMongoConnector().findOne(
      { _id: dataGoogle.getId() },
      { projection: { 'review.reply': true, _id: false } }
    );
    const res = await sendQueryAs(app, request, variables, user.getId());
    const data = await Data.getMongoConnector().findOne(
      { _id: dataGoogle.getId() },
      { projection: { 'review.reply': true, _id: false } }
    );

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetDeleteReply');
    expect(res.data.dataSetDeleteReply).to.be.an('object').which.have.any.keys('status', 'message');
    expect(res.data.dataSetDeleteReply.message).to.be.null;
    expect(res.data.dataSetDeleteReply.status).to.be.equal(true);
    expect(dataBeforeDeletion).to.be.an('object').which.have.keys('review');
    expect(dataBeforeDeletion.review).to.be.an('object').which.have.keys('reply');
    expect(dataBeforeDeletion.review.reply).to.be.an('object').which.have.any.keys('text');
    expect(dataBeforeDeletion.review.reply.text).to.be.equal(review.reply.text);
    expect(data).to.be.an('object').which.have.keys('review');
    expect(data.review).to.be.an('object').which.have.keys('reply');
    expect(data.review.reply).to.be.null;
  });

  it('should return an error when a wrong or unknown token is supplied to the google module', async function () {
    const request = `mutation dataSetDeleteReply($reviewId: ID!, $exogenous: Boolean, $commentId: ID) {
      dataSetDeleteReply(reviewId: $reviewId, exogenous: $exogenous, commentId: $commentId) {
        status
        message
        reviewReplyStatus
        reviewReplyRejectedReason
        publicReviewComment
        publicReviewCommentStatus
        publicReviewCommentRejectionReason
        publicReviewCommentApprovedAt
      }
    }`;

    const dataWithFakeGoogleToken = await generateData(Data, garageWithFakeToken.id, 'Google', review);
    const variables = {
      reviewId: dataWithFakeGoogleToken.getId().toString(),
      exogenous: true,
    };
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetDeleteReply');
    expect(res.data.dataSetDeleteReply)
      .to.be.an('object')
      .which.have.keys(
        'status',
        'message',
        'reviewReplyStatus',
        'reviewReplyRejectedReason',
        'publicReviewComment',
        'publicReviewCommentStatus',
        'publicReviewCommentRejectionReason',
        'publicReviewCommentApprovedAt'
      );
    expect(res.data.dataSetDeleteReply.message).to.be.equal('An error occured with the google service');
    expect(res.data.dataSetDeleteReply.status).to.be.false;
    expect(res.data.dataSetDeleteReply.publicReviewCommentStatus).to.be.equal('Rejected');
    expect(res.data.dataSetDeleteReply.reviewReplyStatus).to.be.null;
    expect(res.data.dataSetDeleteReply.reviewReplyRejectedReason).to.be.null;
    expect(res.data.dataSetDeleteReply.publicReviewComment).to.be.null;
    expect(res.data.dataSetDeleteReply.publicReviewCommentApprovedAt).to.be.null;
    expect(res.data.dataSetDeleteReply.publicReviewCommentRejectionReason).to.be.equal(
      "Google a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n'hésitez pas à nous solliciter."
    );
  });

  it('should return a confirmation result for a deleted facebook reply', async function () {
    const request = `mutation dataSetDeleteReply($reviewId: ID!, $exogenous: Boolean, $commentId: ID) {
      dataSetDeleteReply(reviewId: $reviewId, exogenous: $exogenous, commentId: $commentId) {
        status
        updatedThread {
          text
          approvedAt
          author
          id
          attachment
          isFromOwner
          replies {
            text
            approvedAt
            author
            id
            attachment
            isFromOwner
          }
        }
      }
    }`;

    const variables = {
      reviewId: dataFacebook.getId().toString(),
      commentId: threadId,
    };
    const res = await sendQueryAs(app, request, variables, user.getId());
    const data = await Data.getMongoConnector().findOne(
      { _id: dataFacebook.getId() },
      { projection: { 'review.reply': true } }
    );

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetDeleteReply');
    expect(res.data.dataSetDeleteReply).to.be.an('object').which.have.keys('updatedThread', 'status');
    expect(res.data.dataSetDeleteReply.status).to.be.equal(true);
    expect(res.data.dataSetDeleteReply.updatedThread).to.be.an('array').lengthOf(1);
    expect(res.data.dataSetDeleteReply.updatedThread[0])
      .to.be.an('object')
      .which.have.keys('text', 'approvedAt', 'author', 'id', 'attachment', 'isFromOwner', 'replies');
    expect(res.data.dataSetDeleteReply.updatedThread[0].text).to.be.equal(review.reply.thread[1].text);
    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.an('object').which.have.any.keys('thread');
    expect(data.review.reply.thread).to.be.an('array').lengthOf(1);
    expect(data.review.reply.thread[0]).to.be.an('object').which.have.any.keys('text');
    expect(data.review.reply.thread[0].text).to.be.equal(review.reply.thread[1].text);
  });

  it('should return an error when the exogenousReviewsConfigurations in the data set is not configured', async function () {
    const request = `mutation dataSetDeleteReply($reviewId: ID!, $exogenous: Boolean, $commentId: ID) {
      dataSetDeleteReply(reviewId: $reviewId, exogenous: $exogenous, commentId: $commentId) {
        status
        message
      }
    }`;

    const variables = {
      reviewId: dataWithFakeToken.getId().toString(),
      exogenous: true,
    };
    const res = await sendQueryAs(app, request, variables);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetDeleteReply');
    expect(res.data.dataSetDeleteReply).to.be.an('object').which.have.keys('message', 'status');
    expect(res.data.dataSetDeleteReply.status).to.be.false;
    expect(res.data.dataSetDeleteReply.message).to.be.equal(
      `Garage ${garageWithFakeToken.getId().toString()} not found or exogenousReviewsConfigurations not configured`
    );
  });

  it('should return an error when an unknown dataId is supplied', async function () {
    const request = `mutation dataSetDeleteReply($reviewId: ID!, $exogenous: Boolean, $commentId: ID) {
      dataSetDeleteReply(reviewId: $reviewId, exogenous: $exogenous, commentId: $commentId) {
        status
        message
      }
    }`;
    const reviewId = new ObjectID().toString();
    const variables = {
      reviewId,
    };
    const res = await sendQueryAs(app, request, variables);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetDeleteReply');
    expect(res.data.dataSetDeleteReply).to.be.an('object').which.have.keys('message', 'status');
    expect(res.data.dataSetDeleteReply.status).to.be.false;
    expect(res.data.dataSetDeleteReply.message).to.be.equal(`Data ${reviewId} not found`);
  });
});
