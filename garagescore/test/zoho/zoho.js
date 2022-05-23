const TestApp = require('../../common/lib/test/test-app');
const moment = require('moment');
const { handleGarageModifications } = require('../../common/lib/zoho/garages');
const { expect } = require('chai');
const { handleUserModifications } = require('../../common/lib/zoho/users');
const { handleDealModifications } = require('../../common/lib/zoho/deals');
const { DEAL_URL } = require('../../common/lib/zoho/zoho-api.js');

const { GSGarage, getFakeZohogarageData, getFakeZohoUser, getzohoFakeDeal } = require('./zoho-fake-data');
const KpiDictionary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const testApp = new TestApp();
const ModelFactory = require('../apollo/modelsFactories/factory');
const {
  random: { garage: randomGarage, user: randomUser },
} = require('../../common/lib/test/testtools');
const { KpiTypes } = require('../../frontend/utils/enumV2');
/**
 * @type ModelFactory
 */
let garageFactory, userFactory, kpiByPeriodFactory;

const initializeModelFactories = () => {
  garageFactory = new ModelFactory(testApp.models.Garage, randomGarage);
  userFactory = new ModelFactory(testApp.models.User, randomUser);
  kpiByPeriodFactory = new ModelFactory(
    {
      create: async (data) => {
        const result = await testApp.models.KpiByPeriod.getMongoConnector().insertOne(data);
        if (!result || !result.ops || result.ops.length === 0) {
          throw new Error('Failed to create KpiByPeriod');
        }
        return result.ops[0];
      },
    },
    () => {}
  );
};

const randomIntFn = () => Math.floor(Math.random() * 100);
const generateSubscriptionChurn = () => {
  const subscriptionsTypes = [
    'Lead',
    'UsedVehicleSale',
    'NewVehicleSale',
    'EReputation',
    'Maintenance',
    'VehicleInspection',
    'Analytics',
    'CrossLeads',
    'Automation',
    'Coaching',
  ];
  return {
    isFullChurn: true,
    churnEffectiveDate: new Date().toISOString(),
    ...subscriptionsTypes.reduce((acc, type) => {
      acc[type] = {
        churn: {
          enabled: randomIntFn() % 2 === 0,
          delta: randomIntFn(),
        },
      };
      return acc;
    }, {}),
  };
};
/**
 Do we send the first contacts ?
 */
