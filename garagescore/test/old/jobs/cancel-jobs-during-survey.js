const TestApp = require('../../../common/lib/test/test-app');

const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();

const timeHelper = require('../../../common/lib/util/time-helper');
const scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const { JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const LeadTimings = require('../../../common/models/data/type/lead-timings');

describe('Cancel jobs', () => {
  let garage = null;
  beforeEach(async function beforeEach() {
    await app.reset();
    scheduler.setAppForTests(app);
    garage = await app.addGarage();
  });

  it('Cancel unsat closing', async () => {
    let datas;
    let jobs;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    datas = await campaign.datas();
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
    await survey.rate(10).submit();
    datas = await campaign.datas();
    expect(datas.length).equal(1);
    jobs = await app.jobs({ where: { type: JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET } });
    expect(jobs.length).equal(1);
  });

  it('Cancel lead closing', async () => {
    let datas;
    let jobs;
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(9).setLead(LeadTypes.INTERESTED, LeadTimings.MID_TERM, LeadSaleTypes.NEW_VEHICLE_SALE).submit();
    datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].leadTicket.status).equal('WaitingForContact');
    jobs = await app.jobs({
      where: { type: JobTypes.CLOSE_EXPIRED_LEAD_TICKET },
    });
    expect(jobs.length).equal(1);
    expect(jobs[0].type).equal(JobTypes.CLOSE_EXPIRED_LEAD_TICKET);
    // if the test is ran during the night (outside opening hours), we first move to tomorrow (+1) then add 90 days (+90)
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).to.be.oneOf([
      timeHelper.dayNumber(new Date()) + 90,
      timeHelper.dayNumber(new Date()) + 91,
    ]);
    await survey.rate(9).setLead(LeadTypes.NOT_INTERESTED).submit();
    datas = await campaign.datas();
    expect(datas.length).equal(1);
    jobs = await app.jobs({
      where: { type: JobTypes.CLOSE_EXPIRED_LEAD_TICKET },
    });
    expect(jobs.length).equal(1);
  });
});
