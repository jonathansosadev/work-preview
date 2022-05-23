const TestApp = require('../../common/lib/test/test-app');
const { ServiceCategories } = require('../../frontend/utils/enumV2');
const dataFileTypes = require('../../common/models/data-file.data-type');

const chai = require('chai');
const publicApi = require('../../common/lib/garagescore/api/public-api');
const promises = require('../../common/lib/util/promises');
const appInfos = require('../../common/lib/garagescore/api/app-infos');
const appIdGenerator = require('../../common/lib/garagescore/api/app-id-generator');
const { routesPermissions } = require('../../common/lib/garagescore/api/route-permissions');

const expect = chai.expect;
const app = new TestApp();
/* Get garage data from api */
describe('Get garage data from the api', () => {
  let garage;

  const addReview = async function (rating, comment, categories) {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(rating).setReview(comment).setCategories(categories).submit();
    return;
  };

  const appsOptions = [
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: true, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: true, // True: get data from all garages, False: get data from launched garages only
      permissions: [routesPermissions.GARAGES],
    },
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: false, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: false, // True: get data from all garages, False: get data from launched garages only
      permissions: [routesPermissions.GARAGES],
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

  it('api.garages', async function test() {
    await app.reset();
    for (let i = 0; i < 10; i++) {
      garage = await app.addGarage({ hideDirectoryPage: false });
      await addReview(9, 'mon comentaire numéro 1', [ServiceCategories.MAINTENANCE_CAT_2]);
      await addReview(7, 'mon comentaire numéro 2', [
        ServiceCategories.MAINTENANCE_CAT_1,
        ServiceCategories.MAINTENANCE_CAT_2,
      ]);
    }
    const datas = await publicApi.garages(mockApps.app1.appId, null, 10);
    expect(datas.length).equal(10);
    for (let i = 0; i < 10; i++) {
      const d = await publicApi.garages(mockApps.app1.appId, datas[i].garageId, 10);
      expect(d.length).equal(9 - i);
    }
  });

  it('should not get access to api.garages without access', async function test() {
    let accessError = false
    try {
      await publicApi.garages(mockApps.appNoAccess.appId, null, 10)
    } catch (e) {
      accessError = true
    }
    expect(accessError).equal(true)
  });

  it('api.garagesSearch', async function test() {
    await app.reset();
    for (let i = 0; i < 10; i++) {
      garage = await app.addGarage({ businessId: i });
    }
    const data = await publicApi.garagesSearch(mockApps.app1.appId, { businessId: { lt: 5 } }, null, null);
    expect(data.length).equal(5);
  });

  it('should not get access to api.garagesSearch without access', async function test() {
    let accessError = false
    try {
      await publicApi.garagesSearch(mockApps.appNoAccess.appId, { businessId: { lt: 5 } }, null, null)
    } catch (e) {
      accessError = true
    }
    expect(accessError).equal(true)
  });

  it('api.garages gets only launched garages if appId is not garageScore', async function test() {
    await app.reset();
    const statuses = [
      'Waiting',
      'DataMissing',
      'ToCreate',
      'ToPlug',
      'ToConfigure',
      'UsersMissing',
      'Ready',
      'RunningAuto',
      'RunningManual',
      'Stopped',
    ];

    for (const status of statuses) {
      await app.addGarage({ status, hideDirectoryPage: false });
    }
    // Unauthenticated request: making sure we don't mess with other tests
    let recoveredGarages = await publicApi.garages(mockApps.app1.appId, null, null);
    expect(recoveredGarages.length).equal(statuses.length);

    // Getting reviews authenticated as GarageScore => should retrieve all reviews
    recoveredGarages = await publicApi.garages(mockApps.app1.appId, null, null);
    expect(recoveredGarages.length).equal(statuses.length);

    // Getting reviews authenticated as OuestFrance => should retrieve only reviews shared with partners
    recoveredGarages = await publicApi.garages(mockApps.app2.appId, null, null);
    expect(recoveredGarages.length).equal(2);
    // expect(recoveredGarages.map(g => g.status)).to.include('RunningAuto').and.to.include('RunningManual');
  });

  it('api.garagesSearch gets only launched garages if appId is not garageScore', async function test() {
    await app.reset();
    const statuses = [
      'Waiting',
      'DataMissing',
      'ToCreate',
      'ToPlug',
      'ToConfigure',
      'UsersMissing',
      'Ready',
      'RunningAuto',
      'RunningManual',
      'Stopped',
    ];
    const storedGarages = [];

    for (const status of statuses) {
      storedGarages.push(await app.addGarage({ status }));
    }

    // Unauthenticated request: making sure we don't mess with other tests
    let recoveredGarages = await publicApi.garagesSearch(mockApps.app1.appId, {}, null, null);
    expect(recoveredGarages.length).equal(statuses.length);

    // Getting reviews authenticated as GarageScore => should retrieve all reviews
    recoveredGarages = await publicApi.garagesSearch(mockApps.app1.appId, {}, null, null);
    expect(recoveredGarages.length).equal(statuses.length);

    // Getting reviews authenticated as OuestFrance => should retrieve only reviews shared with partners
    recoveredGarages = await publicApi.garagesSearch(mockApps.app2.appId, {}, null, null);
    expect(recoveredGarages.length).equal(2);
    // expect(recoveredGarages.map(g => g.status)).to.include('RunningAuto').and.to.include('RunningManual');
  });
});
