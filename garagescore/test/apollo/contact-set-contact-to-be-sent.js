const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');

let user;
const request = `mutation contactSetContactToBeSent($firstName: String!, $lastName: String!, $email: String!, $phone: String!, $context: String, $message: String!) {
    contactSetContactToBeSent(firstName: $firstName, lastName: $lastName, email: $email, phone: $phone, context: $context, message: $message) {
      error
      status
    }
  }`;
/* Set contact data in api */
describe('Apollo::contactSetContactToBeSent', () => {
  beforeEach(async function () {
    await app.reset();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });
  });
  it('should create a new contact', async () => {
    const variables = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      phone: '+33788888888',
      message: 'Ceci est un commentaire',
      context: 'sujet',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('contactSetContactToBeSent');
    expect(res.data.contactSetContactToBeSent).to.be.an('object').which.have.keys('error', 'status');
    expect(res.data.contactSetContactToBeSent.error).to.be.null;
    expect(res.data.contactSetContactToBeSent.status).to.be.true;

    const createdContact = await app.models.Contact.getMongoConnector().find({}).toArray();
    expect(createdContact).to.be.an('array').lengthOf(1);
    expect(createdContact[0]).to.be.an('object').which.have.any.keys('payload');
    expect(createdContact[0].payload).to.be.an('object').which.have.any.keys(Object.keys(variables));
    for (const key in variables) {
      expect(createdContact[0].payload[key]).to.be.equal(variables[key]);
    }
  });
});
