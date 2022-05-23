const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const app = new TestApp();

const query = `query garageGetB2CSiteIndex($locale: String!) {
    garageGetB2CSiteIndex(locale: $locale) {
            slug
            publicDisplayName
            type
            locale
    }
}`;

/* Get user data from api */
describe('garageGetB2CSiteIndex', async function descr() {
  let Garage;
  before(async function () {
    await app.reset();
    Garage = app.models.Garage;
    for (let index = 0; index < 20; index++) {
      const garage = Tools.random.garage();
      garage.hideDirectoryPage = false;
      garage.locale = 'fr_FR';
      await Garage.create(garage);
    }
    for (let index = 0; index < 20; index++) {
      const garage = Tools.random.garage();
      garage.hideDirectoryPage = false;
      garage.locale = 'es_ES';
      await Garage.create(garage);
    }
    for (let index = 0; index < 20; index++) {
      const garage = Tools.random.garage();
      garage.hideDirectoryPage = false;
      garage.locale = 'en_US';
      await Garage.create(garage);
    }
  });

  describe('get B2C site index', () => {
    const randomGarageResult = Math.round(Math.random() * 19);
    it('should return only the garages with locale = fr_FR', async () => {
      const variablesApollo = {
        locale: 'fr_FR',
      };
      const garages = await sendQuery(app, query, variablesApollo);
      expect(garages.errors).to.be.undefined;
      expect(garages.data).to.be.an('object').which.have.keys('garageGetB2CSiteIndex');
      expect(garages.data.garageGetB2CSiteIndex).to.be.an('array').which.have.lengthOf(20);
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult])
        .to.be.an('object')
        .which.have.keys('slug', 'publicDisplayName', 'type', 'locale');
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult].locale).equal('fr_FR');
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult].type).equal('Dealership');
    });
    it('should return only the garages with locale = es_ES', async () => {
      const variablesApollo = {
        locale: 'es_ES',
      };
      const garages = await sendQuery(app, query, variablesApollo);
      expect(garages.errors).to.be.undefined;
      expect(garages.data).to.be.an('object').which.have.keys('garageGetB2CSiteIndex');
      expect(garages.data.garageGetB2CSiteIndex).to.be.an('array').which.have.lengthOf(20);
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult])
        .to.be.an('object')
        .which.have.keys('slug', 'publicDisplayName', 'type', 'locale');
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult].locale).equal('es_ES');
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult].type).equal('Dealership');
    });
    it('should return only the garages with locale = en_US', async () => {
      const variablesApollo = {
        locale: 'en_US',
      };
      const garages = await sendQuery(app, query, variablesApollo);
      expect(garages.errors).to.be.undefined;
      expect(garages.data).to.be.an('object').which.have.keys('garageGetB2CSiteIndex');
      expect(garages.data.garageGetB2CSiteIndex).to.be.an('array').which.have.lengthOf(20);
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult])
        .to.be.an('object')
        .which.have.keys('slug', 'publicDisplayName', 'type', 'locale');
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult].locale).equal('en_US');
      expect(garages.data.garageGetB2CSiteIndex[randomGarageResult].type).equal('Dealership');
    });
  });
});
