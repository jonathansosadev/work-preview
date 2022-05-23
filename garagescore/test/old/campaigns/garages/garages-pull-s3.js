const path = require('path');
const { expect } = require('chai');
const TestApp = require('../../../../common/lib/test/test-app');
const campaigns = require('../../../../server/routes/backoffice/campaigns');
const garageStatus = require('../../../../common/models/garage.status.js');
const { ObjectId } = require('mongodb');

const app = new TestApp();

describe('Download S3 files', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('should pull no files from S3 for a garage running manual', async () => {
    const testGarage = await app.addGarage({status : garageStatus.RUNNING_MANUAL});
    const garage = await app.models.Garage.findOne({});
    const req = {
      body: {
        garageIds: [testGarage.getId()],
      },
    };

    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, '../imports/data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );

    const send = (response) => {
      const testGarageId = testGarage.getId();
      expect(response.status).equal('ok');
      expect(response.pushes[testGarageId]).to.exist;
      expect(response.pushes[testGarage.id].garageId.toString()).equal(testGarage.id.toString());
      expect(response.pushes[testGarageId].name).equal(garage.publicDisplayName);
      expect(response.pushes[testGarageId].s3files).equal(undefined);
      expect(response.pushes[testGarageId].files.length).equal(1);
      expect(response.pushes[testGarageId].dataFiles.length).equal(1);
      expect(response.pushes[testGarageId].dataFiles[0]._id.toString()).equal(dataFileId.toString());
      expect(response.pushes[testGarageId].dataFiles[0].filePath).equal(path.join(__dirname, '../imports/data/cobrediamix1.txt'));
      expect(response.pushes[testGarageId].files[0].path).equal(response.pushes[testGarageId].dataFiles[0].filePath);
      expect(response.pushes[testGarageId].files[0].dataFile.id.toString()).equal(dataFileId.toString());
    }

    await campaigns.listPushes(app, req, { send, status: console.log });
  });
});
