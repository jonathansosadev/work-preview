const sinon = require('sinon');
const GooglePlace = require('../../util/google-place-api');
const axios = require('axios');
let googlePlaceGetPlaceDetails;
let axiosGet;

/** Mock api call to google place api getPlaceDetails method*/
module.exports = {
  // start mocking
  on: (postalCode) => {
    if (googlePlaceGetPlaceDetails) {
      googlePlaceGetPlaceDetails.restore();
      axiosGet.restore();
    }
    googlePlaceGetPlaceDetails = sinon.stub(GooglePlace, 'getPlaceDetails').returns({ test: true });
    axiosGet = sinon
      .stub(axios, 'get')
      .returns({ data: { result: { address_components: [{ types: ['postal_code'], long_name: postalCode }] } } });
  },
  // stop mocking
  off: () => {
    if (googlePlaceGetPlaceDetails) {
      googlePlaceGetPlaceDetails.restore();
      axiosGet.restore();
    }
  },
};
