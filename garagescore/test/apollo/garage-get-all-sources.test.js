const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const app = new TestApp();

const query = `query garageGetAllSources {
    garageGetAllSources {
        garageId
        garagePublicDisplayName
        type
        enabled
        phone
        email
        followed_phones
        followed_email
    }
}`;

const sources = [
  {
    enabled: true,
    email: 'lacentrale.111111666777888888@discuss.garagescore.com',
    phone: '0033352740000',
    type: 'LaCentrale',
    createdAt: new Date(),
    createdBy: '5c66c28a2d3a66001537e64a',
    followed_email: 'contact.test@massoutre-locations.com',
    followed_phones: ['+3367370000'],
  },
  {
    enabled: true,
    email: 'leboncoin.111111666777888888@discuss.garagescore.com',
    phone: '0033352740000',
    type: 'LeBonCoin',
    createdAt: new Date(),
    createdBy: '5c66c28a2d3a66001537e64a',
    followed_email: 'contact.test@massoutre-locations.com',
    followed_phones: ['+33626380000'],
  },
  {
    enabled: true,
    email: 'paruvendu.111111666777888888@discuss.garagescore.com',
    phone: '0033352740000',
    type: 'ParuVendu',
    createdAt: new Date(),
    createdBy: '5c66c28a2d3a66001537e64a',
    followed_email: 'contact.test@massoutre-locations.com',
    followed_phones: ['+3367370000'],
  },
];
let user = Tools.random.user();
let garage = Tools.random.garage();

/* Get all garages sources */
describe('garageGetAllSources', async function descr() {
  before(async function () {
    await app.reset();
    garage.crossLeadsConfig = {
      enabled: true,
      sources,
    };
    garage = await app.models.Garage.create(garage);
    user.garageIds = [garage.getId()];
    user = await app.addUser(user);
  });

  it('should return all sources', async () => {
    const { data, errors } = await sendQuery(app, query, {}, user.id.toString());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('garageGetAllSources');
    expect(data.garageGetAllSources).to.be.an('array').which.have.lengthOf(3);
    let index = 0;
    for (const source of data.garageGetAllSources) {
      expect(source)
        .to.be.an('object')
        .which.have.keys(
          'garageId',
          'garagePublicDisplayName',
          'type',
          'enabled',
          'phone',
          'email',
          'followed_phones',
          'followed_email'
        );
      expect(source.garageId).to.be.equal(garage.id.toString());
      expect(source.garagePublicDisplayName).to.be.equal(garage.publicDisplayName);
      expect(source.type).to.be.equal(sources[index].type);
      expect(source.enabled).to.be.true;
      expect(source.phone).to.be.equal(sources[index].phone);
      expect(source.followed_email).to.be.equal(sources[index].followed_email);
      expect(source.followed_phones).to.be.an('array').lengthOf(1);
      expect(source.followed_phones[0]).to.be.equal(sources[index].followed_phones[0]);
      index++;
    }
  });
  it('should return an error when the user has no garageIds', async () => {
    user = Tools.random.user();
    user = await app.addUser(user);
    const { errors, data } = await sendQuery(app, query, {}, user.id.toString());
    expect(errors).to.be.undefined;
    expect(data).to.be.an('object').which.have.keys('garageGetAllSources');
    expect(data.garageGetAllSources).to.be.null;
  });
});
