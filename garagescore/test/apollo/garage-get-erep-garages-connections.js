const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');

const app = new TestApp();

const query = `query ErepConnections($cockpitType: String!, $garageId: [String]) {
    ErepConnections(cockpitType: $cockpitType, garageId: $garageId) {
        totalGarages
        sources {
        name
        countConnectedGarages
        connectedGarages
      }
  }
}`;

const queryAllGarages = `query ErepConnections($cockpitType: String!, $garageId: [String]) {
    ErepConnections(cockpitType: $cockpitType, garageId: $garageId) {
      garages {
        garageId
        garagePublicDisplayName
        hasSubscription
        connectedSources {
          name
          externalId
        }
      }
  }
}`;

async function createGaragesWithOrWithoutSources(Garage, user1) {
  for (let index = 0; index < 10; index++) {
    const garage = Tools.random.garage();
    garage.type = 'Dealership';
    garage.subscriptions = {
      active: true,
      EReputation: {
        enabled: true,
      },
    };
    garage.exogenousReviewsConfigurations = {
      Google: {
        token: '1bdshvsdj3863',
        externalId: 'VIGKJGYKGBbkdsjhflsj',
      },
    };
    const grg = await Garage.create(garage);
    user1.garageIds.push(grg.getId().toString());
  }

  for (let index = 0; index < 10; index++) {
    const garage = Tools.random.garage();
    garage.type = 'Dealership';
    garage.subscriptions = {
      active: true,
      EReputation: {
        enabled: true,
      },
    };
    garage.exogenousReviewsConfigurations = {
      Facebook: {
        token: '1bdshvsdj3863',
        externalId: 'VIGKJGYKGBbkdsjhflsj',
      },
    };
    const grg = await Garage.create(garage);
    user1.garageIds.push(grg.getId().toString());
  }

  for (let index = 0; index < 10; index++) {
    const garage = Tools.random.garage();
    garage.type = 'Dealership';
    garage.subscriptions = {
      active: true,
      EReputation: {
        enabled: true,
      },
    };
    garage.exogenousReviewsConfigurations = {
      PagesJaunes: {
        token: '1bdshvsdj3863',
        externalId: 'VIGKJGYKGBbkdsjhflsj',
      },
    };
    const grg = await Garage.create(garage);
    user1.garageIds.push(grg.getId().toString());
  }

  for (let index = 0; index < 5; index++) {
    const garage = Tools.random.garage();
    garage.type = 'Dealership';
    garage.subscriptions = {
      active: true,
      EReputation: {
        enabled: true,
      },
    };
    const grg = await Garage.create(garage);
    user1.garageIds.push(grg.getId().toString());
  }
}
/* Get garage erep garages connections from api */
describe('ErepConnections', async function descr() {
  let User;
  let Garage;
  let user1 = Tools.random.user();
  before(async function () {
    await app.reset();
    User = app.models.User;
    user1.garageIds = [];
    Garage = app.models.Garage;
    await createGaragesWithOrWithoutSources(Garage, user1);
    user1 = await User.create(user1);
  });

  describe('get garages erep connections', () => {
    it('should return 30 garages with 10 garages by sources', async () => {
      const variablesApollo = {
        cockpitType: 'Dealership',
      };
      const garagesConnections = await sendQuery(app, query, variablesApollo, user1.id.toString());
      expect(garagesConnections.errors, garagesConnections.errors).to.be.undefined;
      expect(garagesConnections.data).to.be.an('object').which.have.keys('ErepConnections');
      expect(garagesConnections.data.ErepConnections).to.be.an('object').which.have.keys('totalGarages', 'sources');
      expect(garagesConnections.data.ErepConnections.totalGarages).to.be.equal(35);
      expect(garagesConnections.data.ErepConnections.sources).to.be.an('array').lengthOf(3);
      expect(garagesConnections.data.ErepConnections.sources[0])
        .to.be.an('object')
        .which.have.keys('name', 'countConnectedGarages', 'connectedGarages');
      expect(garagesConnections.data.ErepConnections.sources[0].name).to.be.equal('Google');
      expect(garagesConnections.data.ErepConnections.sources[0].countConnectedGarages).to.be.equal(10);
      expect(garagesConnections.data.ErepConnections.sources[1])
        .to.be.an('object')
        .which.have.keys('name', 'countConnectedGarages', 'connectedGarages');
      expect(garagesConnections.data.ErepConnections.sources[1].name).to.be.equal('Facebook');
      expect(garagesConnections.data.ErepConnections.sources[1].countConnectedGarages).to.be.equal(10);
      expect(garagesConnections.data.ErepConnections.sources[2])
        .to.be.an('object')
        .which.have.keys('name', 'countConnectedGarages', 'connectedGarages');
      expect(garagesConnections.data.ErepConnections.sources[2].name).to.be.equal('PagesJaunes');
      expect(garagesConnections.data.ErepConnections.sources[2].countConnectedGarages).to.be.equal(10);
    });

    it('should return all garages', async () => {
      const variablesApollo = {
        cockpitType: 'Dealership',
      };

      const garagesConnections = await sendQuery(app, queryAllGarages, variablesApollo, user1.id.toString());
      const garagesWithoutSources = garagesConnections.data.ErepConnections.garages.filter(
        (g) => g.connectedSources.length < 1
      );

      expect(garagesConnections.errors).to.be.undefined;
      expect(garagesConnections.data).to.be.an('object').which.have.keys('ErepConnections');
      expect(garagesConnections.data.ErepConnections).to.be.an('object').which.have.keys('garages');
      expect(garagesConnections.data.ErepConnections.garages).to.be.an('array').lengthOf(35);
      expect(garagesWithoutSources.length).to.be.equal(5);
    });

    it('should return only one garage', async () => {
      const variablesApollo = {
        cockpitType: 'Dealership',
        garageId: [user1.garageIds[0]]
      };
      const garagesConnections = await sendQuery(app, queryAllGarages, variablesApollo, user1.id.toString());
      expect(garagesConnections.errors).to.be.undefined;
      expect(garagesConnections.data).to.be.an('object').which.have.keys('ErepConnections');
      expect(garagesConnections.data.ErepConnections).to.be.an('object').which.have.keys('garages');
      expect(garagesConnections.data.ErepConnections.garages).to.be.an('array').lengthOf(1);
    });

    it('should return 2 garages from list', async () => {
      const variablesApollo = {
        cockpitType: 'Dealership',
        garageId: [user1.garageIds[0],user1.garageIds[2]]
      };
      const garagesConnections = await sendQuery(app, queryAllGarages, variablesApollo, user1.id.toString());
      expect(garagesConnections.errors).to.be.undefined;
      expect(garagesConnections.data).to.be.an('object').which.have.keys('ErepConnections');
      expect(garagesConnections.data.ErepConnections).to.be.an('object').which.have.keys('garages');
      expect(garagesConnections.data.ErepConnections.garages).to.be.an('array').lengthOf(2);
    });
  });
});
