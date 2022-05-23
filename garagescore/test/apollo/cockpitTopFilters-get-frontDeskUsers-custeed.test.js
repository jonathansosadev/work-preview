const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const UserAuthorization = require('../../common/models/user-autorization');
const { DataTypes, LeadSaleTypes } = require('../../frontend/utils/enumV2');
const {
  GLOBAL,
} = require('../../server/webservers-standalones/api/schema/cockpitTopFilters-get-frontDeskUsers-custeed');
const { expect } = require('chai');

const app = new TestApp();

const query = `query cockpitTopFiltersGetFrontDeskUsersCusteed($dataTypes: [String!]!,$garageIds: [String!]!) {
  cockpitTopFiltersGetFrontDeskUsersCusteed (dataTypes: $dataTypes, garageIds: $garageIds){
      id
      frontDeskUserName
      garageId
      garagePublicDisplayName
  }
}`;

describe('apollo::cockpitTopFiltersGetFrontDeskUsersCusteed', async () => {
  let Global = {};

  beforeEach(async function () {
    await app.reset();

    /* reset the query cache */
    GLOBAL.cache.reset();
    GLOBAL.cacheHasBeenSet = false;

    Global = {
      User: null,
      Garage: null,
      CockpitTopFilter: null,
      user1: Tools.random.user(),
      user2: Tools.random.user(),
      garage1: Tools.random.garage(),
      garage2: Tools.random.garage(),
      garage3: Tools.random.garage(),
    };
    Global.User = app.models.User;
    Global.Garage = app.models.Garage;
    Global.CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
    Global.garage1 = await Global.Garage.create(Global.garage1);
    Global.garage2 = await Global.Garage.create(Global.garage2);
    Global.garage3 = await Global.Garage.create(Global.garage3);

    Global.user1.authorization = {};
    Global.user1.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    Global.user1.garageIds = [Global.garage1, Global.garage2].map((o) => o.getId());
    Global.user1 = await Global.User.create(Global.user1);

    Global.user2.authorization = {};
    Global.user2.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    Global.user2.garageIds = [Global.garage1, Global.garage2].map((o) => o.getId());
    Global.user2.job = 'Commercial VN';
    Global.user2 = await Global.User.create(Global.user2);

    /* set the user2 Job as non manager */
    await app.models.UserJob.getMongoConnector().insertOne({
      name: Global.user2.job,
      isManager: false,
    });

    // insert data in cockpitTopFilters
    Global.baseTestCases = [
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        leadSaleType: LeadSaleTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        leadTicketManager: Global.user1.getId().toString(),
      },
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        leadSaleType: LeadSaleTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        leadTicketManager: Global.user1.getId().toString(),
      },
    ];
    await Global.CockpitTopFilter.insertMany(Global.baseTestCases);
  });

  it('should return an error if the dataTypes are empty or missing ', async () => {
    const variablesApollo = {
      garageIds: ['All'],
    };

    const queryResultMissing = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    expect(queryResultMissing).to.have.property('errors');
    expect(queryResultMissing.errors).to.not.be.empty;

    variablesApollo.dataTypes = [];
    const queryResultEmpty = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    expect(queryResultEmpty).to.have.property('errors');
    expect(queryResultEmpty.errors).to.not.be.empty;
  });

  it('should return an error if the dataTypes contains invalid elements ', async () => {
    const variablesApollo = {
      garageIds: ['All'],
      dataTypes: ['TOTO'],
    };

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    expect(queryResult).to.have.property('errors');
    expect(queryResult.errors).to.not.be.empty;
  });

  it('should return an error if the garageIds are empty or missing ', async () => {
    const variablesApollo = {
      dataTypes: ['All'],
    };

    const queryResultMissing = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    expect(queryResultMissing).to.have.property('errors');
    expect(queryResultMissing.errors).to.not.be.empty;

    variablesApollo.garageIds = [];
    const queryResultEmpty = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    expect(queryResultEmpty).to.have.property('errors');
    expect(queryResultEmpty.errors).to.not.be.empty;
  });

  it('should return an error if the garageIds contains invalid elements ', async () => {
    const variablesApollo = {
      garageIds: ['TOTO'],
      dataTypes: ['All'],
    };

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    expect(queryResult).to.have.property('errors');
    expect(queryResult.errors).to.not.be.empty;
  });

  it('should not return duplicates frontDesk ', async () => {
    const variablesApollo = {
      garageIds: ['All'],
      dataTypes: ['All'],
    };

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const res = queryResult.data.cockpitTopFiltersGetFrontDeskUsersCusteed;
    expect(res).to.have.lengthOf(1);
    expect(res[0].id.toString()).to.equal(Global.baseTestCases[0].leadTicketManager);
    expect(res[0].garageId.toString()).to.equal(Global.baseTestCases[0].garageId);
  });

  it('should filter by leadSaleType', async () => {
    const variablesApollo = {
      garageIds: ['All'],
      dataTypes: [LeadSaleTypes.USED_VEHICLE_SALE],
    };
    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const res = queryResult.data.cockpitTopFiltersGetFrontDeskUsersCusteed;

    expect(res).to.have.lengthOf(1);
    expect(res[0].id.toString()).to.equal(Global.baseTestCases[1].leadTicketManager);
    expect(res[0].garageId.toString()).to.equal(Global.baseTestCases[1].garageId);
  });

  it('should filter by GarageId', async () => {
    const variablesApollo = {
      garageIds: [Global.garage2.getId().toString()],
      dataTypes: ['All'],
    };

    await Global.CockpitTopFilter.insertOne({
      garageId: Global.garage2.getId().toString(),
      garageType: 'Dealership',
      type: DataTypes.MAINTENANCE,
      leadSaleType: LeadSaleTypes.USED_VEHICLE_SALE,
      source: 'DataFile',
      leadTicketManager: Global.user1.getId().toString(),
    });

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const res = queryResult.data.cockpitTopFiltersGetFrontDeskUsersCusteed;

    expect(res).to.have.lengthOf(1);
    expect(res[0].id.toString()).to.equal(Global.user1.id.toString());
    expect(res[0].garageId.toString()).to.equal(Global.garage2.getId().toString());
  });

  it('should only sent garages that the users has', async () => {
    const variablesApollo = {
      garageIds: ['All'],
      dataTypes: ['All'],
    };

    /* the user1 doesn't have the garage3 */
    await Global.CockpitTopFilter.insertOne({
      garageId: Global.garage3.getId().toString(),
      garageType: 'Dealership',
      type: DataTypes.MAINTENANCE,
      leadSaleType: LeadSaleTypes.USED_VEHICLE_SALE,
      source: 'DataFile',
      leadTicketManager: Global.user1.getId().toString(),
    });

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const res = queryResult.data.cockpitTopFiltersGetFrontDeskUsersCusteed;

    expect(res).to.have.lengthOf(1);
    expect(res[0].id.toString()).to.equal(Global.user1.id.toString());
    expect(res[0].garageId.toString()).to.not.equal(Global.garage3.getId().toString());
  });

  it('A user that is not a manager should see only the ones assigned to him', async () => {
    const variablesApollo = {
      garageIds: ['All'],
      dataTypes: ['All'],
    };

    /* it should be the only one the non manager user sees */
    await Global.CockpitTopFilter.insertOne({
      garageId: Global.garage1.getId().toString(),
      garageType: 'Dealership',
      type: DataTypes.MAINTENANCE,
      leadSaleType: LeadSaleTypes.USED_VEHICLE_SALE,
      source: 'DataFile',
      leadTicketManager: Global.user2.getId().toString(),
    });

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user2.id.toString());
    const res = queryResult.data.cockpitTopFiltersGetFrontDeskUsersCusteed;

    expect(res).to.have.lengthOf(1);
    expect(res[0].id.toString()).to.equal(Global.user2.getId().toString());
    expect(res[0].garageId.toString()).to.equal(Global.garage1.getId().toString());
  });
});
