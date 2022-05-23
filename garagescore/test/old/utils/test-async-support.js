/**
 * Is async supported
 */

const chai = require('chai');

const expect = chai.expect;

const getX = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(99);
    }, 200);
  });

describe('Is async supported:', () => {
  it('async/await', async function test() {
    const x = await getX();
    expect(x).equal(99);
  });
});
