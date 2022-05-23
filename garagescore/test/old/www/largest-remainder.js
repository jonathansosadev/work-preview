const chai = require('chai');
const largestRemainder = require('../../../common/lib/util/largest-remainder');

const expect = chai.expect;
chai.should();
const g = (o) => o;
const s = function (index, v, array) {
  array[index] = v;
}; // eslint-disable-line
describe('largestRemainder algorithm (used in the score api):', () => {
  it('Serie 1', () => {
    const values = [33, 0, 33, 33, 0];
    largestRemainder(values, g, s, 100);
    expect(values).eql([33, 0, 33, 34, 0]);
  });
  it('Serie 2', () => {
    const values = [45, 36, 9, 9, 0];
    largestRemainder(values, g, s, 100);
    expect(values).eql([46, 36, 9, 9, 0]);
  });
  it('Serie 3', () => {
    const values = [28.5, 42.5, 28.5, 0, 0];
    largestRemainder(values, g, s, 100);
    expect(values).eql([28, 43, 29, 0, 0]);
  });
});
