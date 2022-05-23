const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const googleStubs = require('../../common/lib/test/test-app/mock-google-reply');

let user;
let Data;
let dataGoogle;
let dataWithFakeToken;
let garageWithFakeToken;
const fields = [
  'message',
  'status',
  'reviewReplyStatus',
  'reviewReplyRejectedReason',
  'publicReviewComment',
  'publicReviewCommentStatus',
  'publicReviewCommentRejectionReason',
  'publicReviewCommentApprovedAt',
];
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

describe('Apollo::dataSetUpdateReply', async function () {
  const requestName = 'dataSetUpdateReply';
  beforeEach(async function () {
    await app.reset();
    googleStubs.reset();
    Data = app.models.Data;
    googleStubs.on();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });

    const garage = await app.addGarage({
      exogenousReviewsConfigurations: {
        Google: {
          token: 'thisisavalidtokenbelieveme',
        },
      },
    });

    garageWithFakeToken = await app.addGarage({
      exogenousReviewsConfigurations: {
        Facebook: {
          externalId: '56789',
          token: 'error',
        },
      },
    });

    const review = {
      createdAt: new Date(),
      rating: {
        value: 10,
      },
      comment: {
        text: 'Très bonne réactivité et réparation immédiate sans rendez-vous pour filtre à carburant',
      },
      reply: { text: 'this is a previous reply' },
    };
    dataGoogle = await generateData(Data, garage.id, 'Google', review);

    dataWithFakeToken = await generateData(Data, garageWithFakeToken.id, 'Google', review);
  });

  afterEach(async function () {
    googleStubs.off();
  });

  it('should return confirmation of updation of a google reply', async function () {
    const request = `mutation dataSetUpdateReply($reviewId: ID!, $exogenous: Boolean, $comment: String) {
      dataSetUpdateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
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

    const variables = {
      reviewId: dataGoogle.getId().toString(),
      exogenous: true,
      comment: 'this is a comment',
    };
    const replies = googleStubs.replies();
    const res = await sendQueryAs(app, request, variables, user.getId());
    const data = await Data.getMongoConnector().findOne(
      { _id: dataGoogle.getId() },
      { projection: { 'review.reply': true } }
    );

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys(requestName);
    expect(res.data.dataSetUpdateReply).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetUpdateReply.message).to.be.equal('Reply created');
    expect(res.data.dataSetUpdateReply.status).to.be.equal(true);
    expect(res.data.dataSetUpdateReply.reviewReplyStatus).to.be.equal('Approved');
    expect(res.data.dataSetUpdateReply.reviewReplyRejectedReason).to.be.null;
    expect(res.data.dataSetUpdateReply.publicReviewCommentRejectionReason).to.be.null;
    expect(res.data.dataSetUpdateReply.publicReviewCommentStatus).to.be.equal('Approved');
    expect(res.data.dataSetUpdateReply.publicReviewCommentApprovedAt).to.be.a('string');
    expect(res.data.dataSetUpdateReply.publicReviewComment).to.be.equal(variables.comment);
    expect(replies).to.be.an('array').lengthOf(1);
    expect(replies[0][dataGoogle.source.sourceId]).to.equal(data.review.reply.text);
  });

  it('should return an error when a wrong or unknown token is supplied to the google module when trying to update a reply', async function () {
    const request = `mutation dataSetUpdateReply($reviewId: ID!, $exogenous: Boolean, $comment: String) {
      dataSetUpdateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
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

    const garageWithFakeGoogleToken = await app.addGarage({
      exogenousReviewsConfigurations: {
        Google: {
          externalId: '56789',
          token: 'error',
        },
      },
    });
    const dataWithFakeGoogleToken = await generateData(Data, garageWithFakeGoogleToken.id, 'Google');
    const variables = {
      reviewId: dataWithFakeGoogleToken.getId().toString(),
      exogenous: true,
      comment: 'this is a comment',
    };
    const replies = googleStubs.replies();
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys(requestName);
    expect(res.data.dataSetUpdateReply).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetUpdateReply.message).to.be.equal('An error occured with the google service');
    expect(res.data.dataSetUpdateReply.status).to.be.equal(false);
    expect(res.data.dataSetUpdateReply.reviewReplyStatus).to.be.null;
    expect(res.data.dataSetUpdateReply.reviewReplyRejectedReason).to.be.null;
    expect(res.data.dataSetUpdateReply.publicReviewComment).to.be.null;
    expect(res.data.dataSetUpdateReply.publicReviewCommentStatus).to.be.equal('Rejected');
    expect(res.data.dataSetUpdateReply.publicReviewCommentRejectionReason).to.be.equal(
      "Google a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n'hésitez pas à nous solliciter."
    );
    expect(res.data.dataSetUpdateReply.publicReviewCommentApprovedAt).to.be.null;
    expect(replies).to.be.an('array').lengthOf(0);
  });

  it('should return an error when the exogenousReviewsConfigurations in the data set is not configured when trying to update a reply', async function () {
    const request = `mutation dataSetUpdateReply($reviewId: ID!, $exogenous: Boolean, $comment: String) {
      dataSetUpdateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
        status
        message
      }
    }`;

    const variables = {
      reviewId: dataWithFakeToken.getId().toString(),
      comment: 'this is a comment',
      exogenous: true,
    };
    const res = await sendQueryAs(app, request, variables);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys(requestName);
    expect(res.data.dataSetUpdateReply).to.be.an('object').which.have.keys('message', 'status');
    expect(res.data.dataSetUpdateReply.status).to.be.false;
    expect(res.data.dataSetUpdateReply.message).to.be.equal(
      `Garage ${garageWithFakeToken.getId().toString()} not found or exogenousReviewsConfigurations not configured`
    );
  });

  it('should return an error when an unknown dataId is supplied', async function () {
    const request = `mutation dataSetUpdateReply($reviewId: ID!, $exogenous: Boolean, $comment: String) {
      dataSetUpdateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
        status
        message
      }
    }`;
    const reviewId = new ObjectID().toString();
    const variables = {
      reviewId,
      comment: 'this is a comment',
    };
    const res = await sendQueryAs(app, request, variables);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys(requestName);
    expect(res.data.dataSetUpdateReply).to.be.an('object').which.have.keys('message', 'status');
    expect(res.data.dataSetUpdateReply.status).to.be.false;
    expect(res.data.dataSetUpdateReply.message).to.be.equal(`Data ${reviewId} not found`);
  });
});
