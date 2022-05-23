const expect = require('chai').expect;
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');
const app = new TestApp();

const mutation = `mutation userSetUserUnsubscribeMakeSurveys {
    userSetUserUnsubscribeMakeSurveys {
        success
  }
}`;
let user = Tools.random.user();

// unsubscribe user from make survey
describe('userSetUnsubscribeMakeSurvey', async function descr() {
  before(async function () {
    await app.reset();
    user.firstName = 'JoeBobby';
    user = await app.models.User.create(user);
  });
  describe('Should toggle unsubscribedMakeSurveys', () => {
    it('Should toggle unsubscribedMakeSurveys', async () => {
      expect(user.firstName).to.be.equal('JoeBobby');
      expect(user.unsubscribedMakeSurveys).to.be.undefined;
      const response = await _sendQueryAs(app, mutation, {}, user.getId());
      expect(response.data.userSetUserUnsubscribeMakeSurveys.success).to.be.equal(true);
      user = await app.models.User.findOne({ id: user.getId() });
      expect(user.firstName).to.be.equal('JoeBobby');
      expect(user.unsubscribedMakeSurveys).to.be.equal(true);
    });
  });
});
