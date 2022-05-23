const TestApp = require('../../common/lib/test/test-app');
const { LeadSaleTypes } = require('../../frontend/utils/enumV2');
const DataFileTypes = require('../../common/models/data-file.data-type');
const LeadTypes = require('../../common/models/data/type/lead-types');
const chai = require('chai');
const moment = require('moment');
const publicApi = require('../../common/lib/garagescore/api/public-api');
const appInfos = require('../../common/lib/garagescore/api/app-infos');
const appIdGenerator = require('../../common/lib/garagescore/api/app-id-generator');
const promises = require('../../common/lib/util/promises');
const { routesPermissions } = require('../../common/lib/garagescore/api/route-permissions');

const expect = chai.expect;
const app = new TestApp();
/* Get review from api */
describe('Get leads from the api', () => {
  let garage;
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage();
  });

  const addLead = async (vehicle, { forcedGarage, saleType, leadType } = {}) => {
    forcedGarage = forcedGarage || garage;
    saleType = saleType || LeadSaleTypes.NEW_VEHICLE_SALE;
    leadType = leadType || LeadTypes.INTERESTED;
    const campaign = await forcedGarage.runNewCampaign(DataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey
      .rate(8)
      .setLead(leadType, null, saleType, null, !!vehicle, vehicle || '')
      .submit();
    return;
  };

  // const addCrossLead = async () => {};

  const appsOptions = [
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: true, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: true, // True: get data from all garages, False: get data from launched garages only
      permissions: [routesPermissions.LEADS]
    },
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: false, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: false, // True: get data from all garages, False: get data from launched garages only
      permissions: [routesPermissions.LEADS]
    },
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: true, // True: we can retreive all comments
      withheldGarageData: true, // True: get data from all garages
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [],
    },
  ];
  const mockApps = {
    app1: appInfos.addApp(appsOptions[0]),
    app2: appInfos.addApp(appsOptions[1]),
    appNoAccess: appInfos.addApp(appsOptions[2])
  };

  it('api.leadsByGarage', async () => {
    await addLead('Porsche 911 GT3 RS');
    await addLead('Mercedes-Benz AMG GT S');
    const leads = await publicApi.leadsByGarage(mockApps.app1.appId, garage.garageId, 10, 0);
    expect(leads.length).equal(2);
    expect(leads[0].garageId).equal(garage.garageId);
  });

  it('should not get access to api.leadsByGarage without access', async function test() {
    let accessError = false
    try {
      await publicApi.leadsByGarage(mockApps.appNoAccess.appId, garage.garageId, 10, 0)
    } catch (e) {
      accessError = true
    }

    expect(accessError).equal(true)
  });

  it('api.leadsByGarage get leads only from launched garages if appId is not garageScore', async () => {
    const withheldGarage = await app.addGarage({ status: 'Stopped' });
    const manualLaunchGarage = await app.addGarage({ status: 'RunningManual' });
    await addLead('Mercedes-Benz C63 AMG C205');
    await addLead('BMW M3 F80', { forcedGarage: manualLaunchGarage });
    await addLead('Audi RS3 Sportback', { forcedGarage: withheldGarage });

    let leads = await publicApi.leadsByGarage(mockApps.app1.appId, garage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('Mercedes-Benz C63 AMG C205');
    leads = await publicApi.leadsByGarage(mockApps.app1.appId, withheldGarage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('Audi RS3 Sportback');
    leads = await publicApi.leadsByGarage(mockApps.app1.appId, manualLaunchGarage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('BMW M3 F80');

    leads = await publicApi.leadsByGarage(mockApps.app1.appId, garage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('Mercedes-Benz C63 AMG C205');
    leads = await publicApi.leadsByGarage(mockApps.app1.appId, withheldGarage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('Audi RS3 Sportback');
    leads = await publicApi.leadsByGarage(mockApps.app1.appId, manualLaunchGarage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('BMW M3 F80');

    leads = await publicApi.leadsByGarage(mockApps.app2.appId, garage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('Mercedes-Benz C63 AMG C205');
    // expect(async () => {
    //   await promises.makeAsync(publicApi.leadsByGarage)(mockApps.app2.appId, withheldGarage.garageId, 10, 0)
    // }).to.throw('Not authorized to withheld garages');
    leads = await publicApi.leadsByGarage(mockApps.app2.appId, manualLaunchGarage.garageId, 10, 0);
    expect(leads.length).equal(1);
    expect(leads[0].model).equal('BMW M3 F80');
  });
  it('api.leadsByDate', async () => {
    const day = moment().format('DD');
    const month = moment().format('MM');
    const year = moment().format('YYYY');
    const dateField = 'updatedAt';

    await addLead('Aston Martin DB11 Volante');
    await addLead('Jaguar F-Type R');
    // I am forced to use updatedAt instead of lead.reportedAt in the tests because somehow MemoryDB
    // does not understand date query in embedded documents
    const leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField });
    expect(leads.length).equal(2);
  });
  it('api.leadsByDate get reviews only from launched garages if appId is not garageScore', async () => {
    const withheldGarage = await app.addGarage({ status: 'Stopped' });
    const manualLaunchGarage = await app.addGarage({ status: 'RunningManual' });

    const day = moment().format('DD');
    const month = moment().format('MM');
    const year = moment().format('YYYY');
    const dateField = 'updatedAt';

    await addLead('Ford Mustang GT Fastback');
    await addLead('Ford Gran Torino', { forcedGarage: withheldGarage });
    await addLead('Dodge Challenger R/T', { forcedGarage: manualLaunchGarage });
    //* Come on ! YUNo understand lead.reportedAt
    let leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField });

    expect(leads.length).equal(3);
    expect(leads.map((lead) => lead.model))
      .to.include('Ford Mustang GT Fastback')
      .and.to.include('Ford Gran Torino')
      .and.to.include('Dodge Challenger R/T');

    leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField });
    expect(leads.length).equal(3);
    expect(leads.map((lead) => lead.model))
      .to.include('Ford Mustang GT Fastback')
      .and.to.include('Ford Gran Torino')
      .and.to.include('Dodge Challenger R/T');

    leads = await publicApi.leadsByDate2(mockApps.app2.appId, { day, month, year, dateField });
    expect(leads.length).equal(2);
    expect(leads.map((lead) => lead.model))
      .to.include('Ford Mustang GT Fastback')
      .and.to.include('Dodge Challenger R/T');
    //*/
  });

  it('api.leadsByDate: playing with leadSaleType', async () => {
    const day = moment().format('DD');
    const month = moment().format('MM');
    const year = moment().format('YYYY');
    const dateField = 'updatedAt';

    await addLead('Révision de ma Porsche', { saleType: LeadSaleTypes.MAINTENANCE });
    await addLead('Bugatti Chiron', { saleType: LeadSaleTypes.NEW_VEHICLE_SALE });
    await addLead('Ferrari 250 GTO', { saleType: LeadSaleTypes.USED_VEHICLE_SALE });

    let leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField });
    expect(leads.length).equal(3);
    expect(leads.map((lead) => lead.model))
      .to.include('Révision de ma Porsche')
      .and.to.include('Bugatti Chiron')
      .and.to.include('Ferrari 250 GTO');

    let leadSaleType = LeadSaleTypes.MAINTENANCE;
    leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField, leadSaleType });
    expect(leads.length).equal(1);
    expect(leads.map((lead) => lead.model)).to.include('Révision de ma Porsche');

    leadSaleType = LeadSaleTypes.NEW_VEHICLE_SALE;
    leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField, leadSaleType });
    expect(leads.length).equal(1);
    expect(leads.map((lead) => lead.model)).to.include('Bugatti Chiron');

    leadSaleType = LeadSaleTypes.USED_VEHICLE_SALE;
    leads = await publicApi.leadsByDate2(mockApps.app1.appId, { day, month, year, dateField, leadSaleType });
    expect(leads.length).equal(1);
    expect(leads.map((lead) => lead.model)).to.include('Ferrari 250 GTO');
  });

  it('should not get access to api.leadsByDate2 without access', async function test() {
    let accessError = false
    try {
      await publicApi.leadsByDate2(mockApps.appNoAccess.appId, {})
    } catch (e) {
      accessError = true
    }
    expect(accessError).equal(true)
  });

});
