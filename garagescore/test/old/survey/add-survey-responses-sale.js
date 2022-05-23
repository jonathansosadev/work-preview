const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');
/** Some foreign responses */
const foreignResponses1 = require('./foreign-responses/sale-example-01');
const foreignResponses2 = require('./foreign-responses/sale-example-02');

const expect = chai.expect;
const app = new TestApp();

/**
 * Survey modification with foreign responses
 */

describe('Add SurveyGizmo ForeignResponse:', () => {
  let campaign = null;
  let survey = null;
  beforeEach(async function beforeEach() {
    await app.reset();
    const garage = await app.addGarage();
    campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    survey = await campaign.getSurvey();
  });
  /**
   * this test a response rate 8
   * without lead
   */
  it('First test example', async function test() {
    // first foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses1[0]);
    const datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(2);
    expect(datas[0].get('review.comment.text')).to.equal(null);
    // first foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses1[1]);
    const datas2 = await app.datas();
    expect(datas2[0].get('review.rating.value')).to.equal(2);
    expect(datas2[0].get('review.comment.text')).to.equal('Je suis un autre commentaire');
    // second foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses1[2]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses1[3]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses1[4]);
    const datas3 = await app.datas();
    expect(datas3[0].get('service.middleMans')[0]).to.equal('factoryWebsite');
    expect(datas3[0].get('review.rating.value')).to.equal(2);
    expect(datas3[0].get('review.comment.text')).to.equal('Je suis un autre commentaire');
    expect(datas3[0].get('review.shareWithPartners')).to.equal(true);
    expect(datas3[0].get('review.sharedWithPartnersAt').getTime()).to.closeTo(new Date().getTime(), 80000);
    expect(datas3[0].get('customer.isRevised')).to.equal(true);
    expect(datas3[0].get('customer.fullName.value')).to.equal('Benjamin Thomas');
    expect(datas3[0].get('customer.street.value')).to.equal('44 Rue Cauchy');
    expect(datas3[0].get('customer.contact.email.value')).to.equal('oabida@garagescore.com');
    expect(datas3[0].get('customer.contact.mobilePhone.value')).to.equal('+33625033300');
    expect(datas3[0].get('customer.shareWithGarage')).to.equal(true);
  });
  it('second test example with detailed unsatisfied criteria', async function test() {
    // first foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[0]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[1]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[2]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[3]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[4]);
    const datas = await app.datas();
    expect(datas[0].get('service.middleMans')[0]).to.equal('advertingWebsite');
    expect(datas[0].get('review.rating.value')).to.equal(3);
    expect(datas[0].get('review.comment.text')).to.equal('commentaire très bien');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(true);
    expect(datas[0].get('unsatisfied.criteria')).to.be.an('array');
    expect(datas[0].get('unsatisfied.criteria').length).to.equal(5);
    for (let i = 0; i < 5; i++) {
      expect(datas[0].get('unsatisfied.criteria')[i].values).to.be.an('array');
      expect(datas[0].get('unsatisfied.criteria')[i].values.length).to.equal(4);
    }
  });
});
