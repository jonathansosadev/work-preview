const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');
/** Some foreign responses */
const responses01 = require('./foreign-responses/followup-example-01.json');
const { JobTypes } = require('../../../frontend/utils/enumV2');

const expect = chai.expect;
const app = new TestApp();

/**
 * Survey modification with foreign responses
 */
describe('Add SurveyGizmo ForeignResponse:', () => {
  it('FollowupUnsatisfied Maintenance', async function test() {
    await app.reset();
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } },
    });
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(0).submit();
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    await jobs[0].run();

    const followupSurvey = await campaign.getFollowupSurvey();
    await followupSurvey.addSurveyGizmoForeignResponse(responses01[0]);
    const datas3 = await app.datas();
    expect(datas3[0].get('review.followupUnsatisfiedRating.value')).to.equal(9);
    expect(datas3[0].get('review.followupUnsatisfiedComment.text')).to.equal('Rien');
    expect(datas3[0].get('unsatisfied.followupStatus')).to.equal('Resolved');
    expect(datas3[0].get('unsatisfied.comment.text')).to.equal('merci');
    expect(datas3[0].get('unsatisfied.isRecontacted')).to.equal(true);
    expect(datas3[0].get('surveyFollowupUnsatisfied.firstRespondedAt')).to.be.an.instanceof(Date);
    expect(datas3[0].get('surveyFollowupUnsatisfied.sendAt')).to.be.an.instanceof(Date);
    expect(datas3[0].get('survey.sendAt')).to.be.an.instanceof(Date);
    expect(datas3[0].get('survey.acceptNewResponses')).to.be.false;
  });
});
