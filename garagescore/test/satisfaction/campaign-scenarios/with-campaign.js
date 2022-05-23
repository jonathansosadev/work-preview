const { expect } = require('chai');
const { promisify } = require('util');

const TestApp = require('../../../common/lib/test/test-app');
const dataFileDataType = require('../../../common/models/data-file.data-type');
const campaignStatus = require('../../../common/models/data/type/campaign-status');

const app = new TestApp();

const baseScenario = {
  oldId: '',
  name: 'Groupe Clim - - apv MAKER j+2 / vn j+20 / vo j+4',
  type: 'Dealership',
  duration: 60,
  disableSmsWithValidEmails: true,
  chains: {
    Maintenance: {
      contacts: [
        {
          key: 'maintenance_email_1_make',
          delay: 2,
        },
        {
          key: 'maintenance_sms_1',
          delay: 2,
        },
        {
          key: 'maintenance_email_2_make',
          delay: 6,
        },
        {
          key: 'maintenance_email_3',
          delay: 19,
        },
      ],
      thanks: {
        complete_satisfied: 'maintenance_email_thanks_1_make',
        complete_unsatisfied: 'maintenance_email_thanks_2_make',
        incomplete_satisfied: 'maintenance_email_thanks_3_make',
        incomplete_unsatisfied: 'maintenance_email_thanks_4_make',
      },
      recontacts: {
        enabled: true,
        dayOfNextMonth: 15.0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
        google: {
          email: 'recontact_email_google_write_review',
        },
      },
    },
    NewVehicleSale: {
      contacts: [
        {
          key: 'sale_email_1',
          delay: 19,
        },
        {
          key: 'sale_sms_1',
          delay: 19,
        },
        {
          key: 'sale_email_2',
          delay: 24,
        },
      ],
      thanks: {
        complete_satisfied: 'sale_email_thanks_1',
        complete_unsatisfied: 'sale_email_thanks_2',
        incomplete_satisfied: 'sale_email_thanks_3',
        incomplete_unsatisfied: 'sale_email_thanks_4',
      },
      recontacts: {
        enabled: true,
        dayOfNextMonth: 15.0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
        google: {
          email: 'recontact_email_google_write_review',
        },
      },
    },
    UsedVehicleSale: {
      contacts: [
        {
          key: 'sale_email_1',
          delay: 3,
        },
        {
          key: 'sale_sms_1',
          delay: 3,
        },
        {
          key: 'sale_email_2',
          delay: 8,
        },
      ],
      thanks: {
        complete_satisfied: 'sale_email_thanks_1',
        complete_unsatisfied: 'sale_email_thanks_2',
        incomplete_satisfied: 'sale_email_thanks_3',
        incomplete_unsatisfied: 'sale_email_thanks_4',
      },
      recontacts: {
        enabled: true,
        dayOfNextMonth: 15.0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
        google: {
          email: 'recontact_email_google_write_review',
        },
      },
    },
    VehicleInspection: {
      contacts: [],
      thanks: {
        complete_satisfied: null,
        complete_unsatisfied: null,
        incomplete_satisfied: null,
        incomplete_unsatisfied: null,
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
        google: {},
      },
    },
  },
  createdAt: new Date('2021-08-06T16:06:14.461Z'),
  updatedAt: new Date('2021-08-06T16:06:14.461Z'),
  isEmptyScenario: false,
  followupAndEscalate: {
    DataFile: {
      lead: {
        followup: {
          enabled: true,
          delay: 90,
        },
        escalate: {
          enabled: true,
          stage_1: 27,
          stage_2: 36,
        },
      },
      unsatisfied: {
        followup: {
          enabled: true,
          delay: 45,
        },
        escalate: {
          enabled: true,
          stage_1: 9,
          stage_2: 27,
        },
      },
    },
    ManualLead: {
      lead: {
        followup: {
          enabled: true,
          delay: 90,
        },
        escalate: {
          enabled: true,
          stage_1: 27,
          stage_2: 36,
        },
      },
    },
    ManualUnsatisfied: {
      unsatisfied: {
        followup: {
          enabled: true,
          delay: 45,
        },
        escalate: {
          enabled: true,
          stage_1: 9,
          stage_2: 27,
        },
      },
    },
    Automation: {
      lead: {
        followup: {
          enabled: true,
          delay: 90,
        },
        escalate: {
          enabled: true,
          stage_1: 27,
          stage_2: 36,
        },
      },
    },
    CustomVo: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    LaCentrale: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    LeBonCoin: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    Largus: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    ParuVendu: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    Promoneuve: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    OuestFranceAuto: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    Zoomcar: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    CustomVn: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    CustomApv: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    EkonsilioVo: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    EkonsilioVn: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    Cways: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
  },
};
describe('Starting campaign', async function () {
  beforeEach(async function () {
    await app.reset();
  });

  it('Every data from the same campaign should have the same next contact and next contact date', async function () {
    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({ ...baseScenario });
    const garage = await app.addGarage({
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
    await app.importRandomLines(4, garage.id, dataFileDataType.MAINTENANCES);
    let datas = await app.datas();
    expect(datas[0].campaign.status).equals(campaignStatus.NEW);
    expect(datas[1].campaign.status).equals(campaignStatus.NEW);
    expect(datas[2].campaign.status).equals(campaignStatus.NEW);
    expect(datas[3].campaign.status).equals(campaignStatus.NEW);
    await promisify(app.models.Campaign.startAll)('New');
    datas = await app.datas();
    const day = datas[0].campaign.contactScenario.nextCampaignContactDay;
    const contact = datas[0].campaign.contactScenario.nextCampaignContact;
    expect(!isNaN(day));
    expect(contact !== null);
    expect(datas[1].campaign.contactScenario.nextCampaignContactDay).equals(day);
    expect(datas[2].campaign.contactScenario.nextCampaignContactDay).equals(day);
    expect(datas[3].campaign.contactScenario.nextCampaignContactDay).equals(day);
    expect(datas[1].campaign.contactScenario.nextCampaignContact).equals(contact);
    expect(datas[2].campaign.contactScenario.nextCampaignContact).equals(contact);
    expect(datas[3].campaign.contactScenario.nextCampaignContact).equals(contact);
  });
});
