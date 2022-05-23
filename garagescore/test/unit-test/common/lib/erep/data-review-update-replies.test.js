const TestApp = require('../../../../../common/lib/test/test-app');
const { expect } = require('chai');
const app = new TestApp();
const googleStubs = require('../../../../../common/lib/test/test-app/mock-google-reply');
const facebookStubs = require('../../../../../common/lib/test/test-app/mock-facebook-updateReply');
const { updateReply } = require('../../../../../common/lib/erep/data-review-replies');
const { ObjectID } = require('mongodb');
const ModerationStatus = require('../../../../../common/models/data/type/moderation-status');

const comment = 'this is a comment';
const id = new ObjectID().toString();
const commentId = new ObjectID().toString();
const authorId = new ObjectID();
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

/* Test updateReply module */
describe('updateReplyModule', () => {
  let dataGoogle;
  let dataFacebook;
  let review;
  let garage;
  let garageWithFakeToken;
  let exogenousReviewsConfigurations = {
    Google: {
      token: 'thisisavalidtokenbelieveme',
    },
    Facebook: {
      token: 'thisisavalidtokenbelieveme',
      externalId: 'thisisavalidexternalIdbelieveme',
    },
  };
  beforeEach(async function beforeEach() {
    await app.reset();
    garage = await app.addGarage({
      exogenousReviewsConfigurations,
    });
    garageWithFakeToken = await app.addGarage({
      exogenousReviewsConfigurations: {
        Google: {
          token: 'error',
        },
        Facebook: {
          token: id,
          externalId: null,
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
        text: 'this is a reply',
        status: ModerationStatus.APPROVED,
        thread: [
          {
            id: commentId,
            text: 'this is a comment in a thread',
            status: ModerationStatus.APPROVED,
          },
        ],
      },
    };

    dataGoogle = await generateData(app.models.Data, garage.id, 'Google', review);
    dataFacebook = await generateData(app.models.Data, garage.id, 'Facebook', review);

    googleStubs.on();
    facebookStubs.on();
  });

  afterEach(async function () {
    googleStubs.off();
    facebookStubs.off();
  });

  it('should return an error when an unknown source is supplied to the updateModule', async function test() {
    let sendReply;
    try {
      sendReply = await updateReply(app, { _id: new ObjectID(), source: 'unknownSource', review: {} }, comment);
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(Error);
    expect(sendReply.message).to.be.equal('sourceType is missing or invalid !');
  });

  it('should return a confirmation response from google that the reply was updated', async function test() {
    const sendReply = await updateReply(
      app,
      {
        _id: dataGoogle.getId(),
        source: { type: 'Google', sourceId: new Date().toString() },
        review,
        garageId: garage.id,
      },
      'this is a an updated reply',
      {
        authorId,
      },
      true
    );
    const data = await app.models.Data.getMongoConnector().findOne({ _id: dataGoogle.getId() });

    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.an('object').which.have.any.keys('status', 'text');
    expect(data.review.reply.status).to.be.equal('Approved');
    expect(data.review.reply.text).to.be.equal('this is a an updated reply');
    expect(sendReply).to.be.an('object').which.have.any.keys('modifiedCount');
    expect(sendReply.modifiedCount).to.be.equal(1);
  });

  it('should return a confirmation response from facebook that the reply was updated', async function test() {
    facebookStubs.addReply({ id: commentId, text: 'a reply' });
    const sendReply = await updateReply(
      app,
      {
        _id: dataFacebook.getId(),
        source: { type: 'Facebook', sourceId: new Date().toString() },
        review,
        garageId: garage.id,
        commentId,
      },
      'this is a an updated reply',
      {},
      false
    );

    const data = await app.models.Data.getMongoConnector().findOne({ _id: dataFacebook.getId() });
    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.an('object').which.have.any.keys('status', 'text', 'thread');
    expect(data.review.reply.thread).to.be.an('array').lengthOf(1);
    expect(data.review.reply.thread[0]).to.be.an('object').which.have.any.keys('text');
    expect(data.review.reply.thread[0].text).to.be.equal('this is a an updated reply');
    expect(sendReply).to.be.an('object').which.have.any.keys('modifiedCount');
    expect(sendReply.modifiedCount).to.be.equal(1);
  });

  it('should return an error response from google when an invalid token is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await updateReply(
        app,
        {
          _id: dataGoogle.getId(),
          source: { type: 'Google', sourceId: '10155005575114364' },
          review: {},
          garageId: garageWithFakeToken.id,
        },
        comment,
        {
          authorId,
        },
        true
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(Error);
    expect(sendReply.message).to.be.equal('An error occured with the google service');
  });

  it('should return an error response from the module when a param is missing or null', async function test() {
    let sendReply;
    try {
      sendReply = await updateReply(
        app,
        { _id: dataGoogle.getId(), source: { type: 'Google', sourceId: '10155005575114364' }, review: {} },
        null,
        {
          authorId,
        },
        true
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('replyText is missing!');
  });
  it('should return an error response from the facebook when a param is missing or null', async function test() {
    let sendReply;
    facebookStubs.addReply({ id: commentId, text: 'a reply' });

    try {
      sendReply = await updateReply(
        app,
        {
          _id: dataFacebook.getId(),
          source: { type: 'Facebook', sourceId: new Date().toString() },
          review,
          garageId: garageWithFakeToken.id,
          commentId,
        },
        'this is a an updated reply',
        {},
        false
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('ExternalId is missing!');
  });
});
