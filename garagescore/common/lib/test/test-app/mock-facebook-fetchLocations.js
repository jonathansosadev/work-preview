const sinon = require('sinon');
const Facebook = require('../../util/facebook');

let facebookFetchLocations;
const locations = [];
/** Mock api call to facebook fetchLocations method*/
module.exports = {
  // start mocking
  on: () => {
    if (facebookFetchLocations) {
      facebookFetchLocations.restore();
    }

    facebookFetchLocations = sinon.stub(Facebook, 'fetchLocations').callsFake(async (token) => {
      if (token) {
        return locations;
      }
      return { error: 'An error occured with the google service' };
    });
  },
  // stop mocking
  off: () => {
    if (facebookFetchLocations) {
      facebookFetchLocations.restore();
    }
  },
  addLocation: (location) => {
    locations.push(location);
  },
  reset: () => (locations.length = 0),
};
