const TestApp = require('../../../common/lib/test/test-app');
const GarageTypes = require('../../../common/models/garage.type');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line

const expect = chai.expect;
const app = new TestApp();
const Global = Object.seal({
  Data: null,
  Scope: null,
  garageVI: null,
  garageDealership: null,
  scopeVI_id: null,
  scopeD_id: null,
});
/**
 * Test that the model 'data' create a field 'scopes' if the garage is a VI
 */
describe('Data model Scope:', () => {
  beforeEach(async function () {
    await app.reset();
    await app.addGarage({ type: GarageTypes.VEHICLE_INSPECTION });
    await app.addGarage({ type: GarageTypes.DEALERSHIP });
    Global.garageVI = (await app.garages())[0];
    Global.garageDealership = (await app.garages())[1];
    Global.Data = app.models.Data;
    Global.Scope = app.models.Scope;

    /* create a new scope with the VI garage */
    await Global.Scope.create({ garageIds: [Global.garageVI.getId()] });
    Global.scopeVI_id = (await app.scopes())[0].getId();

    /* create a new scope with the Dealership garage */
    await Global.Scope.create({ garageIds: [Global.garageDealership.getId()] });
    Global.scopeD_id = (await app.scopes())[1].getId();

    /* force cache refresh */
    await Global.Scope.refreshCache();
  });

  it('When a new data is created and its garage is VI, assign it a scope', async () => {
    const dataVI = await Global.Data.init(Global.garageVI.getId(), {
      garageType: GarageTypes.VEHICLE_INSPECTION,
      sourceType: 'DataFile',
      raw: {},
    });
    const dataScopes = dataVI.get('scopes');
    expect(dataScopes.length).to.equal(1);
    expect(dataScopes[0].toString()).to.equal(Global.scopeVI_id.toString());
  });

  it('When a new data is created and its garage is NOT VI, do not assign a scope', async () => {
    const dataDealership = await Global.Data.init(Global.garageDealership.getId(), {
      garageType: GarageTypes.DEALERSHIP,
      sourceType: 'DataFile',
      raw: {},
    });
    const dataScopes = dataDealership.get('scopes');
    expect(dataScopes).to.be.undefined;
  });
});
