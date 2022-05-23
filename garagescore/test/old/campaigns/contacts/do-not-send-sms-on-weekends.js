/* eslint-disable no-unused-expressions */
const TestApp = require('../../../../common/lib/test/test-app');
const testTools = require('../../../../common/lib/test/testtools');
const dataFileTypes = require('../../../../common/models/data-file.data-type');
const contactsConfig = require('../../../../common/lib/garagescore/data-campaign/contacts-config.js');
const timeHelper = require('../../../../common/lib/util/time-helper');

const app = new TestApp();

const contactsTools = require('./_contacts-tools')(app);

const testScenario = {
  _id: '599f41d6571b790400fc7135',
  name: 'test',
  duration: 30,
  emailsChains: {
    Maintenance: [
      [
        {
          name: 'E-mail Contact #1',
        },
        {
          name: 'SMS Contact #1',
          daysAfterCampaignCreation: 0,
        },
        {
          name: 'E-mail Contact #2 - constructeur',
          daysAfterCampaignCreation: 0,
        },
        {
          name: 'E-mail Contact #3',
          daysAfterCampaignCreation: 0,
        },
      ],
      [
        {
          name: 'Thank You E-mail #2',
        },
        {
          name: 'Maintenance FollowupUnsatisfied E-mail',
          daysAfterLastContact: 0,
        },
      ],
      [
        {
          name: 'Thank You E-mail #4',
        },
        {
          name: 'Maintenance FollowupUnsatisfied E-mail',
          daysAfterLastContact: 0,
        },
      ],
    ],
    VehicleSale: [
      [
        {
          name: 'E-mail Sale Contact #1',
        },
        {
          name: 'SMS Sale Contact #1',
          daysAfterLastContact: 1,
        },
        {
          name: 'E-mail Sale Contact #2',
          daysAfterLastContact: 2,
        },
        {
          name: 'E-mail Sale Contact #3',
          daysAfterLastContact: 20,
        },
      ],
      [
        {
          name: 'E-mail Sale Thank You #2',
        },
        {
          name: 'Sale FollowupUnsatisfied E-mail',
          daysAfterLastContact: 0,
        },
      ],
      [
        {
          name: 'E-mail Sale Thank You #4',
        },
        {
          name: 'Sale FollowupUnsatisfied E-mail',
          daysAfterLastContact: 0,
        },
      ],
    ],
  },
  campaignsStart: {
    Maintenance: {
      name: 'E-mail Contact #1',
      daysAfterCampaignCreation: 0,
    },
    VehicleSale: {
      name: 'E-mail Sale Contact #1',
      daysAfterLastContact: 3,
    },
  },
  recontactConfig: {
    maintenance: {
      enabled: false,
    },
    sale: {
      enabled: false,
    },
  },
  disableSmsWithValidEmails: false,
};

const setPerson = (email, mobile) => {
  const person = testTools.random.person();
  person.email = email;
  person.mobilePhone = mobile;
  return person;
};
const setScenario = (scenarioEntry, disable) => {
  const scenario = scenarioEntry;
  scenario.disableSmsWithValidEmails = disable;
  return scenario;
};

describe('Test send on disableSmsWithValidEmails', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('delaying sms some days later if week end', async function test() {
    const person = setPerson('testerino@gmail.com', '+33 6 50 79 67 13');
    const sentDay = timeHelper.dayNumber(new Date());
    testScenario.campaignsStart.Maintenance.daysAfterCampaignCreation = sentDay;
    const scenario = setScenario(testScenario);
    const garage = await app.addGarage();
    // await garage.setScenario(scenario);
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    const expected = {};
    expected.campaignItems = [
      {
        addressee: contactsTools.customer(person),
        lastCampaignContactSent: contactsConfig.maintenance_email_1_make.key,
        nextCampaignContact: contactsConfig.maintenance_sms_1.key,
        nextCampaignContactDay: timeHelper.getNextWeekEnd(sentDay),
      },
    ];
    await contactsTools.checks(expected);
  });
});
