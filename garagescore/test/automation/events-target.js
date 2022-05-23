const TestApp = require('../../common/lib/test/test-app');
const chai = require('chai');
const path = require('path');
const importer = require('../../common/lib/garagescore/data-file/lib/importer');
const exampleData = require('../apollo/examples/data-with-lead-ticket');
const timeHelper = require('../../common/lib/util/time-helper');
const { ObjectId } = require('mongodb');
const sendContactToCustomer = require('../../workers/jobs/scripts/automation-send-contact-to-customer');
const {
  TicketActionNames,
  AutomationCampaignTargets,
  AutomationCampaignsEventsType,
  JobTypes,
} = require('../../frontend/utils/enumV2');
const GarageTypes = require('../../common/models/garage.type');
const DataTypes = require('../../common/models/data/type/data-types');
const LeadTicketStatus = require('../../common/models/data/type/lead-ticket-status');

const expect = chai.expect;
const app = new TestApp();

const createAddLog = async (campaign, garage, customer, eventType, customContentId) => {
  const sentEvent = await mongoAutomationCampaignsEvents.findOne({
    where: {
      type: AutomationCampaignsEventsType.SENT,
    },
  });
  await mongoAutomationCampaignsEvents.addLog(
    {
      garageId: garage.id.toString(),
      campaignId: campaign.id.toString(),
      customerId: customer.id.toString(),
      eventType: eventType,
      contactType: campaign.contactType,
      campaignType: campaign.type,
      target: campaign.target,
      campaignRunDay: timeHelper.todayDayNumber(),
    },
    {
      customContentId: customContentId || (sentEvent && sentEvent.customContentId),
    }
  );
};

let mongoAutomationCampaignsEvents = null;
let mongoAutomationCampaign = null;

