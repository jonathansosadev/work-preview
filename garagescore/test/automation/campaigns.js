const TestApp = require('../../common/lib/test/test-app');
const testTools = require('../../common/lib/test/testtools');
const dataFileTypes = require('../../common/models/data-file.data-type');
const chai = require('chai');
const sendContactToCustomer = require('../../workers/jobs/scripts/automation-send-contact-to-customer');
const createTicket = require('../../workers/jobs/scripts/automation-create-ticket');
const resetPressure = require('../../workers/jobs/scripts/automation-reset-pressure');
const automationCampaignChannel = require('../../common/models/automation-campaign-channel.type');
const {
  createCustomer,

  createAndRunAutomationCampaign,
  createCampaign,
} = require('./common/_utils');
const {
  AutomationCampaignStatuses,
  AutomationCampaignTargets,
  AutomationCampaignsEventsType,
  TicketActionNames,
  JobTypes,
} = require('../../frontend/utils/enumV2');
const timeHelper = require('../../common/lib/util/time-helper');
const commonTicket = require('../../common/models/data/_common-ticket.js');
const automationCrossedLeadsHandler = require('../../common/lib/garagescore/automation/automation-crossed-leads-handler');
const { ObjectId } = require('mongodb');

const expect = chai.expect;
/* eslint-disable no-unused-expressions */
const app = new TestApp();

let garageMongoConnector, customerMongoConnector, automationCampaignMongoConnector, jobMongoConnector;

/*
        Common functions and variables for tests
 */

// Two campaigns per target (MOBILE and EMAIL)
const amountOfAvailableCampaigns = AutomationCampaignTargets.valuesWithFilter('active', true).length * 2;

const getRandomGarageAndItsAssociatedCampaigns = async () => {
  let testGarage = await app.addGarage();
  let garage = await garageMongoConnector.findOne({ _id: testGarage._garageId });
  await app.models.AutomationCampaign.initDefaultCampaigns(
    garage._id,
    garage.subscriptions,
    garage.dataFirstDays,
    garage.locale,
    garage.status
  );
  const aCampaigns = await automationCampaignMongoConnector.find({}).toArray();
  return { aCampaigns, garage, testGarage };
};

const createOrAddDataToCustomer = async (email, mobilePhone, testGarage, dataType) => {
  expect(!!(email || mobilePhone)).to.equal(true);
  const person = testTools.random.person();
  person.email = email;
  person.mobilePhone = mobilePhone;
  await testGarage.runNewCampaign(dataType, person);
  const where = {
    garageId: new ObjectId(testGarage.getId()),
  };
  if (email) where.email = email;
  if (mobilePhone) where.phone = mobilePhone;
  const customer = customerMongoConnector.findOne(where);
  expect(customer).to.not.be.undefined;
  return customer;
};

