/*
 * Test-app: user
 */
const MongoObjectID = require('mongodb').ObjectID;

class TestUser {
  constructor(testApp, userId) {
    this.app = testApp;
    this._userId = userId;
  }
  get userId() {
    return this._userId.toString();
  }
  get id() {
    return this._userId;
  }
  getId() {
    return this._userId.toString();
  }
  // add one garage to the user
  async addGarage(testGarage) {
    const user = await this.app.models.User.findById(this.userId);
    const garageId = MongoObjectID.isValid(testGarage.garageId)
      ? new MongoObjectID(testGarage.garageId)
      : parseInt(testGarage.garageId, 10);
    user.garageIds.push(garageId);
    return user.save();
  }
  // subscribe user to alert
  // "subscriptions" : { "Lead" : true, "UnsatisfiedVn" : false, "UnsatisfiedVo" : false,  "UnsatisfiedMaintenance" : false }}
  async addAlertSubscriptions(subscriptions) {
    const allGaragesAlerts = {
      Lead: subscriptions.Lead || false,
      LeadApv: subscriptions.LeadApv || false,
      LeadVn: subscriptions.LeadVn || false,
      LeadVo: subscriptions.LeadVo || false,
      UnsatisfiedVn: subscriptions.UnsatisfiedVn || false,
      UnsatisfiedVo: subscriptions.UnsatisfiedVo || false,
      UnsatisfiedVI: subscriptions.UnsatisfiedVI || false,
      UnsatisfiedMaintenance: subscriptions.UnsatisfiedMaintenance || false,
      ExogenousNewReview: subscriptions.ExogenousNewReview || false,
      EscalationUnsatisfiedMaintenance: subscriptions.EscalationUnsatisfiedMaintenance || false,
      EscalationUnsatisfiedVn: subscriptions.EscalationUnsatisfiedVn || false,
      EscalationUnsatisfiedVo: subscriptions.EscalationUnsatisfiedVo || false,
      EscalationUnsatisfiedVi: subscriptions.EscalationUnsatisfiedVi || false,
      EscalationLeadMaintenance: subscriptions.EscalationLeadMaintenance || false,
      EscalationLeadVn: subscriptions.EscalationLeadVn || false,
      EscalationLeadVo: subscriptions.EscalationLeadVo || false,
    };
    const user = await this.app.models.User.findById(this.userId);
    await user.updateAttributes({ allGaragesAlerts });
    return this;
  }
  // subscribe user to report
  // "reportConfigs" : {
  //     daily: {
  //       enable: '1',
  //       generalVue: true,
  //       lead: true,
  //       leadVn: true,
  //       leadVo: true,
  //       unsatisfiedApv: true,
  //       unsatisfiedVn: true,
  //       unsatisfiedVo: true
  //     },
  //     weekly: {
  //       enable: '1',
  //       generalVue: true,
  //       lead: true,
  //       leadVn: true,
  //       leadVo: true,
  //       unsatisfiedApv: true,
  //       unsatisfiedVn: true,
  //       unsatisfiedVo: true
  //     },
  //     monthly: {
  //       enable: '1',
  //       generalVue: true,
  //       lead: true,
  //       leadVn: true,
  //       leadVo: true,
  //       unsatisfiedApv: true,
  //       unsatisfiedVn: true,
  //       unsatisfiedVo: true
  //     }
  //   }
  async addReportSubscriptions(reportConfigs) {
    const user = await this.app.models.User.findById(this.userId);
    await user.updateAttributes({ reportConfigs });
    return this;
  }
  async getInstance() {
    return this.app.models.User.findById(this.userId);
  }
}
module.exports = TestUser;
