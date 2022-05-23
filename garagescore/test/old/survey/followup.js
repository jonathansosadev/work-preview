const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');

const { TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const unsatisfiedFollowupStatus = require('../../../common/models/data/type/unsatisfied-followup-status.js');
const testTools = require('../../../common/lib/test/testtools');

const expect = chai.expect;
const app = new TestApp();

/**
 * Send alert after negative reviews and with followupUnsatisfied
 */
describe('Send alerts on unsatisfied followupUnsatisfied', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('test unsatisfied after followupUnsatisfied', async function test() {
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({ DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } });
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();

    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();
    const followupSurvey = await campaign.getFollowupSurvey();
    await followupSurvey
      .setFollowupResponses(unsatisfiedFollowupStatus.NOT_RESOLVED, false, 'un commentaire bidon')
      .submit();
    const datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('unsatisfied.followupStatus')).to.equal('NotResolved');
    expect(datas[0].get('alert.checkAlertHour')).to.be.a('number');
    expect(datas[0].get('surveyFollowupUnsatisfied.lastRespondedAt')).to.be.a('date');
    expect(datas[0].get('surveyFollowupUnsatisfied.firstRespondedAt')).to.be.a('date');
    expect(datas[0].get('unsatisfied.isRecontacted')).to.equal(false);
    expect(datas[0].get('unsatisfied.comment.text')).to.be.a('string');
    expect(datas[0].get('unsatisfied.detectedAt')).to.be.a('date');
  });

  it('does not send multiple alerts when a followupUnsatisfied has been responded to multiple times', async function test() {
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    const userEmail = testTools.random.email();
    const user = await app.addUser({ email: userEmail });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();
    let datas;
    let actions;

    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();
    // Responding to the survey 3 times and checking that only last response is taken into account
    const followupSurvey = await campaign.getFollowupSurvey();
    await followupSurvey
      .setFollowupResponses(unsatisfiedFollowupStatus.NOT_RESOLVED, false, 'un commentaire bidon 1')
      .submit();
    datas = await campaign.datas();
    actions = await datas[0]
      .get('unsatisfiedTicket.actions')
      .filter((e) => e.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED);
    expect(actions.length).equal(1);
    expect(actions[0].followupUnsatisfiedCommentForManager).equal('un commentaire bidon 1');

    await followupSurvey
      .setFollowupResponses(unsatisfiedFollowupStatus.NOT_RESOLVED, false, 'un commentaire bidon 2')
      .submit();
    datas = await campaign.datas();
    actions = await datas[0]
      .get('unsatisfiedTicket.actions')
      .filter((e) => e.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED);
    expect(actions.length).equal(1);
    expect(actions[0].followupUnsatisfiedCommentForManager).equal('un commentaire bidon 1');

    await followupSurvey
      .setFollowupResponses(unsatisfiedFollowupStatus.NOT_RESOLVED, false, 'un commentaire bidon 3')
      .submit();
    datas = await campaign.datas();
    actions = await datas[0]
      .get('unsatisfiedTicket.actions')
      .filter((e) => e.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED);
    expect(actions.length).equal(1);
    expect(actions[0].followupUnsatisfiedCommentForManager).equal('un commentaire bidon 1');
  });
});
