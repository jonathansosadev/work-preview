const chai = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../../common/lib/test/test-app');
const { GaragesTest, ExternalApi } = require('../../../frontend/utils/enumV2');
const exportLeadsToApi = require('../../../workers/jobs/scripts/export-leads-to-api');
const dataWithLeadTicket = require('../../apollo/examples/data-with-lead-ticket');

const expect = chai.expect;
const app = new TestApp();

describe('export-leads-to-selectup', () => {
  beforeEach(async function () {
    await app.reset();
  });
  it('Send lead to Selectup correctly with fake result', async () => {
    // connect directly without models
    const db = app.models.Data.dataSource.connector.db;
    const time = new Date().getTime();
    await Promise.all([
      app.models.Data.getMongoConnector().insertOne({ ...dataWithLeadTicket }),
      app.models.Garage.getMongoConnector().insertOne({
        _id: ObjectId(GaragesTest.GARAGE_DUPONT),
        selectup: { enabled: true },
      }),
      app.models.Job.getMongoConnector().insertOne({
        type: 'EXTERNAL_API',
        scheduledAt: time,
        payload: {
          dataId: dataWithLeadTicket._id,
          garageId: GaragesTest.GARAGE_DUPONT,
          externalApi: ExternalApi.SELECTUP,
        },
      }),
      db.collection('configurations').insertOne({
        reserved_field_name: 'ExportLeads',
        exportLeads: [
          {
            name: 'SelectUp',
            apiUrl: 'http://wsimport2.e-seller.selectup.com/?WSDL&WSImportCRM.asmx?op=CreeLead2',
            garages: {
              '577a30d774616c1a0056c263': [
                {
                  enabled: true,
                  query: { source: 'DataFile', leadType: 'UsedVehicleSale' },
                  exportedValues: { family: "Centre d'Appels", subFamily: 'GarageScore', emailAlerts: true },
                },
              ],
            },
          },
        ],
      }),
    ]);

    const job = await app.models.Job.getMongoConnector().findOne({ scheduledAt: time });
    await exportLeadsToApi(job);
    const expectData = await app.models.Data.getMongoConnector().findOne({ _id: dataWithLeadTicket._id });

    expect(expectData.leadExports.selectup.isRequestSuccess).equal(true);
  });
});
