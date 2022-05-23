const TestApp = require('../../common/lib/test/test-app');
const testTools = require('../../common/lib/test/testtools');
const dataFileTypes = require('../../common/models/data-file.data-type');
const importer = require('../../common/lib/garagescore/data-file/lib/importer');
const timeHelper = require('../../common/lib/util/time-helper');
const LeadTypes = require('../../common/models/data/type/lead-types');
const LeadSaleTypes = require('../../common/models/data/type/lead-sale-types');
const SourceTypes = require('../../common/models/data/type/source-types');
const LeadTimings = require('../../common/models/data/type/lead-timings');
const addDatasToCustomer = require('../../workers/jobs/scripts/automation-add-datas-to-customer');
const consolidateCustomer = require('../../workers/jobs/scripts/automation-consolidate-customer');
const { createCustomer, createAndRunAutomationCampaign } = require('./common/_utils');
const { AutomationCampaignTargets, AutomationCampaignsEventsType, JobTypes } = require('../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../common/models/automation-campaign-channel.type');
const path = require('path');
const chai = require('chai');
const { ObjectId } = require('mongodb');
const AutomationCampaignTypes = require('../../common/models/automation-campaign.type');
const exampleData = require('../apollo/examples/data-with-lead-ticket');

const expect = chai.expect;
const app = new TestApp();

const _createAddLog = async (customer, campaign, eventType, contactType, optionnal) => {
  await app.models.AutomationCampaignsEvents.addLog(
    {
      garageId: customer.garageId,
      campaignId: campaign.id,
      customerId: customer.id,
      eventType: eventType,
      contactType: contactType,
      campaignType: campaign.type,
      target: campaign.target,
      campaignRunDay: timeHelper.todayDayNumber(),
    },
    optionnal
  );
};

