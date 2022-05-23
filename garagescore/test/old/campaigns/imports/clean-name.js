const customer = require('../../../../common/lib/garagescore/data-file/importer/customer-name');
const chai = require('chai');

const expect = chai.expect;
chai.should();
describe('Clean imported names:', () => {
  const fct = (fullName, callback) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const options = {};
    options.cellLabels = { fullName: 'fullName' };
    options.transformer = (a, b) => b;
    customer(dataRecord, 0, { fullName }, options, (e, res) => {
      if (e) {
        callback(e);
        return;
      }
      callback(null, res.customer && res.customer.fullName);
    });
  };

  it('Renove chars', (done) => {
    fct('Dupont****', (err, fullName) => {
      expect(fullName).to.eql('Dupont');
      done();
    });
  });
  it('Renove chars + uppercase', (done) => {
    fct('Re-Séb @gogo*li', (err, fullName) => {
      expect(fullName).to.eql('Re-Séb Gogoli');
      done();
    });
  });
});
