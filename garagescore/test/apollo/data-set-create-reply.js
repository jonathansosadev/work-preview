const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const googleStubs = require('../../common/lib/test/test-app/mock-google-reply');
const facebookStubs = require('../../common/lib/test/test-app/mock-facebook-reply');

let user;
let Data;
let dataGoogle;
let dataFacebook;
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

describe('Apollo::dataSetCreateReply', async function () {
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

    const review = {
      createdAt: new Date(),
      rating: {
        value: 10,
      },
      comment: {
        text: 'Très bonne réactivité et réparation immédiate sans rendez-vous pour filtre à carburant',
      },
      reply: {},
    };
    dataGoogle = await generateData(Data, garage.id, 'Google', review);

    dataFacebook = await generateData(Data, garage.id, 'Facebook', review);

    dataWithFakeToken = await generateData(Data, garageWithFakeToken.id, 'Facebook', review);
  });

  afterEach(async function () {
    googleStubs.off();
    facebookStubs.off();
  });

  it('should return the result for a newly created google reply', async function () {
    const request = `mutation dataSetCreateReply($reviewId: String!, $exogenous: Boolean, $comment: String) {
      dataSetCreateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
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
    expect(res.data).to.be.an('object').which.have.keys('dataSetCreateReply');
    expect(res.data.dataSetCreateReply).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetCreateReply.message).to.be.equal('Reply created');
    expect(res.data.dataSetCreateReply.status).to.be.equal(true);
    expect(res.data.dataSetCreateReply.reviewReplyStatus).to.be.equal('Approved');
    expect(res.data.dataSetCreateReply.reviewReplyRejectedReason).to.be.null;
    expect(res.data.dataSetCreateReply.publicReviewCommentRejectionReason).to.be.null;
    expect(res.data.dataSetCreateReply.publicReviewCommentStatus).to.be.equal('Approved');
    expect(res.data.dataSetCreateReply.publicReviewCommentApprovedAt).to.be.a('string');
    expect(res.data.dataSetCreateReply.publicReviewComment).to.be.equal(variables.comment);
    expect(replies).to.be.an('array').lengthOf(1);
    expect(replies[0][dataGoogle.source.sourceId]).to.equal(data.review.reply.text);
  });

  it('should return an error when a wrong or unknown token is supplied to the google module', async function () {
    const request = `mutation dataSetCreateReply($reviewId: String!, $exogenous: Boolean, $comment: String) {
      dataSetCreateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
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

    const dataWithFakeGoogleToken = await generateData(Data, garageWithFakeToken.id, 'Google');
    const variables = {
      reviewId: dataWithFakeGoogleToken.getId().toString(),
      exogenous: true,
      comment: 'this is a comment',
    };
    const replies = googleStubs.replies();
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetCreateReply');
    expect(res.data.dataSetCreateReply).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetCreateReply.message).to.be.equal('An error occured with the google service');
    expect(res.data.dataSetCreateReply.status).to.be.equal(false);
    expect(res.data.dataSetCreateReply.reviewReplyStatus).to.be.equal('Rejected');
    expect(res.data.dataSetCreateReply.reviewReplyRejectedReason).to.be.equal('Google a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n\'hésitez pas à nous solliciter.');
    expect(res.data.dataSetCreateReply.publicReviewComment).to.be.equal('An error occured with the google service');
    expect(res.data.dataSetCreateReply.publicReviewCommentStatus).to.be.equal('Rejected');
    expect(res.data.dataSetCreateReply.publicReviewCommentRejectionReason).to.be.equal(
      "Google a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n'hésitez pas à nous solliciter."
    );
    expect(res.data.dataSetCreateReply.publicReviewCommentApprovedAt).to.be.null;
    expect(replies).to.be.an('array').lengthOf(0);
  });

  it('should return the result for a newly created facebook reply', async function () {
    const request = `mutation dataSetCreateReply($reviewId: String!, $exogenous: Boolean, $comment: String) {
      dataSetCreateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
        status
        message
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
      comment: 'this is a comment',
    };
    const replies = facebookStubs.replies();
    const res = await sendQueryAs(app, request, variables, user.getId());
    const data = await Data.getMongoConnector().findOne(
      { _id: dataFacebook.getId() },
      { projection: { 'review.reply': true } }
    );

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetCreateReply');
    expect(res.data.dataSetCreateReply).to.be.an('object').which.have.keys('updatedThread', 'message', 'status');
    expect(res.data.dataSetCreateReply.message).to.be.equal('Reply created');
    expect(res.data.dataSetCreateReply.status).to.be.equal(true);
    expect(replies).to.be.an('array').lengthOf(1);
    expect(replies[0][dataFacebook.source.sourceId]).to.exists;
    expect(res.data.dataSetCreateReply.updatedThread).to.be.an('array').lengthOf(1);
    expect(res.data.dataSetCreateReply.updatedThread[0])
      .to.be.an('object')
      .which.have.keys('text', 'approvedAt', 'author', 'id', 'attachment', 'isFromOwner', 'replies');
    expect(res.data.dataSetCreateReply.updatedThread[0].replies).to.be.an('array').lengthOf(0);
    expect(res.data.dataSetCreateReply.updatedThread[0].text).to.be.equal(variables.comment);
    expect(res.data.dataSetCreateReply.updatedThread[0].id).to.be.equal('an id');
    expect(res.data.dataSetCreateReply.updatedThread[0].author).to.be.equal('Owner');
    expect(data.review.reply.thread).to.be.an('array').lengthOf(1);
    expect(data.review.reply.thread[0])
      .to.be.an('object')
      .which.have.keys([
        'text',
        'status',
        'approvedAt',
        'rejectedReason',
        'author',
        'id',
        'authorId',
        'attachment',
        'isFromOwner',
        'replies',
      ]);
    expect(data.review.reply.thread[0].text).to.be.equal(variables.comment);
  });

  it('should return an error when the exogenousReviewsConfigurations in the data set is not configured', async function () {
    const request = `mutation dataSetCreateReply($reviewId: String!, $exogenous: Boolean, $comment: String) {
      dataSetCreateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
        status
        message
      }
    }`;

    const variables = {
      reviewId: dataWithFakeToken.getId().toString(),
      comment: 'this is a comment',
    };
    const res = await sendQueryAs(app, request, variables);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetCreateReply');
    expect(res.data.dataSetCreateReply).to.be.an('object').which.have.keys('message', 'status');
    expect(res.data.dataSetCreateReply.status).to.be.false;
    expect(res.data.dataSetCreateReply.message).to.be.equal(
      `Garage ${garageWithFakeToken.getId().toString()} not found or exogenousReviewsConfigurations not configured`
    );
  });

  it('should return an error when an unknown dataId is supplied', async function () {
    const request = `mutation dataSetCreateReply($reviewId: String!, $exogenous: Boolean, $comment: String) {
      dataSetCreateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
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
    expect(res.data).to.be.an('object').which.have.keys('dataSetCreateReply');
    expect(res.data.dataSetCreateReply).to.be.an('object').which.have.keys('message', 'status');
    expect(res.data.dataSetCreateReply.status).to.be.false;
    expect(res.data.dataSetCreateReply.message).to.be.equal(`Data ${reviewId} not found`);
  });
});
