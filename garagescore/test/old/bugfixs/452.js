const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();
/**
 * Refuse survey updates after closing campaign
 */
describe('Issue 452:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Accept when not complete', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.recommend(false).rate(5).submit();
    await survey.setReview("Refuse moi, j'arrive trop tard").submit();
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].survey.progress.isComplete).equal(true);
  });
  it('Refuse if completed', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.recommend(false).rate(5).submit();
    await campaign.complete();
    await survey.setReview("Refuse moi, j'arrive trop tard").submit();
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].review.comment).be.undefined;
  });
  it('Refuse if cancelled', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.recommend(false).rate(5).submit();
    await campaign.cancel();
    await survey.setReview("Refuse moi, j'arrive trop tard").submit();
    const datas = await app.datas();
    expect(datas.length).equal(1);
    expect(datas[0].campaign.status).equal('Cancelled');
  });
});
