const { expect } = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const testApp = new TestApp();

const request = `
    mutation garageSetSource($type: String!, $garageId: String!, $followed_phones: [String!]!, $followed_email: String!) {
        garageSetSource(type: $type, garageId: $garageId, followed_phones: $followed_phones, followed_email: $followed_email) {
        enabled
        garageId
        garagePublicDisplayName
        type
        phone
        email
        followed_phones
        followed_email
        }
    }
    `;

/* Get garage data from api */
describe('apollo::garageSetSource', () => {
  let user;
  let garage;
  before(async function () {
    await testApp.reset();
    garage = await testApp.addGarage({
      crossLeadsConfig: {
        enabled: true,
      },
    });
    user = await testApp.addUser({
      garageIds: [ObjectId(garage.id)],
    });

    await testApp.models.PhoneBucket.add('0033188336533');
  });

  describe('set or update a source', () => {
    it('should add crossleads source laCentrale', async () => {
      const variables = {
        type: 'LaCentrale',
        followed_email: 'test@email.com',
        garageId: garage.id.toString(),
        followed_phones: ['+33786799099'],
      };

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource)
        .to.be.an('object')
        .which.have.keys(
          'enabled',
          'garageId',
          'garagePublicDisplayName',
          'type',
          'phone',
          'followed_phones',
          'followed_email',
          'email'
        );
      expect(res.data.garageSetSource.enabled).to.be.true;
      expect(res.data.garageSetSource.garageId).to.be.equal(garage.id.toString());
      expect(res.data.garageSetSource.garagePublicDisplayName).to.be.equal('Garagescore');
      expect(res.data.garageSetSource.type).to.be.equal(variables.type);
      expect(res.data.garageSetSource.phone).to.be.equal('0033188336533');
      expect(res.data.garageSetSource.email).to.exist;
      expect(res.data.garageSetSource.followed_email).to.be.equal(variables.followed_email);
      expect(res.data.garageSetSource.followed_phones).to.be.an('array').lengthOf(variables.followed_phones.length);
      expect(res.data.garageSetSource.followed_phones[0]).to.be.equal(variables.followed_phones[0]);
    });
    it('should update a source', async () => {
      const variables = {
        type: 'LaCentrale',
        followed_email: `plop@email.com`,
        garageId: garage.id.toString(),
        followed_phones: ['+33786799099'],
      };

      const allGarageBeforeUpdate = await testApp.models.Garage.getMongoConnector().find({}).toArray();
      expect(allGarageBeforeUpdate).to.be.an('array').lengthOf(1);
      expect(allGarageBeforeUpdate[0]).to.be.an('object').which.include.all.keys('crossLeadsConfig');
      expect(allGarageBeforeUpdate[0].crossLeadsConfig).to.be.an('object').which.include.all.keys('sources');
      expect(allGarageBeforeUpdate[0].crossLeadsConfig.sources).to.be.an('array').lengthOf(1);
      expect(allGarageBeforeUpdate[0].crossLeadsConfig.sources[0])
        .to.be.an('object')
        .which.include.all.keys('enabled', 'type', 'phone', 'followed_phones', 'followed_email', 'email');
      expect(allGarageBeforeUpdate[0].crossLeadsConfig.sources[0].followed_email).to.be.equal('test@email.com');

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource)
        .to.be.an('object')
        .which.have.keys(
          'enabled',
          'garageId',
          'garagePublicDisplayName',
          'type',
          'phone',
          'followed_phones',
          'followed_email',
          'email'
        );
      expect(res.data.garageSetSource.enabled).to.be.true;
      expect(res.data.garageSetSource.garageId).to.be.equal(garage.id.toString());
      expect(res.data.garageSetSource.garagePublicDisplayName).to.be.equal('Garagescore');
      expect(res.data.garageSetSource.type).to.be.equal(variables.type);
      expect(res.data.garageSetSource.phone).to.be.equal('0033188336533');
      expect(res.data.garageSetSource.email).to.exist;
      expect(res.data.garageSetSource.followed_email).to.be.equal(variables.followed_email);
      expect(res.data.garageSetSource.followed_phones).to.be.an('array').lengthOf(variables.followed_phones.length);
      expect(res.data.garageSetSource.followed_phones[0]).to.be.equal(variables.followed_phones[0]);

      const allGarage = await testApp.models.Garage.getMongoConnector().find({}).toArray();
      expect(allGarage).to.be.an('array').lengthOf(1);
      expect(allGarage[0]).to.be.an('object').which.include.all.keys('crossLeadsConfig');
      expect(allGarage[0].crossLeadsConfig).to.be.an('object').which.include.all.keys('sources');
      expect(allGarage[0].crossLeadsConfig.sources).to.be.an('array').lengthOf(1);
      expect(allGarage[0].crossLeadsConfig.sources[0])
        .to.be.an('object')
        .which.include.all.keys('enabled', 'type', 'phone', 'followed_phones', 'followed_email', 'email');
      expect(allGarage[0].crossLeadsConfig.sources[0].followed_email).to.be.equal(variables.followed_email);
    });
  });

  describe('handling errors cases', () => {
    it('should return an error when a wrong phone number is supplied', async () => {
      const variables = {
        type: 'LaCentrale',
        followed_email: 'test@email.com',
        garageId: garage.id.toString(),
        followed_phones: ['+kdsbfjlf'],
      };

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(res.errors[0].message).to.be.equal('The string supplied did not seem to be a phone number');
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource).to.be.null;
    });

    it('should return an error when a wrong email is supplied', async () => {
      const variables = {
        type: 'LaCentrale',
        followed_email: 'test',
        garageId: garage.id.toString(),
        followed_phones: ['+33786799099'],
      };

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(res.errors[0].message).to.be.equal('setSource: source.followed_email not given');
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource).to.be.null;
    });

    it('should return an error when a wrong garageId is supplied', async () => {
      const variables = {
        type: 'LaCentrale',
        followed_email: 'test@test.com',
        garageId: '002345678',
        followed_phones: ['+33786799099'],
      };

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(res.errors[0].message).to.be.equal('setSource: source.garageId not given');
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource).to.be.null;
    });

    it('should return an error when an unknown garageId is supplied', async () => {
      const variables = {
        type: 'LaCentrale',
        followed_email: 'test@test.com',
        garageId: new ObjectId().toString(),
        followed_phones: ['+33786799099'],
      };

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(res.errors[0].message).to.be.equal('setSource: unknown garageId');
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource).to.be.null;
    });

    it('should return an error when an unknown type is supplied', async () => {
      const variables = {
        type: 'plop',
        followed_email: 'test@test.com',
        garageId: garage.id.toString(),
        followed_phones: ['+33786799099'],
      };

      const res = await sendQueryAs(testApp, request, variables, user.userId);

      expect(res.errors).to.be.an('array').lengthOf(1);
      expect(res.errors[0]).to.be.an('object').which.have.keys('message', 'locations', 'path', 'extensions');
      expect(res.errors[0].message).to.be.equal('setSource: source.type not given');
      expect(res.data).to.be.an('object').which.have.keys('garageSetSource');
      expect(res.data.garageSetSource).to.be.null;
    });
  });
});
