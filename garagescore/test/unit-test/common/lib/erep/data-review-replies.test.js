const TestApp = require('../../../../../common/lib/test/test-app');
const { ObjectID } = require('mongodb');
const { expect } = require('chai');
const app = new TestApp();
const googleStubs = require('../../../../../common/lib/test/test-app/mock-google-reply');
const facebookStubs = require('../../../../../common/lib/test/test-app/mock-facebook-reply');
const { createReply } = require('../../../../../common/lib/erep/data-review-replies');

const sourceId = '10155005575114364';
const comment = 'this is a comment';

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

/* Test createReply module */
describe('createReplyModule', () => {
  let dataGoogle;
  let dataFacebook;
  let garage;
  let garageWithFakeToken;
  let exogenousReviewsConfigurations = {
    Facebook: {
      externalId: 'externalidkjbfsvnsqvl',
      token: 'thisisavalidtokenbelieveme',
    },
    Google: {
      token: 'thisisavalidtokenbelieveme',
    },
  };
  beforeEach(async function beforeEach() {
    await app.reset();
    garage = await app.addGarage({
      exogenousReviewsConfigurations,
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

    dataGoogle = await generateData(app.models.Data, garage.id, 'Google', review);

    dataFacebook = await generateData(app.models.Data, garage.id, 'Facebook', review);
    googleStubs.on();
    facebookStubs.on();
  });

  afterEach(async function () {
    googleStubs.off();
    facebookStubs.off();
  });

  it('should return an error when an unknown source is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await createReply(
        app,
        { _id: new ObjectID(), source: 'unknownSource', review: {}, garageid: new ObjectID() },
        comment,
        {
          sourceId,
        }
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(Error);
    expect(sendReply.message).to.be.equal('sourceType is missing or invalid !');
  });

  it('should return a valid response from google', async function test() {
    const sendReply = await createReply(
      app,
      {
        _id: dataGoogle.getId(),
        source: { type: 'Google' },
        review: { reply: { text: 'this is a previous comment' } },
        garageId: garage.id,
      },
      'this is a comment',
      {
        sourceId: '10155005575114364',
      },
      true
    );
    const data = await app.models.Data.getMongoConnector().findOne({ _id: dataGoogle.getId() });

    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.an('object').which.have.any.keys('status', 'text');
    expect(data.review.reply.status).to.be.equal('Approved');
    expect(data.review.reply.text).to.be.equal('this is a comment');
    expect(sendReply).to.be.an('object').which.have.any.keys('modifiedCount');
    expect(sendReply.modifiedCount).to.be.equal(1);
  });

  it('should return a valid response from facebook', async function test() {
    const sendReply = await createReply(
      app,
      { _id: dataFacebook.getId(), source: { type: 'Facebook' }, review: {}, garageId: garage.id },
      'this is a comment',
      {
        sourceId: '10155005575114364',
        authorId: new ObjectID().toString(),
      }
    );
    const data = await app.models.Data.getMongoConnector().findOne({ _id: dataFacebook.getId() });

    expect(data).to.be.an('object').which.have.any.keys('review');
    expect(data.review).to.be.an('object').which.have.any.keys('reply');
    expect(data.review.reply).to.be.an('object').which.have.keys('status', 'thread','automatedReply');
    expect(data.review.reply.status).to.be.equal('Approved');
    expect(data.review.reply.thread).to.be.an('array').lengthOf(1);
    expect(data.review.reply.thread[0]).to.be.an('object').which.have.any.keys('text');
    expect(data.review.reply.thread[0].text).to.be.equal('this is a comment');
    expect(sendReply).to.be.an('object').which.have.any.keys('modifiedCount');
    expect(sendReply.modifiedCount).to.be.equal(1);
  });

  it('should return an error response from facebook when an invalid token is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await createReply(
        app,
        { _id: dataFacebook.getId(), source: { type: 'Facebook' }, review: {}, garageId: garageWithFakeToken.id },
        'this is a comment',
        {
          sourceId: '10155005575114364',
          authorId: new ObjectID().toString(),
        }
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(Error);
    expect(sendReply.message).to.be.equal('An error occured with the facebook service');
  });

  it('should return an error response from google when an invalid token is supplied', async function test() {
    let sendReply;
    try {
      sendReply = await createReply(
        app,
        { _id: dataGoogle.getId(), source: { type: 'Google' }, review: {}, garageId: garageWithFakeToken.id },
        'this is a comment',
        {
          sourceId: '10155005575114364',
        },
        true
      );
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
          token: 'error',
        },
      },
    });
    try {
      sendReply = await createReply(
        app,
        { _id: dataFacebook.getId(), source: { type: 'Facebook' }, review: {}, garageId: garageWithNoExternalId.id },
        'this is a comment',
        {
          sourceId: '10155005575114364',
          authorId: new ObjectID().toString(),
        }
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('ExternalId is missing!');
  });

  it('should return an error response from the module when a param is missing or null', async function test() {
    let sendReply;
    try {
      sendReply = await createReply(
        app,
        { _id: dataGoogle.getId(), source: { type: 'Google' }, review: {} },
        null,
        {
          sourceId: '10155005575114364',
        },
        true
      );
    } catch (error) {
      sendReply = error;
    }

    expect(sendReply).to.be.an.instanceof(TypeError);
    expect(sendReply.message).to.be.equal('replyText is missing!');
  });
});
