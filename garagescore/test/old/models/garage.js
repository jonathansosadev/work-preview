const TestApp = require('../../../common/lib/test/test-app');

const chai = require('chai');
const path = require('path');
const { ObjectID } = require('mongodb');

const GarageTypes = require('../../../common/models/garage.type');
const GarageStatuses = require('../../../common/models/garage.status');
const DataTypes = require('../../../common/models/data/type/data-types');
const importer = require('../../../common/lib/garagescore/data-file/lib/importer');
const { AutomationCampaignTargets, AutomationCampaignStatuses } = require('../../../frontend/utils/enumV2');
const AutomationCampaignFrequency = require('../../../common/models/automation-campaign.frequency');

const { expect } = chai;
const app = new TestApp();

describe('[Garage Model]', () => {
  beforeEach(async function () {
    await app.reset();
  });

  it('Should Update Garage & Associated Data If Garage Type Changed', async () => {
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    const dataFileId = await app.addDataFile(
      testGarage,
      path.join(__dirname, '../campaigns/imports/data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId);
    let garageInstance = await testGarage.getInstance();
    let datas = await testGarage.datas();

    await Promise.all(datas.map(async (d) => expect(d.garageType).to.equals(GarageTypes.DEALERSHIP)));

    garageInstance = await garageInstance.updateFromObject({ type: GarageTypes.CAR_REPAIRER });

    expect(garageInstance.type).to.equals(GarageTypes.CAR_REPAIRER);

    datas = await testGarage.datas();

    await Promise.all(datas.map(async (d) => expect(d.garageType).to.equals(GarageTypes.CAR_REPAIRER)));
  });

  it('Should Update Garage automation campaigns if Garage status Changed', async () => {
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    const dataFileId = await app.addDataFile(
      testGarage,
      path.join(__dirname, '../campaigns/imports/data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId);
    const garageInstance = await testGarage.getInstance();
    let updatedGarage = null;

    expect(garageInstance.status).to.equals(GarageStatuses.RUNNING_AUTO);
    let automationCampaignsCount = await app.models.AutomationCampaign.count({});
    expect(automationCampaignsCount).to.equals(0);
    updatedGarage = await garageInstance.updateFromObject({ status: GarageStatuses.READY });
    expect(updatedGarage.status).to.equals(GarageStatuses.READY);
    automationCampaignsCount = await app.models.AutomationCampaign.count({});
    expect(automationCampaignsCount).to.equals(0);
    updatedGarage = await garageInstance.updateFromObject({ status: GarageStatuses.RUNNING_AUTO });
    expect(updatedGarage.status).to.equals(GarageStatuses.RUNNING_AUTO);
    automationCampaignsCount = await app.models.AutomationCampaign.count({});
    expect(automationCampaignsCount).to.equals(30);
    updatedGarage = await garageInstance.updateFromObject({ status: GarageStatuses.READY });
    expect(updatedGarage.status).to.equals(GarageStatuses.READY);
    automationCampaignsCount = await app.models.AutomationCampaign.count({ hidden: true });
    expect(automationCampaignsCount).to.equals(30);
  });

  it('Should Remove Matching Exogenous Datas If Garage Disconnect Source', async () => {
    const user = await app.addUser({ email: 'user@custeed.com' });
    const exogenousReviewsConfigurations = {
      Google: { token: 'TOKEN', externalId: 'ID' },
      Facebook: { token: 'TOKEN', externalId: 'ID' },
      PagesJaunes: { token: 'TOKEN', externalId: 'ID' },
    };
    const garage = await app.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    let datas = [];

    // Saving the datas in the database
    await Promise.all(
      Array(2)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date('2016-01-01'));
          await app.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(1)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Facebook',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await app.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(4)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'PagesJaunes',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await app.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await Promise.all(
      [garage].map(async (g) => {
        await user.addGarage(g);
      })
    );

    datas = await app.models.Data.find({});

    expect(datas.length).to.equals(7);

    const garageInstance = await garage.getInstance();

    await garageInstance.updateFromObject({
      exogenousReviewsConfigurations: {
        Google: { token: 'TOKEN', externalId: 'ID' },
        Facebook: { token: '', externalId: '' },
        PagesJaunes: { token: 'TOKEN', externalId: 'ID' },
      },
    });

    datas = await app.models.Data.find({});

    expect(datas.length).to.equals(6);
  });

  it('Should Remove All Exogenous Datas If Garage Not Subscribed To Erep Anymore', async () => {
    const user = await app.addUser({ email: 'user@custeed.com' });
    const exogenousReviewsConfigurations = {
      Google: { token: 'TOKEN', externalId: 'ID' },
      Facebook: { token: 'TOKEN', externalId: 'ID' },
      PagesJaunes: { token: 'TOKEN', externalId: 'ID' },
    };
    const garage = await app.addGarage({
      subscriptions: { EReputation: { enabled: true } },
      exogenousReviewsConfigurations,
    });
    let datas = [];

    // Saving the datas in the database
    await Promise.all(
      Array(2)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Google',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date('2016-01-01'));
          await app.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(1)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'Facebook',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await app.models.Data.create(data);
        })
    );
    await Promise.all(
      Array(4)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            type: DataTypes.EXOGENOUS_REVIEW,
            sourceType: 'PagesJaunes',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await app.models.Data.create(data);
        })
    );

    // Adding the created garage to the user
    await Promise.all(
      [garage].map(async (g) => {
        await user.addGarage(g);
      })
    );

    datas = await app.models.Data.find({});

    expect(datas.length).to.equals(7);

    const garageInstance = await garage.getInstance();

    await garageInstance.updateFromObject({ subscriptions: { EReputation: { enabled: false } } });

    datas = await app.models.Data.find({});

    expect(datas.length).to.equals(0);
  });

  it('Should update crossLeadsConfig with unsubscribeToCrossLeads()', async () => {
    await app.addGarage();
    const garage = await app.models.Garage.findOne();

    garage.enableAllSourcesCrossLeads();
    expect(garage.crossLeadsConfig.enabled).to.equals(true);
    garage.crossLeadsConfig.sources.forEach((source) => {
      expect(source.enabled).to.equals(true);
    });

    garage.unsubscribeToCrossLeads();
    expect(garage.crossLeadsConfig.enabled).to.equals(false);
    garage.crossLeadsConfig.sources.forEach((source) => {
      expect(source.enabled).to.equals(false);
    });
  });

  it('Should update crossLeadsConfig with enableAllSourcesCrossLeads()', async () => {
    await app.addGarage();
    const garage = await app.models.Garage.findOne();

    garage.unsubscribeToCrossLeads();
    expect(garage.crossLeadsConfig.enabled).to.equals(false);
    garage.crossLeadsConfig.sources.forEach((source) => {
      expect(source.enabled).to.equals(false);
    });

    garage.enableAllSourcesCrossLeads();
    expect(garage.crossLeadsConfig.enabled).to.equals(true);
    garage.crossLeadsConfig.sources.forEach((source) => {
      expect(source.enabled).to.equals(true);
    });
  });

  it('Should update garage with crossLeadsConfig object', async () => {
    await app.addGarage();
    const garage = await app.models.Garage.findOne();
    const crossLeadsConfig = {
      enabled: true,
      sources: [
        {
          enabled: true,
          email: 'lebonfoin@du.terroir.garagescore.com',
          phone: '0033484891345',
          type: 'lebonfoin',
          followed_email: 'lebonfoin.givors@thivolle.com',
          followed_phones: ['+33484811713'],
        },
      ],
    };

    await garage.updateFromObject({ crossLeadsConfig });
    const result = await app.models.Garage.findOne();

    expect(result.crossLeadsConfig.enabled).equals(crossLeadsConfig.enabled);
    expect(result.crossLeadsConfig.sources[0].enabled).equals(crossLeadsConfig.sources[0].enabled);
    expect(result.crossLeadsConfig.sources[0].email).equals(crossLeadsConfig.sources[0].email);
    expect(result.crossLeadsConfig.sources[0].followed_email).equals(crossLeadsConfig.sources[0].followed_email);
    expect(result.crossLeadsConfig.sources[0].phone).equals(crossLeadsConfig.sources[0].phone);
  });

  it('default tickets managers in ticketsConfiguration are ObjectIds', async () => {
    const user = await app.addUser({ email: 'manager@tickets.com' });
    await app.addGarage({
      ticketsConfiguration: {
        Unsatisfied_Maintenance: user.id,
        Unsatisfied_NewVehicleSale: user.id,
        Unsatisfied_UsedVehicleSale: null,
        Lead_Maintenance: user.id,
        Lead_NewVehicleSale: user.id,
        Lead_UsedVehicleSale: user.id,
        VehicleInspection: null,
      },
    });
    const { ticketsConfiguration } = await app.models.Garage.findOne();
    for (const ticketType in ticketsConfiguration.toObject()) {
      if (ticketsConfiguration[ticketType]) {
        expect(ticketsConfiguration[ticketType], ticketType).to.be.instanceOf(ObjectID);
      }
      if (ticketsConfiguration[ticketType]) {
        const isInstanceOfObjectId = ticketsConfiguration[ticketType] instanceof ObjectID;
        expect(isInstanceOfObjectId).to.be.true;
        expect(ticketsConfiguration[ticketType].toString(), ticketType).to.equal(user.getId().toString());
      } else {
        expect(ticketsConfiguration[ticketType]).to.be.null;
      }
    }
  });
  it('Should not have COVID campaign in initDefaultCampaigns', async () => {
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    const dataFileId = await app.addDataFile(
      testGarage,
      path.join(__dirname, '../campaigns/imports/data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId);
    const garage = await app.models.Garage.findById(testGarage.getId());
    // init default AutomationCampaign campaign
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    // search for find COVID campaign
    const automationCampaigns = await app.models.AutomationCampaign.find({});
    const findCovidCampaign = automationCampaigns.find((campaign) => /covid/i.test(campaign.target));
    // we should not find COVID campaign anymore
    expect(findCovidCampaign).to.be.undefined;
  });
  it('Should not hidden COVID campaign complete', async () => {
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    const dataFileId = await app.addDataFile(
      testGarage,
      path.join(__dirname, '../campaigns/imports/data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId);
    const garageInstance = await testGarage.getInstance();
    const garage = await app.models.Garage.findById(testGarage.getId());
    // init default AutomationCampaign campaign
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    // overwrite for create COVID campaign for unit test
    const covidCampaign = await app.models.AutomationCampaign.findOne({});
    covidCampaign.displayName = 'Qualif. projets véhicule des clients Apv T1 2020';
    covidCampaign.status = AutomationCampaignStatuses.COMPLETE;
    covidCampaign.frequency = AutomationCampaignFrequency.ONESHOT;
    covidCampaign.target = AutomationCampaignTargets.COVID;
    covidCampaign.save();
    // now we setCampaigns and check result
    await garageInstance.updateFromObject({ status: GarageStatuses.RUNNING_AUTO });
    const campaignCovidExpect = await app.models.AutomationCampaign.findOne({ where: { target: 'COVID' } });
    expect(campaignCovidExpect.hidden).to.equals(false);
    expect(campaignCovidExpect.target).to.equals(AutomationCampaignTargets.COVID);
    expect(campaignCovidExpect.status).to.equals(AutomationCampaignStatuses.COMPLETE);
    expect(campaignCovidExpect.frequency).to.equals(AutomationCampaignFrequency.ONESHOT);
  });
  it('Should hidden COVID campaign IDLE', async () => {
    const testGarage = await app.addGarage({ type: GarageTypes.DEALERSHIP });
    const dataFileId = await app.addDataFile(
      testGarage,
      path.join(__dirname, '../campaigns/imports/data/cobrediamix1.txt'),
      'Cobredia/cobredia-mix.js',
      'MixedVehicleSales'
    );
    await importer.generateData(app.models, dataFileId);
    const garageInstance = await testGarage.getInstance();
    const garage = await app.models.Garage.findById(testGarage.getId());
    // init default AutomationCampaign campaign
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    // overwrite for create COVID campaign for unit test
    const covidCampaign = await app.models.AutomationCampaign.findOne({});
    covidCampaign.displayName = 'Qualif. projets véhicule des clients Apv T1 2020';
    covidCampaign.status = AutomationCampaignStatuses.IDLE;
    covidCampaign.frequency = AutomationCampaignFrequency.ONESHOT;
    covidCampaign.target = AutomationCampaignTargets.COVID;
    covidCampaign.save();
    // now we setCampaigns and check result
    await garageInstance.updateFromObject({ status: GarageStatuses.READY });
    const campaignCovidExpect = await app.models.AutomationCampaign.findOne({ where: { target: 'COVID' } });
    expect(campaignCovidExpect.hidden).to.equals(true);
    expect(campaignCovidExpect.target).to.equals(AutomationCampaignTargets.COVID);
    expect(campaignCovidExpect.status).to.equals(AutomationCampaignStatuses.IDLE);
    expect(campaignCovidExpect.frequency).to.equals(AutomationCampaignFrequency.ONESHOT);
  });
});
