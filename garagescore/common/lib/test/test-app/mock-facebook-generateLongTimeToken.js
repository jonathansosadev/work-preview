const sinon = require('sinon');
const Facebook = require('../../util/facebook');
const { ObjectId } = require('mongodb');

let facebookGenerateLongTimeToken;

/** Mock api call to facebook generateLongTimeToken method*/
module.exports = {
  // start mocking
  on: () => {
    if (facebookGenerateLongTimeToken) {
      facebookGenerateLongTimeToken.restore();
    }
    facebookGenerateLongTimeToken = sinon.stub(Facebook, 'generateLongTimeToken').callsFake(async (token) => {
      if (token) {
        return new ObjectId().toString();
      }
      return { error: 'An error occured with the facebook service' };
    });
  },
  // stop mocking
  off: () => {
    if (facebookGenerateLongTimeToken) {
      facebookGenerateLongTimeToken.restore();
    }
  },
};
