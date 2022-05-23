const chai = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../../common/lib/test/test-app');
const { GaragesTest, ExternalApi } = require('../../../frontend/utils/enumV2');
const exportLeadsToApi = require('../../../workers/jobs/scripts/export-leads-to-api');
const dataWithLeadTicket = require('../../apollo/examples/data-with-lead-ticket');

const expect = chai.expect;
const app = new TestApp();

describe('export-leads-to-mbparis', () => {
  beforeEach(async function () {
    await app.reset();
  });
  it('Send lead to mbparis correctly with fake result', async () => {
    // connect directly without models
    const time = new Date().getTime();
    await Promise.all([
      app.models.Data.getMongoConnector().insertOne({ ...dataWithLeadTicket }),
      app.models.Garage.getMongoConnector().insertOne({
        _id: ObjectId(GaragesTest.GARAGE_DUPONT),
        daimler: { enabled: true, name: 'MBParis', urlApi: 'mbf-import@cmlead.daimler.com' },
      }),
      app.models.Job.getMongoConnector().insertOne({
        type: 'EXTERNAL_API',
        scheduledAt: time,
        payload: {
          dataId: dataWithLeadTicket._id,
          garageId: GaragesTest.GARAGE_DUPONT,
          externalApi: ExternalApi.DAIMLER,
        },
      }),
    ]);

    const job = await app.models.Job.getMongoConnector().findOne({ scheduledAt: time });
    await exportLeadsToApi(job);
    const expectData = await app.models.Data.getMongoConnector().findOne({ _id: dataWithLeadTicket._id });

    expect(expectData.leadExports.daimler.isRequestSuccess).equal(true);
  });
});
