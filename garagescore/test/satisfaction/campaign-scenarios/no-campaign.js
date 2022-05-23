const { expect } = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const dataFileDataType = require('../../../common/models/data-file.data-type');
const campaignStatus = require('../../../common/models/data/type/campaign-status');

const app = new TestApp();

const baseScenario = {
  name: 'Sans campagne, avec escalade et followup',
  type: 'Dealership',
  duration: 30,
  disableSmsWithValidEmails: true,
  createdAt: new Date('2021-02-17T14:47:15.584Z'),
  updatedAt: new Date('2021-04-08T15:57:55.753Z'),
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
          stage_1: 3,
          stage_2: 9,
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
          stage_1: 3,
          stage_2: 9,
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
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    CustomVo: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    LaCentrale: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    LeBonCoin: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    Largus: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    ParuVendu: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    Promoneuve: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    OuestFranceAuto: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    Zoomcar: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    Cways: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    CustomVn: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
        },
      },
    },
    CustomApv: {
      lead: {
        followup: {
          enabled: true,
          delay: 12,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 9,
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
  },
};
describe('Campaign scenario without campaign AKA Boscary and contact ticket', async function () {
  beforeEach(async function () {
    await app.reset();
  });

  it('should not run a campaign (format1: no chains)', async function () {
    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({ ...baseScenario });
    const garage = await app.addGarage({
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
    await app.importRandomLines(1, garage.id, dataFileDataType.MAINTENANCES);
    const datas = await app.datas();
    const data = datas[0];
    expect(data.campaign.status).equals(campaignStatus.WITHOUTCAMPAIGN);
  });
  it('should not run a campaign (format2: empty chains)', async function () {
    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({ ...baseScenario, chains: {} });
    const garage = await app.addGarage({
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
    await app.importRandomLines(1, garage.id, dataFileDataType.MAINTENANCES);
    const datas = await app.datas();
    const data = datas[0];
    expect(data.campaign.status).equals(campaignStatus.WITHOUTCAMPAIGN);
  });
  it('should not run a campaign (format3: no contacts)', async function () {
    const chains = {
      Maintenance: {
        toto: [],
      },
    };
    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({ ...baseScenario, chains });

    const garage = await app.addGarage({
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
    await app.importRandomLines(1, garage.id, dataFileDataType.MAINTENANCES);
    const datas = await app.datas();
    const data = datas[0];
    expect(data.campaign.status).equals(campaignStatus.WITHOUTCAMPAIGN);
  });
  it('should not run a campaign (format4: empty contacts)', async function () {
    const chains = {
      Maintenance: {
        contacts: [],
      },
    };
    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({ ...baseScenario, chains });
    const garage = await app.addGarage({
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
    await app.importRandomLines(1, garage.id, dataFileDataType.MAINTENANCES);
    const datas = await app.datas();
    const data = datas[0];
    expect(data.campaign.status).equals(campaignStatus.WITHOUTCAMPAIGN);
  });
  it('should not run a campaign (format5: one contact)', async function () {
    const chains = {
      Maintenance: {
        contacts: [
          {
            key: 'maintenance_email_1_make',
            delay: 0,
          },
        ],
      },
    };
    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({ ...baseScenario, chains });
    const garage = await app.addGarage({
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
    await app.importRandomLines(1, garage.id, dataFileDataType.MAINTENANCES);
    const datas = await app.datas();
    const data = datas[0];
    expect(data.campaign.status).not.equals(campaignStatus.WITHOUTCAMPAIGN);
  });
});
