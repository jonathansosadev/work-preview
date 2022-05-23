const sinon = require('sinon');
const Google = require('../../util/google');
const { ObjectId } = require('mongodb');

let googleGenerateRefreshTokenFromCode;

/** Mock api call to google generateRefreshTokenFromCode method*/
module.exports = {
  // start mocking
  on: () => {
    if (googleGenerateRefreshTokenFromCode) {
      googleGenerateRefreshTokenFromCode.restore();
    }
    googleGenerateRefreshTokenFromCode = sinon.stub(Google, 'generateRefreshTokenFromCode').callsFake(async (token) => {
      if (token) {
        return new ObjectId().toString();
      }
      return { error: 'An error occured with the google service' };
    });
  },
  // stop mocking
  off: () => {
    if (googleGenerateRefreshTokenFromCode) {
      googleGenerateRefreshTokenFromCode.restore();
    }
  },
};
