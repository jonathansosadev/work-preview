/*
 * Test-app: campaign
 */

const promises = require('../../util/promises');
const TestSurvey = require('./test-survey.js');
const schemaSendReContact = require('../../../lib/garagescore/data-campaign/run-schema/send-recontact');

class TestCampaign {
  constructor(testApp, campaignId) {
    this.app = testApp;
    this.campaignId = campaignId;
  }
  // all data of this campaign
  async datas() {
    return this.app.models.Data.find({ where: { 'campaign.campaignId': this.campaignId } });
  }
  // send next contacts of every datas of this campaign
  async sendNextContacts() {
    const datas = await this.datas();
    for (let i = 0; i < datas.length; i++) {
      try {
        await promises.makeAsyncPrototype(datas[i], 'campaign_sendNextContact')();
      } catch (e) {
        console.error(e);
      }
    }
  }
  // send re-contacts of every datas of this campaign
  async sendReContacts() {
    const datas = await this.datas();
    for (let i = 0; i < datas.length; i++) {
      try {
        await schemaSendReContact(datas[i]);
      } catch (e) {
        console.error(e);
      }
    }
  }
  // get a the fist survey of this campaign
  async getSurvey() {
    const datas = await this.datas();
    const data = datas[0];
    return new TestSurvey(this.app, data.id, data.get('survey.type'));
  }
  // get a the fist survey of this campaign
  async getFollowupSurvey() {
    const datas = await this.datas();
    const data = datas[0];
    return new TestSurvey(this.app, data.id, data.get('surveyFollowupUnsatisfied.type'));
  }
  // close campaign (complete)
  async complete() {
    const campaign = await this.app.models.Campaign.findById(this.campaignId);
    return promises.makeAsyncPrototype(campaign, 'complete')();
  }
  // close campaign (cancel)
  async cancel() {
    const campaign = await this.app.models.Campaign.findById(this.campaignId);
    return promises.makeAsyncPrototype(campaign, 'cancel')();
  }
}
module.exports = TestCampaign;
