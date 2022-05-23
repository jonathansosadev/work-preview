const TestApp = require('../../../../common/lib/test/test-app');
const chai = require('chai');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const path = require('path');
const GarageTypes = require('../../../../common/models/garage.type');
const GarageProcessingContext = require('../../../../common/lib/garagescore/monitoring/internal-events/contexts/garage-processing-context');

const expect = chai.expect;
chai.should();
const app = new TestApp();

/**
 *
 * Take a datafile and generate data instances from it
 *
 */

describe('Generate data from datafile:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('test cobrediamix1', async function test() {
    const garage = await app.addGarage();
    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId, false, await garage.getInstance());
    const datas = await app.datas();
    // datas.forEach(d => console.log(JSON.stringify(d, null, 2)));
    expect(datas.length).to.equals(11);
    // console.log(JSON.stringify(datas[0].customer));
  });
  it('should emit events', async function test() {
    const garage = await app.addGarage();
    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    const eventsListener = (event) => {
      console.log(event);
    };
    const eventsEmitterContext = GarageProcessingContext.createForUnitTest(eventsListener);
    await importer.generateData(app.models, dataFileId, false, await garage.getInstance(), eventsEmitterContext);
    const datas = await app.datas();
    // datas.forEach(d => console.log(JSON.stringify(d, null, 2)));
    expect(datas.length).to.equals(11);
    // console.log(JSON.stringify(datas[0].customer));
  });
  it('Should generate Datas with correct GarageType', async () => {
    const garage1 = await app.addGarage({ type: GarageTypes.CAR_REPAIRER });
    const dataFileId = await app.addDataFile(
      garage1,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateDataWithCb(app.models, dataFileId, false, null, null, async (err, result) => {
      const datas = await app.datas();
      for (const data of datas) {
        expect(data.garageType).to.equals(GarageTypes.CAR_REPAIRER);
      }
    });
  });
});
