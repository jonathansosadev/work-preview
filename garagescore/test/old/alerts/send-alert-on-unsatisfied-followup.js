const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const testTools = require('../../../common/lib/test/testtools');
const RenderAlertMail = require('../../../common/lib/garagescore/alert-mail/render-content');
const { JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const unsatisfiedFollowupStatus = require('../../../common/models/data/type/unsatisfied-followup-status.js');

const expect = chai.expect;
const app = new TestApp();

/**
 * Test alert on unsatisfied followupUnsatisfied
 */
describe('Test alert on unsatisfied followupUnsatisfied', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it("Send UNSATISFIED_FOLLOWUP_VN if it's a unsatisfied after followupUnsatisfied", async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({ defaultManager: user });
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();
    await app.sendAlerts();
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();
    const followupSurvey = await campaign.getFollowupSurvey();
    await followupSurvey.setFollowupResponses(unsatisfiedFollowupStatus.NOT_RESOLVED, false).submit();
    await app.sendAlerts();
    const contacts = await app.contacts();
    // first contact + thanks you # 2 + alert unsatisfied + followupUnsatisfied contact + + alert unsatisfied followupUnsatisfied
    expect(contacts[0].type).equal('CAMPAIGN_EMAIL');
    expect(contacts[0].payload.key).equal('sale_email_1');
    expect(contacts[1].type).equal('CAMPAIGN_EMAIL');
    expect(contacts[1].payload.key).equal('sale_email_thanks_2');
    expect(contacts[2].type).equal('ALERT_EMAIL');
    expect(contacts[2].payload.alertType).equal('UnsatisfiedVn');
    expect(contacts[3].type).equal('CAMPAIGN_EMAIL');
    expect(contacts[3].payload.key).equal('sale_email_followup');
    expect(contacts[4].type).equal('ALERT_EMAIL');
    expect(contacts[4].payload.alertType).equal('UnsatisfiedFollowupVn');
    expect(contacts[4].status).equal('Waiting');
    await RenderAlertMail.getAlertPayload(contacts[4]);
  });

  it("Send UNSATISFIED_FOLLOWUP_VO if it's a unsatisfied after followupUnsatisfied", async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    const garage = await app.addGarage({ defaultManager: user });
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.USED_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();

    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();

    const followupSurvey = await campaign.getFollowupSurvey();
    await followupSurvey.setFollowupResponses(unsatisfiedFollowupStatus.NOT_RESOLVED, false).submit();

    await app.sendAlerts();
    const contacts = await app.contacts();
    expect(contacts.length).equal(5);
    // first contact + thanks you # 2 + alert unsatisfied + followupUnsatisfied contact + alert unsatisfied followupUnsatisfied
    const contact = contacts.find((c) => c.type === 'ALERT_EMAIL' && c.payload.alertType === 'UnsatisfiedFollowupVo');
    expect(contact.type).equal('ALERT_EMAIL');
    expect(contact.status).equal('Waiting');
    expect(contact.payload.alertType).equal('UnsatisfiedFollowupVo');
    expect(contact.to).equal(userEmail);
    await RenderAlertMail.getAlertPayload(contact);
  });
});
