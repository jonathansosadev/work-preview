const decrypt = require('../../../common/lib/util/public-link-encrypted-id').decrypt;
const encrypt = require('../../../common/lib/util/public-link-encrypted-id').encrypt;
const xor = require('../../../common/lib/util/public-link-encrypted-id')._xor;
const expect = require('chai').expect;

describe('encrypted ids:', () => {
  it('encrypt a number', () => {
    expect(encrypt(1)).to.equal('1908d4150d9d27a5792f348b4');
  });
  it('xor(xor)', () => {
    for (let n = 0; n < 1000; n++) {
      const hex = n.toString(16);
      const cypher = Math.round(Math.random() * 100).toString(16);
      //  console.log(hex + '(x)' + cypher+'='+xor(hex,cypher)+ '(x)'+cypher+' = ' +(xor(xor(hex,cypher),cypher)));
      const m = parseInt(xor(xor(hex, cypher), cypher), 16);
      expect(n).to.equal(m);
    }
  });

  it('decrypt(encrypt)', () => {
    for (let n = 0; n < 1000; n++) {
      let hex = '';
      for (let i = 0; i < 24; i++) {
        hex += Math.round(16 * Math.random()).toString(16);
      }
      // console.log(hex + ' => ' + encrypt(hex) + '=> ' + decrypt(encrypt(hex)));
      expect(decrypt(encrypt(hex))).to.equal(hex);
    }
  });
});
