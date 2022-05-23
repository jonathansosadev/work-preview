const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const DataBuilder = require('../../common/lib/test/test-instance-factory/data-builder');
const slackStubs = require('../../common/lib/test/test-app/mock-slack-postMessage');
let garage;
let sampleData;
let user;
const fields = ['message', 'status'];

describe('Apollo::dataSetReviewReport', async function () {
  beforeEach(async () => {
    await app.reset();
    slackStubs.on();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });

    garage = await app.addGarage({ publicDisplayName: 'Garage Test' });
    sampleData = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .type('UsedVehicleSale')
      .shouldSurfaceInStatistics(true)
      .reviewRating(5)
      .reviewComment('sample comment')
      .create();
  });

  afterEach(() => {
    slackStubs.off();
  });

  it('should return a valid message when everything is good', async function () {
    const request = `mutation dataSetReviewReport($id: ID!, $comment: String!) {
      dataSetReviewReport(id: $id, comment: $comment) {
        status
        message
      }
    }`;

    const variables = {
      id: sampleData.id.toString(),
      comment: 'this is a comment!',
    };

    const res = await sendQueryAs(app, request, variables, user._userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetReviewReport');
    expect(res.data.dataSetReviewReport).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetReviewReport.status).to.be.true;
    expect(res.data.dataSetReviewReport.message).to.be.null;

    const data = await app.models.Data.getMongoConnector().findOne(
      { _id: sampleData.id },
      { projection: { review: true } }
    );
    expect(data).to.be.an('object').which.have.any.keys(['review']);
    expect(data.review).to.be.an('object').which.have.any.keys(['rating', 'comment']);
    expect(data.review.rating).to.be.an('object').which.have.keys(['value']);
    expect(data.review.rating.value).to.be.equal(5);
    expect(data.review.comment).to.be.an('object').which.have.keys(['text', 'reports', 'status']);
    expect(data.review.comment.text).to.be.equal('sample comment');
    expect(data.review.comment.status).to.be.equal('Approved');
    expect(data.review.comment.reports).to.be.an('array').lengthOf(1);
    expect(data.review.comment.reports[0])
      .to.be.an('object')
      .which.have.keys(['date', 'channel', 'reporterId', 'reason']);
    expect(data.review.comment.reports[0].date).to.exists;
    expect(data.review.comment.reports[0].channel).to.exists;
    expect(data.review.comment.reports[0].reporterId).to.exists;
    expect(data.review.comment.reports[0].reason).to.be.equal(variables.comment);
  });
  it('should return an error when the garage does not exist', async function () {
    const request = `mutation dataSetReviewReport($id: ID!, $comment: String!) {
      dataSetReviewReport(id: $id, comment: $comment) {
        status
        message
      }
    }`;

    sampleData = await new DataBuilder(app)
      .garage(new ObjectID().toString())
      .type('UsedVehicleSale')
      .shouldSurfaceInStatistics(true)
      .reviewRating(5)
      .reviewComment('sample comment')
      .create();

    const variables = {
      id: sampleData.id.toString(),
      comment: 'this is a comment!',
    };

    const res = await sendQueryAs(app, request, variables, user._userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetReviewReport');
    expect(res.data.dataSetReviewReport).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetReviewReport.status).to.be.false;
    expect(res.data.dataSetReviewReport.message).to.be.equal('Garage lié à la publication introuvable');
  });
  it('should return an invalid message when an unkown dataId is supplied', async function () {
    const request = `mutation dataSetReviewReport($id: ID!, $comment: String!) {
      dataSetReviewReport(id: $id, comment: $comment) {
        status
        message
      }
    }`;

    const variables = {
      id: new ObjectID().toString(),
      comment: 'this is a comment!',
    };
    const res = await sendQueryAs(app, request, variables, user._userId);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetReviewReport');
    expect(res.data.dataSetReviewReport).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetReviewReport.status).to.be.false;
    expect(res.data.dataSetReviewReport.message).to.be.equal('Publication introuvable');
  });
});
