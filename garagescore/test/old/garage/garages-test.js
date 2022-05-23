const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const { expect } = chai;
const { GaragesTest } = require('../../../frontend/utils/enumV2');
const testApp = new TestApp();

describe('Check GaragesTest', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Should includes garages Dupont and has 30 garages id', async function test() {
    expect(GaragesTest.values().length).equal(30);
    expect(GaragesTest.values().includes(GaragesTest.GARAGE_DUPONT)).to.be.true;
  });
});