const TestApp = require('../../../common/lib/test/test-app');

const chai = require('chai');
const { promisify } = require('util');

const expect = chai.expect;
const app = new TestApp();
/* Get garage data from api */
describe('Garage scenario related', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.addGarage();
  });

  it('garage.scenarioStartsDelays', async function test() {
    const garage = (await app.garages())[0];
    const expectedDelays = { Maintenance: 0, NewVehicleSale: 0, UsedVehicleSale: 0 };
    const delays = await promisify(garage.scenarioStartsDelays.bind(garage))();
    Object.keys(expectedDelays).forEach((type) => {
      expect(delays[type], `Error ${type} delay, delays=${JSON.stringify(delays)}`).equals(expectedDelays[type]);
    });
  });
});
