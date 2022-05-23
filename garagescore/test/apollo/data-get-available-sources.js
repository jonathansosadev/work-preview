const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const SourceTypes = require('../../common/models/data/type/source-types');
const DataTypes = require('../../common/models/data/type/data-types');
const _sendQueryAs = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('Data get available sources (dataGetAvailableSources)', () => {
  const request = `query dataGetAvailableSources($garageId: [String], $leadSaleType: String) {
    dataGetAvailableSources(garageId: $garageId, leadSaleType: $leadSaleType) {
      sources
    }
  }`;
  const generateRandomLeadTickets = async (N, garage, sourceTypes) => {
    const leadTickets = Array.from(Array(N)).map((e, i) => {
      const sourceType = sourceTypes[i % sourceTypes.length];
      return {
        garageId: garage.getId(),
        source: { type: sourceType },
      };
    });
    await testApp.models.DatasAsyncviewLeadTicket.getMongoConnector().insertMany(leadTickets);
  };
  beforeEach(async function () {
    await testApp.reset();
  });
  it('Gets sources for one garage', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const sourcesToCreate = [SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.MOTOR_SHOW, 'CustomSource'];
    await generateRandomLeadTickets(1000, testGarage, sourcesToCreate);

    const variables = {
      leadSaleType: DataTypes.NEW_VEHICLE_SALE,
      garageId: [testGarage.getId()]
    };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    const expectedSources = [
      SourceTypes.GOOGLE,
      SourceTypes.FACEBOOK,
      SourceTypes.OCCASIONAL_CUSTOMER,
      SourceTypes.MOTOR_SHOW,
      SourceTypes.OPEN_DAYS,
      SourceTypes.MANUFACTURER,
      SourceTypes.GROUP_WEBSITE,
      SourceTypes.CHAT,
      SourceTypes.CALL_CENTER,
      SourceTypes.L_ARGUS_REPRISE,
      SourceTypes.FACEBOOK_MARKETPLACE,
      'CustomSource',
    ];
    expect(res.data.dataGetAvailableSources.sources).to.be.an('Array').and.to.have.lengthOf(12);
    expect(res.data.dataGetAvailableSources.sources).to.includes.all(...expectedSources);
  });

  it('Gets sources for a list of garages', async () => {
    const testGarage = await testApp.addGarage();
    const testGarage2 = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    await user.addGarage(testGarage2);
    const sourcesToCreate = [SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.MOTOR_SHOW, 'CustomSource'];
    await generateRandomLeadTickets(1000, testGarage, sourcesToCreate);
    await generateRandomLeadTickets(1000, testGarage2, sourcesToCreate);

    const variables = {
      leadSaleType: DataTypes.NEW_VEHICLE_SALE,
      garageId: [testGarage.getId(),testGarage2.getId()]
    };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    const expectedSources = [
      SourceTypes.GOOGLE,
      SourceTypes.FACEBOOK,
      SourceTypes.OCCASIONAL_CUSTOMER,
      SourceTypes.MOTOR_SHOW,
      SourceTypes.OPEN_DAYS,
      SourceTypes.MANUFACTURER,
      SourceTypes.GROUP_WEBSITE,
      SourceTypes.CHAT,
      SourceTypes.CALL_CENTER,
      SourceTypes.L_ARGUS_REPRISE,
      SourceTypes.FACEBOOK_MARKETPLACE,
      'CustomSource',
    ];
    expect(res.data.dataGetAvailableSources.sources).to.be.an('Array').and.to.have.lengthOf(12);
    expect(res.data.dataGetAvailableSources.sources).to.includes.all(...expectedSources);
  });

  it('Gets sources for a user (not a god one)', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const sourcesToCreate = [SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.MOTOR_SHOW, 'CustomSource'];
    await generateRandomLeadTickets(1000, testGarage, sourcesToCreate);

    const variables = { leadSaleType: DataTypes.NEW_VEHICLE_SALE };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    const expectedSources = [
      SourceTypes.GOOGLE,
      SourceTypes.FACEBOOK,
      SourceTypes.OCCASIONAL_CUSTOMER,
      SourceTypes.MOTOR_SHOW,
      SourceTypes.OPEN_DAYS,
      SourceTypes.MANUFACTURER,
      SourceTypes.GROUP_WEBSITE,
      SourceTypes.CHAT,
      SourceTypes.CALL_CENTER,
      SourceTypes.L_ARGUS_REPRISE,
      SourceTypes.FACEBOOK_MARKETPLACE,
      'CustomSource',
    ];
    expect(res.data.dataGetAvailableSources.sources).to.be.an('Array').and.to.have.lengthOf(12);
    expect(res.data.dataGetAvailableSources.sources).to.includes.all(...expectedSources);
  });
  it('Gets sources that apply to the selected leadSaleType', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const sourcesToCreate = [SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.MOTOR_SHOW, 'CustomSource'];
    await generateRandomLeadTickets(1000, testGarage, sourcesToCreate);

    const variables = { leadSaleType: DataTypes.MAINTENANCE };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    const expectedSources = [
      SourceTypes.GOOGLE,
      SourceTypes.FACEBOOK,
      SourceTypes.OCCASIONAL_CUSTOMER,
      SourceTypes.MANUFACTURER,
      SourceTypes.GROUP_WEBSITE,
      SourceTypes.CHAT,
      SourceTypes.CALL_CENTER,
      'CustomSource',
    ];
    expect(res.data.dataGetAvailableSources.sources).to.be.an('Array').and.to.have.lengthOf(8);
    expect(res.data.dataGetAvailableSources.sources).to.includes.all(...expectedSources);
  });
  it('Gets sources only cvustom sources if requested to do so', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);
    const sourcesToCreate = [SourceTypes.DATAFILE, SourceTypes.GOOGLE, 'CustomSource 1', 'Custom source 2'];
    await generateRandomLeadTickets(1000, testGarage, sourcesToCreate);

    const variables = { customSourcesOnly: true };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);

    const expectedSources = ['CustomSource 1', 'Custom source 2'];
    expect(res.data.dataGetAvailableSources.sources).to.be.an('Array').and.to.have.lengthOf(2);
    expect(res.data.dataGetAvailableSources.sources).to.includes.all(...expectedSources);
  });
});
