const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line
// eslint-disable-next-line
const should = chai.should(); // enable .should for promise assertions
const expect = chai.expect;
const app = new TestApp();
/**
 *Dynamic setters and getters with app.models.Configuration
 */
describe.skip('Testing documents with invalid data #1847', () => {
  beforeEach(async function () {
    await app.reset();
    await app.addGarage();
  });
  // ['upsert', 'create' 'updateAll']
  // ['find', 'findOne', 'findById', 'count', 'upsert', 'create', 'updateAll', 'destroyAll']
  it("does not crash when there's an invalid date", async () => {
    // 1. Get garage
    let garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    await garage.save();
    // 3. Test
    expect(app.garages).not.to.throw();
    garage = (await app.garages())[0];
    expect(garage).to.be.undefined;

    /* what happens with 2 garages ? */
    await app.reset();
    await app.addGarage();
    // 1. Add another garage
    await app.addGarage();
    // 2. Get garage
    let garages = await app.garages();
    // 3. Remove date from 1 garage
    garages[0].runningSince = '';
    await garages[0].save();
    // 3. Test
    expect(app.garages).not.to.throw();
    garages = (await app.garages())[0];

    /* works also with findOne */
    await app.reset();
    await app.addGarage();
    // 1. Get garage
    garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    let garageId = garage.id;
    await garage.save();
    // 3. Test
    expect(() => app.server.models.Garage.findOne({ where: { id: garageId } })).not.to.throw();
    garage = (await app.garages())[0];
    expect(garage).to.be.undefined;

    /* works also with findById */
    await app.reset();
    await app.addGarage();
    // 1. Get garage
    garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    garageId = garage.id;
    await garage.save();
    // 3. Test
    expect(() => app.server.models.Garage.findById(garageId)).not.to.throw();
    garage = (await app.garages())[0];
    expect(garage).to.be.undefined;

    /* works also with count */
    await app.reset();
    await app.addGarage();
    // 1. Get garage
    garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    await garage.save();
    // 3. Test
    expect(() => app.server.models.Garage.count({})).not.to.throw();
    garage = (await app.garages())[0];
    expect(garage).to.be.undefined;

    /* works also with upsert */
    await app.reset();
    await app.addGarage();
    // 1. Get garage
    garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    const clonedGarage = Object.assign({}, garage);
    delete clonedGarage.id;
    // 3. Test
    expect(() => app.server.models.Garage.upsert(clonedGarage)).not.to.throw(
      undefined,
      'Upsert that creates a garage with invalid date throws an error'
    );
    expect(() => app.server.models.Garage.upsert(garage)).not.to.throw(
      undefined,
      'Upsert that updates a garage with invalid date throws an error'
    );
    garage = (await app.garages())[0];
    expect(garage).to.be.undefined;

    /* works also with updateAll */
    await app.reset();
    await app.addGarage();
    // 1. Get garage
    garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    await garage.save();
    // 3. Test
    expect(() => app.server.models.Garage.updateAll({ id: garage.id }, garage)).not.to.throw();
    garage = (await app.garages())[0];
    expect(garage).to.be.undefined;

    /* works also with destroyAll */
    await app.reset();
    await app.addGarage();
    // 1. Get garage
    garage = (await app.garages())[0];
    // 2. Remove date from garage
    garage.runningSince = '';
    await garage.save();
    // 3. Test
    expect(() => app.server.models.Garage.destroyAll({})).not.to.throw();
  });
});
