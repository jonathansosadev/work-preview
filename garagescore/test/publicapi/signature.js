const apiSignature = require('../../common/lib/garagescore/api/signature');
const expect = require('chai').expect;

const API_KEY = 'OEfVNDFDSFDSKDSIHE';
const API_SECRET = 'EOUREWHREWKYIYEIYI';
const method = 'GET';
const url = 'eeee';
const req = { query: { x: 1, y: 'ééé', a: 'coucou' } };

describe('API signature', function tests() {
  it('test correct signature', (done) => {
    const parametersString = apiSignature.parametersRequest(req);
    const signature = apiSignature.sign(API_KEY, API_SECRET, method, url, parametersString);
    const interval = 300;
    apiSignature.setAutorizedInterval(interval);
    setTimeout(() => {
      expect(apiSignature.verify(signature, API_KEY, API_SECRET, method, url, parametersString)).to.be.true;
      done();
    }, 1000);
  });
  it('test correct signature but timeout', (done) => {
    const parametersString = apiSignature.parametersRequest(req);
    const signature = apiSignature.sign(API_KEY, API_SECRET, method, url, parametersString);
    const interval = 1;
    apiSignature.setAutorizedInterval(interval);
    setTimeout(() => {
      expect(apiSignature.verify(signature, API_KEY, API_SECRET, method, url, parametersString)).to.be.false;
      done();
    }, 1000 + interval * 1000);
  });
  it('test false signature', () => {
    const parametersString = apiSignature.parametersRequest(req);
    const signature = apiSignature.sign(API_KEY, 'NOTTHESECRET', method, url, parametersString);
    expect(apiSignature.verify(signature, API_KEY, API_SECRET, method, url, parametersString)).to.be.false;
  });
  it('different time, different signatures', (done) => {
    const parametersString = apiSignature.parametersRequest(req);
    const signature1 = apiSignature.sign(API_KEY, API_SECRET, method, url, parametersString);
    const interval = 300;
    apiSignature.setAutorizedInterval(interval);
    setTimeout(() => {
      const signature2 = apiSignature.sign(API_KEY, API_SECRET, method, url, parametersString);
      expect(signature2).to.be.not.equals(signature1);
      expect(apiSignature.verify(signature1, API_KEY, API_SECRET, method, url, parametersString)).to.be.true;
      expect(apiSignature.verify(signature2, API_KEY, API_SECRET, method, url, parametersString)).to.be.true;
      done();
    }, 1000);
  });
});
