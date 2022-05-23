const debug = require('debug')('garagescore:common:lib:test:testtools'); // eslint-disable-line max-len,no-unused-vars

const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const GarageTypes = require('../../models/garage.type.js');
const SourceTypes = require('../../models/data/type/source-types.js');
const DataFileTypes = require('../../models/data-file.data-type.js');
const timeHelper = require('../util/time-helper');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

/**
 Some tools to make tests more easy
 */

const Tools = (module.exports = {
  /*
   set an env variable to use test collections instead of real collection
   (must be called before loopback init)
   */
  useTestDB: () => {
    process.env.USE_TEST_COLLECTIONS = true;
  },
  /** use memory instead of loopback */
  useMemoryDB() {
    process.env.USE_MEMORY_DB = true;
  },
  /* insert garagescore example in bdd */
  insertGarageExample(app, cb) {
    app.models.Garage.create(Tools.garageExample, cb);
  },
  /**
   replace const app = require('server') by this one in your test files by this,
   to be sure that your app use test collections
   */
  testServer: () => {
    process.env.USE_TEST_COLLECTIONS = true;
    return require('../../../server/server'); // eslint-disable-line
  },

  /** remove all test collections in DB */
  cleanTestCollections: (callback) => {
    const app = require('../../../server/server'); // eslint-disable-line
    const testableModels = [];
    for (const p in app.models) {
      // eslint-disable-line
      if (
        app.models[p].settings &&
        app.models[p].settings.mongodb &&
        app.models[p].settings.mongodb.collection &&
        app.models[p].settings.mongodb.collection.match(/_test$/)
      ) {
        testableModels.push(app.models[p]);
      }
    }
    async.eachSeries(testableModels, (model, cb) => model.destroyAll(cb), callback);
  },
  /** sometimes, we want the mocha done() to be called only if we had an error */
  mochaDoneIfError: (done) => (err, res) => {
    if (err) {
      done();
      return;
    }
    throw new Error(`No error thrown (should have been one), res=${JSON.stringify(res)}`);
  },

  bulkInserts: (number, Model, generator, callback) => {
    if (process.env.USE_MEMORY_DB) {
      /* let n = number;
      const addInstance = () => {
        n--;console.log(n)
        if (n === 0) { callback(); return; }
        Model.create(generator(), addInstance);
      };
      addInstance();
      return; */
      const instances = [];
      for (let i = 0; i < number; i++) {
        instances.push(generator());
      }
      Model.create(instances, callback);
      return;
    }
    const collection = Model.getDataSource().connector.collection(Model.modelName);
    if (!collection) {
      callback(new Error('MongoDb collection not found'));
      return;
    }
    const batchSize = 10;
    const prepareBatch = (size) => {
      const batch = [];
      for (let i = 0; i < size; i++) {
        batch.push(generator());
      }
      return batch;
    };
    async.times(
      Math.floor(number / batchSize),
      (n, next) => {
        collection.insertMany(prepareBatch(batchSize), next);
      },
      (err) => {
        if (err) {
          callback(err);
          return;
        }
        if (number % batchSize === 0) {
          callback();
          return;
        }
        collection.insertMany(prepareBatch(number % batchSize), callback);
      }
    );
  },

  /** randomly generated field values */
  random: {
    uniqid: () => (new Date().getTime() + Math.floor(Math.random() * 10000 + 1)).toString(16),
    /** a random element from an array */
    element: (array) => _.sample(array),
    /** a random key from an object */
    key: (object) => _.sample(_.keys(object)),
    /** a random key from an object */
    value: (object) => _.sample(_.values(object)),
    /** random integer between min max included */
    integer: (min, max) => _.random(min, max),
    /** random N différent integer between min max included */
    integerN: (N, min, max) => {
      const result = [];
      for (let i = 0; i < N; i++) {
        const bornMin = min + Math.round(i * ((max - min) / N));
        const bornMax = min + Math.round((i + 1) * ((max - min) / N)) - 1;
        result.push(_.random(bornMin, bornMax));
      }
      return result;
    },
    /*Give me an array and I will give you a random subset with at least one member*/
    randomSubset: (inArray = []) => {
      return _.sampleSize(inArray, Math.floor(Math.random() * (inArray.length) + 1))
    },
    /* A random n-carac string non sensical, base 36, without space
     if m is defined then return a length from n to m (included)
     */
    string: (n, m) => {
      const length = _.isUndefined(m) ? n : _.random(n, m);
      // lol http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
      return Array(n + 1)
        .join(`${Math.random().toString(36)}00000000000000000`.slice(2, 18))
        .slice(0, length);
    },
    /** a random url with segments */
    url: (n) => {
      let url = `http://www.${Tools.random.string(4, 10)}.com`;
      for (let i = 0; i < n; i++) {
        url += `/${Tools.random.string(4, 8)}`;
      }
      return url;
    },
    /* A random brandname */
    brand: () => _.sample(['DeLorean', 'Snowspeeder', 'Batmobile', 'Capsule Corp', 'KITT', 'Acme']),
    /* A random city */
    city() {
      return _.sample(['Gotham City', 'Donaldville', 'Namek', "King's Landing", 'Springfield', 'Midgar', 'Mordor']);
    },
    localeCode() {
      return _.sample(['fr_FR', 'es_ES', 'fr_BE', 'nl_BE', 'en_US', 'fr_NC', 'ca_ES']);
    },
    /** random postal code */
    postalCode() {
      return `${_.random(10000, 99999)}`;
    },
    /** random street */
    streetAddress: () => `${_.random(1, 30)} Rue ${Tools.random.lastName()}`,
    /** random lastname */
    lastName: () =>
      _.sample([
        'Kent',
        'Wayne',
        'Arryn',
        'Baratheon',
        'Greyjoy',
        'Lannister',
        'Martell',
        'Stark',
        'Targaryen',
        'Tully',
        'Tyrell',
      ]), // eslint-disable-line max-len
    /** random female firstanam */
    firstNameFemale: () =>
      _.sample(['Lisa', 'Marge', 'Maggie', 'Bulma', 'Chichi', 'Gally', 'Cersei', 'Catelyn', 'Sansa', 'Arya']),
    /** random male firstanam */
    firstNameMale: () => _.sample(['Homer', 'Bart', 'Jon', 'Stannis', 'Theon', 'Tyrion', 'Robb', 'Clark', 'Bruce']),
    email: () => `${Tools.random.string(7, 15)}@${Tools.random.string(5, 12)}.com`,
    emailGmail: () => `${Tools.random.string(7, 15)}@gmail.com`,
    date: (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
    /** random french phone number */
    phone() {
      return _.join(['00336', _.random(10, 99), _.random(10, 99), _.random(10, 99), _.random(10, 99)], '');
    },
    plate: () =>
      `${Tools.random.string(3).toUpperCase()}-${Tools.random.string(2).toUpperCase()}-${Tools.random
        .string(3)
        .toUpperCase()}`,
    /* A person with fields like title, firstname etc. */
    person: (customPerson) => {
      let person = {};
      person.gender = _.sample(['F', 'M']);
      if (person.gender === 'F') {
        person.title = 'Madame';
        person.abbreviatedTitle = 'Mme';
        person.firstName = Tools.random.firstNameFemale();
      } else {
        person.title = 'Monsieur';
        person.abbreviatedTitle = 'M.';
        person.firstName = Tools.random.firstNameMale();
      }
      person.lastName = Tools.random.lastName();
      person.fullName = `${person.firstName} ${person.lastName}`;
      person.email = Tools.random.email();
      person.city = Tools.random.city();
      person.streetAddress = Tools.random.streetAddress();
      person.postalCode = Tools.random.postalCode();
      person.mobilePhone = Tools.random.phone();
      person = { ...person, ...customPerson };
      return person;
    },
    personWithGmail: () => {
      const person = {};
      person.gender = _.sample(['F', 'M']);
      if (person.gender === 'F') {
        person.title = 'Madame';
        person.abbreviatedTitle = 'Mme';
        person.firstName = Tools.random.firstNameFemale();
      } else {
        person.title = 'Monsieur';
        person.abbreviatedTitle = 'M.';
        person.firstName = Tools.random.firstNameMale();
      }
      person.lastName = Tools.random.lastName();
      person.fullName = `${person.firstName} ${person.lastName}`;
      person.email = Tools.random.emailGmail();
      person.city = Tools.random.city();
      person.streetAddress = Tools.random.streetAddress();
      person.postalCode = Tools.random.postalCode();
      person.mobilePhone = Tools.random.phone();
      return person;
    },
    garage: () => {
      const name = `${_.sample(['Garage', 'Atelier', 'Centre', 'Auto', 'Espace', 'Agence', 'Alliance'])} ${_.sample([
        'Nord',
        'Sud',
        'Est',
        'Ouest',
        "de l'Étoile",
        'Center',
        'Automobiles',
        'SAS',
        'SARL',
        'Groupe',
      ])}`;
      const city = Tools.random.city();
      const brand = Tools.random.brand();
      const publicDisplayName = `${name} (${city} ${brand})`;
      const slug = publicDisplayName.replace(/ /g, '-').replace('(', '').replace(')', '').toLowerCase();
      return {
        slug,
        type: GarageTypes.DEALERSHIP,
        publicDisplayName,
        securedDisplayName: publicDisplayName,
        brandNames: [Tools.random.brand()],
        streetAddress: Tools.random.streetAddress(),
        postalCode: Tools.random.postalCode(),
        city: Tools.random.city(),
        locale: Tools.random.localeCode(),
        phone: Tools.random.phone(),
        fax: Tools.random.phone(),
        links: [{ name: 'website', url: Tools.random.url() }],
      };
    },
    garageHistoryStats: () => {
      const fields = [
        'totalShouldSurfaceInCampaignStats',
        'score',
        'scoreAPV',
        'scoreVN',
        'scoreVO',
        'scoreVI',
        'countSurveys',
        'countModifiedPhone',
        'countReceivedSurveys',
        'countSurveysResponded',
        'countEmails',
        'countSurveySatisfied',
        'countSurveyUnsatisfied',
        'countSurveyLead',
        'countSurveyLeadVo',
        'countSurveyLeadVn',
        'countSurveyLeadTrade',
        'countValidEmails',
        'countBlockedByEmail',
        'countModifiedEmail',
        'countBlockedLastMonthEmail',
        'countUnsubscribedByEmail',
        'countWrongEmails',
        'countNotPresentEmails',
        'countValidPhones',
        'countBlockedByPhone',
        'countBlockedLastMonthPhone',
        'countUnsubscribedByPhone',
        'countWrongPhones',
        'countNotPresentPhones',
        'countBlocked',
        'countNotContactable',
        'countSurveyRespondedAPV',
        'countSurveyRespondedVN',
        'countSurveyRespondedVO',
        'countSurveyRespondedVI',
        'countScheduledContacts',
        'scoreNPS',
        'scoreAPV',
        'scoreVN',
        'scoreVO',
        'countSurveyPromotor',
        'countSurveyDetractor',
        'countSurveysResponded',
        'countSurveySatisfied',
        'countSurveyUnsatisfied',
        'countValidEmails',
        'countValidPhones',
        'countNotContactable',
        'countNotContactablePercent',
        'countSurveysRespondedPercent',
        'countBlockedByEmail',
        'countWrongEmails',
        'countNotPresentEmails',
        'countBlockedByPhone',
        'countWrongPhones',
        'countNotPresentPhones',
      ];

      return fields.reduce(
        (fields, key) => ((fields[key] = Math.floor(Math.random() * (100 - 1 + 1)) +
          1), fields), {});
    },
    garageHistory: () => {


      return {
        garageId: null,
        periodToken: 'lastQuarter',
        frontDesk: 'ALL_USERS',
        historyByType: {},
        ...Tools.random.garageHistoryStats()
      }
    },
    user: () => ({
      password: Tools.random.string(10),
      email: Tools.random.email(),
      firstName: Tools.random.firstNameMale(),
      lastName: Tools.random.lastName(),
      job: Date.now() % 2 === 0 ? 'Directeur de concession' : "Chef d'atelier concession",
      garageIds: [],
      authorization: {
        ACCESS_TO_COCKPIT: true,

        ACCESS_TO_WELCOME: false,
        ACCESS_TO_SATISFACTION: false,
        ACCESS_TO_UNSATISFIED: false,
        ACCESS_TO_LEADS: false,
        ACCESS_TO_AUTOMATION: false,
        ACCESS_TO_CONTACTS: false,
        ACCESS_TO_E_REPUTATION: false,
        ACCESS_TO_ESTABLISHMENT: false,
        ACCESS_TO_TEAM: false,

        ACCESS_TO_ADMIN: true,
        ACCESS_TO_DARKBO: false,
        ACCESS_TO_GREYBO: false,
        WIDGET_MANAGEMENT: false,
      },
    }),
    survey: () => ({
      type: 'MaintenanceFollowup',
      accessToken: 'de726fd0436a7a93',
      urls: {
        base: 'http://survey.garagescore.com/s3/4258f0820197/i-w34yd-1399012?sguid=w34yd&token=de726fd0436a7a93',
      },
      foreign: {
        dataRecordId: '577792af016d601a0059ea13',
        garageId: '574eb3b854a5851a00970851',
        sgizmo: {
          masterSurveyId: '2358952',
          surveyTitle: 'Audi Boulogne-sur-Mer',
          surveyInternalTitle: '[MaintenanceFollowup] Audi Boulogne-sur-Mer 2016-07-11',
          surveyId: '2909638',
          campaignId: '3956854',
          campaignInviteId: '760534',
          campaignUri: 'survey.garagescore.com/s3/4258f0820197',
          isCampaignSsl: false,
          campaignEmailMessageId: '1399012',
          sguid: '100316478',
          surveyUrl: 'http://survey.garagescore.com/s3/4258f0820197/i-w34yd-1399012?sguid=w34yd&token=de726fd0436a7a93',
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      surveyForeignResponses: [],
    }),
    campaign: () => ({
      name: `Test campaign ${moment().format('DD-MM-YYYY')}`,
      description: 'Test campaign',
    }),
    dataFile: () => ({
      fileStore: 'Dropbox',
      importSchemaName: 'tom-auto-service-v1',
      filePath: `test/${Tools.random.uniqid()}.xlsx`,
      dataType: _.sample(DataFileTypes.values()),
    }),
    customer: () => {
      const person = Tools.random.person();
      return {
        type: 'Individual',
        title: person.title,
        abbreviatedTitle: person.abbreviatedTitle,
        fullName: person.fullName,
        gender: person.gender,
        contactChannel: {
          email: {
            address: Tools.random.email(),
          },
          snailMail: {
            streetAddress: Tools.random.streetAddress(),
            postCode: Tools.random.postalCode(),
            city: Tools.random.city(),
            countryCode: 'FR',
          },
          mobilePhone: {
            number: Tools.random.phone(),
          },
        },
        foreign: {
          garageProvidedCustomerId: Tools.random.string(7).toUpperCase(),
        },
        dataRecords: [Tools.random.dataRecord()],
      };
    },
    vehicule: () => {
      const make = _.sample(['TOYOTA', 'RENAULT', 'PEUGEOT', 'CITROEN', 'VOLKSWAGEN']);
      const model = _.sample(['Clio', 'Espace', '508', 'Polo', 'Golf', 'C5', 'Auris']);
      return {
        make,
        model,
        registration: {
          plate: Tools.random.plate(),
          countryCode: 'FR',
          firstRegisteredAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    reviewReplyTemplate: () => {
      const title = `${_.sample([
        'Sorry',
        'Excited',
        'Surprised',
        'Happy',
        "Tomorrow I'll be available"])} ${_.sample([
          'to hear',
          'to recieve any enquires',
          'to inform you ',
        ])}`;
      const content = title + ' ' + `${_.sample([
        'about your car',
        'about your last service',
        'about your dealership',
        'about your garage',
      ])}`;;
      const automated = _.sample([true, false])
      const sources = Tools.random.randomSubset(['Google', 'Facebook', 'DataFile'])
      const ratingCategories = Tools.random.randomSubset(['detractor', 'passive', 'promoter'])

      return {
        title,
        content,
        automated,
        sources,
        ratingCategories,
      };
    },
  },
});
Tools.garageExample = {
  slug: 'garagescore',
  type: GarageTypes.DEALERSHIP,
  publicDisplayName: 'Garagescore',
  securedDisplayName: 'Garagescore',
  locale: 'fr_FR',
  brandNames: ['Renault'],
  dataImportStartedAt: '2016-07-03T19:48:00.000Z',
  googlePlaceId: 'ChIJ1SfnIBJx5kcRZS5kijZrH_4',
  googlePlace: {
    rating: 3,
    openingHours: [
      { close: { day: 1, time: '1200' }, open: { day: 1, time: '0730' } },
      { close: { day: 1, time: '1900' }, open: { day: 1, time: '1330' } },
      { close: { day: 2, time: '1200' }, open: { day: 2, time: '0730' } },
      { close: { day: 2, time: '1900' }, open: { day: 2, time: '1330' } },
      { close: { day: 3, time: '1200' }, open: { day: 3, time: '0730' } },
      { close: { day: 3, time: '1900' }, open: { day: 3, time: '1330' } },
      { close: { day: 4, time: '1200' }, open: { day: 4, time: '0730' } },
      { close: { day: 4, time: '1900' }, open: { day: 4, time: '1330' } },
      { close: { day: 5, time: '1200' }, open: { day: 5, time: '0730' } },
      { close: { day: 5, time: '1900' }, open: { day: 5, time: '1330' } },
    ],
    latitude: '48.8046164',
    longitude: '2.334739300000024',
  },
  timezone: 'Europe/Paris',
  streetAddress: '44 Rue Cauchy',
  postalCode: '94110',
  region: 'Île-de-France',
  city: 'Arcueil',
  phone: '',
  links: [{ name: 'contact', url: 'https://www.garagescore.com/' }],
  dms: {},
  usersQuota: 5,
  surveySignature: {
    useDefault: true,
    defaultSignature: {
      lastName: 'Jean-Pierre',
      firstName: 'Martin',
      job: 'Responsable APV',
    },
  },
  subscriptions: {
    active: true,
    Maintenance: {
      enabled: true,
      price: 2,
      date: new Date(),
    },
    NewVehicleSale: {
      enabled: true,
      price: 2,
      date: new Date(),
    },
    UsedVehicleSale: {
      enabled: true,
      price: 2,
      date: new Date(),
    },
    Lead: {
      enabled: true,
      price: 2,
      date: new Date(),
    },
    Automation: {
      enabled: true,
      price: 2,
    },
    AutomationApv: {
      enabled: true,
    },
    AutomationVn: {
      enabled: true,
    },
    AutomationVo: {
      enabled: true,
    },
  },
  hideDirectoryPage: true,
  status: 'RunningAuto',
  group: 'example',
  enrichScriptEnabled: false,
  createdAt: '2016-07-04T09:48:07.456Z',
  updatedAt: '2017-06-14T13:09:08.827Z',
  brandName: '',
  campaignCreationOptions: {},
  newLinkInput: '',
  subRegion: 'Val-de-Marne',
  crossLeadsConfig: {
    enabled: true,
    sources: [
      ...SourceTypes.supportedCrossLeadsSources().map((sourceType) => ({
        enabled: true,
        email: `${sourceType.toLowerCase()}.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
        phone: '0033188333590',
        type: sourceType,
        createdAt: '2020-03-03T18:35:01.887Z',
        createdBy: '5a9d7fe92b3af00013f3f377',
        followed_email: 'smenard@garagescore.com',
        followed_phones: ['+33384232717'],
      })),
    ],
  },
  dataFirstDays: {
    firstMaintenanceDay: timeHelper.dayNumber(new Date()) - 365 * 4,
    firstNewVehicleSaleDay: timeHelper.dayNumber(new Date()) - 365 * 4,
    firstUsedVehicleSaleDay: timeHelper.dayNumber(new Date()) - 365 * 4,
  },
  allowReviewCreationFromContactTicket: false,
  enableCrossLeadsSelfAssignCallAlert: true,
};

Tools.BAExample = {
  name: 'JohnBillyAccount',
  email: 'Olivier.LELOUP@losangeautos.fr, olivier.leloup@groupe-altair.fr',
  accountingId: 'Daumont-EdamMontlhery',
  companyName: 'EDAM MONTLHERY',
  address: '72 Rte Nationale 20',
  postalCode: '91310',
  city: 'MONTLHERY',
  billingDate: 11,
  vfClientId: 20610057,
  dateNextBilling: '2019-05-11T21:00:00.000Z',
  goCardLessSetup: true,
  technicalContact: '',
  accountingContact: '',
  RGPDContact: '',
  externalId: null,
  mandateId: 'MD0002BB7VBN6H',
  customerId: 'CU0002QBQWK1GX',
  garageIds: [],
  createdAt: '2017-12-13T09:42:24.120Z',
  updatedAt: '2020-03-04T13:08:20.924Z',
  billingType: 'debit',
  invoices: [
    {
      createdAt: '2019-10-11',
      sentAt: null,
      id: 53570744,
    },
    {
      createdAt: '2019-11-11',
      sentAt: null,
      id: 55383310,
    },
    {
      createdAt: '2019-12-11',
      sentAt: null,
      id: 57730046,
    },
    {
      createdAt: '2020-01-11',
      sentAt: null,
      id: 59933440,
    },
    {
      createdAt: '2020-02-11',
      sentAt: null,
      id: 62143177,
    },
  ],
  sentLastAt: '202002',
};
