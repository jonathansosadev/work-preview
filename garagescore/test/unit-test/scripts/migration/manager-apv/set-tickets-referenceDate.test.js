/** Testing the migration script because it's hell */
const TestApp = require('../../../../../common/lib/test/test-app');

const chai = require('chai');

const { TicketActionNames } = require('../../../../../frontend/utils/enumV2');
const ReminderStatuses = require('../../../../../common/models/data/type/userActions/reminder-status');

const { setReferenceDateForPeriod } = require('../../../../../scripts/migration/manager-apv/set-tickets-referenceDate');
const DataBuilder = require('../../../../../common/lib/test/test-instance-factory/data-builder');
const timeHelper = require('../../../../../common/lib/util/time-helper');

const expect = chai.expect;
const app = new TestApp();
/**
 * Test the model 'data'
 */
const generateTestData = (garageId) => {
  const createDataWithTicketsSpecs = ({ leadTicket, unsatisfiedTicket, type }) => {
    return new DataBuilder(app)
      .garage(garageId)
      .type(type) // Type is hacked here to provide identification on the lead/unsatisfied ticket created
      .leadTicket(leadTicket, !!leadTicket)
      .unsatisfiedTicket(unsatisfiedTicket, !!unsatisfiedTicket)
      .create();
  };
  const reminder = (offset = 0, status = ReminderStatuses.NOT_RESOLVED) => {
    const reminderFirstDay = timeHelper.dayNumber(new Date()) + offset;
    return {
      createdAt,
      name: TicketActionNames.REMINDER,
      reminderStatus: status,
      reminderFirstDay,
      reminderNextDay: reminderFirstDay,
      reminderDate: timeHelper.dayNumberToDate(reminderFirstDay).toString(),
      reminderActionName: TicketActionNames.CUSTOMER_CALL,
    };
  };
  const createdAt = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()) - 90);
  const dataSpecs = [
    // No leadTicket, no unsatisfiedTicket
    { type: 'nothing' },
    // leadTicket without action, no unsatisfiedTicket
    { leadTicket: { createdAt }, type: 'leadNoAction' },
    // unsatisfiedTicket without action, no leadTicket
    { unsatisfiedTicket: { createdAt }, type: 'unsatisfiedNoAction' },
    // leadTicket with reminder in the future, still no unsatisfiedTicket
    { leadTicket: { createdAt, actions: [reminder(15)] }, type: 'leadReminderFuture' },
    // leadTicket with reminder today
    { leadTicket: { createdAt, actions: [reminder(0)] }, type: 'leadReminderToday' },
    // leadTicket with reminder in close past
    { leadTicket: { createdAt, actions: [reminder(-3)] }, type: 'leadReminderRecent' },
    // leadTicket with reminder in far past
    { leadTicket: { createdAt, actions: [reminder(-30)] }, type: 'leadReminderOld' },
    // leadTicket with resolved reminder
    { leadTicket: { createdAt, action: [reminder(0, ReminderStatuses.RESOLVED)] }, type: 'leadReminderResolved' },
    // leadTicket with canceled reminder
    { leadTicket: { createdAt, action: [reminder(0, ReminderStatuses.CANCELLED)] }, type: 'leadReminderCancelled' },
    // unsatisfiedTicket with reminder in the future, still no leadTicket
    { unsatisfiedTicket: { createdAt, actions: [reminder(15)] }, type: 'unsatisfiedReminderFuture' },
    // unsatisfiedTicket with reminder today
    { unsatisfiedTicket: { createdAt, actions: [reminder(0)] }, type: 'unsatisfiedReminderToday' },
    // unsatisfiedTicket with reminder in close past
    { unsatisfiedTicket: { createdAt, actions: [reminder(-3)] }, type: 'unsatisfiedReminderRecent' },
    // unsatisfiedTicket with reminder in far past
    { unsatisfiedTicket: { createdAt, actions: [reminder(-30)] }, type: 'unsatisfiedReminderOld' },
    // unsatisfiedTicket with resolved reminder
    {
      unsatisfiedTicket: { createdAt, action: [reminder(0, ReminderStatuses.RESOLVED)] },
      type: 'unsatisfiedReminderResolved',
    },
    // unsatisfiedTicket with canceled reminder
    {
      unsatisfiedTicket: { createdAt, action: [reminder(0, ReminderStatuses.CANCELLED)] },
      type: 'unsatisfiedReminderCancelled',
    },
    // leadTicket & unsatisfiedTicket with reminder today
    {
      leadTicket: { createdAt, actions: [reminder(0)] },
      unsatisfiedTicket: { createdAt, actions: [reminder(0)] },
      type: 'bothReminderToday',
    },
  ];

  return Promise.all(dataSpecs.map(createDataWithTicketsSpecs));
};

const checkReferenceDate = (ticket, value) => {
  const toCheck = ticket && ticket.referenceDate && ticket.referenceDate.toString();
  const toCompare = value && value.toString();
  expect(toCheck).to.equals(toCompare);
};