describe('Test automation campaigns:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    garageMongoConnector = app.models.Garage.getMongoConnector();
    customerMongoConnector = app.models.Customer.getMongoConnector();
    automationCampaignMongoConnector = app.models.AutomationCampaign.getMongoConnector();
    automationCampaignsEventsMongoConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
    jobMongoConnector = app.models.Job.getMongoConnector();
  });
  it('Create a garage and add campaigns to it', async function test() {
    let { aCampaigns } = await getRandomGarageAndItsAssociatedCampaigns();
    expect(aCampaigns.length).equal(amountOfAvailableCampaigns);
  });
  it('Should create a campaign EMAIL and MOBILE for a customer', async function test() {
    const testGarage = await app.addGarage();
    const garage = await garageMongoConnector.findOne({ _id: testGarage._garageId });
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garage._id,
      garage.subscriptions,
      garage.dataFirstDays,
      garage.locale,
      garage.status
    );
    const campaignsExpected = await automationCampaignMongoConnector
      .find({
        target: AutomationCampaignTargets.M_M,
      })
      .toArray();
    // We try the campaigns M_M MOBILE and EMAIL
    const campaignEmail = campaignsExpected.find((c) => c.contactType === automationCampaignChannel.EMAIL);
    const campaignMobile = campaignsExpected.find((c) => c.contactType === automationCampaignChannel.MOBILE);
    expect(campaignEmail.contactType).equal(automationCampaignChannel.EMAIL);
    expect(campaignMobile.contactType).equal(automationCampaignChannel.MOBILE);
  });
  it('Should send RGPD first to customer for campaign EMAIL', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target, automationCampaignChannel.EMAIL);
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.EMAIL,
    });
    await sendContactToCustomer(senContactJob);

    const customerExpect = await customerMongoConnector.findOne({ email });
    const events = await automationCampaignsEventsMongoConnector.find({}).toArray();
    const prepareSendRgpd = events.find((e) => e.type === AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    const rgpdDelay = events.find((e) => e.type === AutomationCampaignsEventsType.DELAYED_BY_GDPR);
    // should create event RGPD and set date on customer hasReceivedGDPRContactAt
    expect(!!customerExpect.hasReceivedGDPRContactAt).equal(true);
    expect(senContactJob.payload.contactType).equal(automationCampaignChannel.EMAIL);
    expect(prepareSendRgpd.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    expect(rgpdDelay.type).equal(AutomationCampaignsEventsType.DELAYED_BY_GDPR);
  });
  it('Should send RGPD with short URL if the garage is not French', async function test() {
    const garage = await app.addGarage({ locale: 'es_ES' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target, automationCampaignChannel.MOBILE);
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.MOBILE,
    });
    await sendContactToCustomer(senContactJob);

    const customerExpect = await customerMongoConnector.findOne({ email });
    const events = await automationCampaignsEventsMongoConnector.find({}).toArray();
    const expectContact = await app.models.Contact.getMongoConnector().findOne();
    const prepareSendRgpd = events.find((e) => e.type === AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    const rgpdDelay = events.find((e) => e.type === AutomationCampaignsEventsType.DELAYED_BY_GDPR);
    // should create event RGPD and set date on customer hasReceivedGDPRContactAt
    expect(!!customerExpect.hasReceivedGDPRContactAt).equal(true);
    expect(senContactJob.payload.contactType).equal(automationCampaignChannel.MOBILE);
    expect(prepareSendRgpd.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    expect(rgpdDelay.type).equal(AutomationCampaignsEventsType.DELAYED_BY_GDPR);
    expect(expectContact.payload.shortUrl.length).is.greaterThan(1);
  });
  it('Should send RGPD first to customer for campaign MOBILE and delay the job MOBILE', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target, automationCampaignChannel.MOBILE);
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.MOBILE,
    });
    await sendContactToCustomer(senContactJob);
    // get results
    const customerExpect = await customerMongoConnector.findOne({ email });
    const events = await automationCampaignsEventsMongoConnector.find({}).toArray();
    const prepareSendRgpd = events.find((e) => e.type === AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    const rgpdDelay = events.find((e) => e.type === AutomationCampaignsEventsType.DELAYED_BY_GDPR);
    const jobMobile = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.MOBILE,
      'payload.delayedByGDPR': true,
    });
    // should create event RGPD and set date on customer hasReceivedGDPRContactAt
    expect(!!customerExpect.hasReceivedGDPRContactAt).equal(true);
    expect(jobMobile).to.not.be.undefined;
    expect(jobMobile.payload.delayedByGDPR).equal(true);
    expect(jobMobile.payload.target).equal(target);
    expect(senContactJob.payload.contactType).equal(automationCampaignChannel.MOBILE);
    expect(prepareSendRgpd.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    expect(rgpdDelay.type).equal(AutomationCampaignsEventsType.DELAYED_BY_GDPR);
  });
  it('Should run campaign and send email to customer for a campaign EMAIL and delay campaign MOBILE', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    const today = timeHelper.todayDayNumber();
    await createCustomer(app, target, garage, email);
    await createCampaign(app, garage, target, automationCampaignChannel.MOBILE);
    await createAndRunAutomationCampaign(app, garage, target);
    // set customer already get RGPD
    await customerMongoConnector.updateOne(
      { email: email },
      { $set: { hasReceivedGDPRContactAt: timeHelper.dayNumberToDate(today - 3) } }
    );
    const jobEmail = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.EMAIL,
    });
    const jobMobile = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.MOBILE,
    });
    // executed job
    await sendContactToCustomer(jobEmail);
    await sendContactToCustomer(jobMobile);
    // get results
    const [jobMobileExpect, contactExpect] = await Promise.all([
      jobMongoConnector.findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
        'payload.contactType': automationCampaignChannel.MOBILE,
        'payload.delayedBySmsChecking': true,
      }),
      app.models.Contact.getMongoConnector().findOne({ to: email }),
    ]);
    // expected send messange on customer email and delay job mobile
    expect(contactExpect.to).equal(email);
    expect(contactExpect.payload.target).equal(target);
    expect(jobMobileExpect.payload.delayedBySmsChecking).equal(true);
    expect(jobMobileExpect.payload.target).equal(target);
  });
  it('Should run campaign and send contact to customer for a campaign MOBILE', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const phone = '+33745556969';
    const target = AutomationCampaignTargets.M_M;
    const today = timeHelper.todayDayNumber();
    await createCustomer(app, target, garage, null, phone);
    await createAndRunAutomationCampaign(app, garage, target, automationCampaignChannel.MOBILE);
    // set customer already get RGPD
    await customerMongoConnector.updateOne(
      { phone: phone },
      { $set: { hasReceivedGDPRContactAt: timeHelper.dayNumberToDate(today - 3) } }
    );
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.MOBILE,
    });
    await sendContactToCustomer(senContactJob);

    const contactExpect = await app.models.Contact.getMongoConnector().findOne({
      to: phone,
    });

    // expected send messange on customer mobile
    expect(contactExpect.to).equal(phone);
    expect(contactExpect.payload.shortUrl).to.be.a('string').that.is.not.empty;
  });
  it('Should set pressure to true after send contact to customer', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    const leadDataType = AutomationCampaignTargets.getProperty(target, 'leadDataType');
    const today = timeHelper.todayDayNumber();
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target);
    // set customer already get RGPD
    await customerMongoConnector.updateOne(
      { email: email },
      { $set: { hasReceivedGDPRContactAt: timeHelper.dayNumberToDate(today - 3) } }
    );
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
    });
    // send contact to customer
    await sendContactToCustomer(senContactJob);
    const customerExpect = await customerMongoConnector.findOne({
      email: email,
    });
    const resetPressureJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_RESET_PRESSURE,
    });
    // expect hasRecentlyBeenContacted = AUTOMATION_MAINTENANCE
    // the job for reset pressure shoulb be executed after 30 days
    expect(Object.keys(customerExpect.hasRecentlyBeenContacted).toString()).equal(leadDataType);
    expect(timeHelper.todayDayNumber() + 30).to.equal(timeHelper.dayNumber(resetPressureJob.scheduledAtAsDate));
    expect(resetPressureJob.type).equal(JobTypes.AUTOMATION_RESET_PRESSURE);
  });
  it('Should not run send contact to customer because pressure is true', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    const leadDataType = AutomationCampaignTargets.getProperty(target, 'leadDataType');
    const today = timeHelper.todayDayNumber();
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target);
    // set customer hasRecentlyBeenContacted and already get RGPD
    await customerMongoConnector.updateOne(
      { email: email },
      {
        $set: {
          hasReceivedGDPRContactAt: timeHelper.dayNumberToDate(today - 3),
          hasRecentlyBeenContacted: { [leadDataType]: new Date() },
        },
      }
    );
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
    });
    // send contact to customer
    await sendContactToCustomer(senContactJob);
    const eventExpect = await automationCampaignsEventsMongoConnector.findOne({
      type: AutomationCampaignsEventsType.PRESSURE_BLOCKED,
    });
    // expect an event PRESSURE_BLOCKED
    expect(eventExpect.garageId.toString()).equal(garage.id.toString());
    expect(eventExpect.type).equal(AutomationCampaignsEventsType.PRESSURE_BLOCKED);
  });
  it('Should reset pressutre to customer', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    const leadDataType = AutomationCampaignTargets.getProperty(target, 'leadDataType');
    const today = timeHelper.todayDayNumber();
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target);
    // set customer already get RGPD
    await customerMongoConnector.updateOne(
      { email: email },
      { $set: { hasReceivedGDPRContactAt: timeHelper.dayNumberToDate(today - 3) } }
    );
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
    });
    // send contact to customer
    await sendContactToCustomer(senContactJob);
    const customerBefore = await customerMongoConnector.findOne({ email });
    const jobResetPressure = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_RESET_PRESSURE,
    });
    // executed job for reset pressure on customer
    await resetPressure(jobResetPressure);

    const customerExpect = await customerMongoConnector.findOne({ email });
    // pressure is false
    expect(!!customerBefore.hasRecentlyBeenContacted[leadDataType]).equal(true);
    expect(customerExpect.hasRecentlyBeenContacted[leadDataType]).equal(false);
  });
  it("Blacklisted customer with a single email won't be contacted", async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const target = AutomationCampaignTargets.M_M;
    const today = timeHelper.todayDayNumber();
    const emailBlacklisted = 'jacky.and.michel@email.com';
    await createCustomer(app, target, garage, emailBlacklisted);
    // blacklist email
    await customerMongoConnector.updateOne(
      { email: emailBlacklisted },
      { $set: { hasReceivedGDPRContactAt: timeHelper.dayNumberToDate(today - 30) } }
    );
    await app.models.BlackListItem.getMongoConnector().insertOne({
      reason: 'USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL',
      to: emailBlacklisted,
    });
    await createAndRunAutomationCampaign(app, garage, target);
    // retrieve and execute job
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.garageId': garage.id.toString(),
    });
    await sendContactToCustomer(senContactJob);

    const expectCustomer = await customerMongoConnector.findOne({
      garageId: ObjectId(garage.id.toString()),
    });
    const expectContact = await app.models.Contact.getMongoConnector().find().toArray();
    // expect no contact was created and email is blacklist
    expect(expectContact.length).equal(0);
    expect(expectCustomer.email).equal(null);
    expect(expectCustomer.emailBlackList.toString()).equal(emailBlacklisted);
  });
  it('Customer with two emails including the main one blacklisted will be contacted', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const target = AutomationCampaignTargets.M_M;
    const emailValid = 'valid_send@email.com';
    const emailBlacklisted = 'jacky.and.michel@email.com';
    // create customer and insert another email
    await createCustomer(app, target, garage, emailValid);
    await customerMongoConnector.updateOne({ email: emailValid }, { $push: { emailList: emailBlacklisted } });
    // blacklist email
    await app.models.BlackListItem.getMongoConnector().insertOne({
      reason: 'USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL',
      to: emailBlacklisted,
    });
    await createAndRunAutomationCampaign(app, garage, target);
    // retrieve and execute job
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.garageId': garage.id.toString(),
    });
    await sendContactToCustomer(senContactJob);

    const expectCustomer = await customerMongoConnector.findOne({ email: emailValid });
    const expectContact = await app.models.Contact.getMongoConnector().findOne({ to: emailValid });
    // expect send email to valid email
    expect(expectCustomer.emailBlackList.toString()).equal(emailBlacklisted);
    expect(expectCustomer.email).equal(emailValid);
    expect(expectContact.to).equal(emailValid);
  });
  it('With a customer with a lead, close the ticket manually, conversion not lost after reset', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const target = AutomationCampaignTargets.M_M;
    await createCustomer(app, target, garage);
    await createCampaign(app, garage, target);
    const campaign = await automationCampaignMongoConnector.findOne({ target });
    const customer = await customerMongoConnector.findOne({
      garageId: ObjectId(garage.id.toString()),
    });
    await createTicket({
      payload: {
        customerId: customer._id.toString(),
        campaignId: campaign._id.toString(),
        campaignRunDay: timeHelper.todayDayNumber(),
      },
    });
    const automationLeadTicketData = await app.models.Data.findOne({
      where: {
        'automation.customerId': ObjectId(customer._id.toString()),
      },
    });
    // close ticket manually
    await commonTicket.addAction('lead', automationLeadTicketData, {
      name: TicketActionNames.LEAD_CLOSED,
      assignerUserId: '5a5e00d2f4609513002b4f02',
      wasTransformedToSale: true,
    });
    await automationLeadTicketData.save();
    // Conversion should be 1, we have a converted data
    const events = await app.automationCampaignEvents();
    expect(!!events.find((e) => e.type === AutomationCampaignsEventsType.CONVERTED)).to.equal(false);
    // We generate the conversions twice, to detect a reset problem
    for (const a of [1, 2, 3]) {
      await createOrAddDataToCustomer('toto@tata.com', '+33612345678', garage, dataFileTypes.NEW_VEHICLE_SALES);
      await automationCrossedLeadsHandler.generateConvertedAndCrossedEvents(true);
      const eventsExpect = await app.automationCampaignEvents();
      const convertedEvents = eventsExpect.filter((e) => e.type === AutomationCampaignsEventsType.CONVERTED);
      expect(convertedEvents.length).to.equal(1);
      await createOrAddDataToCustomer('toto@tata.com', '+33612345678', garage, dataFileTypes.NEW_VEHICLE_SALES);
    }
  });
  it('Create a customer without a lead for a campaign, only open, create a conversion data, conversion and cross not lost after reset', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const target = AutomationCampaignTargets.M_M;
    await createCustomer(app, target, garage);
    await createAndRunAutomationCampaign(app, garage, target);
    // executed job
    const senContactJob = await jobMongoConnector.findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      'payload.contactType': automationCampaignChannel.EMAIL,
    });
    await sendContactToCustomer(senContactJob);
    let customer = await app.models.Customer.findOne();
    let campaign = await app.models.AutomationCampaign.findOne();
    let event = await app.models.AutomationCampaignsEvents.findOne();
    // Now we generate an event SENT, RECEIVED, OPEN, and LEAD to create the lead ticket associated to it
    for (const eventType of [
      AutomationCampaignsEventsType.SENT,
      AutomationCampaignsEventsType.RECEIVED,
      AutomationCampaignsEventsType.OPENED,
      AutomationCampaignsEventsType.LEAD,
    ]) {
      await app.models.AutomationCampaignsEvents.addLog({
        garageId: customer.garageId.toString(),
        campaignId: campaign.getId().toString(),
        customerId: customer.getId(),
        eventType,
        contactType: campaign.contactType,
        campaignType: campaign.type,
        target: campaign.target,
        campaignRunDay: event.campaignRunDay,
      });
    }
    // We generate a lead
    await createTicket({
      payload: {
        customerId: customer.getId(),
        campaignId: campaign.getId().toString(),
        campaignRunDay: event.campaignRunDay,
      },
    });
    // We generate a data to get a conversion
    const person = testTools.random.person();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    [customer] = await app.customers();
    let element = customer.history[0];
    let newDate = new Date();
    newDate.setDate(newDate.getDate() + 10);
    element.serviceProvidedAt = newDate;
    await customer.consolidate();
    await customer.save();
    // Conversion should be 1, we have a converted data
    const events = await app.automationCampaignEvents();
    expect(!!events.find((e) => e.type === AutomationCampaignsEventsType.CONVERTED)).to.equal(false);
    // We generate the conversions twice, to detect a reset problem
    for (const a of [1, 2, 3]) {
      await createOrAddDataToCustomer('toto@tata.com', '+33612345678', garage, dataFileTypes.NEW_VEHICLE_SALES);
      await automationCrossedLeadsHandler.generateConvertedAndCrossedEvents(true);
      const eventsExpected = await app.automationCampaignEvents();
      const convertedEvents = eventsExpected.filter((e) => e.type === AutomationCampaignsEventsType.CONVERTED);
      const crossedEvents = eventsExpected.filter((e) => e.type === AutomationCampaignsEventsType.CROSSED);
      expect(convertedEvents.length).to.equal(1);
      expect(crossedEvents.length).to.equal(1);
      await createOrAddDataToCustomer('toto@tata.com', '+33612345678', garage, dataFileTypes.NEW_VEHICLE_SALES);
    }
  });
  it('Should Create Campaigns With BLOCKED Status because not enought historic', async function test() {
    const garage = await app.addGarage({ dataFirstDays: { firstMaintenanceDay: timeHelper.todayDayNumber() } });
    const garageInstance = await garage.getInstance();
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garageInstance.getId(),
      garageInstance.subscriptions,
      garageInstance.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    // They should all be blocked from having not enough historic right now
    const campaignsBlocked = await automationCampaignMongoConnector
      .find({
        target: {
          $in: [AutomationCampaignTargets.M_M, AutomationCampaignTargets.M_M_23, AutomationCampaignTargets.M_M_35],
        },
      })
      .toArray();

    for (const blocked of campaignsBlocked) {
      expect(blocked.status).to.equals(AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC);
    }
  });
  it('Should unlock Campaigns M_M from BLOCKED_NOT_ENOUGH_HISTORIC to IDLE', async function test() {
    const garage = await app.addGarage({ dataFirstDays: { firstMaintenanceDay: timeHelper.todayDayNumber() } });
    const garageInstance = await garage.getInstance();
    // create default campaigns blocked
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garageInstance.getId(),
      garageInstance.subscriptions,
      garageInstance.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    // unlock campaign M_M
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garageInstance.getId(),
      garageInstance.subscriptions,
      { firstMaintenanceDay: timeHelper.dayNumber(date) },
      'fr_FR',
      'RunningAuto'
    );
    const campaigns = await automationCampaignMongoConnector
      .find({
        target: {
          $in: [AutomationCampaignTargets.M_M, AutomationCampaignTargets.M_M_23, AutomationCampaignTargets.M_M_35],
        },
      })
      .toArray();
    const campaignUnlock = campaigns.find(({ target }) => target === AutomationCampaignTargets.M_M);
    const blockedCampaigns = campaigns.filter(({ target }) => target !== AutomationCampaignTargets.M_M);
    // only M_M should be unblocked by now
    expect(campaignUnlock.target).to.equals(AutomationCampaignTargets.M_M);
    expect(campaignUnlock.status).to.equals(AutomationCampaignStatuses.IDLE);
    expect(blockedCampaigns[0].status).to.equals(AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC);
    expect(blockedCampaigns[1].status).to.equals(AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC);
  });
  it('Should unlock all Campaigns from BLOCKED_NOT_ENOUGH_HISTORIC to IDLE', async function test() {
    const today = timeHelper.todayDayNumber();
    const dataFirstDaysToday = {
      firstMaintenanceDay: today,
      firstNewVehicleSaleDay: today,
      firstUsedVehicleSaleDay: today,
    };
    const garage = await app.addGarage(dataFirstDaysToday);
    const garageInstance = await garage.getInstance();
    // create blocked campaigns
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garageInstance.getId(),
      garageInstance.subscriptions,
      dataFirstDaysToday,
      'fr_FR',
      'RunningAuto'
    );
    // unlock campaigns
    const date = new Date();
    date.setMonth(date.getMonth() - 200);
    const dataFirstDaysIdle = {
      firstMaintenanceDay: timeHelper.dayNumber(date),
      firstNewVehicleSaleDay: timeHelper.dayNumber(date),
      firstUsedVehicleSaleDay: timeHelper.dayNumber(date),
    };
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garageInstance.getId(),
      garageInstance.subscriptions,
      dataFirstDaysIdle,
      'fr_FR',
      'RunningAuto'
    );
    // They all should be unblocked by now
    const campaignsIdle = await automationCampaignMongoConnector.find({}).toArray();
    for (const campaign of campaignsIdle) {
      expect(campaign.status).to.equals(AutomationCampaignStatuses.IDLE);
    }
  });
  it('Should run campaigns twice, the campaign should be run once', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'bily@email.com';
    const target = AutomationCampaignTargets.M_M;
    await Promise.all([
      createCustomer(app, target, garage, email),
      createCampaign(app, garage, target, 'EMAIL'),
      createCampaign(app, garage, target, 'MOBILE'),
    ]);
    const [campaign1, campaign2] = await app.models.AutomationCampaign.find();
    // we set customer already target by campaign EMAIL and MOBILE
    await customerMongoConnector.updateOne(
      { email: email },
      {
        $set: {
          automationCampaignsEvents: [
            {
              campaignId: campaign1.id,
              campaignRunDay: campaign1.runDayNumber,
              campaignType: 'AUTOMATION_MAINTENANCE',
              type: 'TARGETED',
            },
            {
              campaignId: campaign2.id,
              campaignRunDay: campaign2.runDayNumber,
              campaignType: 'AUTOMATION_MAINTENANCE',
              type: 'TARGETED',
            },
          ],
        },
      }
    );
    // run campaign but should not created new campaigns events because it's already targed !
    const tommorow = timeHelper.dayNumberToDate(timeHelper.todayDayNumber() + 1);
    await app.models.AutomationCampaign.runCampaigns(tommorow);
    // expect events is empty because it's already targetd in customer document
    const events = await app.models.AutomationCampaignsEvents.find();
    const customer = await customerMongoConnector.findOne({ email: email });
    expect(events.length).equal(0);
    expect(customer.automationCampaignsEvents.length).equal(2);
    expect(customer.automationCampaignsEvents[0].type).equal('TARGETED');
    expect(customer.automationCampaignsEvents[1].type).equal('TARGETED');
  });
});
