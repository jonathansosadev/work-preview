const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line

const expect = chai.expect;
const app = new TestApp();
const Global = Object.seal({
  Data: null,
  Scope: null,
  garage_1: null,
  garage_2: null,
});

describe('Model Scope: methods', () => {
  beforeEach(async function () {
    await app.reset();
    await app.addGarage();
    Global.garage_1 = (await app.garages())[0];
    await app.addGarage();
    Global.garage_2 = (await app.garages())[1];
    Global.Scope = app.models.Scope;

    /* create a new scope with the garage 1 */
    await Global.Scope.create({ garageIds: [Global.garage_1.getId()] });

    /* create a new scope with the garage 2 */
    await Global.Scope.create({ garageIds: [Global.garage_2.getId()] });

    /* create a new scope with both garages */
    await Global.Scope.create({ garageIds: [Global.garage_1.getId(), Global.garage_2.getId()] });

    /* force cache refresh */
    await Global.Scope.refreshCache();
  });

  /* should return an array of scopeIds where the garageId is present */
  it('getScopeIdsFromGarageId', async () => {
    const res = await Global.Scope.getScopeIdsFromGarageId(Global.garage_1.getId());
    const resToStr = res.map((id) => id.toString());

    const scopes = await app.scopes();
    const scopesToStr = scopes.map((scope) => scope.id.toString());

    expect(resToStr).to.include(scopesToStr[0]);
    expect(resToStr).to.include(scopesToStr[2]);
  });
});
