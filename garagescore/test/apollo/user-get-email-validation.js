const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const UserAuthorization = require('../../common/models/user-autorization');
const mockMailgun = require('../../common/lib/test/test-app/mock-mailgun');

const app = new TestApp();

const query = `query userGetEmailValidation($email: String!) {
    userGetEmailValidation(email: $email) {
      message
      error
      email
    }
  }`;

let user;
describe('Apollo::userGetEmailValidation', async function descr() {
  before(async function () {
    await app.reset();
    mockMailgun.validate();
    user = await app.addUser({ authorization: { [UserAuthorization.ACCESS_TO_COCKPIT]: true } });
  });
  after(() => {
    mockMailgun.off();
  });
  it('should validate a valid email', async () => {
    const newUserEmail = 'test@test.fr';
    const variables = {
      email: newUserEmail,
    };

    const isEmailValid = await sendQuery(app, query, variables, user.id.toString());
    expect(isEmailValid.errors).to.be.undefined;
    expect(isEmailValid.data).to.be.an('object').which.have.keys('userGetEmailValidation');
    expect(isEmailValid.data.userGetEmailValidation).to.be.an('object').which.have.keys('message', 'error', 'email');
    expect(isEmailValid.data.userGetEmailValidation.error).to.be.equal('');
    expect(isEmailValid.data.userGetEmailValidation.message).to.be.equal('Email valid !');
    expect(isEmailValid.data.userGetEmailValidation.email).to.be.equal(newUserEmail);
  });
  it('should not validate an invalid email', async () => {
    const newUserEmail = 'testtest.fr';
    const variables = {
      email: newUserEmail,
    };

    const isEmailValid = await sendQuery(app, query, variables, user.id.toString());
    expect(isEmailValid.errors).to.be.undefined;
    expect(isEmailValid.data).to.be.an('object').which.have.keys('userGetEmailValidation');
    expect(isEmailValid.data.userGetEmailValidation).to.be.an('object').which.have.keys('message', 'error', 'email');
    expect(isEmailValid.data.userGetEmailValidation.error).to.be.equal('Email invalid');
    expect(isEmailValid.data.userGetEmailValidation.message).to.be.equal('Not valid');
    expect(isEmailValid.data.userGetEmailValidation.email).to.be.equal(newUserEmail);
  });
});
