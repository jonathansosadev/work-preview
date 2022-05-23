const sinon = require('sinon');
const Google = require('../../util/google');
const { ObjectID } = require('mongodb');

let googleFetchSingleLocation;

/** Mock api call to facebook reply method*/
module.exports = {
  // start mocking
  on: () => {
    if (googleFetchSingleLocation) {
      googleFetchSingleLocation.restore();
    }
    googleFetchSingleLocation = sinon.stub(Google, 'fetchSingleLocation').callsFake(async (token, externalGarageId) => {
      if (token && externalGarageId) {
        return { locationKey: { placeId: new ObjectID().toString() } };
      }
      return { error: 'An error occured with the google service' };
    });
  },
  // stop mocking
  off: () => {
    if (googleFetchSingleLocation) {
      googleFetchSingleLocation.restore();
    }
  },
};
