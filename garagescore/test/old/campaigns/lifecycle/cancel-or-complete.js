const TestApp = require('../../../../common/lib/test/test-app');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const chai = require('chai');
const promises = require('../../../../common/lib/util/promises');

const expect = chai.expect;
const app = new TestApp();
/**
 * Cancel / Complete a campaign
 */
describe('Cancelling or completing a campaign:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
    await promises.wait(app.models.CensoredWords.updateAllCachedCensoredWords);
  });
  it('Completing', async function test() {
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();
    await survey.setReview('Tout à fait Claude').submit();
    await campaign.complete();
    await survey.setReview('Oula non alors').submit();
    const campaigns = await app.campaigns();
    expect(campaigns[0].status).equal('Complete');
    const datas = await app.datas();
    expect(datas[0].get('campaign.status')).equal('Complete');
    expect(datas[0].get('campaign.contactScenario.nextCampaignReContactDay')).to.be.null;
    expect(datas[0].get('campaign.contactScenario.nextCampaignContact')).to.be.null;
    expect(datas[0].get('campaign.contactScenario.nextCampaignContactDay')).to.be.null;
    expect(datas[0].get('survey.acceptNewResponses')).to.be.false;
  });
  it('Cancelling', async function test() {
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();
    await campaign.cancel();
    await survey.setReview('Ne doit pas être publié').submit();
    const campaigns = await app.campaigns();
    expect(campaigns[0].status).equal('Cancelled');
    const datas = await app.datas();
    expect(datas[0].get('review.comment.text')).to.be.null;
    expect(datas[0].get('campaign.status')).equal('Cancelled');
    expect(datas[0].get('campaign.contactScenario.nextCampaignReContactDay')).to.be.null;
    expect(datas[0].get('campaign.contactScenario.nextCampaignContact')).to.be.null;
    expect(datas[0].get('campaign.contactScenario.nextCampaignContactDay')).to.be.null;
    expect(datas[0].get('survey.acceptNewResponses')).to.be.false;
  });
});
