const TestApp = require('../../../common/lib/test/test-app');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const chai = require('chai');
const testTools = require('../../../common/lib/test/testtools');
const leadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const leadTimings = require('../../../common/models/data/type/lead-timings');
const leadTypes = require('../../../common/models/data/type/lead-types');
const timeHelper = require('../../../common/lib/util/time-helper');
const exampleData = require('../../apollo/examples/data-with-lead-ticket');
const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');
const { automationCampaign } = require('../../../server/routes/backoffice/public-request');
const expect = chai.expect;
const { ObjectId } = require('mongodb');

const app = new TestApp();

class Res {
  constructor() {
    this.response = {};
  }
  status(code) {
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

describe('Test Escalate', () => {
  beforeEach(async function () {
    await app.reset();
  });
  it('User should not receive contact type ESCALATE_LEAD_1 on leadTicket.saleType=Maintenance, if EscalationLeadMaintenance is false', async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({
      email: userEmail,
      allGaragesAlerts: {
        EscalationLeadMaintenance: false,
      },
    });
    const testGarage = await app.addGarage({
      defaultManager: user,
    });
    await user.addGarage(testGarage);
    exampleData.garageId = testGarage.getId();
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const garage = await app.models.Garage.findOne();
    const aCampaigns = await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );

    const aCampaign = aCampaigns.find((c) => c.target === 'M_M');

    const customer = await app.models.Customer.findOne();
    // create campaign type targeted
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(aCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber(),
      campaignType: 'AUTOMATION_CAMPAIGN_EMAIL',
      eventDay: timeHelper.todayDayNumber(),
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.TARGETED,
      target: 'M_M',
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
    await automationCampaign(req, res);
    let jobs = await app.jobs();
    const jobAutomationCreateTicket = jobs.find((item) => item.type === 'AUTOMATION_CREATE_TICKET');
    await jobAutomationCreateTicket.run();
    jobs = await app.jobs();
    const jobsEscalate = jobs.find((item) => item.type === 'ESCALATE');
    await jobsEscalate.run();

    const contacts = await app.contacts();
    escalateLeadContact = contacts.find((contact) => contact.type === 'ESCALATE_LEAD_1');
    expect(escalateLeadContact).to.equal(undefined);
  });

  it('User should receive contact type ESCALATE_LEAD_1 on leadTicket.saleType=Maintenance, if EscalationLeadMaintenance is true', async function test() {
    await app.reset();
    const userEmail = testTools.random.email();
    const user = await app.addUser({
      email: userEmail,
      allGaragesAlerts: {
        EscalationLeadMaintenance: true,
      },
    });
    const testGarage = await app.addGarage({
      defaultManager: user,
    });
    await user.addGarage(testGarage);
    exampleData.garageId = testGarage.getId();
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const garage = await app.models.Garage.findOne();
    const aCampaigns = await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );

    const aCampaign = aCampaigns.find((c) => c.target === 'M_M');

    const customer = await app.models.Customer.findOne();
    // create campaign type targeted
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId(aCampaign.id),
      campaignRunDay: timeHelper.todayDayNumber(),
      campaignType: 'AUTOMATION_CAMPAIGN_EMAIL',
      eventDay: timeHelper.todayDayNumber(),
      garageId: ObjectId(garage.id),
      type: AutomationCampaignsEventsType.TARGETED,
      target: 'M_M',
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
    await automationCampaign(req, res);
    let jobs = await app.jobs();
    const jobAutomationCreateTicket = jobs.find((item) => item.type === 'AUTOMATION_CREATE_TICKET');
    await jobAutomationCreateTicket.run();
    jobs = await app.jobs();
    const jobsEscalate = jobs.find((item) => item.type === 'ESCALATE');
    await jobsEscalate.run();

    const contacts = await app.contacts();
    escalateLeadContact = contacts.find((contact) => contact.type === 'ESCALATE_LEAD_1');
    expect(escalateLeadContact).not.equal(undefined);
  });

  it('User should not receive contact type ESCALATE_LEAD_1 on leadTicket.saleType=NewVehicleSale, if EscalationLeadVN is false', async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({
      email: userEmail,
      allGaragesAlerts: {
        EscalationLeadVn: false,
      },
    });

    const garage = await app.addGarage({ defaultManager: user });
    await app.upsertDefaultScenario({});

    await user.addGarage(garage);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).setLead(leadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.NEW_VEHICLE_SALE).submit();
    const jobs = await app.jobs();
    const job = jobs.find((item) => item.type === 'ESCALATE');
    await job.run();
    const contacts = await app.contacts();
    escalateLeadContact = contacts.find((contact) => contact.type === 'ESCALATE_LEAD_1');
    expect(escalateLeadContact).to.equal(undefined);
  });

  it('User should receive contact type ESCALATE_LEAD_1 on leadTicket.saleType=NewVehicleSale, if EscalationLeadVN is true', async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({
      email: userEmail,
      allGaragesAlerts: {
        EscalationLeadVn: true,
      },
    });

    const garage = await app.addGarage({ defaultManager: user });
    await app.upsertDefaultScenario({});

    await user.addGarage(garage);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).setLead(leadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.NEW_VEHICLE_SALE).submit();
    const jobs = await app.jobs();
    const job = jobs.find((item) => item.type === 'ESCALATE');
    await job.run();
    const contacts = await app.contacts();
    escalateLeadContact = contacts.find((contact) => contact.type === 'ESCALATE_LEAD_1');
    expect(escalateLeadContact).not.equal(undefined);
  });

  it('User should not receive contact type ESCALATE_LEAD_1 on leadTicket.saleType=OldVehicleSale, if EscalationLeadVo is false', async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({
      email: userEmail,
      allGaragesAlerts: {
        EscalationLeadVo: false,
      },
    });

    const garage = await app.addGarage({ defaultManager: user });
    await app.upsertDefaultScenario({});

    await user.addGarage(garage);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).setLead(leadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.USED_VEHICLE_SALE).submit();
    const jobs = await app.jobs();
    const job = jobs.find((item) => item.type === 'ESCALATE');
    await job.run();
    const contacts = await app.contacts();
    escalateLeadContact = contacts.find((contact) => contact.type === 'ESCALATE_LEAD_1');
    expect(escalateLeadContact).to.equal(undefined);
  });

  it('User should receive contact type ESCALATE_LEAD_1 on leadTicket.saleType=OldVehicleSale, if EscalationLeadVo is true', async function test() {
    const userEmail = testTools.random.email();
    const user = await app.addUser({
      email: userEmail,
      allGaragesAlerts: {
        EscalationLeadVo: true,
      },
    });

    const garage = await app.addGarage({ defaultManager: user });
    await app.upsertDefaultScenario({});

    await user.addGarage(garage);
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(10).setLead(leadTypes.INTERESTED, leadTimings.MID_TERM, leadSaleTypes.USED_VEHICLE_SALE).submit();
    const jobs = await app.jobs();
    const job = jobs.find((item) => item.type === 'ESCALATE');
    await job.run();
    const contacts = await app.contacts();
    escalateLeadContact = contacts.find((contact) => contact.type === 'ESCALATE_LEAD_1');
    expect(escalateLeadContact).not.equal(undefined);
  });
});
