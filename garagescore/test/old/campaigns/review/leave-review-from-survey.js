const TestApp = require('../../../../common/lib/test/test-app');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();
/**
 * Review creation
 */
describe('Leaving reviews from a survey:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Leaving a positive rating', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.false;
    expect(datas[0].review_isSensitive(await garage.getInstance())).to.be.false;
    expect(datas[0].review_isPromoter()).to.be.true;
  });
  it('Leaving a negative rating', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.true;
    expect(datas[0].review_isSensitive(await garage.getInstance())).to.be.false;
    expect(datas[0].review_isPromoter()).to.be.false;
  });
  it('Leaving a sensitive rating', async function test() {
    await app.reset();
    const thresholds = {
      alertSensitiveThreshold: {
        maintenance: 8,
        sale_new: 8,
        sale_used: 8,
        vehicle_inspection: 6,
      },
    };
    const garage = await app.addGarage({ thresholds });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(7).submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.false;
    expect(datas[0].review_isSensitive(await garage.getInstance())).to.be.true;
    expect(datas[0].review_isPromoter()).to.be.false;
  });
  it('Leaving a sensitive rating at threshold limit', async function test() {
    await app.reset();
    const thresholds = {
      alertSensitiveThreshold: {
        maintenance: 8,
        sale_new: 8,
        sale_used: 8,
        vehicle_inspection: 6,
      },
    };
    const garage = await app.addGarage({ thresholds });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(8).submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.false;
    expect(datas[0].review_isSensitive(await garage.getInstance())).to.be.true;
    expect(datas[0].review_isPromoter()).to.be.false;
  });
  it('Leaving a negative rating on a garage with sensitive thresholds', async function test() {
    await app.reset();
    const thresholds = {
      alertSensitiveThreshold: {
        maintenance: 8,
        sale_new: 8,
        sale_used: 8,
        vehicle_inspection: 6,
      },
    };
    const garage = await app.addGarage({ thresholds });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.true;
    expect(datas[0].review_isSensitive(await garage.getInstance())).to.be.false;
    expect(datas[0].review_isPromoter()).to.be.false;
  });
  it('Leaving a positive rating on a garage with sensitive thresholds', async function test() {
    await app.reset();
    const thresholds = {
      alertSensitiveThreshold: {
        maintenance: 8,
        sale_new: 8,
        sale_used: 8,
        vehicle_inspection: 6,
      },
    };
    const garage = await app.addGarage({ thresholds });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.false;
    expect(datas[0].review_isSensitive(await garage.getInstance())).to.be.false;
    expect(datas[0].review_isPromoter()).to.be.true;
  });
  it('Leaving a rating and a comment', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    await survey.setReview('Tout à fait Claude').submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.true;
    expect(datas[0].review_isPromoter()).to.be.false;
    expect(datas[0].get('review.rating.value')).equal(2);
  });
  it('Leaving a recommendation with a comment', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    await survey.setReview('Tout à fait Claude').submit();
    const datas = await app.datas();
    expect(datas[0].review_isDetractor()).to.be.true;
    expect(datas[0].review_isPromoter()).to.be.false;
  });
});
