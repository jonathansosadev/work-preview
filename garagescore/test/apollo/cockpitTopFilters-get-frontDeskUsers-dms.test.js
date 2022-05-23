const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const UserAuthorization = require('../../common/models/user-autorization');
const { DataTypes } = require('../../frontend/utils/enumV2');
const { GLOBAL } = require('../../server/webservers-standalones/api/schema/cockpitTopFilters-get-frontDeskUsers-dms');

const app = new TestApp();

const query = `query cockpitTopFiltersGetFrontDeskUsersDms( $dataTypes: [String!]!, $garageIds: [String!]!) {
      cockpitTopFiltersGetFrontDeskUsersDms (dataTypes: $dataTypes, garageIds: $garageIds){
          id
          frontDeskUserName
          garageId
      }
    }`;

const formatTestCase = (doc) => {
  return { id: doc.frontDeskUserName, frontDeskUserName: doc.frontDeskUserName, garageId: doc.garageId };
};

/* Get cockpit filters from api */
describe('apollo::cockpitTopFiltersGetFrontDeskUsersDms', async () => {
  let Global = {};

  beforeEach(async function () {
    await app.reset();
    //reset query cache
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
    };
    Global.User = app.models.User;
    Global.Garage = app.models.Garage;
    Global.CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
    Global.garage1 = await Global.Garage.create(Global.garage1);
    Global.garage2 = await Global.Garage.create(Global.garage2);

    Global.user1.authorization = {};
    Global.user1.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    Global.user1.garageIds = [Global.garage1, Global.garage2].map((o) => o.getId());
    Global.user1 = await Global.User.create(Global.user1);

    Global.user2.authorization = {};
    Global.user2.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    Global.user2.garageIds = [Global.garage2.getId()];
    Global.user2 = await Global.User.create(Global.user2);
  });

  it('should return all DMS', async () => {
    const variablesApollo = {
      garageIds: [Global.garage1.getId().toString()],
      dataTypes: ['All'],
    };

    const testCase = [
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO',
      },
    ];
    await Global.CockpitTopFilter.insertMany(testCase);

    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const result = queryResult.data.cockpitTopFiltersGetFrontDeskUsersDms;
    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(2);
    expect(result).to.have.deep.members(testCase.map(formatTestCase));
  });

  it('should only get the DMS for one dataType and one garage', async () => {
    const variablesApollo = {
      garageIds: [Global.garage2.getId().toString()],
      dataTypes: [DataTypes.MAINTENANCE],
    };
    await Global.CockpitTopFilter.insertMany([
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
      {
        garageId: Global.garage2.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO',
      },
      {
        garageId: Global.garage2.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO_2',
      },
    ]);
    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const result = queryResult.data.cockpitTopFiltersGetFrontDeskUsersDms;
    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(1);
    expect(result[0].id).to.equal('SUPER_TOTO');
  });

  it('should only get the DMS for the requested multiples dataTypes and one garage', async () => {
    const variablesApollo = {
      garageIds: [Global.garage1.getId().toString()],
      dataTypes: [DataTypes.MAINTENANCE, DataTypes.USED_VEHICLE_SALE],
    };

    const testCase = [
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO',
      },
      {
        garageId: Global.garage2.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO_2',
      },
    ];
    await Global.CockpitTopFilter.insertMany(testCase);
    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const result = queryResult.data.cockpitTopFiltersGetFrontDeskUsersDms;
    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(2);
    expect(result).to.have.deep.members([testCase[0], testCase[1]].map(formatTestCase));
  });

  it('should only get the DMS for the requested multiples dataTypes and multiples garages', async () => {
    const variablesApollo = {
      garageIds: [Global.garage1.getId().toString(), Global.garage2.getId().toString()],
      dataTypes: [DataTypes.MAINTENANCE, DataTypes.USED_VEHICLE_SALE],
    };

    const testCase = [
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO',
      },
      {
        garageId: Global.garage2.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO_2',
      },
      {
        garageId: Global.garage2.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.NEW_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'SUPER_TOTO_3',
      },
    ];
    await Global.CockpitTopFilter.insertMany(testCase);
    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const result = queryResult.data.cockpitTopFiltersGetFrontDeskUsersDms;
    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(3);
    expect(result).to.have.deep.members([testCase[0], testCase[1], testCase[2]].map(formatTestCase));
  });

  it('Should not return duplicates DMS for the same Garage', async () => {
    const variablesApollo = {
      garageIds: [Global.garage1.getId().toString(), Global.garage2.getId().toString()],
      dataTypes: ['All'],
    };

    const testCase = [
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.USED_VEHICLE_SALE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
      {
        garageId: Global.garage2.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
      // considered as duplicate
      {
        garageId: Global.garage1.getId().toString(),
        garageType: 'Dealership',
        type: DataTypes.MAINTENANCE,
        source: 'DataFile',
        frontDeskUserName: 'TOTO',
      },
    ];
    await Global.CockpitTopFilter.insertMany(testCase);
    const queryResult = await sendQuery(app, query, variablesApollo, Global.user1.id.toString());
    const result = queryResult.data.cockpitTopFiltersGetFrontDeskUsersDms;
    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(2);
    expect(result).to.have.deep.members([testCase[0], testCase[1]].map(formatTestCase));
  });
});
