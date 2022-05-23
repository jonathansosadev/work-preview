const TestApp = require('../../../common/lib/test/test-app');
const DataFileTypes = require('../../../common/models/data-file.data-type');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const LeadTimings = require('../../../common/models/data/type/lead-timings');
const LeadTradeInTypes = require('../../../common/models/data/type/lead-trade-in-types');
const LeadFinancing = require('../../../common/models/data/type/lead-financing.js');
const { AutoBrands } = require('../../../frontend/utils/enumV2');
const { BodyTypes } = require('../../../common/models/data/type/vehicle-bodytypes.js');
const VehicleFuelTypes = require('../../../common/models/data/type/vehicle-energytypes.js');
const chai = require('chai');
/** Some foreign responses */
const foreignResponses = require('./foreign-responses/maintenance-example-01.json');
const foreignResponses2 = require('./foreign-responses/maintenance-example-02.json');

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
    campaign = await garage.runNewCampaign(DataFileTypes.MAINTENANCES);
    survey = await campaign.getSurvey();
  });
  /**
   * this test a response rate 8
   * without lead
   */
  it('First test example', async function test() {
    // first foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[0]);
    let datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(10);
    expect(datas[0].get('review.comment.text')).to.equal(null);
    expect(datas[0].get('survey.progress.isComplete')).to.equal(false);
    // second foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[1]);
    // third foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[2]);
    datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(10);
    expect(datas[0].get('review.comment.text')).to.equal('hello comment ');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(false);
    expect(datas[0].get('lead.type')).to.equal(LeadTypes.INTERESTED);
    // fourth foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[3]);
    datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(10);
    expect(datas[0].get('review.comment.text')).to.equal('hello comment ');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(false);
    expect(datas[0].get('lead.type')).to.equal(LeadTypes.INTERESTED);
    // fifth foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[4]);
    datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(10);
    expect(datas[0].get('review.comment.text')).to.equal('hello comment ');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(false);
    expect(datas[0].get('lead.saleType')).to.equal(LeadSaleTypes.NEW_VEHICLE_SALE);
    expect(datas[0].get('lead.timing')).to.equal(LeadTimings.LONG_TERM);
    expect(datas[0].get('lead.knowVehicle')).to.equal(false);
    expect(datas[0].get('lead.tradeIn')).to.equal(LeadTradeInTypes.NO);
    expect(datas[0].get('lead.isConverted')).to.equal(false);
    expect(datas[0].get('lead.type')).to.equal(LeadTypes.INTERESTED);
    expect(datas[0].get('lead.brands')[0].brand).to.equal(AutoBrands.MCLAREN);
    expect(datas[0].get('lead.brands')[1].brand).to.equal(AutoBrands.FERRARI);
    expect(datas[0].get('lead.brands')[2].brand).to.equal(AutoBrands.TESLA_MOTORS);
    expect(datas[0].get('lead.energyType')[0]).to.equal(VehicleFuelTypes.fuel);
    expect(datas[0].get('lead.energyType')[1]).to.equal(VehicleFuelTypes.electric);
    expect(datas[0].get('lead.bodyType')[0]).to.equal(BodyTypes.BERLINE);
    expect(datas[0].get('lead.bodyType')[1]).to.equal(BodyTypes.BREAK);
    expect(datas[0].get('lead.financing')).to.equal(LeadFinancing.cash);
    // Sixth foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[5]);
    expect(datas[0].get('customer.fullName')).to.equal('Richard');
    await survey.addSurveyGizmoForeignResponse(foreignResponses[6]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses[7]);
    datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(10);
    expect(datas[0].get('review.comment.text')).to.equal('hello comment ');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(false);
    expect(datas[0].get('lead.saleType')).to.equal(LeadSaleTypes.NEW_VEHICLE_SALE);
    expect(datas[0].get('lead.timing')).to.equal(LeadTimings.LONG_TERM);
    expect(datas[0].get('lead.knowVehicle')).to.equal(false);
    expect(datas[0].get('lead.tradeIn')).to.equal(LeadTradeInTypes.NO);
    expect(datas[0].get('lead.isConverted')).to.equal(false);

    expect(datas[0].get('lead.type')).to.equal(LeadTypes.INTERESTED);
    expect(datas[0].get('lead.brands')[0].brand).to.equal(AutoBrands.MCLAREN);
    expect(datas[0].get('lead.brands')[1].brand).to.equal(AutoBrands.FERRARI);
    expect(datas[0].get('lead.brands')[2].brand).to.equal(AutoBrands.TESLA_MOTORS);
    expect(datas[0].get('lead.energyType')[0]).to.equal(VehicleFuelTypes.fuel);
    expect(datas[0].get('lead.energyType')[1]).to.equal(VehicleFuelTypes.electric);

    expect(datas[0].get('lead.bodyType')[0]).to.equal(BodyTypes.BERLINE);
    expect(datas[0].get('lead.bodyType')[1]).to.equal(BodyTypes.BREAK);
    expect(datas[0].get('lead.financing')).to.equal(LeadFinancing.cash);
    expect(datas[0].get('customer.street')).to.equal('44 Rue Cauchy');
    expect(datas[0].get('customer.postalCode')).to.equal('94110');
    expect(datas[0].get('customer.city')).to.equal('Arcueil');
    expect(datas[0].get('customer.title')).to.equal('Monsieur');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(false);
    // remaining foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses[8]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses[9]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses[10]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses[11]);
    datas = await app.datas();
    expect(datas[0].get('service.middleMans')[0]).to.equal('price');
    expect(datas[0].get('customer.fullName')).to.equal('Olivier Richard');
    expect(datas[0].customer_getCustomerPublicDisplayName()).to.equal('O. R.');
    expect(datas[0].get('customer.contact.email')).to.equal('oabida@garagescore.com');
    expect(datas[0].get('survey.progress.isComplete')).to.equal(true);
    expect(datas[0].get('customer.shareWithGarage')).to.equal(true);
    expect(datas[0].get('service.categories').length).to.equal(2);
  });
  it('second test example with detailed unsatisfied criteria', async function test() {
    // first foreignResponse
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[0]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[1]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[2]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[3]);
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[4]);
    let datas = await app.datas();
    expect(datas[0].get('review.rating.value')).to.equal(4);
    expect(datas[0].get('review.comment.text')).to.equal('hello world !');
    expect(datas[0].get('unsatisfied.criteria')).to.be.an('array');
    expect(datas[0].get('unsatisfied.criteria').length).to.equal(5);
    for (let i = 0; i < 5; i++) {
      expect(datas[0].get('unsatisfied.criteria')[i].values).to.be.an('array');
      expect(datas[0].get('unsatisfied.criteria')[i].values.length).to.equal(4);
    }
    await survey.addSurveyGizmoForeignResponse(foreignResponses2[5]);
    datas = await app.datas();
    expect(datas[0].get('review.shareWithPartners')).to.equal(true);
    expect(datas[0].get('review.sharedOnGoogleClicked')).to.equal(true);
  });
});