describe('Test target on AutomationCampaignsEvents bucket', () => {
  beforeEach(async function beforeEach() {
    // clean database and collections before each test
    await app.reset();
    mongoAutomationCampaignsEvents = app.models.AutomationCampaignsEvents;
    mongoAutomationCampaign = app.models.AutomationCampaign;
    await mongoAutomationCampaignsEvents.getMongoConnector().deleteMany({});
    await app.models.Job.getMongoConnector().deleteMany({});
    // create default garage, customers and datas
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    exampleData.garageId = testGarage.getId();
    exampleData.type = DataTypes.AUTOMATION_CAMPAIGN;
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const garage = await app.models.Garage.findOne();
    const dataFileId = await app.addDataFile(
      testGarage,
      path.join(__dirname, './data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId);
    // init default AutomationCampaign campaign
    await mongoAutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
  });
  it('Should fail because campaignId is missing', async () => {
    const garage = await app.models.Garage.findOne();
    const campaign = await mongoAutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    try {
      await mongoAutomationCampaignsEvents.addLog({
        garageId: garage.id.toString(),
        //campaignId: campaign.id.toString(), --> missing argument
        customerId: customer.id.toString(),
        eventType: AutomationCampaignsEventsType.CONVERTED,
        contactType: campaign.contactType,
        campaignType: campaign.type,
        target: campaign.target,
        campaignRunDay: timeHelper.todayDayNumber(),
      });
    } catch (err) {
      const eventsExpect = await mongoAutomationCampaignsEvents.findOne();
      expect(eventsExpect).equal(null);
      expect(err.message).equal('AutomationCampaignsEvents: campaignId required');
    }
  });
  it('Should fail because TARGET is missing', async () => {
    try {
      const garage = await app.models.Garage.findOne();
      const campaign = await mongoAutomationCampaign.findOne({
        where: { target: AutomationCampaignTargets.M_M },
      });
      const customer = await app.models.Customer.findOne();
      expect(campaign.target).equal(AutomationCampaignTargets.M_M);
      // target is null
      campaign.target = null;
      expect(campaign.target).equal(null);
      // create events
      await createAddLog(campaign, garage, customer, AutomationCampaignsEventsType.CONVERTED);
    } catch (err) {
      expect(err.message).equal('AutomationCampaignsEvents: target required');
    }
  });
  it('Should created target for AutomationCampaignsEvents TARGETED', async () => {
    const garage = await app.models.Garage.findOne();
    const campaigns = await mongoAutomationCampaign.find();
    const customer = await app.models.Customer.findOne();
    // create events
    for (const campaign of campaigns) {
      await createAddLog(campaign, garage, customer, AutomationCampaignsEventsType.TARGETED);
      const eventExpect = await mongoAutomationCampaignsEvents.findOne({
        where: { campaignId: ObjectId(campaign.id.toString()) },
      });
      expect(eventExpect.type).equal(AutomationCampaignsEventsType.TARGETED);
      expect(eventExpect.campaignId.toString()).equal(campaign.id.toString());
      expect(eventExpect.target).equal(campaign.target);
    }

    const eventsExpect = await mongoAutomationCampaignsEvents.find({});
    expect(campaigns.length).equal(eventsExpect.length);
  });
  it('Should create event REACTIVE_LEAD in addEventsfromLeadTicketAction', async () => {
    const data = await app.models.Data.findOne();
    const customer = await app.models.Customer.findOne();
    const campaign = await mongoAutomationCampaign.findOne();
    const type = 'lead';
    const newStatus = null;
    const reactive = true;
    const args = {};
    data.automation = {
      campaignId: campaign.id.toString(),
      customerId: customer.id.toString(),
      campaignRunDay: campaign.runDayNumber,
    };
    // trigger addEventsfromLeadTicketAction
    await mongoAutomationCampaignsEvents.addEventsfromLeadTicketAction(data, args, type, newStatus, reactive);

    const eventExpect = await mongoAutomationCampaignsEvents.findOne({});
    expect(eventExpect.type).equal(AutomationCampaignsEventsType.REACTIVE_LEAD);
    expect(eventExpect.target).equal(campaign.target);
  });
  it('Should create event FOLLOWUP_ANSWERED, LEAD_FOLLOWUP_RESPONDED and FOLLOWUP_HAS_NEW_APPOINTMENT in addEventsfromLeadTicketAction', async () => {
    const data = await app.models.Data.findOne();
    const customer = await app.models.Customer.findOne();
    const campaign = await mongoAutomationCampaign.findOne();
    const type = 'lead';
    const newStatus = null;
    const reactive = false;
    const args = {
      name: TicketActionNames.LEAD_FOLLOWUP_RESPONDED,
      followupIsRecontacted: true,
    };
    data.automation = {
      campaignId: campaign.id.toString(),
      customerId: customer.id.toString(),
      campaignRunDay: campaign.runDayNumber,
    };
    data.leadTicket.actions.push({
      name: TicketActionNames.LEAD_FOLLOWUP_RESPONDED,
      createdAt: new Date(),
      type: 'lead',
    });

    data.leadTicket.followup = {
      appointment: 'YesDone',
    };
    // trigger addEventsfromLeadTicketAction
    await mongoAutomationCampaignsEvents.addEventsfromLeadTicketAction(data, args, type, newStatus, reactive);
    // expect get events
    const eventAnswered = await mongoAutomationCampaignsEvents.findOne({
      where: { type: AutomationCampaignsEventsType.FOLLOWUP_ANSWERED },
    });
    const eventCalledBack = await mongoAutomationCampaignsEvents.findOne({
      where: { type: AutomationCampaignsEventsType.FOLLOWUP_HAS_CALLED_BACK },
    });
    const eventAppointment = await mongoAutomationCampaignsEvents.findOne({
      where: { type: AutomationCampaignsEventsType.FOLLOWUP_HAS_NEW_APPOINTMENT },
    });
    expect(eventAnswered.type).equal(AutomationCampaignsEventsType.FOLLOWUP_ANSWERED);
    expect(eventCalledBack.type).equal(AutomationCampaignsEventsType.FOLLOWUP_HAS_CALLED_BACK);
    expect(eventAppointment.type).equal(AutomationCampaignsEventsType.FOLLOWUP_HAS_NEW_APPOINTMENT);
    expect(eventAnswered.target).equal(campaign.target);
    expect(eventCalledBack.target).equal(campaign.target);
    expect(eventAppointment.target).equal(campaign.target);
  });
  it('Should create new event with externalEventNameParsing in addEventsfromLeadTicketAction', async () => {
    const data = await app.models.Data.findOne();
    const customer = await app.models.Customer.findOne();
    const campaign = await mongoAutomationCampaign.findOne();
    const type = 'lead';
    const newStatus = 'wingOfLiberty';
    const reactive = false;
    const args = {};
    campaign.type = newStatus;
    campaign.save();
    data.automation = {
      campaignId: campaign.id.toString(),
      customerId: customer.id.toString(),
      campaignRunDay: campaign.runDayNumber,
    };

    // trigger addEventsfromLeadTicketAction
    await mongoAutomationCampaignsEvents.addEventsfromLeadTicketAction(data, args, type, newStatus, reactive);
    // expect new event from externalEventNameParsing
    const eventExpect = await mongoAutomationCampaignsEvents.findOne({ where: { campaignType: newStatus } });
    expect(eventExpect.campaignType).equal(newStatus);
    expect(eventExpect.type).equal('WING_OF_LIBERTY');
    expect(eventExpect.target).equal(campaign.target);
  });
  it('Should create event CONVERTED in addEventsfromLeadTicketAction', async () => {
    const data = await app.models.Data.findOne();
    const customer = await app.models.Customer.findOne();
    const campaign = await mongoAutomationCampaign.findOne();
    const type = 'lead';
    const newStatus = LeadTicketStatus.CLOSED_WITH_SALE;
    const reactive = false;
    const args = {
      automaticClose: false,
    };
    campaign.type = AutomationCampaignsEventsType.CONVERTED;
    campaign.save();
    data.automation = {
      campaignId: campaign.id.toString(),
      customerId: customer.id.toString(),
      campaignRunDay: campaign.runDayNumber,
    };

    // trigger addEventsfromLeadTicketAction
    await mongoAutomationCampaignsEvents.addEventsfromLeadTicketAction(data, args, type, newStatus, reactive);

    const eventExpect = await mongoAutomationCampaignsEvents.findOne({});
    expect(eventExpect.campaignType).equal(AutomationCampaignsEventsType.CONVERTED);
    expect(eventExpect.type).equal('CLOSED_WITH_SALE');
    expect(eventExpect.target).equal(campaign.target);
  });
  it('Should set customContentId to null when he is missing', async () => {
    const garage = await app.models.Garage.findOne();
    const campaign = await mongoAutomationCampaign.findOne({
      where: { target: AutomationCampaignTargets.M_M },
    });
    const customer = await app.models.Customer.findOne();
    // create event SENT without customContentId
    await createAddLog(campaign, garage, customer, AutomationCampaignsEventsType.SENT);
    // create events CONVERTED
    await createAddLog(campaign, garage, customer, AutomationCampaignsEventsType.CONVERTED);
    const eventExpect = await mongoAutomationCampaignsEvents.findOne({});
    expect(eventExpect.customContentId).equal(null);
  });
  it('Should set customContentId from database Automation Events SENT', async () => {
    const garage = await app.models.Garage.findOne();
    const campaign = await mongoAutomationCampaign.findOne({
      where: { target: AutomationCampaignTargets.M_M },
    });
    const customer = await app.models.Customer.findOne();
    const customContentId = '5f02eab2f720f333d48a5e7d';
    // create events SENT with customContentId
    await createAddLog(campaign, garage, customer, AutomationCampaignsEventsType.SENT, customContentId);
    // the events should retrieve customContent from SENT event
    await createAddLog(campaign, garage, customer, AutomationCampaignsEventsType.CONVERTED);
    const eventExpect = await mongoAutomationCampaignsEvents.findOne({
      where: { type: AutomationCampaignsEventsType.CONVERTED },
    });
    expect(eventExpect.customContentId.toString()).equal(customContentId.toString());
  });
  it('Should create event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS because email no email are valid', async function test() {
    const testGarage = await app.addGarage();
    const campaign = await mongoAutomationCampaign.create({
      type: 'AUTOMATION_MAINTENANCE',
      contactType: 'EMAIL',
      garageId: ObjectId('5a81b070fa2cc90013b0660c'),
      status: 'RUNNING',
      frequency: 'DAILY',
    });
    const customer = await app.models.Customer.create({
      emailList: ['0251464322'], // email address is not valid
      phoneList: [],
      garageId: testGarage._garageId,
      unsubscribed: false,
      email: '0251464322',
      phone: null,
    });
    const job = {
      payload: {
        customerId: customer.id.toString(),
        campaignId: campaign.id.toString(),
        garageId: testGarage._garageId.toString(),
        campaignType: 'AUTOMATION_MAINTENANCE',
        target: 'M_M_35',
        contactType: 'EMAIL',
        campaignRunDay: timeHelper.todayDayNumber(),
      },
    };

    await sendContactToCustomer(job);
    // when no email are valid, a event should be create CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS
    const events = await mongoAutomationCampaignsEvents.find();
    expect(events.length).equal(1);
    expect(events[0].type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
  });
  it('Should create JOB for consolidate customer when the Promise is reject', async function test() {
    const testGarage = await app.addGarage();
    const campaign = await mongoAutomationCampaign.create({
      type: 'AUTOMATION_MAINTENANCE',
      contactType: 'EMAIL',
      garageId: ObjectId('5a81b070fa2cc90013b0660c'),
      status: 'RUNNING',
      frequency: 'DAILY',
    });
    const customer = await app.models.Customer.create({
      emailList: ['mfrg1111.@gmail.com'], // email address is not valid
      phoneList: [],
      garageId: testGarage._garageId,
      unsubscribed: false,
      email: 'mfrg1111.@gmail.com',
      phone: null,
    });
    const job = {
      payload: {
        customerId: customer.id.toString(),
        campaignId: campaign.id.toString(),
        garageId: testGarage._garageId.toString(),
        campaignType: 'AUTOMATION_MAINTENANCE',
        target: 'M_M_35',
        contactType: 'EMAIL',
        campaignRunDay: timeHelper.todayDayNumber(),
      },
    };
    try {
      await sendContactToCustomer(job);
    } catch (err) {
      const jobExpect = await app.models.Job.findOne({ where: { type: JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER } });
      const eventExpect = await mongoAutomationCampaignsEvents.findOne({
        where: { type: AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS },
      });
      // create a job for consolidate customer when we got error
      expect(err).equal('Invalid recipient email address mfrg1111.@gmail.com');
      expect(jobExpect.type).equal(JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER);
      expect(eventExpect.type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    }
  });
});
