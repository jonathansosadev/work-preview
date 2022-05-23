const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const { ObjectId } = require('mongodb');
const UserAuthorization = require('../../common/models/user-autorization');
const googleFetchLocationsStub = require('../../common/lib/test/test-app/mock-google-fetchSingleLocation');
const googlePlacegetPlaceDetailsStub = require('../../common/lib/test/test-app/mock-google-place-api-getPlaceDetails');

const request = `mutation garageSetMatch($garageId: ID!, $oldGarageId: ID!, $externalGarageId: ID!, $baseGarageId: ID!, $source: String!) {
      garageSetMatch(garageId: $garageId, oldGarageId: $oldGarageId, externalGarageId: $externalGarageId, baseGarageId: $baseGarageId, source: $source) {
      success
    }
    }`;
let garage;
let baseGarage;
let oldGarage;
let user;
const postalCode = '75008';
/* Set garage match */
describe('Apollo::garageSetMatch', () => {
  beforeEach(async function () {
    await app.reset();
    googleFetchLocationsStub.on();
    googlePlacegetPlaceDetailsStub.on(postalCode);
    garage = await app.addGarage({ googlePlaceId: new ObjectId().toString() });
    baseGarage = await app.addGarage({
      exogenousReviewsConfigurations: { Google: { token: 'TOKEN', externalId: 'ID' } },
    });
    oldGarage = await app.addGarage();
    user = await app.addUser({ authorization: { [UserAuthorization.ACCESS_TO_COCKPIT]: true } });
  });

  afterEach(function () {
    googleFetchLocationsStub.off();
    googlePlacegetPlaceDetailsStub.off();
  });
  it('should return an error when no garage/oldGarage/baseGarage was found', async () => {
    const garagesIds = ['garageId', 'oldGarageId', 'baseGarageId'];
    const selectRandomGarageId = Math.floor(Math.random() * (2 + 1));
    const variables = {
      garageId: garage.getId().toString(),
      oldGarageId: oldGarage.getId().toString(),
      externalGarageId: new ObjectId().toString(),
      baseGarageId: baseGarage.getId().toString(),
      source: 'Google',
    };
    variables[garagesIds[selectRandomGarageId]] = new ObjectId().toString();
    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('garageSetMatch');
    expect(res.data.garageSetMatch).to.be.an('object').which.have.keys('success');
    expect(res.data.garageSetMatch.success).to.be.false;
  });

  it('should return an error when no token in the baseGarage was found', async () => {
    const variables = {
      garageId: garage.getId().toString(),
      oldGarageId: oldGarage.getId().toString(),
      externalGarageId: new ObjectId().toString(),
      baseGarageId: baseGarage.getId().toString(),
      source: 'Facebook',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('garageSetMatch');
    expect(res.data.garageSetMatch).to.be.an('object').which.have.keys('success');
    expect(res.data.garageSetMatch.success).to.be.false;
  });

  it('should return a confirmation message when the match was perfectly done', async () => {
    const variables = {
      garageId: garage.getId().toString(),
      oldGarageId: oldGarage.getId().toString(),
      externalGarageId: new ObjectId().toString(),
      baseGarageId: baseGarage.getId().toString(),
      source: 'Google',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('garageSetMatch');
    expect(res.data.garageSetMatch).to.be.an('object').which.have.keys('success');
    expect(res.data.garageSetMatch.success).to.be.true;

    const updatedGarage = await app.models.Garage.getMongoConnector().findOne({ _id: garage._garageId });
    expect(updatedGarage).to.be.an('object').which.have.any.keys('googlePlace');
    expect(updatedGarage.googlePlace).to.be.an('object').which.have.any.keys('postalCode');
    expect(updatedGarage.googlePlace.postalCode).to.be.equal(postalCode);
  });
});
