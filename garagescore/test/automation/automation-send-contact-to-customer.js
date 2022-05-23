const TestApp = require('../../common/lib/test/test-app');
const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const automationSendContactToCustomer = require('../../workers/jobs/scripts/automation-send-contact-to-customer');
const importer = require('../../common/lib/garagescore/data-file/lib/importer');
const exampleData = require('../apollo/examples/data-with-lead-ticket');
const { AutomationCampaignsEventsType, JobTypes } = require('../../frontend/utils/enumV2');
const GarageTypes = require('../../common/models/garage.type');
const AutomationCampaignChannelTypes = require('../../common/models/automation-campaign-channel.type');
const BlackListReason = require('../../common/models/black-list-reason');
const ContactType = require('../../common/models/contact.type');
const timeHelper = require('../../common/lib/util/time-helper');
const {
  automationCampaign,
  automationCampaignUnsubscribe,
  automationCampaignNotFound,
  automationCampaignRedirect,
} = require('../../server/routes/backoffice/public-request');

const expect = chai.expect;
const app = new TestApp();

class Res {
  constructor() {
    this.response = {};
  }
  status(code) {
    this.response.status = code;
    return this;
  }
  redirect(code) {
    this.response.status = code;
    return this;
  }
  end() {
    return this;
  }
  json(text) {
    for (const key of Object.keys(text)) this.response[key] = text[key];
    return this;
  }
}

const _createJob = (customer, automationCampaign, garage, contactType) => {
  return {
    payload: {
      customerId: customer.id.toString(),
      campaignId: automationCampaign.id.toString(),
      garageId: garage.id.toString(),
      campaignType: automationCampaign.type,
      target: automationCampaign.target,
      contactType: contactType,
      campaignRunDay: timeHelper.todayDayNumber(),
    },
  };
};

