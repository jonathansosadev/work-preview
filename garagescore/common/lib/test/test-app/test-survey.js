/*
 * Test-app: survey
 *
 * use provided method to fill your survey and then call submit() to save the changes
 * Example
 * survey.rate(10)
 *
 * You can submit multiple times to emulate an user responding with delay
 */
const promises = require('../../util/promises');
const LeadTypes = require('../../../models/data/type/lead-types');
const LeadTimings = require('../../../models/data/type/lead-timings');
const LeadSaleTypes = require('../../../models/data/type/lead-sale-types');

class TestSurvey {
  constructor(testApp, dataId) {
    this.app = testApp;
    this.dataId = dataId;
    this.actions = [];
    this.beforeSaveScheduledChanges = [];
  }
  async addSurveyGizmoForeignResponse(response) {
    const data = await this.app.models.Data.findById(this.dataId);
    return promises.makeAsyncPrototype(data, `${data.getSurveyInProgress()}_addSurveyGizmoForeignResponse`)(
      data.getSurveyInProgress(),
      response
    );
  }
  // add a global score
  rate(score) {
    this.actions.push((updates) => {
      updates.updateScore(score, {}, new Date());
    });
    return this;
  }
  // add a recommendation
  recommend(bool) {
    this.actions.push((updates) => {
      updates.updateRecommend(bool, new Date());
    });
    return this;
  }
  // set Lead
  setLead(leadType, leadTiming, leadSaleType, leadTradeIn, leadKnowVehicle, leadVehicle) {
    this.actions.push((updates) => {
      updates.updateLead({
        type: leadType || LeadTypes.INTERESTED,
        timing: leadTiming || LeadTimings.NOW,
        saleType: leadSaleType || LeadSaleTypes.NEW_VEHICLE_SALE,
        tradeIn: leadTradeIn,
        knowVehicle: leadKnowVehicle,
        vehicle: leadVehicle,
      });
    });
    return this;
  }
  removeLead() {
    this.actions.push((updates) => {
      updates.updateLead(null);
    });
    return this;
  }
  setFollowupResponses(followupStatus, isRecontacted, unsatisfactionComment) {
    this.actions.push((updates) => {
      updates.updateFollowupUnsatisfied(followupStatus, isRecontacted, unsatisfactionComment);
    });
    return this;
  }
  setReview(string, shareWithPartners) {
    this.actions.push((updates) => {
      updates.updateComment(string, shareWithPartners, new Date());
    });
    return this;
  }
  reviseCustomer(
    revisedTitle,
    revisedFullName,
    revisedStreet,
    revisedPostalCode,
    revisedCity,
    revisedEmail,
    revisedMobilePhone
  ) {
    this.actions.push((updates) => {
      updates.updateCustomer(
        revisedTitle,
        revisedFullName,
        revisedStreet,
        revisedPostalCode,
        revisedCity,
        revisedEmail,
        revisedMobilePhone
      );
    });
    return this;
  }
  // set data type
  dataType(dataType) {
    this.actions.push((updates) => {
      updates.updateDataType(dataType);
    });
    return this;
  }
  // set service frontDeskGarageId
  setProvidedGarageId(providedGarageId) {
    this.actions.push((updates) => {
      updates.updateProvidedGarageId(providedGarageId);
    });
    return this;
  }
  // set service.categories
  setCategories(categories) {
    this.actions.push((updates) => {
      updates.updateCategories(categories);
    });
    return this;
  }

  // set service.progress
  async setProgress(currentPage = 0) {
    const data = await this.app.models.Data.findById(this.dataId);
    if (!data.getSurveyInProgress()) {
      return;
    }
    const updates = data.survey_prepareUpdates(data.getSurveyInProgress());
    this.actions.forEach((a) => {
      a(updates);
    });
    updates.updateProgress(currentPage, 5, false, new Date());
    await promises.makeAsyncPrototype(updates, 'run')();
    await promises.makeAsyncPrototype(data, 'campaign_checkSurveyUdpates')();
    return this;
  }

  // get a campaignItem and fake a complete survey response
  async submit(complete = true) {
    if (this.actions.length === 0) {
      return;
    }
    const data = await this.app.models.Data.findById(this.dataId);
    if (!data.getSurveyInProgress()) {
      return;
    }
    const updates = data.survey_prepareUpdates(data.getSurveyInProgress());
    this.actions.forEach((a) => {
      a(updates);
    });
    updates.updateProgress(5, 5, complete, new Date());
    await promises.makeAsyncPrototype(updates, 'run')();
    await promises.makeAsyncPrototype(data, 'campaign_checkSurveyUdpates')();
  }
  async getInstance() {
    return this.app.models.Survey.findById(this.dataId);
  }
}
module.exports = TestSurvey;
