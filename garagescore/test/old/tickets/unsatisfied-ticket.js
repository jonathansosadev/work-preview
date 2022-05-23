const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai').use(require('chai-as-promised'));

const { TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const dataFileTypes = require('../../../common/models/data-file.data-type');

const timeHelper = require('../../../common/lib/util/time-helper');
const commonTicket = require('../../../common/models/data/_common-ticket');

const expect = chai.expect;
const app = new TestApp();
/**
 * Test the model 'data'
 */
describe('Data model UnsatisfiedTicket:', async () => {
  let garage = null;
  let user1 = null;
  let user2 = null;
  before(async function () {});
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage({
      thresholds: {
        alertSensitiveThreshold: {
          maintenance: 7,
          sale_new: 7,
          sale_used: 7,
        },
      },
    });
    user1 = await app.addUser();
    user2 = await app.addUser();
  });

  it('unsatisfiedTicket manager must be a string', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    const datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(typeof datas[0].unsatisfiedTicket.manager).equal('string');
    await app.reset();
  });
  it('test initialising unsatisfiedTicket + add customerCall action + closeTicket', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(2).submit();
    let datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].unsatisfiedTicket.status).equal('WaitingForContact');
    expect(datas[0].unsatisfiedTicket.actions.length).equal(1);
    expect(datas[0].unsatisfiedTicket.actions[0].name).equal('unsatisfiedStarted');
    let jobs;
    jobs = await app.jobs({
      where: {
        type: JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET,
      },
    });
    expect(jobs.length).equal(1);
    // if the test is ran during the night (outside opening hours), we first move to tomorrow (+1) then add 30 days (+30)
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).to.be.oneOf([
      timeHelper.dayNumber(new Date()) + 30,
      timeHelper.dayNumber(new Date()) + 31,
    ]);
    jobs = await app.jobs({
      where: {
        type: JobTypes.ESCALATE,
      },
    });
    expect(jobs.length).equal(1);
    // Adding CustomerCall TicketActionTo Data[0]
    await commonTicket.addAction('unsatisfied', datas[0], {
      name: TicketActionNames.CUSTOMER_CALL,
      assignerUserId: user1.userId,
    });
    await datas[0].save();

    // Transfer TicketAction of Data[0] to user2
    await commonTicket.addAction('unsatisfied', datas[0], {
      name: TicketActionNames.TRANSFER,
      assignerUserId: user1.userId,
      ticketManagerId: user2.userId,
    });
    await datas[0].save();

    datas = await campaign.datas();
    expect(datas[0].unsatisfiedTicket.status).equal('WaitingForVisit');
    expect(datas[0].unsatisfiedTicket.actions.length).equal(3);

    // check that a unsatisfiedTicketTransfer notification was sent to the assigned user (user2)
    let contacts = await app.contacts();
    expect(contacts[contacts.length - 1].type).equal('ALERT_EMAIL');
    expect(contacts[contacts.length - 1].payload.alertType).equal('UnsatisfiedTicketTransfer');
    expect(contacts[contacts.length - 1].payload.addresseeId).equal(user2.userId);
    expect(contacts[contacts.length - 1].payload.actionIndex).equal(2);

    // Closing Unsat Ticket
    await commonTicket.addAction('unsatisfied', datas[0], {
      name: TicketActionNames.UNSATISFIED_CLOSED,
      assignerUserId: user1.userId,
      wasTransformedToSale: true,
      alertContributors: true,
    });
    await datas[0].save();
    datas = await campaign.datas();
    expect(datas[0].unsatisfiedTicket.status).equal('ClosedWithoutResolution');
    expect(datas[0].unsatisfiedTicket.actions.length).equal(4);
    jobs = await app.jobs({
      where: {
        type: JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET,
      },
    });
    expect(jobs.length).equal(0);
    jobs = await app.jobs({
      where: {
        type: JobTypes.ESCALATE,
      },
    });
    expect(jobs.length).equal(0);

    // check that a unsatisfiedTicketCloseAction notification was sent to the unique participant in the unsatisfiedTicket (user2)
    contacts = await app.contacts();
    expect(contacts[contacts.length - 1].type).equal('ALERT_EMAIL');
    expect(contacts[contacts.length - 1].payload.alertType).equal('UnsatisfiedTicketCloseAction');
    expect(contacts[contacts.length - 1].payload.addresseeId).equal(user2.userId);
    expect(contacts[contacts.length - 1].payload.actionIndex).equal(3);

    // Reopening Unsat Ticket
    await commonTicket.addAction('unsatisfied', datas[0], {
      name: TicketActionNames.UNSATISFIED_REOPENED,
      assignerUserId: user1.userId,
      alertContributors: true,
    });
    await datas[0].save();

    datas = await campaign.datas();
    expect(datas[0].unsatisfiedTicket.status).equal('WaitingForVisit');
    expect(datas[0].unsatisfiedTicket.actions.length).equal(5);
    jobs = await app.jobs({
      where: {
        type: JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET,
      },
    });
    expect(jobs.length).equal(1);
    expect(jobs[0].type).equal(JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET);
    // if the test is ran during the night (outside opening hours), we first move to tomorrow (+1) then add 30 days (+30)
    expect(timeHelper.dayNumber(jobs[0].scheduledAtAsDate)).to.be.oneOf([
      timeHelper.dayNumber(new Date()) + 30,
      timeHelper.dayNumber(new Date()) + 31,
    ]);

    // check that a unsatisfiedTicketReOpen notification was sent to the unique participant in the unsatisfiedTicket user2
    contacts = await app.contacts();
    expect(contacts[contacts.length - 1].type).equal('ALERT_EMAIL');
    expect(contacts[contacts.length - 1].payload.alertType).equal('UnsatisfiedTicketReOpen');
    expect(contacts[contacts.length - 1].payload.addresseeId).equal(user2.userId);
    expect(contacts[contacts.length - 1].payload.actionIndex).equal(4);
  });

  it('test initialising unsatisfiedTicket from sensible', async () => {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(7).submit();
    const datas = await campaign.datas();
    expect(datas.length).equal(1);
    expect(datas[0].unsatisfiedTicket.status).equal('WaitingForContact');
  });
});