describe('Test zoho', () => {
  beforeEach(async function beforeEach() {
    await testApp.reset();
    initializeModelFactories();
  });
  it('test zoho garageModification', async function test() {
    let garage = await testApp.addGarage(GSGarage);
    const user = await testApp.addUser({ email: 'user@test.com' });
    await user.addGarage(garage);
    const user2 = await testApp.addUser({ email: 'user2@test.com' });
    await user2.addGarage(garage);
    garage = await garage.getInstance();
    await testApp.models.AutomationCampaign.initDefaultCampaigns(
      garage.getId(),
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    const zohoFakeData = getFakeZohogarageData(garage.getId().toString());
    const garagesModifications = await handleGarageModifications(zohoFakeData);
    const lastApiUpdate = garagesModifications[0].last_api_update;
    expect(garagesModifications).to.eql([
      {
        id: '1886266000085337005',
        last_api_update: lastApiUpdate,
        exogenous_z_Google_z_connected: true,
        exogenous_z_Facebook_z_connected: true,
        MaintenancePrice: 0,
        NewVehicleSale: null,
        Billing_City: 'Arcueil',
        countFollowupResponded: 0,
        xleads_z_Largus_z_createdAt: '2020-03-03',
        xleads_z_CustomApv_z_createdAt: '2020-03-03',
        xleads_z_CustomVn_z_createdAt: '2020-03-03',
        xleads_z_CustomVo_z_createdAt: '2020-03-03',
        xleads_z_EkonsilioVn_z_createdAt: '2020-03-03',
        xleads_z_OuestFranceAuto_z_createdAt: '2020-03-03',
        xleads_z_Zoomcar_z_createdAt: '2020-03-03',
        Lead: null,
        Account_Name: 'Garagescore',
        xleads_z_ParuVendu_z_createdAt: '2020-03-03',
        xleads_z_Promoneuve_z_createdAt: '2020-03-03',
        Marques_du_portefeuille: ['Renault'],
        Xleads: true,
        boolean_pas_de_campagne: false,
        countPotentialSales: 0,
        countSurveysResponded: 0,
        countValidEmails: 0,
        Billing_Street: '44 Rue Cauchy',
        totalShouldSurfaceInCampaignStats: 0,
        xleads_z_LaCentrale_z_createdAt: '2020-03-03',
        Billing_Code: '94110',
        Maintenance: null,
        Rating: '3. Garage lancé en automatique',
        xleads_z_LeBonCoin_z_createdAt: '2020-03-03',
        UsedVehicleSale: null,
        debut_abo: null,
        countSurveys: 0,
        Analytics: null,
        Billing_State: 'Île-de-France',
        XleadsSourcesCosts: 490,
        UserCosts: 5.16,
        Coaching: true,
        CoachingPrice: 35,
      },
    ]);
  });
  it('test zoho userModification', async function () {
    const garage = await testApp.addGarage();
    const user = await testApp.addUser();
    user.addGarage(garage);
    const zohoFakeGarage = getFakeZohogarageData(garage.getId());
    const fakeZohoUser = getFakeZohoUser(await user.getInstance());
    const userModification = await handleUserModifications(fakeZohoUser, zohoFakeGarage);
    const lastApiUpdate = userModification.users[0].last_api_update;
    expect(userModification).to.eql({
      users: [
        {
          id: '1886266000092425294',
          last_api_update: lastApiUpdate,
          job: 'Directeur de marque',
          Service: ['Directeur de marque'],
        },
      ],
      links: [],
    });
  });
  it('test zoho dealsModification', async function () {
    const zohoFakeDeal = getzohoFakeDeal();
    const garage = await testApp.addGarage({
      zohoDealUrl: `${DEAL_URL}/${zohoFakeDeal[0].id}`,
      doNotShowInZohoReport: false,
    });
    const user = await testApp.addUser();
    user.addGarage(garage);
    const dealModification = await handleDealModifications(zohoFakeDeal);
    const lastApiUpdate = dealModification[0].last_api_update;
    expect(dealModification).to.eql([
      {
        id: '1886266000092610003',
        last_api_update: lastApiUpdate,
        Nb_garages_miroirs_inclus: 1,
        Montant_Abonnement: 10,
        Montant_Setup: 0,
        Etat: 'Garage lancé en automatique: 1',
        Statut_GoCardLess: 'Reçu',
      },
    ]);
  });

  it('should update churn down sales fields correctly', async () => {
    const fakeSubscriptionChurnData = generateSubscriptionChurn();
    Object.keys(fakeSubscriptionChurnData).forEach((key) => {
      if (!GSGarage.subscriptions[key]) {
        GSGarage.subscriptions[key] = fakeSubscriptionChurnData[key];
      } else {
        GSGarage.subscriptions[key] = { ...GSGarage.subscriptions[key], ...fakeSubscriptionChurnData[key] };
      }
    });
    let garage = await testApp.addGarage(GSGarage);

    const user = await testApp.addUser({ email: 'user@test.com' });
    await user.addGarage(garage);
    garage = await garage.getInstance();

    await testApp.models.AutomationCampaign.initDefaultCampaigns(
      garage.getId(),
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    const zohoFakeData = getFakeZohogarageData(garage.getId().toString());
    const additionalFields = [
      'AnalyticsPrice_evol',
      'AutomationPrice_evol',
      'CoachingPrice_evol',
      'EReputationPrice_evol',
      'LeadPrice_evol',
      'MaintenancePrice_evol',
      'NewVehicleSalePrice_evol',
      'UsedVehicleSalePrice_evol',
      'VehicleInspectionPrice_evol',
      'XleadsPrice_evol',
    ];
    const garagesModifications = await handleGarageModifications([
      {
        ...zohoFakeData[0],
        evol_date: null,
        ...additionalFields.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}),
      },
    ]);
    const awaitedChurnProperties = {
      AnalyticsPrice_evol: 'Analytics',
      AutomationPrice_evol: 'Automation',
      CoachingPrice_evol: 'Coaching',
      EReputationPrice_evol: 'Ereputation',
      LeadPrice_evol: 'Lead',
      MaintenancePrice_evol: 'Maintenance',
      NewVehicleSalePrice_evol: 'NewVehicleSale',
      UsedVehicleSalePrice_evol: 'UsedVehicleSale',
      VehicleInspectionPrice_evol: 'VehicleInspection',
      XleadsPrice_evol: 'CrossLeads',
    };
    const awaitedChurnData = {
      evol_date: moment(garage.subscriptions.churnEffectiveDate).utc().format('YYYY-MM-DD'),
      ...Object.entries(awaitedChurnProperties).reduce((acc, [evolKey, subscriptionKey]) => {
        if (garage.subscriptions[subscriptionKey] && garage.subscriptions[subscriptionKey].churn) {
          acc[evolKey] = garage.subscriptions[subscriptionKey].churn.delta;
        }
        return acc;
      }, {}),
    };
    expect(garagesModifications[0]).to.include(awaitedChurnData);
  });

  it('should retrieve right datas from kpb', async () => {
    const randomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const garage = await garageFactory.createInDB({ ...GSGarage });
    const user = await userFactory.createInDB({
      garageIds: [garage.id],
    });

    await testApp.models.AutomationCampaign.initDefaultCampaigns(
      garage.getId(),
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );

    const kpiByPeriod = await kpiByPeriodFactory.createInDB({
      [KpiDictionary.garageId]: garage.id,
      [KpiDictionary.period]: 10,
      [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
      [KpiDictionary.contactsCountValidEmails]: randomInt(1, 100),
      [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: randomInt(1, 100),
      [KpiDictionary.contactsCountSurveysResponded]: randomInt(1, 100),
      [KpiDictionary.contactsCountReceivedSurveys]: randomInt(1, 100),
      [KpiDictionary.countConvertedLeads]: randomInt(1, 100),
      [KpiDictionary.countConvertedTradeIns]: randomInt(1, 100),
      [KpiDictionary.countLeads]: randomInt(1, 100),
      [KpiDictionary.countUnsatisfiedFollowupResponded]: randomInt(1, 100),
      [KpiDictionary.countUnsatisfiedFollowupRecontacted]: randomInt(1, 100),
    });

    const zohoFakeGarage = getFakeZohogarageData(garage.getId().toString());
    const garageModifications = await handleGarageModifications(zohoFakeGarage);
    expect(garageModifications[0]).to.contains({
      countFollowupResponseQid122: kpiByPeriod[KpiDictionary.countUnsatisfiedFollowupRecontacted],
      countFollowupResponded: kpiByPeriod[KpiDictionary.countUnsatisfiedFollowupResponded],
      totalShouldSurfaceInCampaignStats: kpiByPeriod[KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats],
    });
  });
});
