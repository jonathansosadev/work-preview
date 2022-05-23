const sinon = require('sinon');
const Google = require('../../util/google');

let googleFetchLocations;
const locations = [];
/** Mock api call to google fetchLocations method*/
module.exports = {
  // start mocking
  on: () => {
    if (googleFetchLocations) {
      googleFetchLocations.restore();
    }
    googleFetchLocations = sinon.stub(Google, 'fetchLocations').callsFake(async (token) => {
      if (token) {
        return locations;
      }
      return { error: 'An error occured with the google service' };
    });
  },
  // stop mocking
  off: () => {
    if (googleFetchLocations) {
      googleFetchLocations.restore();
    }
  },
  addLocation: (location) => {
    locations.push(location);
  },
  reset: () => (locations.length = 0),
};