describe('Ticket referenceDate migration script', async () => {
  let garage = null;
  before(async function () {
    await app.reset();
    garage = await app.addGarage();

    await generateTestData(garage.id.toString());

    const minDay = timeHelper.dayNumber(new Date()) - 10;
    const maxDay = timeHelper.dayNumber(new Date());
    await setReferenceDateForPeriod(app, { minDay, maxDay });
  });

  it('does nothing when data has no lead/unsatisfied Ticket', async () => {
    const [noTicketData] = await app.models.Data.getMongoConnector()
      .find({ type: 'nothing' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    expect(noTicketData.leadTicket).to.be.undefined;
    expect(noTicketData.unsatisfiedTicket).to.be.undefined;
  });

  it("sets the reference date to ticket.createdAt if there's no reminder", async () => {
    const [leadNoAction] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadNoAction' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedNoAction] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedNoAction' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    checkReferenceDate(leadNoAction.leadTicket, leadNoAction.leadTicket.createdAt);
    checkReferenceDate(unsatisfiedNoAction.unsatisfiedTicket, unsatisfiedNoAction.unsatisfiedTicket.createdAt);
    expect(leadNoAction.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedNoAction.leadTicket).to.be.undefined;
  });
  it('sets the reference date to ticket.createdAt if the reminder is in the future', async () => {
    const [leadReminderFuture] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadReminderFuture' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedReminderFuture] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedReminderFuture' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    checkReferenceDate(leadReminderFuture.leadTicket, leadReminderFuture.leadTicket.createdAt);
    checkReferenceDate(
      unsatisfiedReminderFuture.unsatisfiedTicket,
      unsatisfiedReminderFuture.unsatisfiedTicket.createdAt
    );
    expect(leadReminderFuture.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedReminderFuture.leadTicket).to.be.undefined;
  });

  it("sets the reference date to the reminder date if it's today", async () => {
    const [leadReminderToday] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadReminderToday' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedReminderToday] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedReminderToday' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    const todayMidnight = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()));
    checkReferenceDate(leadReminderToday.leadTicket, todayMidnight);
    checkReferenceDate(unsatisfiedReminderToday.unsatisfiedTicket, todayMidnight);
    expect(leadReminderToday.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedReminderToday.leadTicket).to.be.undefined;
  });
  it("sets the reference date to the reminder date if it's recent", async () => {
    const [leadReminderRecent] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadReminderRecent' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedReminderRecent] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedReminderRecent' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    const threeDaysAgo = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()) - 3);
    checkReferenceDate(leadReminderRecent.leadTicket, threeDaysAgo);
    checkReferenceDate(unsatisfiedReminderRecent.unsatisfiedTicket, threeDaysAgo);
    expect(leadReminderRecent.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedReminderRecent.leadTicket).to.be.undefined;
  });

  it('sets the reference date to ticket.createdAt if the reminder is too old', async () => {
    const [leadReminderOld] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadReminderOld' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedReminderOld] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedReminderOld' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    checkReferenceDate(leadReminderOld.leadTicket, leadReminderOld.leadTicket.createdAt);
    checkReferenceDate(unsatisfiedReminderOld.unsatisfiedTicket, unsatisfiedReminderOld.unsatisfiedTicket.createdAt);
    expect(leadReminderOld.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedReminderOld.leadTicket).to.be.undefined;
  });

  it('sets the reference date to ticket.createdAt if the reminder resolved', async () => {
    const [leadReminderResolved] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadReminderResolved' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedReminderResolved] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedReminderResolved' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    checkReferenceDate(leadReminderResolved.leadTicket, leadReminderResolved.leadTicket.createdAt);
    checkReferenceDate(
      unsatisfiedReminderResolved.unsatisfiedTicket,
      unsatisfiedReminderResolved.unsatisfiedTicket.createdAt
    );
    expect(leadReminderResolved.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedReminderResolved.leadTicket).to.be.undefined;
  });

  it('sets the reference date to ticket.createdAt if the reminder is cancelled', async () => {
    const [leadReminderCancelled] = await app.models.Data.getMongoConnector()
      .find({ type: 'leadReminderCancelled' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();
    const [unsatisfiedReminderCancelled] = await app.models.Data.getMongoConnector()
      .find({ type: 'unsatisfiedReminderCancelled' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    checkReferenceDate(leadReminderCancelled.leadTicket, leadReminderCancelled.leadTicket.createdAt);
    checkReferenceDate(
      unsatisfiedReminderCancelled.unsatisfiedTicket,
      unsatisfiedReminderCancelled.unsatisfiedTicket.createdAt
    );
    expect(leadReminderCancelled.unsatisfiedTicket).to.be.undefined;
    expect(unsatisfiedReminderCancelled.leadTicket).to.be.undefined;
  });

  it("sets the reference date to the reminder date if it's today", async () => {
    const [bothReminderToday] = await app.models.Data.getMongoConnector()
      .find({ type: 'bothReminderToday' }, { projection: { leadTicket: true, unsatisfiedTicket: true } })
      .toArray();

    const todayMidnight = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()));
    checkReferenceDate(bothReminderToday.leadTicket, todayMidnight);
    checkReferenceDate(bothReminderToday.unsatisfiedTicket, todayMidnight);
  });
});
