const chai = require('chai');

const { getPlaceDetails } = require('../../common/lib/util/google-place-api.js');
const dupont = require('./dupont.json');
const { expect } = chai;

const dupontGooglePlaceId = 'ChIJ1SfnIBJx5kcRZS5kijZrH_4';

describe('Test google place API', () => {
  it('test getPlaceDetails', async function () {
    const placeDetails = await getPlaceDetails({ googlePlaceId: dupontGooglePlaceId });
    [
      'id',
      'rating',
      'url',
      'openingHours',
      'website',
      'latitude',
      'longitude',
      'streetAddress',
      'postalCode',
      'region',
      'city',
      'phone',
      'subRegion',
      'businessStatus',
    ]
      .map((f) => ({ field: f, value: dupont.googlePlace[f] }))
      .forEach((test) => {
        if (test.field !== 'rating') {
          expect(JSON.stringify(placeDetails[test.field]), test.field).to.be.equal(JSON.stringify(test.value));
        } else expect(placeDetails[test.field], test.field).be.above(1);
      });
  });
});
