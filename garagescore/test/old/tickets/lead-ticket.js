const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai').use(require('chai-as-promised'));

const { TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const leadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const leadTimings = require('../../../common/models/data/type/lead-timings');

const timeHelper = require('../../../common/lib/util/time-helper');
const commonTicket = require('../../../common/models/data/_common-ticket');

// eslint-disable-next-line
const should = chai.should(); // enable .should for promise assertions
const expect = chai.expect;
const app = new TestApp();
/**
 * Test the model 'data'
 */
describe('Data model LeadTicket:', async () => {
  let garage = null;
  let user1 = null;
  let user2 = null;
  before(async function () {});
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage();
    user1 = await app.addUser();
    user2 = await app.addUser();
  });
  it('leadTicket manager must be a string', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(9).setLead(LeadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.NEW_VEHICLE_SALE).submit();
    const datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(typeof datas[0].leadTicket.manager).equal('string');
  });
  it('test detecting lead and initialising leadTicket + add customerCall action + closeTicket', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(9).setLead(LeadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.NEW_VEHICLE_SALE).submit();
    let datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].leadTicket.status).equal('WaitingForContact');
    expect(datas[0].leadTicket.temperature).equal('Unknown');
    expect(datas[0].leadTicket.actions.length).equal(1);
    expect(datas[0].leadTicket.actions[0].name).equal('leadStarted');
    let jobs;
    jobs = await app.jobs({
      where: {
        type: JobTypes.CLOSE_EXPIRED_LEAD_TICKET,
      },
    });
    expect(jobs.length).equal(1);
    // if the test is ran during the night (outside opening hours), we first move to tomorrow (+1) then add 90 days (+90)
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).to.be.oneOf([
      timeHelper.dayNumber(new Date()) + 90,
      timeHelper.dayNumber(new Date()) + 91,
    ]);
    jobs = await app.jobs({
      where: {
        type: JobTypes.ESCALATE,
      },
    });
    expect(jobs.length).equal(1);
    jobs = await app.jobs({
      where: {
        type: JobTypes.SEND_LEAD_FOLLOWUP,
      },
    });
    expect(jobs.length).equal(1);
    // Adding CustomerCall TicketActionTo Data[0]
    await commonTicket.addAction('lead', datas[0], {
      name: TicketActionNames.CUSTOMER_CALL,
      assignerUserId: user1.userId,
    });
    await datas[0].save();

    // Transfer TicketAction of Data[0] to user2
    await commonTicket.addAction('lead', datas[0], {
      name: TicketActionNames.TRANSFER,
      assignerUserId: user1.userId,
      ticketManagerId: user2.userId,
    });
    await datas[0].save();

    datas = await campaign.datas();
    expect(datas[0].leadTicket.status).equal('WaitingForMeeting');
    expect(datas[0].leadTicket.actions.length).equal(3);

    // check that a LeadTicketTransfer notification was sent to the assigned user (user2)
    let contacts = await app.contacts();
    expect(contacts[contacts.length - 1].type).equal('ALERT_EMAIL');
    expect(contacts[contacts.length - 1].payload.alertType).equal('LeadTicketTransfer');
    expect(contacts[contacts.length - 1].payload.addresseeId).equal(user2.userId);
    expect(contacts[contacts.length - 1].payload.actionIndex).equal(2);

    // Closing Lead Ticket
    await commonTicket.addAction('lead', datas[0], {
      name: TicketActionNames.LEAD_CLOSED,
      assignerUserId: user1.userId,
      wasTransformedToSale: true,
      alertContributors: true,
    });
    await datas[0].save();

    datas = await campaign.datas();
    expect(datas[0].leadTicket.status).equal('ClosedWithSale');
    expect(datas[0].leadTicket.actions.length).equal(4);
    jobs = await app.jobs({
      where: {
        type: JobTypes.CLOSE_EXPIRED_LEAD_TICKET,
      },
    });
    expect(jobs.length).equal(0);

    // check that a LeadTicketCloseAction notification was sent to the unique participant in the LeadTicket (user2)
    contacts = await app.contacts();
    expect(contacts[contacts.length - 1].type).equal('ALERT_EMAIL');
    expect(contacts[contacts.length - 1].payload.alertType).equal('LeadTicketCloseAction');
    expect(contacts[contacts.length - 1].payload.addresseeId).equal(user2.userId);
    expect(contacts[contacts.length - 1].payload.actionIndex).equal(3);

    // Reopening Lead Ticket
    await commonTicket.addAction('lead', datas[0], {
      name: TicketActionNames.LEAD_REOPENED,
      assignerUserId: user1.userId,
      alertContributors: true,
    });
    await datas[0].save();

    datas = await campaign.datas();
    expect(datas[0].leadTicket.status).equal('WaitingForMeeting');
    expect(datas[0].leadTicket.actions.length).equal(5);
    jobs = await app.jobs({
      where: {
        type: JobTypes.CLOSE_EXPIRED_LEAD_TICKET,
      },
    });
    expect(jobs.length).equal(1);
    expect(jobs[0].type).equal(JobTypes.CLOSE_EXPIRED_LEAD_TICKET);

    // if the test is ran during the night (outside opening hours), we first move to tomorrow (+1) then add 90 days (+90)
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).to.be.oneOf([
      timeHelper.dayNumber(new Date()) + 90,
      timeHelper.dayNumber(new Date()) + 91,
    ]);
    // check that a LeadTicketReOpen notification was sent to the unique participant in the LeadTicket user2
    contacts = await app.contacts();
    expect(contacts[contacts.length - 1].type).equal('ALERT_EMAIL');
    expect(contacts[contacts.length - 1].payload.alertType).equal('LeadTicketReOpen');
    expect(contacts[contacts.length - 1].payload.addresseeId).equal(user2.userId);
    expect(contacts[contacts.length - 1].payload.actionIndex).equal(4);
  });
});
