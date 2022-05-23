const { decrypt, encrypt } = require('../../../common/lib/garagescore/survey/survey-id-encryption');
const expect = require('chai').expect;

describe('encrypted ids:', () => {
  it('decrypt(encrypt)', () => {
    for (let n = 0; n < 10; n++) {
      let hex = '';
      for (let i = 0; i < 24; i++) {
        hex += Math.round(16 * Math.random()).toString(16);
      }
      expect(decrypt(encrypt(hex)).dataId).to.equal(hex);
    }
  });
});
