const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');

const expect = chai.expect;
const app = new TestApp();

const { TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');

const { dayNumber } = require('../../../common/lib/util/time-helper');
const commonTicket = require('../../../common/models/data/_common-ticket');
const scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');

describe('Update jobs after reminder', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    scheduler.setAppForTests(app);
  });

  it('Test schedule date of the followup', async () => {
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 45 } } } },
    });
    const userEmail = 'toto@toto.fr';
    const user = await app.addUser({ email: userEmail });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    expect(jobs.length).equal(1);
    // On friday tests were failing because we ain't supposed to send followups during the weekend
    const expectedDelay = 5;
    expect(dayNumber(jobs[0].scheduledAtAsDate)).equal(dayNumber(new Date()) + expectedDelay);
  });

  it("Test if we don't cancel the followup when we close the ticket", async () => {
    const garage = await app.addGarage();
    await app.upsertDefaultScenario({
      followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 45 } } } },
    });
    const userEmail = 'toto@toto.fr';
    const user = await app.addUser({ email: userEmail });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ UnsatisfiedMaintenance: true, UnsatisfiedVo: true, UnsatisfiedVn: true });
    const campaign = await garage.runNewCampaign(dataFileTypes.NEW_VEHICLE_SALES);
    const survey = await campaign.getSurvey();
    await survey.rate(5).submit();

    let jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    expect(jobs.length).equal(1);

    const datas = await campaign.datas();
    // Closing Unsat Ticket
    await commonTicket.addAction('unsatisfied', datas[0], {
      name: TicketActionNames.UNSATISFIED_CLOSED,
      assignerUserId: user.userId,
      wasTransformedToSale: true,
      alertContributors: true,
    });
    await datas[0].save();

    jobs = await app.jobs({ where: { type: JobTypes.SEND_UNSATISFIED_FOLLOWUP } });
    expect(jobs.length).equal(1);
    // On friday tests were failing because we ain't supposed to send followups during the weekend
    const expectedDelay = 5;
    expect(dayNumber(jobs[0].scheduledAtAsDate)).equal(dayNumber(new Date()) + expectedDelay);
  });
});
