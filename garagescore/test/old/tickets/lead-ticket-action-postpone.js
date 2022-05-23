const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const { SourceTypes, ContactTypes, TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const DataTypes = require('../../../common/models/data-file.data-type');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const LeadTimings = require('../../../common/models/data/type/lead-timings');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const LeadTicketStatuses = require('../../../common/models/data/type/lead-ticket-status');
const ReminderStatuses = require('../../../common/models/data/type/userActions/reminder-status');
const AlertTypes = require('../../../common/models/alert.types');
const KpiPeriods = require('../../../common/lib/garagescore/kpi/KpiPeriods');

const commonTicket = require('../../../common/models/data/_common-ticket');
const { aggregateLeadsKpi } = require('../../../common/lib/garagescore/kpi/kpiAggregator');
const timeHelper = require('../../../common/lib/util/time-helper');

const DataBuilder = require('../../../common/lib/test/test-instance-factory/data-builder');

const { expect } = chai;
const app = new TestApp();

const { LEAD_STARTED, CUSTOMER_CALL, MEETING, PROPOSITION, REMINDER, POSTPONED_LEAD, LEAD_CLOSED } = TicketActionNames;
const {
  WAITING_FOR_CONTACT,
  CONTACT_PLANNED,
  WAITING_FOR_MEETING,
  MEETING_PLANNED,
  WAITING_FOR_PROPOSITION,
  PROPOSITION_PLANNED,
  WAITING_FOR_CLOSING,
  CLOSED_WITHOUT_SALE,
  CLOSED_WITH_SALE,
} = LeadTicketStatuses;

const createLeadFromCampaign = async (garage) => {
  const campaign = await garage.runNewCampaign(DataTypes.MAINTENANCES);
  const survey = await campaign.getSurvey();
  await survey.rate(9).setLead(LeadTypes.INTERESTED, LeadTimings.MID_TERM, LeadSaleTypes.NEW_VEHICLE_SALE).submit();

  const [data] = await campaign.datas();
  return data;
};

const createLead = async (garageId, { leadTicket, type }) => {
  return new DataBuilder(app)
    .shouldSurfaceInStatistics()
    .garage(garageId.toString())
    .type(type) // Type is hacked here to provide identification on the lead/unsatisfied ticket created
    .source(SourceTypes.DATAFILE)
    .leadTicket(leadTicket, Boolean(leadTicket))
    .create();
};

const reminderAction = (
  offset = 0,
  { status = ReminderStatuses.NOT_RESOLVED, reminderActionName = CUSTOMER_CALL } = {}
) => {
  const reminderFirstDay = timeHelper.dayNumber(new Date()) + offset;
  return {
    createdAt,
    name: REMINDER,
    reminderStatus: status,
    reminderFirstDay,
    reminderNextDay: reminderFirstDay,
    reminderDate: timeHelper.dayNumberToDate(reminderFirstDay).toString(),
    reminderActionName,
  };
};

const postponeLead = async (
  data,
  { reminderFirstDay, comment = 'default comment', postponedLeadCreatedAt = new Date() }
) => {
  const postponeAction = {
    name: POSTPONED_LEAD,
    reminderFirstDay,
    reminderNextDay: reminderFirstDay,
    reminderStatus: ReminderStatuses.NOT_RESOLVED,
    comment,
    createdAt: postponedLeadCreatedAt,
  };
  await commonTicket.addAction('lead', data, postponeAction);
  await data.save();
};

const cancelPostponeLead = async (data, { userId, postponedLeadCreatedAt }) => {
  await commonTicket.cancelReminder('lead', data, { userId, createdAt: postponedLeadCreatedAt });
  await data.save();
};

const createdAt = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()) - 90);

