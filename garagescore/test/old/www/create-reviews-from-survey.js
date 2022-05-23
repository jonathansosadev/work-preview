const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');
const testTools = require('../../../common/lib/test/testtools');

const expect = chai.expect;
const app = new TestApp();

/**
 * Test public review generation
 */
describe('Public Review Creation:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Answers to a survey and generate a review with the updatedAt field set', async function test() {
    const garage = await app.addGarage();
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.recommend(true).rate(9).setReview('Je suis très satisfait et cela devrait générer un review').submit();

    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('review.comment.status')).equal('Approved');
    expect(datas[0].get('review.comment.text')).equal('Je suis très satisfait et cela devrait générer un review');
    expect(datas[0].get('review.comment.updatedAt')).not.be.undefined;
  });
});
