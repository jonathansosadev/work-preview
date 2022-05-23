const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const UserAuthorization = require('../../common/models/user-autorization');
const app = new TestApp();

let User;
let Garage;
let CockpitTopFilter;
let sendQueryAndCheckCommonFields;
let user1 = Tools.random.user();
let user2 = Tools.random.user();
let garage1 = Tools.random.garage();
let garage2 = Tools.random.garage();

const query = `query cockpitTopFiltersGetCockpitFilters($source: String, $garageId: [String], $cockpitType: String, $type: String, $ticketType: String, $leadSaleType: String, $filterToFetch: String!) {
      cockpitTopFiltersGetCockpitFilters (source: $source, garageId: $garageId, cockpitType: $cockpitType, type: $type, ticketType: $ticketType, leadSaleType: $leadSaleType, filterToFetch: $filterToFetch){
          garageId
          garageType
          type
          source
          automationCampaignType
          frontDeskUserName {
            frontDeskUserName
            garageId
          }
          leadSaleType
          manager {
            name
            userId
          }
      }
    }`;

/* Get cockpit filters from api */
describe('apollo::cockpitTopFiltersGetCockpitFilters', async function descr() {
  before(async function () {
    await app.reset();
    User = app.models.User;
    Garage = app.models.Garage;
    CockpitTopFilter = app.models.CockpitTopFilter;
    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);

    user1.authorization = {};
    user1.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user1.garageIds = [garage1, garage2].map((o) => o.getId());
    user1 = await User.create(user1);
    user2 = await User.create(user2);

    const filterToFetch = [
      [
        ['garageId', garage2.getId()],
        ['frontDeskUserName', 'PAGE FRANCK'],
        ['garageType', 'Dealership'],
        ['automationCampaignType', 'test'],
      ],
      [
        ['garageId', garage1.getId()],
        ['frontDeskUserName', 'PAGE FRANCK'],
        ['garageType', 'Dealership'],
        ['automationCampaignType', 'test'],
      ],
      [
        ['garageId', garage2.getId()],
        ['frontDeskUserName', 'PAGE Tester'],
        ['garageType', 'Dealership'],
      ],
      [
        ['garageType', 'Agent'],
        ['garageId', garage1.getId()],
        ['unsatisfiedTicketManager', user2.getId()],
        ['type', 'Maintenance'],
        ['source', 'Agent'],
        ['automationCampaignType', 'check'],
      ],
      [
        ['leadSaleType', 'Unknown'],
        ['ticketType', 'lead'],
        ['garageId', garage2.getId()],
        ['leadTicketManager', user1.getId()],
      ],
      [
        ['leadSaleType', 'UsedVehicleSale'],
        ['garageId', garage2.getId()],
        ['frontDeskUserName', 'Plop User'],
        ['leadTicketManager', user1.getId()],
        ['garageType', 'Dealership'],
        ['source', 'Unknown'],
      ],
      [
        ['ticketType', 'unsatisfied'],
        ['unsatisfiedTicketManager', user1.getId()],
        ['garageId', garage1.getId()],
        ['garageType', 'CarRepairer'],
        ['type', 'UsedVehicleSale'],
        ['source', 'DataFile'],
        ['automationCampaignType', 'ok'],
      ],
    ];

    for (let index = 0; index < filterToFetch.length; index++) {
      const filterToInsert = Object.fromEntries(filterToFetch[index]);
      filterToInsert.index = filterToFetch[index].map(([k, v]) => ({ k, v }));

      await CockpitTopFilter.create(filterToInsert);
    }

    sendQueryAndCheckCommonFields = async (variablesApollo) => {
      const result = await sendQuery(app, query, variablesApollo, user1.id.toString());

      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').and.to.have.keys('cockpitTopFiltersGetCockpitFilters');
      expect(result.data.cockpitTopFiltersGetCockpitFilters)
        .to.be.an('object')
        .which.have.keys(
          'garageId',
          'type',
          'garageType',
          'source',
          'frontDeskUserName',
          'leadSaleType',
          'manager',
          'automationCampaignType'
        );
      return result;
    };
  });

  describe('get cockpit filters', () => {


    it('should return filters giving a frontDeskUserName filterToFetch with a list of garages', async () => {
      const variablesApollo = {
        garageId: [garage1.getId().toString(),garage2.getId().toString()],
        cockpitType: 'Dealership',
        filterToFetch: 'frontDeskUserName',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);
      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]).to.be.an('array').lengthOf(5);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.an('object').which.have.all.keys(variablesApollo.filterToFetch, 'garageId');
        expect(index.garageId).to.exist;
        expect(variablesApollo.garageId).to.includes(index.garageId);
      }
    });

    it('should return filters giving a frontDeskUserName filterToFetch with a a specific garageId', async () => {
      const variablesApollo = {
        garageId: [garage2.getId().toString()],
        cockpitType: 'Dealership',
        filterToFetch: 'frontDeskUserName',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);

      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(3);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.an('object').which.have.all.keys(variablesApollo.filterToFetch, 'garageId');
        expect(index.frontDeskUserName).to.exist;
        expect(index.garageId).to.exist;
      }
    });

    it('should return filters giving a type filterToFetch with a specific garageId', async () => {
      const variablesApollo = {
        garageId: [garage1.getId().toString()],
        filterToFetch: 'type',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);

      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(2);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.a('string').to.contain.oneOf(['Maintenance', 'UsedVehicleSale']);
      }
    });

    it('should return filters giving a source filterToFetch with a specific garageId', async () => {
      const variablesApollo = {
        garageId: [garage1.getId().toString()],
        filterToFetch: 'source',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);
      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(2);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.a('string').to.contain.oneOf(['DataFile', 'Agent']);
      }
    });

    it('should return filters giving a source filterToFetch', async () => {
      const variablesApollo = {
        filterToFetch: 'source',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);
      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(3);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.a('string').to.contain.oneOf(['DataFile', 'Agent', 'Unknown']);
      }
    });

    it('should return filters giving a manager filterToFetch', async () => {
      const variablesApollo = {
        filterToFetch: 'manager',
        ticketType: 'unsatisfied',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);

      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(2);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.an('object').which.have.all.keys('userId', 'name');
        expect(index.userId).to.exist;
        expect(index.name).to.exist;
      }
    });

    it('should return filters giving an automationCampaignType filterToFetch', async () => {
      const variablesApollo = {
        filterToFetch: 'automationCampaignType',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);

      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(3);
      for (const index of result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch]) {
        expect(index).to.be.a('string').to.contain.oneOf(['check', 'ok', 'test']);
      }
    });

    it('should return null or an empty array when a wrong type is supplied', async () => {
      const variablesApollo = {
        filterToFetch: 'type',
        type: 'plop',
      };

      const result = await sendQueryAndCheckCommonFields(variablesApollo);

      expect(result.data.cockpitTopFiltersGetCockpitFilters[variablesApollo.filterToFetch])
        .to.be.an('array')
        .lengthOf(0);
    });
  });

  describe('handling error cases', () => {
    it('should return an error when filterToFetch = manager and no ticketType is supplied', async () => {
      const variablesApollo = {
        filterToFetch: 'manager',
      };

      const result = await sendQuery(app, query, variablesApollo, user1.id.toString());

      expect(result.errors).to.be.an('array').lengthOf(1);
      expect(result.errors[0]).to.be.an('object').to.have.keys('message', 'locations', 'path', 'extensions');
      expect(result.errors[0].message).to.be.equal('No ticketType was supplied for manager');
      expect(result.data).to.be.an('object').and.to.have.keys('cockpitTopFiltersGetCockpitFilters');
      expect(result.data.cockpitTopFiltersGetCockpitFilters).to.be.null;
    });
  });
});
