/* eslint-disable */
/** testApp must be called as the first require in your tests
 Some macro to make unit tests shorter and cleaner
 # exemple 1: check contact created after creating and running a campaign
 const garage = await app.addGarage(publicDisplayName);
 await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
 const contacts = await app.contacts();
 */
/* eslint-disable */
const BSON = require('./bson');
const moment = require('moment');
const { ObjectId } = require('mongodb');

// Those are the tests that have to be launched on a regular MongoDB instead of the in-Memory connector used by default in our tests.
// The reason behind this is that in memoryDB bugs when the query involves arrays.
// Uncomment following 2 lines to reactivate & take a look at datasources.local.js
// const mongoTests = ['issue-850-switch-parent', 'add-user-add-garage'];
process.env.USE_MEMORY_DB = true; // mongoTests.every(mongoTest => !module.parent.id.includes(mongoTest));
process.env.USE_FAKE_PG_DB = true;
require('dotenv').config({ silent: true }); // We need to be sure that this line is called before any require('config')
const debug = require('debug')('garagescore:common:lib:test:test-app');
const fs = require('fs');
const sinon = require('sinon');
const testTools = require('./testtools.js');
const TestGarage = require('./test-app/test-garage');
const TestUser = require('./test-app/test-user');
const TestReviewReplyTemplate = require('./test-app/test-review-reply-template');
const fixLoopback = require('./test-app/fix-loopback');
const promises = require('../util/promises');
const supervisor = require('../garagescore/supervisor/reporter');
const contactsSender = require('../../../workers/contacts-sender');
const timeHelper = require('../util/time-helper.js');
const mockSmsFactor = require('../../../common/lib/test/test-app/mock-smsfactor');
const mockMailGun = require('../../../common/lib/test/test-app/mock-mailgun');
const defaultScenario = require('../../../common/lib/garagescore/campaign-scenario/default-scenario.js');
const specialTestScenario = require('../../../common/lib/test/test-scenario');
const contactRender = require('../../../common/lib/garagescore/contact/render');
const ContactType = require('../../../common/models/contact.type');
const { TEST_DB_NAME } = require('./constants');

if (process.env.serverjsloaded) {
  // setted by server.js
  console.error(new Error('#2758 do not require server.js before test.app'));
  process.exit(1);
}
let _stubs = [];

