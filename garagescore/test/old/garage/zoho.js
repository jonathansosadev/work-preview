const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const { expect } = chai;
const { ObjectID } = require('mongodb');
const { getMissingGaragesDetails } = require('../../../common/lib/zoho/garages.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');
const testApp = new TestApp();

describe('Check on GaragesTest', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Check getMissingGaragesDetails for Zoho', async function test() {
    await testApp.addGarageWithMongo({ _id: new ObjectID(GaragesTest.GARAGE_DUPONT) });
    await testApp.addGarageWithMongo({ _id: new ObjectID(GaragesTest.VEHICULE_INSPECTION_DURANT) });
    await testApp.addGarageWithMongo({ _id: new ObjectID(GaragesTest.AGENT_DUPONT) });
    await testApp.addGarageWithMongo({ _id: new ObjectID(GaragesTest.MOTO_DUBOIS) });
    await testApp.addGarageWithMongo({ _id: new ObjectID(GaragesTest.GARAGE_DEL_BOSQUE) });
    await testApp.addGarageWithMongo({ _id: new ObjectID(GaragesTest.MOTO_DEL_MAR) });

    await testApp.addGarageWithMongo({});
    await testApp.addGarageWithMongo({});

    [countMissingGarages] = await getMissingGaragesDetails([]);
    // Expect 2 missing garages it should count test garages
    expect(countMissingGarages).equal(2);
  });
});