describe('Lead ticket action postponedLead', () => {
  let garage = null;
  let user1 = null;
  let user2 = null;
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage();
    user1 = await app.addUser();
    user2 = await app.addUser();
    await user1.addGarage(garage);
    await user2.addGarage(garage);
  });

  describe('postponedLead action creation', () => {
    it('we can add an action postponedLead and schedule the postponing', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }] };
      const data = await createLead(garage.id, { type: 'checkAction', leadTicket });

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      const postponedLeadCreatedAt = new Date();
      const postponeAction = {
        name: POSTPONED_LEAD,
        reminderFirstDay,
        reminderNextDay: reminderFirstDay,
        reminderStatus: ReminderStatuses.NOT_RESOLVED,
        assignerUserId: user1.id,
        createdAt: postponedLeadCreatedAt,
      };
      await commonTicket.addAction('lead', data, postponeAction);
      await data.save();

      // get actions and check last action name & reminderDate & reminderNextDay
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkAction' }, { projection: { leadTicket: true } })
        .toArray();
      expect(dataFromDB.leadTicket).not.to.be.undefined;
      expect(dataFromDB.leadTicket.actions).to.be.an('Array').and.to.have.lengthOf(2);

      const [leadStarted, postponedLeadAction] = dataFromDB.leadTicket.actions;
      expect(postponedLeadAction.name).to.equal(POSTPONED_LEAD);
      expect(postponedLeadAction.reminderFirstDay).to.equal(reminderFirstDay);
      expect(postponedLeadAction.reminderNextDay).to.equal(reminderFirstDay);
      expect(postponedLeadAction.reminderStatus).to.equal(ReminderStatuses.NOT_RESOLVED);
      expect(postponedLeadAction.assignerUserId).to.eql(user1.id);
      expect(postponedLeadAction.createdAt).to.eql(postponedLeadCreatedAt);
    });
    it('we can add an action postponedLead with a comment', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }] };
      const data = await createLead(garage.id, { type: 'checkComment', leadTicket });

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      const comment = 'Hello world';
      await postponeLead(data, { reminderFirstDay, comment });

      // get actions and check comment
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkComment' }, { projection: { leadTicket: true } })
        .toArray();
      expect(dataFromDB.leadTicket).not.to.be.undefined;
      expect(dataFromDB.leadTicket.actions).to.be.an('Array').and.to.have.lengthOf(2);

      const [leadStarted, postponedLeadAction] = dataFromDB.leadTicket.actions;
      expect(postponedLeadAction.name).to.equal(POSTPONED_LEAD);
      expect(postponedLeadAction.comment).to.equal(comment);
    });
    it('we can cancel a postponedLead action', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }] };
      const data = await createLead(garage.id, { type: 'checkCancel', leadTicket });

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      const comment = 'Hello world';
      const postponedLeadCreatedAt = new Date();
      await postponeLead(data, { reminderFirstDay, comment, postponedLeadCreatedAt });

      // cancel the postponing
      await cancelPostponeLead(data, { userId: user1.id, postponedLeadCreatedAt });

      // get actions and check status
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkCancel' }, { projection: { leadTicket: true } })
        .toArray();
      expect(dataFromDB.leadTicket).not.to.be.undefined;
      expect(dataFromDB.leadTicket.actions).to.be.an('Array').and.to.have.lengthOf(2);

      const [leadStarted, postponedLeadAction] = dataFromDB.leadTicket.actions;
      expect(postponedLeadAction.reminderStatus).to.equal(ReminderStatuses.CANCELLED);
      expect(postponedLeadAction.reminderTriggeredByUserId).to.eql(user1.id);
    });
  });

  describe('postponedLead effects on the ticket', () => {
    it("postponing a lead has a slight effect on the ticket's status", async () => {
      // create leads with all possible statuses
      const actionsForStatus = {
        [CONTACT_PLANNED]: [reminderAction(2, { reminderActionName: CUSTOMER_CALL })],
        [WAITING_FOR_MEETING]: [{ name: CUSTOMER_CALL }],
        [MEETING_PLANNED]: [reminderAction(2, { reminderActionName: MEETING })],
        [WAITING_FOR_PROPOSITION]: [{ name: MEETING }],
        [PROPOSITION_PLANNED]: [reminderAction(2, { reminderActionName: PROPOSITION })],
        [WAITING_FOR_CLOSING]: [{ name: PROPOSITION }],
        [CLOSED_WITHOUT_SALE]: [{ name: LEAD_CLOSED }],
        [CLOSED_WITH_SALE]: [{ name: LEAD_CLOSED }],
      };
      const leadTicketWithStatus = (status) => ({
        createdAt,
        status,
        wasTransformedToSale: status === CLOSED_WITH_SALE,
        actions: [{ name: LEAD_STARTED }, ...(actionsForStatus[status] || [])],
      });

      const datas = await Promise.all(
        LeadTicketStatuses.values().map((status) =>
          createLead(garage.id, { type: status, leadTicket: leadTicketWithStatus(status) })
        )
      );

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      await Promise.all(datas.map((data) => postponeLead(data, { reminderFirstDay })));
      // check status
      const datasFromDB = await app.models.Data.getMongoConnector()
        .find({}, { projection: { type: true, leadTicket: true } })
        .toArray();

      for (const { type, leadTicket } of datasFromDB) {
        // Remember, we sat type at the value of leadTicket.status in the beginning
        // It helps us to check because it holds history
        if (type === WAITING_FOR_CONTACT) {
          expect(leadTicket.status).to.equal(CONTACT_PLANNED, 'WAITING_FOR_CONTACT => CONTACT_PLANNED');
        } else if (type === WAITING_FOR_MEETING) {
          expect(leadTicket.status).to.equal(MEETING_PLANNED, 'WAITING_FOR_MEETING => MEETING_PLANNED');
        } else if (type === WAITING_FOR_PROPOSITION) {
          expect(leadTicket.status).to.equal(PROPOSITION_PLANNED, 'WAITING_FOR_PROPOSITION => PROPOSITION_PLANNED');
        } else {
          expect(leadTicket.status).to.equal(type, `${type} should remain but found ${leadTicket.status}`);
        }
      }
    });

    it("cancelling postponedLead restores the previous ticket's status", async () => {
      // create leads with all possible statuses
      const actionsForStatus = {
        [CONTACT_PLANNED]: [reminderAction(2, { reminderActionName: CUSTOMER_CALL })],
        [WAITING_FOR_MEETING]: [{ name: CUSTOMER_CALL }],
        [MEETING_PLANNED]: [reminderAction(2, { reminderActionName: MEETING })],
        [WAITING_FOR_PROPOSITION]: [{ name: MEETING }],
        [PROPOSITION_PLANNED]: [reminderAction(2, { reminderActionName: PROPOSITION })],
        [WAITING_FOR_CLOSING]: [{ name: PROPOSITION }],
        [CLOSED_WITHOUT_SALE]: [{ name: LEAD_CLOSED }],
        [CLOSED_WITH_SALE]: [{ name: LEAD_CLOSED }],
      };
      const leadTicketWithStatus = (status) => ({
        createdAt,
        status,
        wasTransformedToSale: status === CLOSED_WITH_SALE,
        actions: [{ name: LEAD_STARTED }, ...(actionsForStatus[status] || [])],
      });

      const datas = await Promise.all(
        LeadTicketStatuses.values().map((status) =>
          createLead(garage.id, {
            type: status,
            leadTicket: leadTicketWithStatus(status),
          })
        )
      );

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      const postponedLeadCreatedAt = new Date();
      await Promise.all(datas.map((data) => postponeLead(data, { reminderFirstDay, postponedLeadCreatedAt })));

      // cancel all those postponedLead
      await Promise.all(datas.map((data) => cancelPostponeLead(data, { userId: user1.id, postponedLeadCreatedAt })));

      // check status
      const datasFromDB = await app.models.Data.getMongoConnector()
        .find({}, { projection: { type: true, leadTicket: true } })
        .toArray();

      for (const { type, leadTicket } of datasFromDB) {
        // Remember, we sat type at the value of leadTicket.status in the beginning
        // It helps us to check because it holds history
        expect(leadTicket.status).to.equal(type, `${type} should remain but found ${leadTicket.status}`);
      }
    });

    it('postponing a lead cancels all previous reminders', async () => {
      // create lead & set reminders
      const nReminders = Math.ceil(Math.random() * 1000);
      const reminderActions = Array.from(Array(nReminders)).map((e, i) => reminderAction(i + 1));
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }, ...reminderActions] };
      const data = await createLead(garage.id, { type: 'checkCancelledReminders', leadTicket });

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 10;
      await postponeLead(data, { reminderFirstDay });

      // check that reminders have been cancelled
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkCancelledReminders' }, { projection: { leadTicket: true } })
        .toArray();
      const reminders = dataFromDB.leadTicket.actions.filter(({ name }) => name === REMINDER);
      for ({ reminderStatus, cancelledByPostponedLead } of reminders) {
        expect(reminderStatus).to.equal(ReminderStatuses.CANCELLED);
        expect(cancelledByPostponedLead).to.equal(true);
      }
    });

    it('postponing a lead keeps the reference date before we reach scheduled date', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }] };
      const data = await createLead(garage.id, { type: 'checkRefDateFuture', leadTicket });

      // set action postponedLead (it has to be in the past)
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      await postponeLead(data, { reminderFirstDay });

      // check referenceDate
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkRefDateFuture' }, { projection: { leadTicket: true } })
        .toArray();

      const { referenceDate } = dataFromDB.leadTicket;
      expect(referenceDate).not.to.undefined;
      expect(referenceDate.toString()).to.equal(createdAt.toString());
    });

    it('postponing a lead sets the reference date to the scheduled date after we reach it', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }] };
      const data = await createLead(garage.id, { type: 'checkRefDatePast', leadTicket });

      // set action postponedLead (it has to be in the past)
      const reminderFirstDay = timeHelper.dayNumber(new Date()) - 1;
      await postponeLead(data, { reminderFirstDay });

      // check referenceDate
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkRefDatePast' }, { projection: { leadTicket: true } })
        .toArray();

      const { referenceDate } = dataFromDB.leadTicket;
      expect(referenceDate).not.to.undefined;
      const expectedReferenceDate = timeHelper.dayNumberToDate(reminderFirstDay);
      expect(referenceDate.toString()).to.equal(expectedReferenceDate.toString());
    });

    it('cancelling postponedLead restores the previous reference date', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }] };
      const data = await createLead(garage.id, { type: 'checkRefDateCancel', leadTicket });

      // set action postponedLead (it has to be in the past)
      const reminderFirstDay = timeHelper.dayNumber(new Date()) - 1;
      const postponedLeadCreatedAt = new Date();
      await postponeLead(data, { reminderFirstDay, postponedLeadCreatedAt });

      // cancel the postponing
      await cancelPostponeLead(data, { userId: user1.id, postponedLeadCreatedAt });

      // check referenceDate
      const [dataFromDB] = await app.models.Data.getMongoConnector()
        .find({ type: 'checkRefDateCancel' }, { projection: { leadTicket: true } })
        .toArray();

      const { referenceDate } = dataFromDB.leadTicket;
      expect(referenceDate).not.to.undefined;
      expect(referenceDate.toString()).to.equal(createdAt.toString());
    });

    it('a postponed ticket is included in the alert email: LEAD_TICKET_REMINDER at the scheduled date', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }], manager: user1.id.toString() };
      const data = await createLead(garage.id, { type: 'checkReminderEmail', leadTicket });

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 10;
      await postponeLead(data, { reminderFirstDay });

      await commonTicket.sendRemindersForGivenDay('lead', reminderFirstDay);
      const [contact] = await app.contacts();

      // check that we have the LEAD_TICKET_REMINDER email with the correct info
      expect(contact).not.to.be.undefined;
      expect(contact.type).to.equal(ContactTypes.ALERT_EMAIL);
      const { alertType, addresseeId, actions } = contact.payload;
      expect(alertType).to.equal(AlertTypes.LEAD_TICKET_REMINDER);
      expect(addresseeId).to.equal(user1.id.toString());
      expect(actions).to.be.an('Array').and.to.have.lengthOf(1);
      expect(actions[0].garageId).to.equal(garage.id.toString());
      expect(actions[0].dataId).to.equal(data.id.toString());
      expect(actions[0].name).to.equal(POSTPONED_LEAD);
    });

    it('a cancelled postponedLead is NOT included in the alert email: LEAD_TICKET_REMINDER', async () => {
      // create lead
      const leadTicket = { createdAt, actions: [{ name: LEAD_STARTED }], manager: user1.id.toString() };
      const data = await createLead(garage.id, { type: 'checkReminderEmail', leadTicket });

      // set action postponedLead
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 10;
      const postponedLeadCreatedAt = new Date();
      await postponeLead(data, { reminderFirstDay, postponedLeadCreatedAt });

      // cancel the postponing
      await cancelPostponeLead(data, { userId: user1.id, postponedLeadCreatedAt });

      await commonTicket.sendRemindersForGivenDay('lead', reminderFirstDay);
      const [contact] = await app.contacts();

      // check that we don't have LEAD_TICKET_REMINDER email
      expect(contact).to.be.undefined;
    });
  });

  describe('postponedLead effects on the KPIs', () => {
    it("postponing a lead doesn't mess with the KPIs", async () => {
      // create a dataset of leads by pairs with different statuses
      const leadCreatedAt = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()) - 10);
      const actionsForStatus = {
        [CONTACT_PLANNED]: [reminderAction(2, { reminderActionName: CUSTOMER_CALL })],
        [WAITING_FOR_MEETING]: [{ name: CUSTOMER_CALL }],
        [MEETING_PLANNED]: [reminderAction(2, { reminderActionName: MEETING })],
        [WAITING_FOR_PROPOSITION]: [{ name: MEETING }],
        [PROPOSITION_PLANNED]: [reminderAction(2, { reminderActionName: PROPOSITION })],
        [WAITING_FOR_CLOSING]: [{ name: PROPOSITION }],
        [CLOSED_WITHOUT_SALE]: [{ name: LEAD_CLOSED }],
        [CLOSED_WITH_SALE]: [{ name: LEAD_CLOSED }],
      };
      const leadTicketWithStatus = (status) => ({
        createdAt: leadCreatedAt,
        status,
        wasTransformedToSale: status === CLOSED_WITH_SALE,
        actions: [{ name: LEAD_STARTED }, ...(actionsForStatus[status] || [])],
      });
      const dataPairs = await Promise.all(
        LeadTicketStatuses.values().map((status) =>
          Promise.all([
            createLead(garage.id, { type: status, leadTicket: leadTicketWithStatus(status) }),
            createLead(garage.id, { type: status, leadTicket: leadTicketWithStatus(status) }),
          ])
        )
      );
      // in the pair, the 1st will be kept as is, the 2nd will be postponed
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      await Promise.all(dataPairs.map(([data]) => postponeLead(data, { reminderFirstDay })));

      // run kpiAggregator or compute kpis or whatever
      const period = KpiPeriods.getPeriodObjectFromKpiPeriodToken(KpiPeriods.LAST_90_DAYS);
      const kpis = await aggregateLeadsKpi(app, { period });

      // check nLeads = 2 * nStatuses, nLeadsStatusXXX = 2
      const myKpi = kpis.find(({ _id }) => _id === garage.id.toString());
      expect(myKpi).not.to.be.undefined;

      // We got 2 leads for each status
      expect(myKpi.countLeads).to.equal(2 * LeadTicketStatuses.values().length);
      // Postponing a lead WAITING_FOR_CONTACT makes it CONTACT_PLANNED
      expect(myKpi.countLeadsWaitingForContact).to.equal(1);
      expect(myKpi.countLeadsContactPlanned).to.equal(3);
      // Postponing a lead WAITING_FOR_MEETING makes it MEETING_PLANNED
      expect(myKpi.countLeadsWaitingForMeeting).to.equal(1);
      expect(myKpi.countLeadsMeetingPlanned).to.equal(3);
      // Postponing a lead WAITING_FOR_PROPOSITION makes it PROPOSITION_PLANNED
      expect(myKpi.countLeadsWaitingForProposition).to.equal(1);
      expect(myKpi.countLeadsPropositionPlanned).to.equal(3);
      // No effect on the others
      expect(myKpi.countLeadsWaitingForClosing).to.equal(2);
      expect(myKpi.countLeadsClosedWithoutSale).to.equal(2);
      expect(myKpi.countLeadsClosedWithSale).to.equal(2);
    });

    it("cancelled postponedLead doesn't mess with the KPIs", async () => {
      // create a dataset of leads by pairs with different statuses
      const leadCreatedAt = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()) - 10);
      const actionsForStatus = {
        [CONTACT_PLANNED]: [reminderAction(2, { reminderActionName: CUSTOMER_CALL })],
        [WAITING_FOR_MEETING]: [{ name: CUSTOMER_CALL }],
        [MEETING_PLANNED]: [reminderAction(2, { reminderActionName: MEETING })],
        [WAITING_FOR_PROPOSITION]: [{ name: MEETING }],
        [PROPOSITION_PLANNED]: [reminderAction(2, { reminderActionName: PROPOSITION })],
        [WAITING_FOR_CLOSING]: [{ name: PROPOSITION }],
        [CLOSED_WITHOUT_SALE]: [{ name: LEAD_CLOSED }],
        [CLOSED_WITH_SALE]: [{ name: LEAD_CLOSED }],
      };
      const leadTicketWithStatus = (status) => ({
        createdAt: leadCreatedAt,
        status,
        wasTransformedToSale: status === CLOSED_WITH_SALE,
        actions: [{ name: LEAD_STARTED }, ...(actionsForStatus[status] || [])],
      });
      const dataPairs = await Promise.all(
        LeadTicketStatuses.values().map((status) =>
          Promise.all([
            createLead(garage.id, { type: status, leadTicket: leadTicketWithStatus(status) }),
            createLead(garage.id, { type: status, leadTicket: leadTicketWithStatus(status) }),
          ])
        )
      );
      // in the pair, the 1st will be kept as is, the 2nd will be postponed
      const reminderFirstDay = timeHelper.dayNumber(new Date()) + 1;
      const postponedLeadCreatedAt = new Date();
      await Promise.all(dataPairs.map(([data]) => postponeLead(data, { reminderFirstDay, postponedLeadCreatedAt })));

      // cancel the postponeLead actions
      await Promise.all(
        dataPairs.map(([data]) => cancelPostponeLead(data, { userId: user1.id, postponedLeadCreatedAt }))
      );

      // run kpiAggregator or compute kpis or whatever
      const period = KpiPeriods.getPeriodObjectFromKpiPeriodToken(KpiPeriods.LAST_90_DAYS);
      const kpis = await aggregateLeadsKpi(app, { period });

      // check nLeads = 2 * nStatuses, nLeadsStatusXXX = 2
      const myKpi = kpis.find(({ _id }) => _id === garage.id.toString());
      expect(myKpi).not.to.be.undefined;

      // We got 2 leads for each status
      expect(myKpi.countLeads).to.equal(2 * LeadTicketStatuses.values().length);
      // Postponing a lead WAITING_FOR_CONTACT makes it CONTACT_PLANNED
      expect(myKpi.countLeadsWaitingForContact).to.equal(2);
      expect(myKpi.countLeadsContactPlanned).to.equal(2);
      // Postponing a lead WAITING_FOR_MEETING makes it MEETING_PLANNED
      expect(myKpi.countLeadsWaitingForMeeting).to.equal(2);
      expect(myKpi.countLeadsMeetingPlanned).to.equal(2);
      // Postponing a lead WAITING_FOR_PROPOSITION makes it PROPOSITION_PLANNED
      expect(myKpi.countLeadsWaitingForProposition).to.equal(2);
      expect(myKpi.countLeadsPropositionPlanned).to.equal(2);
      // No effect on the others
      expect(myKpi.countLeadsWaitingForClosing).to.equal(2);
      expect(myKpi.countLeadsClosedWithoutSale).to.equal(2);
      expect(myKpi.countLeadsClosedWithSale).to.equal(2);
    });
  });
});
