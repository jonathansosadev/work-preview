const normalize = require('../../../../common/lib/garagescore/customer/city-normalizer').normalize;
const chai = require('chai');

const expect = chai.expect;
chai.should();
/*
Normalize city names from postal code
*/
describe('City Normalization:', () => {
  it('Normalize from postal code', function (done) {
    const tests = [
      ['St Hilaire De Riez', 85270, 'Saint-Hilaire-de-Riez'],
      ['Strabourg', null, 'Strasbourg'],
      ['toulo', 83200, 'Toulon'],
      ['fdsfretreterterter', 83200, null],
    ];
    tests.forEach((test) => {
      if (test[1]) {
        expect(normalize(test[0], test[1])).equal(test[2]);
      } else {
        expect(normalize(test[0])).equal(test[2]);
      }
    });
    done();
  });
});