function _isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function _mergeDeep(target, source) {
  // const output = Object.assign({}, target);
  if (_isObject(target) && _isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (_isObject(source[key])) {
        if (!(key in target)) Object.assign(target, { [key]: source[key] });
        else target[key] = _mergeDeep(target[key], source[key]); // eslint-disable-line
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }
  return target;
}

/** Mock app models */
const _momo = {
  // For mock models
  // start mocking
  on: (models) => {
    _stubs.push(
      sinon.stub(models.CampaignScenario.prototype, 'formatContact').callsFake((contact, importedDayNumber, delta) => {
        if (!contact) return null;
        return { day: importedDayNumber + contact.delay + (delta || 0), key: contact.key }; // don't jump weekend for sms
      })
    );
  },
  // stop mocking
  off: () => {
    _stubs.forEach((stub) => stub.restore());
    _stubs = [];
  },
};

fixLoopback();

class TestApp {
  /** block until app is booted */
  waitAppBoot() {
    if (this.serverBooted) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.waitingAppBootList.push(resolve);
    });
  }

  constructor() {
    this.defaultScenario = null;
    this.specialTestScenario = null;
    this.serverBooted = false;
    this.waitingAppBootList = [];
    this.server = require('../../../server/server'); // eslint-disable-line
    this.server.on('booted', () => {
      this.models = this.server.models;
      this.serverBooted = true;
      this.waitingAppBootList.forEach((p) => p());
      for (const modelName of Object.keys(this.models)) {
        if (
          !this.models[modelName].getDataSource().settings.url.includes(TEST_DB_NAME) ||
          this.models[modelName].getDataSource().settings.database !== TEST_DB_NAME
        ) {
          console.error(`[APP-TEST CONSTRUCTOR] The Model "${modelName}" Is Not Connected To The In Memory Db!`);
          process.exit(1);
        }
      }
    });
  }
  // build a nuxt instance to test contact rendering
  async allowContactsRender() {
    await contactRender.setTestMode();
  }
  // clear database
  async reset() {
    await this.waitAppBoot();
    _momo.off();
    debug('Clear data');
    delete this.defaultScenario;
    delete this.specialTestScenario;
    const modelNames = Object.keys(this.models);
    for (let m = 0; m < modelNames.length; m++) {
      await this.models[modelNames[m]].destroyAll();
    }
    _momo.on(this.models);
    mockSmsFactor.reset();
    mockMailGun.reset();
    debug('init done');
    await this.upsertDefaultScenario(); // add the default scenario
    await this.upsertSpecialTestScanario(); // add a special scenario
  }
  // direct access to models
  _models() {
    return this.models;
  }
  getCollection(collectionName) {
    return this.models[collectionName];
  }
  // Now unsatisfied & lead tickets have are automatically assigned
  // but for that to work, the garage needs to have the ticketsConfiguration
  // That's the aim of the function below
  async fillTicketsConfiguration(user) {
    let userId = null;
    if (typeof user === 'string') {
      const found = await this.users({ id: new ObjectId(user) });
      userId = found && found.id;
    } else if (user && user.getId) {
      userId = user.id;
    }
    if (!userId) {
      const john = await this.addUser();
      userId = john.id;
    }
    return {
      Unsatisfied_Maintenance: userId,
      Unsatisfied_NewVehicleSale: userId,
      Unsatisfied_UsedVehicleSale: userId,
      Lead_Maintenance: userId,
      Lead_NewVehicleSale: userId,
      Lead_UsedVehicleSale: userId,
    };
  }
  async upsertSpecialTestScanario(options = {}) {
    if (!this.specialTestScenario) {
      const newSpecialTestScenario = new this.models.CampaignScenario(JSON.parse(JSON.stringify(specialTestScenario)));
      this.specialTestScenario = await newSpecialTestScenario.save();
      return this.specialTestScenario;
    }
    _mergeDeep(this.specialTestScenario, options);
    this.specialTestScenario = await this.specialTestScenario.save();
    return this.specialTestScenario;
  }
  // Ex : { followupAndEscalate: { DataFile: { unsatisfied: { followup: { enabled: true, delay: 0 } } } } }
  async upsertDefaultScenario(options = {}) {
    if (!this.defaultScenario) {
      const newDefaultScenario = new this.models.CampaignScenario(JSON.parse(JSON.stringify(defaultScenario)));
      newDefaultScenario.chains.NewVehicleSale.contacts[0].delay = 0; // Send directly vn first contact
      newDefaultScenario.chains.UsedVehicleSale.contacts[0].delay = 0; // Send directly vo first contact
      newDefaultScenario.chains.NewVehicleSale.contacts[1].delay = 0; // Send directly SMS vn
      newDefaultScenario.chains.UsedVehicleSale.contacts[1].delay = 0; // Send directly SMS vo
      this.defaultScenario = await newDefaultScenario.save();
      return this.defaultScenario;
    }
    _mergeDeep(this.defaultScenario, options);
    this.defaultScenario = await this.defaultScenario.save();
    return this.defaultScenario;
  }
  async addGarageWithMongo(options = {}) {
    await this.waitAppBoot();
    const data = JSON.parse(JSON.stringify(testTools.garageExample));
    delete data.id; // deprecated

    return await this.models.Garage.getMongoConnector().insertOne({ ...data, ...options });
  }
  // create a new garage, give options to override default fields (exemple addGarage({publicDisplayName: 'xx'}))
  async addGarage(options = {}) {
    await this.waitAppBoot();
    const data = JSON.parse(JSON.stringify(testTools.garageExample));
    delete data.id; // deprecated
    for (const option in options) {
      // eslint-disable-line
      if (option === 'id') {
        console.error('test app error: id presence');
      } else {
        data[option] = options[option];
      }
    }
    // Normally the garage takes the default scenario for which the delays have been set to 0
    // However this scenario cannot send 2 SMSs (e.g. to test mobile phone revisions), so a test-scenario has been created for this purpose
    // We can choose this test scenario by setting specialTestScenario option to true
    const scenarioToBeUsed = options.specialTestScenario ? this.specialTestScenario : this.defaultScenario;
    data.campaignScenarioId = scenarioToBeUsed.id.toString(); // We give the new born the default Scenario Id
    delete options.specialTestScenario;

    if (!options.ticketsConfiguration) {
      options.ticketsConfiguration = await this.fillTicketsConfiguration(options.defaultManager || null);
    }
    delete options.defaultManager;

    for (const option in options) {
      // eslint-disable-line
      data[option] = options[option];
    }
    const res = await this.models.Garage.create(data);
    const existingBA = await this.models.BillingAccount.findOne();
    if (!existingBA) {
      const BA = JSON.parse(JSON.stringify(testTools.BAExample));
      BA.garageIds.push(res.id);
      await this.models.BillingAccount.create(BA);
    } else {
      existingBA.garageIds.push(res.id);
      await this.models.BillingAccount.findByIdAndUpdateAttributes(existingBA.getId(), {
        garageIds: existingBA.garageIds,
      });
    }

    return new TestGarage(this, res.id);
  }

  async addGarageWithMongo(options = {}) {
    await this.waitAppBoot();
    const data = JSON.parse(JSON.stringify(testTools.garageExample));
    delete data.id; // deprecated

    return await this.models.Garage.getMongoConnector().insertOne({
      ...data,
      ...options,
    });

    // TODO : Translate next lines to be compatible with Mongo

    // for (const option in options) {
    //   // eslint-disable-line
    //   if (option === 'id') {
    //     console.error('test app error: id presence');
    //   } else {
    //     data[option] = options[option];
    //   }
    // }
    // // Normally the garage takes the default scenario for which the delays have been set to 0
    // // However this scenario cannot send 2 SMSs (e.g. to test mobile phone revisions), so a test-scenario has been created for this purpose
    // // We can choose this test scenario by setting specialTestScenario option to true
    // const scenarioToBeUsed = options.specialTestScenario ? this.specialTestScenario : this.defaultScenario;
    // data.campaignScenarioId = scenarioToBeUsed.id.toString(); // We give the new born the default Scenario Id
    // delete options.specialTestScenario;

    // if (!options.ticketsConfiguration) {
    //   options.ticketsConfiguration = await this.fillTicketsConfiguration(options.defaultManager || null);
    // }
    // delete options.defaultManager;

    // for (const option in options) {
    //   // eslint-disable-line
    //   data[option] = options[option];
    // }
    // const res = await this.models.Garage.create(data);
    // const existingBA = await this.models.BillingAccount.findOne();
    // if (!existingBA) {
    //   const BA = JSON.parse(JSON.stringify(testTools.BAExample));
    //   BA.garageIds.push(res.id);
    //   await this.models.BillingAccount.create(BA);
    // } else {
    //   existingBA.garageIds.push(res.id);
    //   await this.models.BillingAccount.findByIdAndUpdateAttributes(existingBA.getId(), {
    //     garageIds: existingBA.garageIds,
    //   });
    // }

    // return new TestGarage(this, res.id);
  }

  // create a censoredWords listcontact
  async addCensoredWords(data = {}) {
    await this.waitAppBoot();
    return this.models.CensoredWords.create(data);
  }

  // add a datafile
  async addDataFile(testGarage, filePath, importSchemaName, dataType, importAutomation) {
    await this.waitAppBoot();
    const fileBufffer = fs.readFileSync(filePath);
    const dataFile = {};
    dataFile.fileStore = 'filesystem';
    dataFile.filePath = filePath;
    dataFile.garageId = testGarage.getId();
    dataFile.dataType = dataType;
    dataFile.importSchemaName = importSchemaName;
    dataFile.importOptions = null;
    dataFile.fileBuffer = fileBufffer;
    dataFile.importAutomation = importAutomation;
    const instance = await this.models.DataFile.create(dataFile);
    return instance.id;
  }

  // create a data
  async addData(data) {
    return this.models.Data.create(data);
  }

  // create a new user
  async addUser(options = {}) {
    if (options.id) {
      console.error('addUser - Cannot force an id');
      delete options.id; // eslint-disable-line
    }
    await this.waitAppBoot();
    const userData = { email: testTools.random.email(), password: 'toto', job: 'Directeur de marque' };
    for (const option in options) {
      // eslint-disable-line
      userData[option] = options[option];
    }
    const user = await this.models.User.create(userData);
    return new TestUser(this, user.getId());
  }
  // run find on a model
  async find(model, query = {}) {
    await this.waitAppBoot();
    return this.server.models[model].find(query);
  }
  // list all users
  async users(query = {}) {
    await this.waitAppBoot();
    return this.server.models.User.find(query);
  }
  // list all contacts created
  async contacts(query) {
    await this.waitAppBoot();
    return this.server.models.Contact.find(query);
  }
  // list all customers created
  async customers(query = {}) {
    await this.waitAppBoot();
    return this.server.models.Customer.find(query);
  }
  // list all automationCampaignsEvents created
  async automationCampaignEvents(query = {}) {
    await this.waitAppBoot();
    return this.server.models.AutomationCampaignsEvents.find(query);
  }
  // list all scenarios created
  async scenarios(query = {}) {
    await this.waitAppBoot();
    return this.server.models.CampaignScenario.find(query);
  }
  async blackListItems(query = {}) {
    await this.waitAppBoot();
    return this.server.models.BlackListItem.find(query);
  }
  // black list a contact
  async blackListContact(contact, reason) {
    await this.waitAppBoot();
    let data;
    if (contact.payload.dataId) {
      data = await this.server.models.Data.findById(contact.payload.dataId);
    }
    await this.server.models.Contact.blackList(data, contact, reason);
    if (
      contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL ||
      contact.type === ContactType.AUTOMATION_CAMPAIGN_SMS
    ) {
      // We reset pressure since we didnt send anything (blacklisted)
      await this.server.models.Customer.resetPressure(
        contact.payload.campaignType,
        new ObjectId(contact.payload.customerId)
      );
    }
    if (data) {
      return promises.wait(this.server.models.Contact.markDataForBlacklist, data, contact, reason);
    }
  }
  // fix a stupid thing when we have an .id field but no ._id
  async add_IdField(promise) {
    const documents = await promise;
    for (const doc of documents) {
      doc._id = doc.id;
    }
    return documents;
  }
  // list all contacts created
  async dataRecordStatistics(filter = {}) {
    await this.waitAppBoot();
    return this.add_IdField(this.server.models.DataRecordStatistic.find(filter));
  }
  // list all Campaigns created
  async campaigns(query = {}) {
    await this.waitAppBoot();
    return this.add_IdField(this.server.models.Campaign.find(query));
  }
  // list all garages created
  async garages(query = {}) {
    await this.waitAppBoot();
    return this.add_IdField(this.server.models.Garage.find(query));
  }
  // list all jobs created
  async jobs(query = {}) {
    await this.waitAppBoot();
    return this.add_IdField(this.server.models.Job.find(query));
  }
  // list all Data created
  async datas(query = {}) {
    await this.waitAppBoot();
    return this.add_IdField(this.server.models.Data.find(query));
  }
  // list all Scopes created
  async scopes(query = {}) {
    await this.waitAppBoot();
    return this.add_IdField(this.server.models.Scope.find(query));
  }
  // send alerts for every updated survey on the last hour
  async sendAlerts() {
    await this.waitAppBoot();
    await promises.wait(this.server.models.Alert.fetchAndSend, timeHelper.hourAfterNow(1));
    return promises.wait(this.server.models.Alert.sendDeferred, true);
  }
  // send supervisor reports
  async sendSupervisorReports() {
    return promises.wait(supervisor.sendReport, { where: {} }, 'Test report');
  }
  // send supervisor reports
  async generateGarageHistory(periodId, garageId, frontDesk) {
    return this.server.models.GarageHistory.generateForPeriod(periodId, garageId, true, true, false, frontDesk, true);
  }
  async reviewReplyTemplates(query = {}) {
    await this.waitAppBoot();
    return this.server.models.reviewReplyTemplate.find(query);
  }

  /**
   * Consume waiting contacts
   * Please use on() of mock-mailgun.js and mock-smsfactor.js
   */
  async sendWaitingContacts() {
    await this.waitAppBoot();
    mockSmsFactor.on();
    mockMailGun.on();
    const waitingContacts = await this.server.models.Contact.find({ status: 'Waiting' });
    const credentialsSms = {
      sfusername: 'iam@legend.com',
      sfpassword: '###',
      sfhost: '//smsdoctor.herokuapp.com',
    };
    for (let i = 0; i < waitingContacts.length; i++) {
      const contact = waitingContacts[i];
      await contactsSender.sendContact(contact, { credentialsSms });
    }
    mockSmsFactor.off();
    mockMailGun.off();
    return { emails: mockMailGun.emailSent(), sms: mockSmsFactor.smsSent() };
  }

  async simulateMailgunResponse() {
    await this.waitAppBoot();
    await mockMailGun.simulateResponse();
  }

  async dropMailgunContact(contact) {
    await this.waitAppBoot();
    mockMailGun.drop(contact.email);
  }
  async emptyData(o = {}) {
    if (!o.garageId) {
      o.garageId = 'garageId';
    } // eslint-disable-line
    if (!o.type) {
      o.type = 'type';
    } // eslint-disable-line
    return this.server.models.Data.create(o);
  }
  // restore a dump
  async restore(filePath) {
    const promises = [];
    const models = this.server.models;
    let currentCollection = null;
    let nextCollectionComing = false;
    let nextDocComing = false;
    const lines = fs.readFileSync(filePath).toString().replace(/\r/g, '').split('\n');
    for (const line of lines) {
      if (line === 'BEGIN_DUMP') {
        currentCollection = null;
        nextCollectionComing = true;
        nextDocComing = false;
      } else if (line === 'END_DUMP') {
        currentCollection = null;
        nextCollectionComing = false;
        nextDocComing = false;
      } else if (nextCollectionComing) {
        currentCollection = line;
        nextCollectionComing = false;
        nextDocComing = true;
      } else if (nextDocComing) {
        const doc = BSON.deserialize(Buffer.from(line, 'hex'));
        const collection = models[currentCollection]
          .getDataSource()
          .connector.collection(models[currentCollection].modelName); //do not use loopback, it bugs
        promises.push(collection.insertOne(doc));
      }
    }
    return Promise.all(promises);
  }
  async importRandomLines(numberOfLines, garageId, dataFileDataType, columns = {}) {
    const date = moment().format('DD/MM/YYYY');

    let csv = `dateinter;genre;fullName;firstName;lastName;email;mobilePhone;ville;rue;cp;marque;modele${columns.Service ? ';Service' : ''
      }`;
    for (let i = 0; i < numberOfLines; i++) {
      csv += '\n';
      const person = testTools.random.person();
      const vehicule = testTools.random.vehicule();
      const d = {};
      d.gender = columns.gender || person.gender;
      d.fullName = columns.fullName || person.fullName;
      d.firstName = columns.firstName || person.firstName;
      d.lastName = columns.lastName || person.lastName;
      d.email = columns.email || columns.email === null ? columns.email : person.email;
      d.mobilePhone = columns.mobilePhone || columns.mobilePhone === null ? columns.mobilePhone : person.mobilePhone;
      d.city = columns.city || person.city;
      d.streetAddress = columns.streetAddress || person.streetAddress;
      d.postCode = columns.postalCode || person.postalCode;
      d.vehicleMake = columns.make || vehicule.make;
      d.model = columns.model || vehicule.model;
      d.Service = columns.Service;
      const csvFields = [
        date,
        d.gender,
        d.fullName,
        d.firstName,
        d.lastName,
        d.email,
        d.mobilePhone,
        d.city,
        d.streetAddress,
        d.postCode,
        d.vehicleMake,
        d.model,
      ]; // eslint-disable-line max-len
      if (d.Service) {
        csvFields.push(d.Service);
      }
      csv += csvFields.join(';');
    }
    const campaigns = await promises.wait(this.models.DataFile.importFromString, garageId, dataFileDataType, csv);
    return campaigns;
  }
  async addReviewReplyTemplateMongo(options = {}) {
    await this.waitAppBoot();
    const data = testTools.random.reviewReplyTemplate();
    for (const option in options) {
      // eslint-disable-line
      data[option] = options[option];
    }
    return this.models.ReviewReplyTemplate.getMongoConnector().insertOne(data);
  }
  async addReviewReplyTemplate(options = {}) {
    await this.waitAppBoot();

    const data = testTools.random.reviewReplyTemplate();

    for (const option in options) {
      // eslint-disable-line
      data[option] = options[option];
    }
    const res = await this.models.ReviewReplyTemplate.create(data);
    return new TestReviewReplyTemplate(this, res);
  }
}

module.exports = TestApp;
