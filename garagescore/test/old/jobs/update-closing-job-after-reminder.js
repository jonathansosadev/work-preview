const TestApp = require('../../../common/lib/test/test-app');

const moment = require('moment');
const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();

const { TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const reminderStatus = require('../../../common/models/data/type/userActions/reminder-status');

const timeHelper = require('../../../common/lib/util/time-helper');
const commonTicket = require('../../../common/models/data/_common-ticket');
const scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');

describe('Update jobs after reminder', () => {
  let garage = null;
  let user1 = null;
  beforeEach(async function beforeEach() {
    await app.reset();
    scheduler.setAppForTests(app);
    garage = await app.addGarage();
    user1 = await app.addUser();
  });

  it('Update unsat closing', async () => {
    let jobs;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    const datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].unsatisfiedTicket.status).equal('WaitingForContact');
    jobs = await app.jobs({ where: { type: JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET } });
    expect(jobs.length).equal(1);
    expect(jobs[0].type).equal(JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET);
    // if the test is ran during the night (outside opening hours), we first move to tomorrow (+1) then add 30 days (+30)
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).to.be.oneOf([
      timeHelper.dayNumber(new Date()) + 30,
      timeHelper.dayNumber(new Date()) + 31,
    ]);
    const reminderDate = moment.utc().clone().add(1, 'day');
    await commonTicket.addAction('unsatisfied', datas[0], {
      name: TicketActionNames.REMINDER,
      createdAt: moment.utc().toISOString(),
      type: 'unsatisfied',
      assignerUserId: user1.getId(),
      alertContributors: true,
      reminderFirstDay: timeHelper.dayNumber(reminderDate.toDate()),
      reminderNextDay: timeHelper.dayNumber(reminderDate.toDate()),
      reminderActionName: TicketActionNames.INVESTIGATION,
      reminderStatus: reminderStatus.NOT_RESOLVED,
      reminderDate: reminderDate.toISOString(),
    });

    await datas[0].save();

    jobs = await app.jobs({ where: { type: JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET } });
    expect(jobs.length).equal(1);
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).equal(timeHelper.dayNumber(new Date()) + 30 + 1);
  });
});
