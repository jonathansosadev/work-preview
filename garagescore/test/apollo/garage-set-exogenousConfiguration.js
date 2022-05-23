const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const { ObjectId } = require('mongodb');
const stubGoogleGenerateRefreshTokenFromCode = require('../../common/lib/test/test-app/mock-google-generateRefreshTokenFromCode');
const stubFacebookGenerateLongTimeToken = require('../../common/lib/test/test-app/mock-facebook-generateLongTimeToken');
const stubGoogleFetchLocations = require('../../common/lib/test/test-app/mock-google-fetchLocations');
const stubFacebookFetchLocations = require('../../common/lib/test/test-app/mock-facebook-fetchLocations');
const SourceTypes = require('../../common/models/data/type/source-types');

let user = {};
let garage;
const fields = ['garagesToMatch', 'baseGarageId', 'rejectionReason'];
const request = `
    mutation garageSetExogenousConfiguration($garageId: ID!, $source: String!, $code: String!) {
      garageSetExogenousConfiguration(garageId: $garageId, source: $source, code: $code) {
        garagesToMatch {
          name
          externalId
        }
        baseGarageId
        rejectionReason
      }
    }
    `;
/* test apollo request garageSetExogenousConfiguration */
describe('Apollo::garageSetExogenousConfiguration', () => {
  beforeEach(async function () {
    await app.reset();
    stubGoogleGenerateRefreshTokenFromCode.on();
    stubGoogleFetchLocations.on();
    stubFacebookFetchLocations.on();
    stubFacebookGenerateLongTimeToken.on();
    user.authorization = {};
    user.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user = await app.addUser(user);
    garage = await app.addGarage();
  });

  afterEach(() => {
    stubGoogleGenerateRefreshTokenFromCode.off();
    stubFacebookGenerateLongTimeToken.off();
    stubGoogleFetchLocations.off();
    stubFacebookFetchLocations.off();
  });

  it('should return null when an unknown garageId is supplied', async () => {
    const variables = {
      garageId: new ObjectId().toString(),
      source: SourceTypes.PAGESJAUNES,
      code: '',
    };
    const res = await sendQueryAs(app, request, variables, user.userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetExogenousConfiguration');
    expect(res.data.garageSetExogenousConfiguration).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch).to.be.null;
    expect(res.data.garageSetExogenousConfiguration.baseGarageId).to.be.null;
    expect(res.data.garageSetExogenousConfiguration.rejectionReason).to.be.equal('Garage not found');
  });
  // valid sources are Pagejaunes, Google, Facebook
  it('should return null when an unknown source is supplied', async () => {
    const variables = {
      garageId: garage.id.toString(),
      source: SourceTypes.DATAFILE,
      code: new ObjectId().toString(),
    };
    const res = await sendQueryAs(app, request, variables, user.userId);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetExogenousConfiguration');
    expect(res.data.garageSetExogenousConfiguration).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch).to.be.null;
    expect(res.data.garageSetExogenousConfiguration.baseGarageId).to.be.null;
    expect(res.data.garageSetExogenousConfiguration.rejectionReason).to.be.equal('Source not supported');
  });

  it('should return a valid response with a baseGarageId and the garagesToMatch for Facebook', async () => {
    const variables = {
      garageId: garage.id.toString(),
      source: SourceTypes.FACEBOOK,
      code: new ObjectId().toString(),
    };
    const location = { name: 'Garage Dupont', id: new ObjectId().toString() };
    stubFacebookFetchLocations.addLocation(location);
    const res = await sendQueryAs(app, request, variables, user.userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetExogenousConfiguration');
    expect(res.data.garageSetExogenousConfiguration).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch).to.be.an('array').lengthOf(1);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch[0])
      .to.be.an('object')
      .which.have.keys('name', 'externalId');
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch[0].name).to.be.equal(location.name);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch[0].externalId).to.be.equal(location.id);
    expect(res.data.garageSetExogenousConfiguration.baseGarageId).to.be.equal(garage.id.toString());
    expect(res.data.garageSetExogenousConfiguration.rejectionReason).to.be.null;

    const updatedGarage = await app.models.Garage.getMongoConnector().findOne(
      { _id: garage.id },
      { projection: { exogenousReviewsConfigurations: true } }
    );
    expect(updatedGarage).to.be.an('object').which.have.any.keys('exogenousReviewsConfigurations');
    expect(updatedGarage.exogenousReviewsConfigurations)
      .to.be.an('object')
      .which.have.any.keys('Facebook', 'Google', 'PagesJaunes');
    expect(updatedGarage.exogenousReviewsConfigurations.Google).to.be.an('object');
    expect(Object.keys(updatedGarage.exogenousReviewsConfigurations.Google).length).to.be.equal(0);
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes).to.be.an('object');
    expect(Object.keys(updatedGarage.exogenousReviewsConfigurations.PagesJaunes).length).to.be.equal(0);
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook)
      .to.be.an('object')
      .which.have.any.keys('token', 'lastRefresh', 'connectedBy');
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook.token).to.be.a('string');
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook.lastRefresh).to.be.a('date');
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook.connectedBy).to.be.a('String');
    stubFacebookFetchLocations.reset();
  });

  it('should return a valid response with a baseGarageId and the garagesToMatch for Google', async () => {
    const variables = {
      garageId: garage.id.toString(),
      source: SourceTypes.GOOGLE,
      code: new ObjectId().toString(),
    };
    const location = { locationName: 'Garage Dupont', name: new ObjectId().toString() };
    stubGoogleFetchLocations.addLocation(location);
    const res = await sendQueryAs(app, request, variables, user.userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetExogenousConfiguration');
    expect(res.data.garageSetExogenousConfiguration).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch).to.be.an('array').lengthOf(1);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch[0])
      .to.be.an('object')
      .which.have.keys('name', 'externalId');
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch[0].name).to.be.equal(location.locationName);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch[0].externalId).to.be.equal(location.name);
    expect(res.data.garageSetExogenousConfiguration.baseGarageId).to.be.equal(garage.id.toString());
    expect(res.data.garageSetExogenousConfiguration.rejectionReason).to.be.null;

    const updatedGarage = await app.models.Garage.getMongoConnector().findOne(
      { _id: garage.id },
      { projection: { exogenousReviewsConfigurations: true } }
    );
    expect(updatedGarage).to.be.an('object').which.have.any.keys('exogenousReviewsConfigurations');
    expect(updatedGarage.exogenousReviewsConfigurations)
      .to.be.an('object')
      .which.have.any.keys('Facebook', 'Google', 'PagesJaunes');
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook).to.be.an('object');
    expect(Object.keys(updatedGarage.exogenousReviewsConfigurations.Facebook).length).to.be.equal(0);
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes).to.be.an('object');
    expect(Object.keys(updatedGarage.exogenousReviewsConfigurations.PagesJaunes).length).to.be.equal(0);
    expect(updatedGarage.exogenousReviewsConfigurations.Google)
      .to.be.an('object')
      .which.have.any.keys('token', 'lastRefresh', 'connectedBy');
    expect(updatedGarage.exogenousReviewsConfigurations.Google.token).to.be.a('string');
    expect(updatedGarage.exogenousReviewsConfigurations.Google.lastRefresh).to.be.a('date');
    expect(updatedGarage.exogenousReviewsConfigurations.Google.connectedBy).to.be.a('String');
    stubGoogleFetchLocations.reset();
  });

  it('should return a valid response with a baseGarageId and the garagesToMatch for pageJaunes', async () => {
    const variables = {
      garageId: garage.id.toString(),
      source: SourceTypes.PAGESJAUNES,
      code: new ObjectId().toString(), // fake url
    };
    const res = await sendQueryAs(app, request, variables, user.userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('garageSetExogenousConfiguration');
    expect(res.data.garageSetExogenousConfiguration).to.be.an('object').which.have.keys(fields);
    expect(res.data.garageSetExogenousConfiguration.garagesToMatch).to.be.an('array').lengthOf(0);
    expect(res.data.garageSetExogenousConfiguration.baseGarageId).to.be.equal(garage.id.toString());
    expect(res.data.garageSetExogenousConfiguration.rejectionReason).to.be.null;

    const updatedGarage = await app.models.Garage.getMongoConnector().findOne(
      { _id: garage.id },
      { projection: { exogenousReviewsConfigurations: true } }
    );
    expect(updatedGarage).to.be.an('object').which.have.any.keys('exogenousReviewsConfigurations');
    expect(updatedGarage.exogenousReviewsConfigurations)
      .to.be.an('object')
      .which.have.any.keys('Facebook', 'Google', 'PagesJaunes');
    expect(updatedGarage.exogenousReviewsConfigurations.Facebook).to.be.an('object');
    expect(Object.keys(updatedGarage.exogenousReviewsConfigurations.Facebook).length).to.be.equal(0);
    expect(updatedGarage.exogenousReviewsConfigurations.Google).to.be.an('object');
    expect(Object.keys(updatedGarage.exogenousReviewsConfigurations.Google).length).to.be.equal(0);
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes)
      .to.be.an('object')
      .which.have.any.keys('token', 'lastRefresh', 'connectedBy', 'externalId');
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes.token).to.be.a('string');
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes.lastRefresh).to.be.a('date');
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes.connectedBy).to.be.a('String');
    expect(updatedGarage.exogenousReviewsConfigurations.PagesJaunes.externalId).to.be.a('String');
  });
});