describe('Test events Automation send contact to customers', () => {
  beforeEach(async function beforeEach() {
    // clean database and collections before each test
    await app.reset();
    await app.models.AutomationCampaignsEvents.getMongoConnector().deleteMany({});
    await app.models.Job.getMongoConnector().deleteMany({});
    // create default garage, customers and datas
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    exampleData.garageId = testGarage.getId();
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
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
  });
  it('Should send error 404', async () => {
    const req = {
      params: {},
    };
    const res = new Res();
    automationCampaignNotFound(req, res);
    const response = res.response;
    expect(response.status).equal(404);
  });
  it('Should unsubscribe customer', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    // customer is not unsubscribed
    const customer = await app.models.Customer.findOne();
    expect(customer.unsubscribed).equal(false);
    // create GDPR_SENT events for unsubscribed
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(automationCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber(),
      campaignType: 'AUTOMATION_VEHICLE_SALE',
      eventDay: timeHelper.todayDayNumber(),
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.GDPR_SENT,
      nsamples: 1,
      nsamplesDesktop: 1,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
          isMobile: false,
          leadFromMobile: null,
        },
      ],
    });

    const req = {
      params: {
        customerid: customer.id.toString(),
        campaignid: automationCampaign.id.toString(),
      },
    };
    const res = new Res();
    // user click on the "link" and trigger the function unsubscribed
    await automationCampaignUnsubscribe(req, res);
    // the customer shoulb be unsubscribed
    const customerExpect = await app.models.Customer.findOne();
    const response = res.response;
    expect(customerExpect.unsubscribed).equal(true);
    expect(response.status).equal(200);
    expect(response.message).equal('OK!');
  });
  it('Should create jobs when customer click on campaign email', async () => {
    const garage = await app.models.Garage.findOne();
    const aCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create campaign type targeted
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(aCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber(),
      campaignType: 'AUTOMATION_MAINTENANCE',
      eventDay: timeHelper.todayDayNumber(),
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.TARGETED,
      nsamples: 1,
      nsamplesDesktop: 1,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
          isMobile: false,
          leadFromMobile: null,
        },
      ],
    });
    const req = {
      params: {
        customerid: customer.id.toString(),
        campaignid: aCampaign.id.toString(),
        isLead: 'isLead',
        fromMobile: false,
      },
    };
    const res = new Res();
    // user click on the "link" and trigger the function automationCampaign
    await automationCampaign(req, res);
    const response = res.response;
    expect(response.status).equal(200);
    expect(response.message).equal('OK!');
    expect(response.thanks).equal(true);
    expect(response.brandName).equal(garage.brandNames[0]);
    // a job should be create for create a lead ticket
    const job = await app.models.Job.findOne({ where: { type: JobTypes.AUTOMATION_CREATE_TICKET } });
    expect(job.payload.customerId.toString()).equal(customer.id.toString());
    expect(job.payload.campaignId.toString()).equal(aCampaign.id.toString());
  });
  it('Should create not a job the campaign is expire', async () => {
    const garage = await app.models.Garage.findOne();
    const aCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create event type targeted
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(aCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber() - 100,
      campaignType: 'AUTOMATION_MAINTENANCE',
      eventDay: timeHelper.todayDayNumber() - 100,
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.TARGETED,
      nsamples: 1,
      nsamplesDesktop: 1,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
          isMobile: false,
          leadFromMobile: null,
        },
      ],
    });
    const req = {
      params: {
        customerid: customer.id.toString(),
        campaignid: aCampaign.id.toString(),
        isLead: 'isLead',
        fromMobile: false,
      },
    };
    const res = new Res();
    // user click on the "link" and display campaign is expire
    await automationCampaign(req, res);
    const response = res.response;
    // a job should not be found for create a lead ticket
    const jobs = await app.jobs();
    const jobNotFound = !!jobs.find((j) => j.type === JobTypes.AUTOMATION_CREATE_TICKET);
    expect(response.status).equal(200);
    expect(response.isCampaignActive).equal(undefined);
    expect(jobNotFound).equal(false);
  });
  it('Should create jobs when customer click on custom URL campaign email', async () => {
    const garage = await app.models.Garage.findOne();
    const aCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create campaign type targeted
    const customContent = await app.models.AutomationCampaignsCustomContent.create({
      displayName: 'boulette',
      target: 'M_M',
      promotionalMessage: '<p>🏖 good enought !</p>',
      themeColor: '#E70EBB',
      dayNumberStart: 18700,
      dayNumberEnd: 999999999,
      noExpirationDate: true,
      allTimeGarageIds: [ObjectId(garage.id)],
      activeGarageIds: [ObjectId(garage.id)],
      customUrl: 'https://9gag.com/gag/angqmEn',
    });

    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(aCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber(),
      campaignType: 'AUTOMATION_MAINTENANCE',
      eventDay: timeHelper.todayDayNumber(),
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.TARGETED,
      nsamples: 1,
      nsamplesDesktop: 1,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
          isMobile: false,
          leadFromMobile: null,
        },
      ],
    });
    const req = {
      params: {
        customerid: customer.id.toString(),
        campaignid: aCampaign.id.toString(),
        customContentId: customContent.id.toString(),
        isLead: 'isLead',
        fromMobile: false,
      },
    };
    const res = new Res();
    // user click on the "link" and trigger the function automationCampaignRedirect and redirect code 302
    await automationCampaignRedirect(req, res);
    const response = res.response;
    expect(response.status).equal(302);
    // a job should be create for create a lead ticket
    const jobs = await app.jobs();
    const job = jobs.find((j) => j.type === JobTypes.AUTOMATION_CREATE_TICKET);
    expect(job.payload.customerId.toString()).equal(customer.id.toString());
    expect(job.payload.campaignId.toString()).equal(aCampaign.id.toString());
  });
  it('Should create not job when the campaign is expired on custom URL campaign email', async () => {
    const garage = await app.models.Garage.findOne();
    const aCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create event type targeted
    const customContent = await app.models.AutomationCampaignsCustomContent.create({
      displayName: 'Custeedlexicotimation des lois du marché est très clair',
      target: 'M_M',
      promotionalMessage: "<p>🏖 la Custeedlexicotimation permet d'imposer le valium !</p>",
      themeColor: '#E70EBB',
      dayNumberStart: 18700,
      dayNumberEnd: 999999999,
      noExpirationDate: true,
      allTimeGarageIds: [ObjectId(garage.id)],
      activeGarageIds: [ObjectId(garage.id)],
      customUrl: 'https://9gag.com/gag/a41oGpm',
    });

    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(aCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber() - 100,
      campaignType: 'AUTOMATION_MAINTENANCE',
      eventDay: timeHelper.todayDayNumber() - 100,
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.TARGETED,
      nsamples: 1,
      nsamplesDesktop: 1,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
          isMobile: false,
          leadFromMobile: null,
        },
      ],
    });
    const req = {
      params: {
        customerid: customer.id.toString(),
        campaignid: aCampaign.id.toString(),
        customContentId: customContent.id.toString(),
        isLead: 'isLead',
        fromMobile: false,
      },
    };
    const res = new Res();
    // user click on the "link" and redirect to normal page and display campaign is expire
    await automationCampaignRedirect(req, res);
    const response = res.response;
    expect(response.status).equal(302);
    // a job should not be create
    const jobs = await app.jobs();
    const jobNotFound = !!jobs.find((j) => j.type === JobTypes.AUTOMATION_CREATE_TICKET);
    expect(jobNotFound).equal(false);
  });
  it('Should fail because campaignId is missing', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create job wihtout campaignId
    const job = {
      payload: {
        customerId: customer.id.toString(),
        garageId: garage.id.toString(),
        campaignType: automationCampaign.type,
        contactType: AutomationCampaignChannelTypes.EMAIL,
        campaignRunDay: timeHelper.todayDayNumber(),
      },
    };
    try {
      // send to contact customer
      await automationSendContactToCustomer(job);
    } catch (err) {
      // it's display error message like: automation-send-contact-to-customer :: no campaignId...
      expect(err.message.includes('no campaignId')).equal(true);
      expect(err.message.includes(job.payload.customerId)).equal(true);
      expect(err.message.includes(job.payload.garageId)).equal(true);
    }
  });
  it('Should create a job and send email to customer', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    await automationSendContactToCustomer(job);
    // it's should create a job and send to customer
    const [jobsExpect] = await app.jobs({ where: { type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER } });
    expect(jobsExpect.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
    expect(jobsExpect.payload.campaignId).equal(automationCampaign.id.toString());
  });
  it('Should send email on another address if one is blacklist', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    const defaultEmail = customer.email;
    const blackListEmail = 'jambe@debois.com';
    // add another email on customer
    delete exampleData._id;
    exampleData.garageId = customer.garageId.toString();
    exampleData.customer.contact.email.value = blackListEmail;
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    // check customer before in email list
    const customerBeforeBlacklist = await app.models.Customer.findOne();
    expect(customerBeforeBlacklist.email).equal(blackListEmail);
    expect(customerBeforeBlacklist.emailList.length).equal(2);
    expect(customerBeforeBlacklist.emailList.includes(defaultEmail)).equal(true);
    expect(customerBeforeBlacklist.emailList.includes(blackListEmail)).equal(true);
    // Blacklisted customer with a single email won't be contacted
    await app.models.BlackListItem.getMongoConnector().insertOne({
      to: blackListEmail,
    });
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    await automationSendContactToCustomer(job);
    // a job should be create for send email on second email
    const blackList = await app.models.BlackListItem.findOne();
    expect(blackList.to).equal(blackListEmail);
    const [jobExpect] = await app.jobs({ where: { type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER } });
    expect(jobExpect.type).equal(JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER);
    expect(jobExpect.payload.customerId).equal(customer.id.toString());
    const customerExpect = await app.models.Customer.findOne();
    const contactExpect = await app.models.Contact.findOne({ where: { to: customerExpect.email } });
    // should send email to defautl email, not blacklist  email
    expect(contactExpect.to).equal(defaultEmail);
    // one email is blacklist, the second is available
    expect(customerExpect.email).equal(defaultEmail);
    expect(customerExpect.emailList.length).equal(1);
    expect(customerExpect.email).equal(customerExpect.emailList[0]);
    expect(customerExpect.emailList.includes(defaultEmail)).equal(true);
    expect(customerExpect.emailList.includes(blackListEmail)).equal(false);
    expect(customerExpect.emailBlackList.length).equal(1);
    expect(customerExpect.emailBlackList[0]).equal(blackListEmail);
  });
  it('Should send sms on another number if one is blacklist', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    const defaultPhoneNumber = customer.phone;
    const blackListPhoneNumber = '+33685555555';
    // add another phone number on customer
    delete exampleData._id;
    exampleData.garageId = customer.garageId.toString();
    exampleData.customer.contact.mobilePhone.value = blackListPhoneNumber;
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    // black list phone number
    await app.models.BlackListItem.getMongoConnector().insertOne({
      to: blackListPhoneNumber,
    });
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.MOBILE);
    // send to contact customer
    await automationSendContactToCustomer(job);

    const expectEvent = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
      type: AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR,
    });
    const expectCustomer = await app.models.Customer.findOne();
    const expectContact = await app.models.Contact.findOne();

    expect(expectEvent.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    expect(expectCustomer.phoneBlackList.toString()).equal(blackListPhoneNumber);
    expect(expectCustomer.phone).equal(defaultPhoneNumber);
    expect(expectContact.to).equal(defaultPhoneNumber);
  });
  it('Should create event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS if no contact is valid when send RGPD', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    const invalidEmail = 'vacheKiRi.@email.com';
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: ObjectId(customer.id.toString()) },
      { $set: { email: invalidEmail, emailList: [invalidEmail] } }
    );
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    try {
      await automationSendContactToCustomer(job);
    } catch (err) {
      // it' should create event
      const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
      expect(automationEvent.type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
      // email should be null
      const customerExpect = await app.models.Customer.findOne();
      expect(customerExpect.email).equal(null);
      expect(customerExpect.emailBlackList[0]).equal(invalidEmail);
    }
  });
  it('Should create event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS if no contact is valid when send EMAIL', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    const invalidEmail = 'vacheKiPleure.@email.com';
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: ObjectId(customer.id.toString()) },
      {
        $set: {
          email: invalidEmail,
          emailList: [invalidEmail],
          hasReceivedGDPRContactAt: timeHelper.addDays(new Date(), -10),
        },
      }
    );
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    try {
      await automationSendContactToCustomer(job);
    } catch (err) {
      // it' should create event
      const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
      expect(automationEvent.type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
      // email should be null
      const customerExpect = await app.models.Customer.findOne();
      expect(customerExpect.email).equal(null);
      expect(customerExpect.emailBlackList[0]).equal(invalidEmail);
    }
  });
  it('Should create event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // Blacklisted customer with a single email won't be contacted
    await app.models.Contact.create({
      payload: { dataId: customer.dataIds[0].toString(), customerId: customer.id.toString() },
      type: ContactType.CAMPAIGN_EMAIL,
      campaignType: automationCampaign.type,
      to: customer.email,
    });
    const contact = await app.models.Contact.findOne();
    await app.blackListContact(contact, BlackListReason.USER_COMPLAINED_BY_EMAIL);
    const blackList = await app.models.BlackListItem.findOne();
    expect(blackList.to).equal(customer.email);
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    // automationSendContactToCustomer should find email in BlackListItem and set customer email = null
    // the customer only have 1 email, the event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS should be create
    await automationSendContactToCustomer(job);
    // it' should create event
    const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
    expect(automationEvent.type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    // email should be null
    const customerExpect = await app.models.Customer.findOne();
    expect(customerExpect.email).equal(null);
  });
  it('Should create event CANNOT_SEND_CONTACT_UNSUBSCRIBED', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    // customer is not unsubscribed
    const customer = await app.models.Customer.findOne();
    expect(customer.unsubscribed).equal(false);
    // create GDPR_SENT events for unsubscribed
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(automationCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber(),
      campaignType: 'AUTOMATION_VEHICLE_SALE',
      eventDay: timeHelper.todayDayNumber(),
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.GDPR_SENT,
      nsamples: 1,
      nsamplesDesktop: 1,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
          isMobile: false,
          leadFromMobile: null,
        },
      ],
    });

    const req = {
      params: {
        customerid: customer.id.toString(),
        campaignid: automationCampaign.id.toString(),
      },
    };
    const res = new Res();
    // user click on the "link" and trigger the function unsubscribed
    await automationCampaignUnsubscribe(req, res);
    // the customer shoulb be unsubscribed
    const customerExpect = await app.models.Customer.findOne();
    const response = res.response;
    expect(customerExpect.unsubscribed).equal(true);
    expect(response.status).equal(200);
    expect(response.message).equal('OK!');
    // create job
    const job = {
      payload: {
        customerId: customer.id.toString(),
        campaignId: automationCampaign.id.toString(),
        garageId: garage.id.toString(),
        campaignType: automationCampaign.type,
        target: automationCampaign.target,
        contactType: AutomationCampaignChannelTypes.EMAIL,
        campaignRunDay: timeHelper.todayDayNumber(),
      },
    };
    // send to contact customer
    await automationSendContactToCustomer(job);
    // it' should create event because user is unsubscribed
    const automationEvent = await app.models.AutomationCampaignsEvents.findOne({
      where: { type: AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_UNSUBSCRIBED },
    });
    expect(automationEvent.type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_UNSUBSCRIBED);
  });
  it('Should create event PRESSURE_BLOCKED', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    // set customer hasRecentlyBeenContacted for unit test
    const customer = await app.models.Customer.findOne();
    const sendDate = timeHelper.addDays(new Date(), -30);
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: ObjectId(customer.id.toString()) },
      { $set: { hasRecentlyBeenContacted: { [`${automationCampaign.type}`]: sendDate } } }
    );
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    await automationSendContactToCustomer(job);
    // it' should create event
    const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
    expect(automationEvent.type).equal(AutomationCampaignsEventsType.PRESSURE_BLOCKED);
  });
  it('Should create event PREPARE_TO_SEND_GDPR and DELAYED_BY_GDPR', async () => {
    // when a customer is contacted for the 1st time, must have sent a GDPR email first
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    const customer = await app.models.Customer.findOne();
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    await automationSendContactToCustomer(job);
    // it' should create events
    const automationEvents = await app.models.AutomationCampaignsEvents.find();
    const expectSendGdprEvent = automationEvents.find(
      (e) => e.type === AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR
    );
    const expectDelayByGdprEvent = automationEvents.find(
      (e) => e.type === AutomationCampaignsEventsType.DELAYED_BY_GDPR
    );
    expect(expectSendGdprEvent.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
    expect(expectDelayByGdprEvent.type).equal(AutomationCampaignsEventsType.DELAYED_BY_GDPR);
  });
  it('Should create event PREPARE_TO_SEND', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    // set customer hasReceivedGDPRContactAt for unit test
    const customer = await app.models.Customer.findOne();
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: ObjectId(customer.id.toString()) },
      { $set: { hasReceivedGDPRContactAt: timeHelper.addDays(new Date(), -10) } }
    );
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.EMAIL);
    // send to contact customer
    await automationSendContactToCustomer(job);
    // it' should create event
    const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
    expect(automationEvent.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND);
  });
  it('Should create short url for contact MOBILE', async () => {
    const garage = await app.models.Garage.findOne();
    const automationCampaign = await app.models.AutomationCampaign.findOne();
    // set customer hasReceivedGDPRContactAt for unit test
    const customer = await app.models.Customer.findOne();
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: ObjectId(customer.id.toString()) },
      { $set: { hasReceivedGDPRContactAt: timeHelper.addDays(new Date(), -10) } }
    );
    // create job
    const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.MOBILE);
    // send to contact customer
    await automationSendContactToCustomer(job);
    // it' should create event
    const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
    const expectContact = await app.models.Contact.findOne();
    expect(automationEvent.type).equal(AutomationCampaignsEventsType.PREPARE_TO_SEND);
    expect(expectContact.payload.shortUrl.length).is.greaterThan(1);
  });
  it('Should trigger error and create event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS', async () => {
    try {
      const garage = await app.models.Garage.findOne();
      const automationCampaign = await app.models.AutomationCampaign.findOne();
      const customer = await app.models.Customer.findOne();
      // set wrong email
      await app.models.Customer.getMongoConnector().updateOne(
        { _id: ObjectId(customer.id.toString()) },
        { $set: { email: 'wrong.@email.fr' } }
      );
      // create job
      const job = _createJob(customer, automationCampaign, garage, AutomationCampaignChannelTypes.MOBILE);
      // send to contact customer
      await automationSendContactToCustomer(job);
    } catch (err) {
      // it' should create event CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS because email adress is invaliad
      expect(err).equal('Invalid recipient email address wrong.@email.fr');
      const automationEvent = await app.models.AutomationCampaignsEvents.findOne();
      expect(automationEvent.type).equal(AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    }
  });
});
