const TestApp = require('../../../../../common/lib/test/test-app');
const { expect } = require('chai');
const app = new TestApp();
const googleDeleteStubs = require('../../../../../common/lib/test/test-app/mock-google-deleteReplies');
const facebookDeleteStubs = require('../../../../../common/lib/test/test-app/mock-facebook-deleteReply');
const { deleteReply } = require('../../../../../common/lib/erep/data-review-replies');
const { ObjectID } = require('mongodb');

let _id;
const commentId = 'thisisacommentId';
let garage;
let garageWithFakeToken;
const review = {
  reply: {
    text: 'this is a reply',
    thread: [
      { id: '123456', text: 'this is reply' },
      { id: '7890', text: 'this is another reply' },
    ],
  },
};
const createFakeData = (type, sourceId = 'thisisasourceid') => ({ _id, source: { type, sourceId }, review });
let data;
/* Test deleteReply module */
describe('deleteReplyModule', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    googleDeleteStubs.on();
    facebookDeleteStubs.on();
    garage = await app.addGarage({
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
        Facebook: {
          externalId: 'externalidkjbfsvnsqvl',
          token: 'error',
        },
        Google: {
          token: 'error',
        },
      },
    });
    data = await app.models.Data.create({
      garageId: garage.getId(),
      type: 'ExogenousReview',
      review,
    });
    _id = data.getId();
  });

  afterEach(async function () {
    googleDeleteStubs.off();
    facebookDeleteStubs.off();
  });

  it('should return an error when an unknown source is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await deleteReply(app, createFakeData('unknownSource'), new ObjectID());
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('sourceType is missing or invalid !');
  });

  it('should return a confirmation of deletion from google', async function test() {
    const dataBeforeDeletion = await app.models.Data.getMongoConnector().findOne({ _id });
    const sourceId = 'randomSourceIdForGoogle';
    googleDeleteStubs.addReply({ id: sourceId, reply: 'Hello G' });
    const sendReply = await deleteReply(app, { ...createFakeData('Google', sourceId), garageId: garage.getId() }, true);
    const isReplyDeleted = googleDeleteStubs.findReply(sourceId);
    const replies = googleDeleteStubs.replies();
    const data = await app.models.Data.getMongoConnector().findOne({ _id });

    expect(dataBeforeDeletion).to.be.an('object').which.have.any.keys('review');
    expect(dataBeforeDeletion.review).to.be.an('object').which.have.any.keys('reply');
    expect(dataBeforeDeletion.review.reply).to.be.an('object').which.have.any.keys('text');
    expect(dataBeforeDeletion.review.reply.text).to.be.equal(review.reply.text);
    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.null;
    expect(sendReply).to.be.true;
    expect(isReplyDeleted).to.be.undefined;
    expect(replies.length).to.be.equal(0);
  });

  it('should return a confirmation of deletion from facebook', async function test() {
    const dataBeforeDeletion = await app.models.Data.getMongoConnector().findOne({ _id });
    const commentId = review.reply.thread[0].id;
    facebookDeleteStubs.addReply({ id: commentId, reply: 'Hello Zuck' });
    const sendReply = await deleteReply(app, {
      ...createFakeData('Facebook', commentId),
      garageId: garage.getId(),
      commentId,
    });
    const isReplyDeleted = facebookDeleteStubs.findReply(commentId);
    const replies = facebookDeleteStubs.replies();
    const data = await app.models.Data.getMongoConnector().findOne({ _id });

    expect(dataBeforeDeletion).to.be.an('object').which.have.any.keys('review');
    expect(dataBeforeDeletion.review).to.be.an('object').which.have.any.keys('reply');
    expect(dataBeforeDeletion.review.reply).to.be.an('object').which.have.any.keys('thread');
    expect(dataBeforeDeletion.review.reply.thread).to.be.an('array').lengthOf(2);
    expect(dataBeforeDeletion.review.reply.thread[0]).to.be.an('object').which.have.any.keys('id');
    expect(dataBeforeDeletion.review.reply.thread[0].id).to.be.equal(review.reply.thread[0].id);
    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.an('object').which.have.any.keys('thread');
    expect(data.review.reply.thread).to.be.an('array').lengthOf(1);
    expect(data.review.reply.thread[0]).to.be.an('object').which.have.any.keys('id');
    expect(data.review.reply.thread[0].id).to.be.equal(review.reply.thread[1].id);
    expect(sendReply).to.be.true;
    expect(isReplyDeleted).to.be.undefined;
    expect(replies.length).to.be.equal(0);
  });

  it('should return an error response from facebook when an invalid token is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await deleteReply(app, {
        ...createFakeData('Facebook'),
        garageId: garageWithFakeToken.getId(),
        commentId,
      });
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(Error);
    expect(sendReply.message).to.be.equal('An error occured with the facebook service');
  });

  it('should return an error response from google when an invalid token is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await deleteReply(app, { ...createFakeData('Google'), garageId: garageWithFakeToken.getId() }, true);
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(Error);
    expect(sendReply.message).to.be.equal('An error occured with the google service');
  });

  it('should return an error response from the facebook when the param externalId is missing', async function test() {
    let sendReply;
    const garageWithNoExternalId = await app.addGarage({
      exogenousReviewsConfigurations: {
        Facebook: {
          token: 'thisisavalidtokenbelieveme',
        },
      },
    });
    try {
      sendReply = await deleteReply(app, { ...createFakeData('Facebook'), garageId: garageWithNoExternalId.getId() });
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('externalId is missing!');
  });

  it('should return an error response from facebook when the commentId is missing', async function test() {
    let sendReply;
    try {
      sendReply = await deleteReply(app, { ...createFakeData('Facebook'), garageId: garage.getId() });
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('commentId is missing!');
  });
});
