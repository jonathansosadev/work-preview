const TestApp = require('../../common/lib/test/test-app');
const chai = require('chai');
const { ObjectId } = require('mongodb');
const testtools = require('../../common/lib/test/testtools');
const {
  createCustomer,
  createEventInCustomerIndex,
  createAndRunAutomationCampaign,
  addVehicleSaleAt,
} = require('./common/_utils');
const {
  JobTypes,
  GaragesTest,
  AutomationCampaignTargets,
  AutomationCampaignsEventsType,
} = require('../../frontend/utils/enumV2');
const { todayDayNumber, dayNumberToDate } = require('../../common/lib/util/time-helper');

const expect = chai.expect;
const app = new TestApp();

let mongoAutomationCampaignsEvents = null;
let mongoCustomer = null;
let jobMongo = null;

describe('Test automation run campaign', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    mongoAutomationCampaignsEvents = app.models.AutomationCampaignsEvents;
    mongoCustomer = app.models.Customer;
    jobMongo = app.models.Job;
  });
  it('Should run campaign and ignore garage test DUPONT', async function test() {
    const target = AutomationCampaignTargets.M_M;
    await app.models.Garage.getMongoConnector().insertOne({
      _id: ObjectId(GaragesTest.GARAGE_DUPONT),
      ...testtools.garageExample,
    });
    const garageDupont = await app.models.Garage.findOne();
    await createCustomer(app, target, garageDupont);
    await createAndRunAutomationCampaign(app, garageDupont, target);
    const eventsExpected = await mongoAutomationCampaignsEvents.find();
    const customerDupont = await mongoCustomer.getMongoConnector().findOne({
      garageId: ObjectId(GaragesTest.GARAGE_DUPONT),
    });
    // customer with garage TEST should not be contacted/targeted
    expect(eventsExpected.length).equal(0);
    expect(customerDupont.garageId.toString()).equal(GaragesTest.GARAGE_DUPONT);
    expect(customerDupont.hasReceivedGDPRContactAt).equal(undefined);
    expect(customerDupont.hasRecentlyBeenContacted).equal(undefined);
  });
  it('Should run campaign and target a random customer', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const target = AutomationCampaignTargets.M_M;
    const email = 'random@customer.com';
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target);

    const randomCustomer = await mongoCustomer.getMongoConnector().findOne({
      email: email,
    });
    const eventExpected = await mongoAutomationCampaignsEvents.getMongoConnector().findOne({
      garageId: ObjectId(garage.id.toString()),
    });
    // customer shoulb be targeted
    expect(randomCustomer.garageId.toString()).equal(garage.id.toString());
    expect(eventExpected.garageId.toString()).equal(garage.id.toString());
    expect(eventExpected.type).equal(AutomationCampaignsEventsType.TARGETED);
  });
  it('Should ignore campaign M-14 because customer have got CONVERTED recently', async function test() {
    // retrieve enum M-14
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /14/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(
        app,
        garage,
        target,
        todayDayNumber() - 40,
        AutomationCampaignsEventsType.CONVERTED
      );
      await createAndRunAutomationCampaign(app, garage, target);
      const expectFindJob = await jobMongo.find({});
      expect(expectFindJob.length).equal(0);
      await app.reset();
    }
  });
  it('Should ignore campaign M-26 because customer have got CONVERTED recently', async function test() {
    // retrieve enum M-26
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /26/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(
        app,
        garage,
        target,
        todayDayNumber() - 40,
        AutomationCampaignsEventsType.CONVERTED
      );
      await createAndRunAutomationCampaign(app, garage, target);
      const expectFindJob = await jobMongo.find({});
      expect(expectFindJob.length).equal(0);
      await app.reset();
    }
  });
  it("Should targeted customer for campaign M-14 because customer don't have got CONVERTED recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /14/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(
        app,
        garage,
        target,
        todayDayNumber() - 130,
        AutomationCampaignsEventsType.CONVERTED
      );
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });

      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it("Should targeted customer for campaign 'Essaie' because customer don't have got LEAD recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /_18|_6/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(app, garage, target, todayDayNumber() - 366, AutomationCampaignsEventsType.LEAD);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });

      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it("Should NOT targeted customer for campaign 'Essaie' because customer have got LEAD recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /_18|_6/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(app, garage, target, todayDayNumber() - 365, AutomationCampaignsEventsType.LEAD);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.find({});
      expect(expectFindJob.length).equal(0);
      await app.reset();
    }
  });
  it("Should targeted customer for campaign 'cotation' because customer don't have got LEAD recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /_12|_24/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(app, garage, target, todayDayNumber() - 366, AutomationCampaignsEventsType.LEAD);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });

      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it("Should NOT targeted customer for campaign 'cotation' because customer have got LEAD recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /_12|_24/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(app, garage, target, todayDayNumber() - 80, AutomationCampaignsEventsType.LEAD);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.find({});
      expect(expectFindJob.length).equal(0);
      await app.reset();
    }
  });
  it("Should targeted customer for campaign M-26 because customer DON'T have got CONVERTED recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /26/.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createEventInCustomerIndex(
        app,
        garage,
        target,
        todayDayNumber() - 130,
        AutomationCampaignsEventsType.CONVERTED
      );
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });

      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it('Should ignore campaign VS_M_11 because customer got LEAD recently', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    await createCustomer(app, AutomationCampaignTargets.VS_M_11, garage);
    await createEventInCustomerIndex(
      app,
      garage,
      AutomationCampaignTargets.VS_M_11,
      todayDayNumber() - 40,
      AutomationCampaignsEventsType.LEAD
    );
    await createAndRunAutomationCampaign(app, garage, AutomationCampaignTargets.VS_M_11);
    const expectFindJob = await jobMongo.find({});
    expect(expectFindJob.length).equal(0);
  });
  it("Should targeted customer for campaign VS_M_11 because customer don't have got LEAD recently", async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    await createCustomer(app, AutomationCampaignTargets.VS_M_11, garage);
    await createEventInCustomerIndex(
      app,
      garage,
      AutomationCampaignTargets.VS_M_11,
      todayDayNumber() - 366,
      AutomationCampaignsEventsType.LEAD
    );
    await createAndRunAutomationCampaign(app, garage, AutomationCampaignTargets.VS_M_11);

    const expectFindJob = await jobMongo.getMongoConnector().findOne({
      type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
    });
    // a job shoulb be create for send email to customer
    expect(expectFindJob.payload.contactType).equal('EMAIL');
    expect(expectFindJob.payload.target).equal(AutomationCampaignTargets.VS_M_11);
  });
  it('Should targeted customer for all campaign target except COVID', async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => !/COVID/i.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it('Should NOT targeted customer for all campaign target except COVID because customer got LEAD/CONVERTED recently', async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /COVID/i.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      // create event leadd/converted
      let event = null;
      const checkLastEvent = AutomationCampaignTargets.getProperty(target, 'checkLastEvent');
      if (checkLastEvent.name === 'lastLeadAt') {
        event = AutomationCampaignsEventsType.LEAD;
      }
      if (checkLastEvent.name === 'lastConvertedAt') {
        event = AutomationCampaignsEventsType.CONVERTED;
      }

      await createEventInCustomerIndex(app, garage, target, todayDayNumber() - 90, event);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await jobMongo.find({});
      expect(expectFindJob.length).equal(0);
    }
  });
  it('Should NOT target customer with COVID campaign', async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /COVID/i.test(value));

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage);
      await createAndRunAutomationCampaign(app, garage, target);
      // covid campaign shoulb be disable, no jobs found
      const expectFindJob = await jobMongo.getMongoConnector().findOne();
      expect(expectFindJob).equal(null);
      await app.reset();
    }
  });
  it('Should NOT target customer with campaign APV because customer buy a car recently', async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /M_M|_M_/.test(value));
    const lastVehicleSaleAt = dayNumberToDate(todayDayNumber() - 2);
    const email = 'jean@mouloude.com';

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage, email);
      await addVehicleSaleAt(app, target, email, lastVehicleSaleAt);
      await createAndRunAutomationCampaign(app, garage, target);

      // retrieve job
      const expectFindJob = await app.models.Job.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      // we should not have job for send contact to customer
      expect(expectFindJob).equal(null);
      await app.reset();
    }
  });

  it("Should target customer with campaign APV because customer DON'T buy a car recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /M_M|_M_/.test(value));
    const lastVehicleSaleAt = dayNumberToDate(todayDayNumber() - 2000);
    const email = 'jean@mouloude.com';

    for (const target of enumTargetCampaigns) {
      /*await runCampaignForSpecificTarget(
        target,
        todayDayNumber() - 999,
        AutomationCampaignsEventsType.LEAD,
        lastVehicleSaleAt
      );*/
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage, email);
      await addVehicleSaleAt(app, target, email, lastVehicleSaleAt);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await app.models.Job.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      // we should have a job for send contact to customer
      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it('Should NOT target customer with campaign VN because customer buy a car recently', async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /NVS/.test(value));
    const lastVehicleSaleAt = dayNumberToDate(todayDayNumber() - 20);
    const email = 'jean@mouloude.com';

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage, email);
      await addVehicleSaleAt(app, target, email, lastVehicleSaleAt);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await app.models.Job.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      // we should not have job for send contact to customer
      expect(expectFindJob).equal(null);
      await app.reset();
    }
  });
  it("Should target customer with campaign VN because customer DON'T buy a car recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /NVS/.test(value));
    const lastVehicleSaleAt = dayNumberToDate(todayDayNumber() - 2000);
    const email = 'jean@mouloude.com';

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage, email);
      await addVehicleSaleAt(app, target, email, lastVehicleSaleAt);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await app.models.Job.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      // we should not have job for send contact to customer
      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
  it('Should NOT target customer with campaign Vo because customer buy a car recently', async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /UVS/.test(value));
    const lastVehicleSaleAt = dayNumberToDate(todayDayNumber() - 20);
    const email = 'jean@mouloude.com';

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage, email);
      await addVehicleSaleAt(app, target, email, lastVehicleSaleAt);
      await createAndRunAutomationCampaign(app, garage, target);
      // retrieve job
      const expectFindJob = await app.models.Job.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      // we should not have job for send contact to customer
      expect(expectFindJob).equal(null);
      await app.reset();
    }
  });
  it("Should target customer with campaign Vo because customer DON'T buy a car recently", async function test() {
    const enumTargetCampaigns = AutomationCampaignTargets.values().filter((value) => /UVS/.test(value));
    const lastVehicleSaleAt = dayNumberToDate(todayDayNumber() - 2000);
    const email = 'jean@mouloude.com';

    for (const target of enumTargetCampaigns) {
      const garage = await app.addGarage({ locale: 'fr_FR' });
      await createCustomer(app, target, garage, email);
      await addVehicleSaleAt(app, target, email, lastVehicleSaleAt);
      await createAndRunAutomationCampaign(app, garage, target);

      // retrieve job
      const expectFindJob = await app.models.Job.getMongoConnector().findOne({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      });
      // we should not have job for send contact to customer
      expect(expectFindJob.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
      expect(expectFindJob.payload.contactType).equal('EMAIL');
      expect(expectFindJob.payload.target).equal(target);
      await app.reset();
    }
  });
});