describe('Test automation customers:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('should create new customer', async function test() {
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    await app.models.Configuration.create({
      reserved_field_name: 'DataToAddToCustomers',
      dataToAddToCustomers: [],
    });
    const customer = await app.models.Customer.findOne();
    expect(customer.email).equal(exampleData.customer.contact.email.value);
    expect(customer.phone).equal(exampleData.customer.contact.mobilePhone.value);
  });
  it('should update customer by email', async function test() {
    // check customer before
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const customerBefore = await app.models.Customer.findOne();
    expect(customerBefore.email).equal(exampleData.customer.contact.email.value);
    expect(customerBefore.phone).equal(exampleData.customer.contact.mobilePhone.value);
    const newPhone = '+33684513555';
    const exampleForUpdate = await app.models.Data.create({
      garageId: exampleData.garageId,
      type: 'Maintenance',
      garageType: 'Dealership',
      service: {},
      customer: {
        isValidated: true,
        contact: {
          email: {
            value: exampleData.customer.contact.email.value,
            original: exampleData.customer.contact.email.value,
          },
          mobilePhone: {
            value: newPhone,
            original: newPhone,
          },
        },
      },
    });
    await app.models.Customer.addData(exampleForUpdate);
    const customerExpect = await app.models.Customer.findOne();
    expect(customerExpect.email).equal(exampleData.customer.contact.email.value);
    expect(customerExpect.phone).equal(newPhone);
  });
  it('should update customer by phone', async function test() {
    // check customer before
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const customerBefore = await app.models.Customer.findOne();
    expect(customerBefore.email).equal(exampleData.customer.contact.email.value);
    expect(customerBefore.phone).equal(exampleData.customer.contact.mobilePhone.value);
    const newEmail = 'solid@serpent.fr';
    const exampleForUpdate = await app.models.Data.create({
      garageId: exampleData.garageId,
      type: 'Maintenance',
      garageType: 'Dealership',
      service: {},
      customer: {
        isValidated: true,
        contact: {
          email: {
            value: newEmail,
            original: newEmail,
          },
          mobilePhone: {
            value: exampleData.customer.contact.mobilePhone.value,
            original: exampleData.customer.contact.mobilePhone.value,
          },
        },
      },
    });
    await app.models.Customer.addData(exampleForUpdate);
    const customerExpect = await app.models.Customer.findOne({
      where: { email: newEmail },
    });

    expect(customerExpect.email).equal(newEmail);
    expect(customerExpect.phone).equal(exampleData.customer.contact.mobilePhone.value);
  });
  it('Should check email phone and not create customer', async function test() {
    const garage = await app.addGarage();
    const exampleForUpdate = await app.models.Data.create({
      garageId: ObjectId(garage.id.toString()),
      type: 'Maintenance',
      shouldSurfaceInStatistics: true,
      service: {
        isQuote: false,
        categories: null,
        frontDeskUserName: 'BAUMER anthony',
        frontDeskGarageId: '24',
      },
      garageType: 'Dealership',
    });
    await app.models.Customer.addData(exampleForUpdate);
    const cutomerExpect = await app.models.Customer.findOne({
      where: {
        garageId: ObjectId(garage.id.toString()),
      },
    });
    // not created customer with this invalid data (email ko, phone ko)
    expect(cutomerExpect).equal(null);
  });
  it('should exclude null@garagescore email', async function test() {
    const exampleForUpdate = await app.models.Data.create({
      garageId: exampleData.garageId,
      type: 'Maintenance',
      garageType: 'Dealership',
      service: {},
      customer: {
        isValidated: true,
        contact: {
          email: {
            value: 'null+123@garagescore.com',
            original: 'null+123@garagescore.com',
          },
        },
      },
    });
    await app.models.Customer.addData(exampleForUpdate);
    const customerExpect = await app.models.Customer.findOne({ where: { email: 'null+123@garagescore.com' } });
    // should not create customer with email address @garagescore or @custted
    expect(customerExpect).equal(null);
  });
  it('should create customer with garagescore email', async function test() {
    const email = 'bob@garagescore.com';
    const exampleForUpdate = await app.models.Data.create({
      garageId: exampleData.garageId,
      type: 'Maintenance',
      garageType: 'Dealership',
      service: {},
      customer: {
        isValidated: true,
        contact: {
          email: {
            value: email,
            original: email,
          },
        },
      },
    });
    await app.models.Customer.addData(exampleForUpdate);
    const customerExpect = await app.models.Customer.getMongoConnector().findOne({ email: email });
    // should not create customer with email address @garagescore or @custted
    expect(customerExpect.email).equal(email);
  });
  it('should create one document on DataToAddToCustomers', async function test() {
    const commonPhone = '+33684554321';
    const dataExample = {
      garageId: exampleData.garageId,
      type: 'Maintenance',
      garageType: 'Dealership',
      service: {},
      customer: {
        isValidated: true,
        contact: {
          email: {
            value: 'doge@coin.com',
            original: 'doge@coin.com',
          },
          mobilePhone: {
            value: commonPhone,
            original: commonPhone,
          },
        },
      },
    };
    const phoneList = [commonPhone, '+33684554322', '+33684554323', '+33684554324', '+33684554325', '+33684554326'];
    for (const phone of phoneList) {
      dataExample.customer.contact.mobilePhone.value = phone;
      dataExample.customer.contact.mobilePhone.original = phone;
      const exampleForUpdate = await app.models.Data.create(dataExample);
      await app.models.Customer.addData(exampleForUpdate);
    }
    // customer should have array of 5 phones number
    const customerExpect = await app.models.Customer.findOne({ where: { phoneList: commonPhone } });
    expect(customerExpect.phoneList.length).equal(5);
    expect(customerExpect.phoneList.includes(commonPhone)).equal(true);
    const [resultExpect] = await app.models.DataToAddToCustomers.getMongoConnector().find().toArray();
    // created one document on collection DataToAddToCustomers because phoneList > 5
    const motifs = resultExpect.motifs.find(({ name }) => name === 'phoneList');
    expect(resultExpect.email).equal('doge@coin.com');
    expect(resultExpect.phone).equal('+33684554326');
    expect(motifs.count).equal(6);
  });
  it('add single data not linked to any customer', async function test() {
    const person = testTools.random.person();
    person.email = 'toto@tata.com';
    person.mobilePhone = '+33687452103';
    person.fullName = 'El Diablo Fuerte De La Puerta Del Sol';
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const datas = await app.datas();
    const customers = await app.customers();
    expect(customers.length).equal(1);
    expect(datas.length).equal(1);
    const survey = await campaign.getSurvey();
    await survey.rate('9').submit();
    await campaign.complete();
    const jobs = await app.jobs();
    const automationJobs = jobs.filter((e) => e.type === 'AUTOMATION_ADD_DATAS_TO_CUSTOMER');
    expect(automationJobs.length).to.equal(0);
    const customer = customers[0];
    expect(customer.fullName).equal('El Diablo Fuerte De La Puerta Del Sol');
    expect(customer.email).equal('toto@tata.com');
    expect(customer.phone).equal('+33687452103');
    expect(customer.clientId).equal(undefined);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
  });
  it('add lead data not linked to any customer, creates a customer with lead filled', async function test() {
    const person = testTools.random.person();
    person.email = 'toto@tata.com';
    person.mobilePhone = '+33687452103';
    person.fullName = 'El Diablo Fuerte De La Puerta Del Sol';
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const datas = await app.datas();
    let customers = await app.customers();
    expect(customers.length).equal(1);
    expect(datas.length).equal(1);
    const survey = await campaign.getSurvey();
    await survey.rate(8).setLead(LeadTypes.INTERESTED, LeadTimings.MID_TERM, LeadSaleTypes.USED_VEHICLE_SALE).submit();
    const closeDate = new Date();
    await campaign.complete();
    const automationJobs = await app.jobs({ where: { type: JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER } });
    expect(automationJobs.length).to.equal(1);
    await addDatasToCustomer(automationJobs[0]);
    const [customer] = await app.customers();
    expect(customer.fullName).equal('El Diablo Fuerte De La Puerta Del Sol');
    expect(customer.email).equal('toto@tata.com');
    expect(customer.phone).equal('+33687452103');
    expect(customer.clientId).equal(undefined);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
    expect(customer.leads.length).equal(1);
    expect(customer.leads[0].leadType).equal(LeadSaleTypes.USED_VEHICLE_SALE);
    expect(customer.leads[0].source).equal(SourceTypes.DATAFILE);
    expect(customer.leads[0].declaredAt.getDate()).equal(closeDate.getDate());
    expect(customer.leads[0].declaredAt.getMonth()).equal(closeDate.getMonth());
    expect(customer.leads[0].declaredAt.getFullYear()).equal(closeDate.getFullYear());
  });
  it('add two datas with same email', async function test() {
    const person = testTools.random.person();
    const person2 = testTools.random.person();
    person.email = 'toto@tata.com';
    person2.email = 'toto@tata.com';
    person2.mobilePhone = '+33687452103';
    person2.fullName = 'El Diablo Fuerte De La Puerta Del Sol';
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const campaign2 = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person2);
    const datas = await app.datas();
    const customers = await app.customers();
    expect(customers.length).equal(1);
    expect(datas.length).equal(2);
    const survey = await campaign.getSurvey();
    await survey.rate('9').submit();
    await campaign.complete();
    await campaign2.complete();
    const jobs = await app.jobs();
    const automationJobs = jobs.filter((e) => e.type === 'AUTOMATION_ADD_DATAS_TO_CUSTOMER');
    expect(automationJobs.length).to.equal(0);
    const customer = customers[0];
    expect(customer.fullName).equal('El Diablo Fuerte De La Puerta Del Sol');
    expect(customer.email).equal('toto@tata.com');
    expect(customer.phone).equal('+33687452103');
    expect(customer.clientId).equal(undefined);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
    expect(customer.history[1].dataId.toString()).equal(datas[1].getId().toString());
  });
  it('add two datas with one diff email + one diff phone, then add a third fusion data containing both', async function test() {
    const person = testTools.random.person();
    const person2 = testTools.random.person();
    const person3 = testTools.random.person();
    person.email = 'toto@tata.com';
    person.mobilePhone = '+33698541278';
    person2.email = 'minimoo@lele.fr';
    person2.mobilePhone = '+33687452103';
    person3.email = 'toto@tata.com';
    person3.mobilePhone = '+33687452103';
    person3.fullName = 'El Diablo Fuerte De La Puerta Del Sol';
    const garage = await app.addGarage();
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const campaign2 = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person2);
    const campaign3 = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person3);
    const datas = await app.datas();
    const customers = await app.customers();
    expect(customers.length).equal(1);
    expect(datas.length).equal(3);
    const survey = await campaign.getSurvey();
    await survey.rate('9').submit();
    await campaign.complete();
    await campaign2.complete();
    await campaign3.complete();
    const jobs = await app.jobs();
    const automationJobs = jobs.filter((e) => e.type === 'AUTOMATION_ADD_DATAS_TO_CUSTOMER');
    expect(automationJobs.length).to.equal(0);
    expect(customers.length).equal(1);
    const customer = customers[0];
    expect(customer.fullName).equal('El Diablo Fuerte De La Puerta Del Sol');
    expect(customer.email).equal('toto@tata.com');
    expect(customer.phone).equal('+33687452103');
    expect(customer.clientId).equal(undefined);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
    expect(customer.history[1].dataId.toString()).equal(datas[1].getId().toString());
    expect(customer.history[2].dataId.toString()).equal(datas[2].getId().toString());
  });
  it('all combined (fusion, re add, double fusion, kaioken)', async function test() {
    // We have 5 different datas
    const persons = {
      c1: testTools.random.person(),
      c2: testTools.random.person(),
      c3: testTools.random.person(),
      c4: testTools.random.person(),
      c5: testTools.random.person(),
      // We fuse 1 with 2 and 3
      c12: testTools.random.person(),
      c23: testTools.random.person(),
      // We fuse 4 and 5
      c45: testTools.random.person(),
      // We fuse 1234 with 56
      c15: testTools.random.person(),
    };

    persons.c1.email = 'c1@toto.com';
    persons.c1.mobilePhone = '+33611111111';
    persons.c2.email = 'c2@toto.com';
    persons.c2.mobilePhone = null;
    persons.c3.email = null;
    persons.c3.mobilePhone = '+33633333333';
    persons.c4.email = 'c4@toto.com';
    persons.c4.mobilePhone = '+33644444444';
    persons.c5.email = 'c5@toto.com';
    persons.c5.mobilePhone = '+33655555555';
    //
    persons.c12.email = 'c2@toto.com';
    persons.c12.mobilePhone = '+33611111111';
    persons.c23.email = 'c2@toto.com';
    persons.c23.mobilePhone = '+33633333333';
    //
    persons.c45.email = 'c4@toto.com';
    persons.c45.mobilePhone = '+33655555555';
    //
    persons.c15.email = 'c1@toto.com';
    persons.c15.mobilePhone = '+33655555555';
    const garage = await app.addGarage();
    const ids = {};
    // First datas, add customer, base behaviour. Will be identical for each
    for (let i = 1; i < 6; i++) {
      let key = `c${i}`;
      await garage.runNewCampaign(dataFileTypes.MAINTENANCES, persons[key]);
      let customers = await app.customers();
      let datas = await app.datas();
      expect(customers.length).equal(i);
      expect(datas.length).equal(i);
      let customer = customers[i - 1];
      ids[key] = customer.getId().toString();
      if (!persons[key].email) {
        expect(!!customer.email).equal(false);
        expect(customer.emailList.length).equal(0);
      } else {
        expect(customer.email).equal(persons[key].email);
        expect(customer.emailList.length).equal(1);
      }
      if (!persons[key].mobilePhone) {
        expect(!!customer.phone).equal(false);
        expect(customer.phoneList.length).equal(0);
      } else {
        expect(customer.phone).equal(persons[key].mobilePhone);
        expect(customer.phoneList.length).equal(1);
      }
      expect(customer.clientId).equal(undefined);
      expect(customer.fusedCustomerIds).equal(undefined);
      expect(customer.history[0].dataId.toString()).equal(datas[i - 1].getId().toString());
    }
    // C12s data will fusion 1 and 2
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, persons.c12);
    let customers = await app.customers();
    let datas = await app.datas();
    expect(customers.length).equal(4);
    expect(datas.length).equal(6);
    let customer = customers[0];
    expect(customer.getId().toString()).equal(ids.c1.toString());
    expect(customer.email).equal(persons.c2.email);
    expect(customer.phone).equal(persons.c1.mobilePhone);
    expect(customer.clientId).equal(undefined);
    expect(customer.emailList.length).equal(2);
    expect(customer.phoneList.length).equal(1);
    expect(customer.fusedCustomerIds.length).equal(1);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c2.toString())).equal(true);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
    expect(customer.history[1].dataId.toString()).equal(datas[1].getId().toString());
    expect(customer.history[2].dataId.toString()).equal(datas[5].getId().toString());
    // C23 adds a data which will be added to the fusion of 1 and 2, and will also fuse 3 with them
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, persons.c23);
    customers = await app.customers();
    datas = await app.datas();
    expect(customers.length).equal(3);
    expect(datas.length).equal(7);
    customer = customers[0];
    expect(customer.getId().toString()).equal(ids.c1.toString());
    expect(customer.email).equal(persons.c2.email);
    expect(customer.phone).equal(persons.c3.mobilePhone);
    expect(customer.clientId).equal(undefined);
    expect(customer.emailList.length).equal(2);
    expect(customer.phoneList.length).equal(2);
    expect(customer.fusedCustomerIds.length).equal(2);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c2.toString())).equal(true);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c3.toString())).equal(true);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
    expect(customer.history[1].dataId.toString()).equal(datas[1].getId().toString());
    expect(customer.history[2].dataId.toString()).equal(datas[5].getId().toString());
    expect(customer.history[3].dataId.toString()).equal(datas[2].getId().toString());
    expect(customer.history[4].dataId.toString()).equal(datas[6].getId().toString());
    // C45s data will fusion 4 and 5
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, persons.c45);
    customers = await app.customers();
    datas = await app.datas();
    expect(customers.length).equal(2);
    expect(datas.length).equal(8);
    customer = customers[1];
    expect(customer.getId().toString()).equal(ids.c4.toString());
    expect(customer.email).equal(persons.c4.email);
    expect(customer.phone).equal(persons.c5.mobilePhone);
    expect(customer.clientId).equal(undefined);
    expect(customer.emailList.length).equal(2);
    expect(customer.phoneList.length).equal(2);
    expect(customer.fusedCustomerIds.length).equal(1);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c5.toString())).equal(true);
    expect(customer.history[0].dataId.toString()).equal(datas[3].getId().toString());
    expect(customer.history[1].dataId.toString()).equal(datas[4].getId().toString());
    expect(customer.history[2].dataId.toString()).equal(datas[7].getId().toString());
    // Grand finale, C15 fuses everything together
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, persons.c15);
    customers = await app.customers();
    datas = await app.datas();
    expect(customers.length).equal(1);
    expect(datas.length).equal(9);
    customer = customers[0];
    expect(customer.getId().toString()).equal(ids.c1.toString());
    expect(customer.email).equal(persons.c1.email);
    expect(customer.phone).equal(persons.c5.mobilePhone);
    expect(customer.clientId).equal(undefined);
    expect(customer.emailList.length).equal(4);
    expect(customer.phoneList.length).equal(4);
    expect(customer.fusedCustomerIds.length).equal(4);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c2.toString())).equal(true);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c3.toString())).equal(true);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c4.toString())).equal(true);
    expect(customer.fusedCustomerIds.map((e) => e.toString()).includes(ids.c5.toString())).equal(true);
    expect(customer.history[0].dataId.toString()).equal(datas[0].getId().toString());
    expect(customer.history[1].dataId.toString()).equal(datas[1].getId().toString());
    expect(customer.history[2].dataId.toString()).equal(datas[5].getId().toString());
    expect(customer.history[3].dataId.toString()).equal(datas[2].getId().toString());
    expect(customer.history[4].dataId.toString()).equal(datas[6].getId().toString());
    expect(customer.history[5].dataId.toString()).equal(datas[3].getId().toString());
    expect(customer.history[6].dataId.toString()).equal(datas[4].getId().toString());
    expect(customer.history[7].dataId.toString()).equal(datas[7].getId().toString());
  });
  it('set automation only on a garage, import file, all datas created should be automationOnly, automationCampaigns on running', async function test() {
    const garage = await app.addGarage({
      subscriptions: {
        Maintenance: {
          enabled: false,
        },
        Automation: {
          enabled: true,
        },
        AutomationApv: {
          enabled: true,
        },
      },
    });
    let garageInstance = await garage.getInstance();
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garageInstance.getId(),
      garageInstance.subscriptions,
      garageInstance.dataFirstDays,
      garageInstance.locale,
      garageInstance.status
    );
    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'Maintenances'
    );
    await importer.generateData(app.models, dataFileId, await garage.getInstance());
    const datas = await app.datas();
    expect(datas.length).to.equals(11);
    expect(datas.filter((d) => d.campaign.automationOnly).length).to.equal(11);
    const jobs = await app.jobs();
    expect(jobs.length).to.equals(1);
    expect(jobs[0].payload.dataIds.length).to.be.equal(11);
    const aCampaigns = await app.models.AutomationCampaign.find({
      type: AutomationCampaignTypes.AUTOMATION_MAINTENANCE,
    });
    expect(aCampaigns.length > 0).to.equals(true);
  });
  it('dataFile with importAutomation on, datas should be automationOnly even if Maintenance is on. SHould also create customers', async function test() {
    const garage = await app.addGarage();
    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'Maintenances',
      true
    );
    await importer.generateData(app.models, dataFileId, await garage.getInstance());
    const datas = await app.datas();
    expect(datas.length).to.equals(11);
    expect(datas.filter((d) => d.campaign.automationOnly).length).to.equal(11);
    const jobs = await app.jobs();
    expect(jobs.length).to.equals(1);
    expect(jobs[0].payload.dataIds.length).to.be.equal(11);
    expect(jobs[0].type).to.be.equal(JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER);
    await addDatasToCustomer(jobs[0]);
    const customers = await app.customers();
    expect(customers.length).to.equals(11);
  });
  it('Consolidation of a customer', async function test() {
    const garage = await app.addGarage({ locale: 'fr_FR' });
    const email = 'toto@tata.com';
    const target = AutomationCampaignTargets.M_M;
    await createCustomer(app, target, garage, email);
    await createAndRunAutomationCampaign(app, garage, target);
    const customer = await app.models.Customer.findOne();
    const maintenanceCampaignEmail = await app.models.AutomationCampaign.findOne({
      where: {
        contactType: AutomationCampaignChannelTypes.EMAIL,
        target: AutomationCampaignTargets.M_M,
      },
    });
    // We put the data in his history in the future, to create a billingDate
    customer.history[0].serviceProvidedAt = timeHelper.dayNumberToDate(timeHelper.dayNumber(new Date()) + 10);
    const element = customer.index.find((e) => e.k === 'lastMaintenanceAt');
    const newDate = new Date();
    newDate.setFullYear(newDate.getFullYear() - 1);
    newDate.setMonth(newDate.getMonth() + 1);
    element.v = newDate;
    await customer.save();

    await _createAddLog(
      customer,
      maintenanceCampaignEmail,
      AutomationCampaignsEventsType.SENT,
      AutomationCampaignChannelTypes.EMAIL
    );
    await _createAddLog(
      customer,
      maintenanceCampaignEmail,
      AutomationCampaignsEventsType.RECEIVED,
      AutomationCampaignChannelTypes.EMAIL,
      { forceDate: timeHelper.dayNumberToDate(timeHelper.todayDayNumber() + 2) }
    );
    await _createAddLog(
      customer,
      maintenanceCampaignEmail,
      AutomationCampaignsEventsType.OPENED,
      AutomationCampaignChannelTypes.EMAIL,
      { forceDate: timeHelper.dayNumberToDate(timeHelper.todayDayNumber() + 2) }
    );
    await _createAddLog(
      customer,
      maintenanceCampaignEmail,
      AutomationCampaignsEventsType.LEAD,
      AutomationCampaignChannelTypes.EMAIL,
      { forceDate: timeHelper.dayNumberToDate(timeHelper.todayDayNumber() + 4) }
    );
    const [job] = await app.jobs({ type: JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER });
    await consolidateCustomer(job);
    const customerExpected = await app.models.Customer.getMongoConnector().findOne({ email });

    expect(customerExpected.automationCampaigns.length).to.equal(1);
    expect(customerExpected.automationCampaigns[0].openedDayToBillingDay).to.equal(8);
    expect(customerExpected.automationCampaigns[0].targetedDay).to.equal(timeHelper.todayDayNumber());
    expect(customerExpected.automationCampaigns[0].leadDay).to.equal(timeHelper.todayDayNumber() + 4);
  });
  it('import file, check registrationDate is ISODate', async function test() {
    const garage = await app.addGarage();
    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'Maintenances'
    );
    await importer.generateData(app.models, dataFileId, await garage.getInstance());
    const datas = await app.datas();
    datas.forEach((data) => {
      if (data.vehicle.registrationDate && data.vehicle.registrationDate.isSyntaxOK) {
        const isIsoDate = /[Z]/.test(JSON.stringify(data.vehicle.registrationDate.value));
        expect(isIsoDate).to.equals(true);
      }
    });
  });
  it('import two dataFiles, remove one, check customers', async function test() {
    const secondGarageId = '5bc5e7eec600b00014059d24';
    // First, we add two datafiles.
    const garage = await app.addGarage();
    const dataFileId = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'Maintenances',
      true
    );
    await importer.generateData(app.models, dataFileId, await garage.getInstance());
    const dataFileId2 = await app.addDataFile(
      garage,
      path.join(__dirname, 'data/cobrediamix2.xls'),
      'Cobredia/cobredia-mix.js',
      'Maintenances',
      true
    );
    await importer.generateData(app.models, dataFileId2, await garage.getInstance());
    const datas = await app.datas();
    expect(datas.length).to.equals(130);
    let jobs = await app.jobs();
    expect(jobs.length).to.equals(2);
    const job1 = jobs.find((j) => j.payload.dataIds.length === 11);
    const job2 = jobs.find((j) => j.payload.dataIds.length === 119);
    expect(job1.payload.dataIds.length).to.be.equal(11);
    expect(job1.type).to.be.equal(JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER);
    expect(job2.payload.dataIds.length).to.be.equal(119);
    expect(job2.type).to.be.equal(JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER);
    // Then we add data to customer for the 1st file (11 datas)
    await addDatasToCustomer(job1);
    let customers = await app.customers();
    expect(customers.length).to.equals(11);
    // We will add another data to this specific customer on the second import, so we verify what we have on it before the second import
    let interestingCustomer = customers.find((c) => c.phone === '+33617565315');
    expect(interestingCustomer.fullName).to.be.equal('Valerie Le Scolan');
    expect(interestingCustomer.email).to.be.equal('lescolan.valerie@orange.fr');
    expect(interestingCustomer.emailList.includes('lescolan.valerie@orange.fr')).to.be.equal(true);
    // Then we add data to customer for the 2nd file (119 datas)
    await addDatasToCustomer(job2);
    customers = await app.customers();
    // We have 2 datas that fits customer in this situation, so we have 124 customers, not 130
    expect(customers.length).to.equals(124);
    // We know we have a data in each import that fits the same person, so we check again for this person and its data
    interestingCustomer = customers.find((c) => c.dataIds.length > 1);
    expect(interestingCustomer.fullName).to.be.equal('Valerie Le Scolan');
    expect(interestingCustomer.phone).to.be.equal('+33617565315');
    expect(interestingCustomer.email).to.be.equal('lescolanvalerie@orange.fr');
    expect(interestingCustomer.emailList.includes('lescolan.valerie@orange.fr')).to.be.equal(true);
    expect(interestingCustomer.emailList.includes('lescolanvalerie@orange.fr')).to.be.equal(true);
    expect(interestingCustomer.emailList.length).to.be.equal(2);
    // Hack to put datasCreatedIds in the datafile
    await app.models.DataFile.getMongoConnector().updateOne(
      { filePath: path.join(__dirname, 'data/cobrediamix1.txt') },
      { $set: { datasCreatedIds: job1.payload.dataIds.map((dId) => ObjectId(dId)) } }
    );
    // End of the hack
    // We remove the datas from the customers and migrate them to another
    await app.models.Customer.deleteOrMigrateDatasToAnotherGarage({
      dataFilePath: path.join(__dirname, 'data/cobrediamix1.txt'),
      migrationGarageId: secondGarageId,
      migrationManagerId: '5bc5e7eec600b00014059d34',
    });
    // Time to check
    customers = await app.customers();
    // We should have 125, now we splitted the datas of the customer with two emails in two garages
    expect(customers.length).to.equals(125);
    // The new garage should have 11 elements, the old one 114
    expect(customers.filter((c) => c.garageId.toString() === secondGarageId).length).to.equals(11);
    expect(customers.filter((c) => c.garageId.toString() !== secondGarageId).length).to.equals(114);
    // Now we get the interesting customers and check if they're good
    const interestingCustomers = customers.filter((c) => c.fullName === 'Valerie Le Scolan');
    expect(interestingCustomers.length).to.equals(2);
    const customerFirstGarage = interestingCustomers.find((c) => c.garageId.toString() !== secondGarageId);
    const customerSecondGarage = interestingCustomers.find((c) => c.garageId.toString() === secondGarageId);
    expect(customerFirstGarage.phone).to.be.equal('+33617565315');
    expect(customerFirstGarage.email).to.be.equal('lescolanvalerie@orange.fr');
    expect(customerFirstGarage.emailList.includes('lescolanvalerie@orange.fr')).to.be.equal(true);
    expect(customerFirstGarage.emailList.length).to.be.equal(1);
    expect(customerSecondGarage.phone).to.be.equal('+33617565315');
    expect(customerSecondGarage.email).to.be.equal('lescolan.valerie@orange.fr');
    expect(customerSecondGarage.emailList.includes('lescolan.valerie@orange.fr')).to.be.equal(true);
    expect(customerSecondGarage.emailList.length).to.be.equal(1);
  });
  it('should push campaign status in customer index', async function test() {
    // create customer
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const customer = await app.models.Customer.findOne(data);
    // create events
    const eventLead = {
      campaignId: ObjectId('5efe19e49633ed00038748d6'),
      type: AutomationCampaignsEventsType.LEAD,
      target: AutomationCampaignTargets.M_M,
      eventDay: timeHelper.dayNumber(new Date()),
    };
    const eventConverted = {
      campaignId: ObjectId('5efe19e49633ed00038748d7'),
      type: AutomationCampaignsEventsType.CONVERTED,
      target: AutomationCampaignTargets.M_M_23,
      eventDay: timeHelper.dayNumber(new Date()),
    };
    const events = [eventLead, eventConverted];
    app.models.Customer.setCampaignStatusInIndex(customer, events);

    const expectLeadIndex = customer.index.find(({ k }) => k === 'lastLeadAt');
    const expectConvertedIndex = customer.index.find(({ k }) => k === 'lastConvertedAt');
    // index look like { k: 'lastLeadAt', v: 18446 }
    expect(/lead/i.test(expectLeadIndex.k)).equals(true);
    expect(/converted/i.test(expectConvertedIndex.k)).equals(true);
    expect(expectLeadIndex.v).equals(eventLead.eventDay);
    expect(expectConvertedIndex.v).equals(eventConverted.eventDay);
  });
  it('should insert last CONVERTED in customer index', async function test() {
    // create customer
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const customer = await app.models.Customer.findOne();
    // create events
    const dayNumber = timeHelper.dayNumber(new Date()) - 10;
    const eventLead = {
      campaignId: ObjectId('5efe19e49633ed00038748d6'),
      type: AutomationCampaignsEventsType.CONVERTED,
      target: AutomationCampaignTargets.M_M,
      eventDay: dayNumber,
    };
    const events = [eventLead];
    app.models.Customer.setCampaignStatusInIndex(customer, events);

    await customer.save();

    const expectCustomer = await app.models.Customer.findOne();
    const result = expectCustomer.index.find(({ k, v }) => k === `lastConvertedAt` && v === dayNumber);
    // customer should have in index { k: 'lastConvertedAt' , v: dayNumber }
    expect(/converted/i.test(result.k)).equals(true);
    expect(result.v).equals(dayNumber);
  });
  it('should insert last LEAD in customer index', async function test() {
    // create customer
    const data = await app.models.Data.create(exampleData);
    await app.models.Customer.addData(data);
    const customer = await app.models.Customer.findOne();
    // create events
    const dayNumber = timeHelper.dayNumber(new Date()) - 10;
    const eventLead = {
      campaignId: ObjectId('5efe19e49633ed00038748d6'),
      type: AutomationCampaignsEventsType.LEAD,
      target: AutomationCampaignTargets.VS_M_11,
      eventDay: dayNumber,
    };
    const events = [eventLead];
    app.models.Customer.setCampaignStatusInIndex(customer, events);

    await customer.save();

    const expectCustomer = await app.models.Customer.findOne();
    const result = expectCustomer.index.find(({ k, v }) => k === `lastLeadAt` && v === dayNumber);
    // customer should have in index { k: 'lastLeadAt' , v: dayNumber }
    expect(/lead/i.test(result.k)).equals(true);
    expect(result.v).equals(dayNumber);
  });
});
