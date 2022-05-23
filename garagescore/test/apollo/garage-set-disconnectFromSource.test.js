const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const DataTypes = require('../../common/models/data/type/data-types');
const { ObjectId } = require('mongodb');
const SourceTypes = require('../../common/models/data/type/source-types');
const DataBuilder = require('../../common/lib/test/test-instance-factory/data-builder');

let user = {};
let garage;
let dataWillBeDeleted;

const exogenousReviewsConfigurations = {
  Facebook: {
    externalId: 'externalidkjbfsvnsqvl',
    token: 'thisisavalidtokenbelieveme',
  },
  Google: {
    token: 'thisisavalidtokenbelieveme',
  },
  PagesJaunes: {
    token: 'thisisavalidtokenbelieveme',
  },
};
const fields = ['baseGarageId', 'message'];
const request = `
    mutation garageSetDisconnectFromSource($garageId: ID!, $source: String!) {
      garageSetDisconnectFromSource(garageId: $garageId, source: $source) {
        baseGarageId
        message
      }
    }
    `;
/* test apollo request garageSetDisconnectFromSource */
describe('Apollo::garageSetDisconnectFromSource', () => {
  beforeEach(async function () {
    await app.reset();
    user.authorization = {};
    user.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user = await app.addUser(user);
    garage = await app.addGarage({
      exogenousReviewsConfigurations,
    });

    await new DataBuilder(app)
      .garage(garage.id)
      .type(DataTypes.EXOGENOUS_REVIEW)
      .shouldSurfaceInStatistics(true)
      .source(SourceTypes.FACEBOOK)
      .create();

    dataWillBeDeleted = await new DataBuilder(app)
      .garage(garage.id)
      .type(DataTypes.EXOGENOUS_REVIEW)
      .shouldSurfaceInStatistics(true)
      .source(SourceTypes.GOOGLE)
      .create();

    await new DataBuilder(app)
      .garage(garage.id)
      .type(DataTypes.MANUAL_LEAD)
      .shouldSurfaceInStatistics(true)
      .source(SourceTypes.GOOGLE)
      .create();
  });

  it('should return null when an unknown garageId is supplied', async () => {
    const variables = {
      garageId: new ObjectId().toString(),
      source: SourceTypes.PAGESJAUNES,
    };
    const res = await sendQueryAs(app, request, variables, user.userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetDisconnectFromSource');
    expect(res.data.garageSetDisconnectFromSource).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetDisconnectFromSource.baseGarageId).to.be.null;
    expect(res.data.garageSetDisconnectFromSource.message).to.be.false;
  });
  // valid sources are exogeneous so Pagejaunes, Google, Facebook
  it('should return null when an unknown source is supplied', async () => {
    const variables = {
      garageId: garage.id.toString(),
      source: SourceTypes.DATAFILE,
    };
    const res = await sendQueryAs(app, request, variables, user.userId);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetDisconnectFromSource');
    expect(res.data.garageSetDisconnectFromSource).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetDisconnectFromSource.baseGarageId).to.be.null;
    expect(res.data.garageSetDisconnectFromSource.message).to.be.false;
  });

  it('should return a valid response when the exogenousReviewsConfigurations was deleted', async () => {
    const variables = {
      garageId: garage.id.toString(),
      source: SourceTypes.GOOGLE,
    };
    const res = await sendQueryAs(app, request, variables, user.userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetDisconnectFromSource');
    expect(res.data.garageSetDisconnectFromSource).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetDisconnectFromSource.baseGarageId).to.be.equal(garage.id.toString());
    expect(res.data.garageSetDisconnectFromSource.message).to.be.true;

    const updatedGarage = await app.models.Garage.getMongoConnector().findOne(
      { _id: garage.id },
      { projection: { exogenousReviewsConfigurations: true } }
    );
    expect(updatedGarage).to.be.an('object').which.have.any.keys('exogenousReviewsConfigurations');
    expect(updatedGarage.exogenousReviewsConfigurations)
      .to.be.an('object')
      .which.have.any.keys('Facebook', 'Google', 'PagesJaunes');
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook)
      .to.be.an('object')
      .which.have.any.keys('externalId', 'token');
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes).to.be.an('object').which.have.any.keys('token');
    expect(updatedGarage.exogenousReviewsConfigurations.Google)
      .to.be.an('object')
      .which.have.any.keys('lastRefresh', 'token', 'connectedBy');
    expect(updatedGarage.exogenousReviewsConfigurations.Google.lastRefresh).to.be.null;
    expect(updatedGarage.exogenousReviewsConfigurations.Google.token).to.be.equal('');
    expect(updatedGarage.exogenousReviewsConfigurations.Google.connectedBy).to.be.equal('');

    const datas = await app.models.Data.getMongoConnector().find({}).toArray();
    expect(datas).to.be.an('array').lengthOf(2);
    const findDeletedData = datas.find((data) => data._id.toString() === dataWillBeDeleted.getId().toString());
    expect(findDeletedData).to.be.undefined;
  });
});
