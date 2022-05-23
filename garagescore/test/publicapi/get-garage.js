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

  const appsOptions = [
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: true, // True: we can retreive all comments
      withheldGarageData: true, // True: get data from all garages
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.GARAGES],
    },
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: false, // False: we only get sharedWithPartners comments
      withheldGarageData: false, // False: get data from launched garages only
      nonIndexedGarages: false,
      permissions: [routesPermissions.GARAGES],
    },
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: false, // False: we only get sharedWithPartners comments
      withheldGarageData: false, // False: get data from launched garages only
      nonIndexedGarages: true,
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
    app3: appInfos.addApp(appsOptions[2]),
    appNoAccess: appInfos.addApp(appsOptions[3]),
  };

  beforeEach(async function beforeEach() {
    await app.reset();
    garage = await app.addGarage({ hideDirectoryPage: false });
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
    await promises.wait(app.models.CensoredWords.updateAllCachedCensoredWords);
  });

  const addReview = async function (rating, comment, categories) {
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(rating).setReview(comment).setCategories(categories).submit();
    return;
  };

  it('api.garage', async function test() {
    await addReview(9, 'mon comentaire numéro 1', [ServiceCategories.MAINTENANCE_CAT_2]);
    await addReview(7, 'mon comentaire numéro 2', [
      ServiceCategories.MAINTENANCE_CAT_1,
      ServiceCategories.MAINTENANCE_CAT_2,
    ]);
    const garageData = await publicApi.garage(mockApps.app1.appId, garage.garageId);
    expect(garageData.respondentsCount).equal(2);
    expect(garageData.Maintenance.rating).equal(8);
    expect(garageData.Maintenance.respondentsCount).equal(2);


  });

  it('should not get access to api.garage without access', async function test() {
    let accessError = false
    try {
      await publicApi.garage(mockApps.appNoAccess.appId, garage.garageId)
    } catch (error) {
      accessError = true
    }

    expect(accessError).equal(true)
  });

  it('api.garageSearch', async function test() {
    const garageData = await publicApi.garageSearch(mockApps.app1.appId, { id: garage.garageId });
    expect(garageData.id.toString()).equal(garage.garageId.toString());

  });

  it('should not get access to api.garageSearch without access', async function test() {
    let accessError = false
    try {
      await publicApi.garage(mockApps.appNoAccess.appId, garage.garageId)
    } catch (error) {
      accessError = true
    }

    expect(accessError).equal(true)
  });

  it('api.garage gets only launched garages if appId is not garageScore', async function test() {
    const garagesSpecs = [
      { status: 'Waiting', hideDirectoryPage: false },
      { status: 'Waiting', hideDirectoryPage: true },
      { status: 'DataMissing', hideDirectoryPage: false },
      { status: 'DataMissing', hideDirectoryPage: true },
      { status: 'ToCreate', hideDirectoryPage: false },
      { status: 'ToCreate', hideDirectoryPage: true },
      { status: 'ToPlug', hideDirectoryPage: false },
      { status: 'ToPlug', hideDirectoryPage: true },
      { status: 'ToConfigure', hideDirectoryPage: false },
      { status: 'ToConfigure', hideDirectoryPage: true },
      { status: 'UsersMissing', hideDirectoryPage: false },
      { status: 'UsersMissing', hideDirectoryPage: true },
      { status: 'Ready', hideDirectoryPage: false },
      { status: 'Ready', hideDirectoryPage: true },
      { status: 'RunningAuto', hideDirectoryPage: false },
      { status: 'RunningAuto', hideDirectoryPage: true },
      { status: 'RunningManual', hideDirectoryPage: false },
      { status: 'RunningManual', hideDirectoryPage: true },
      { status: 'Stopped', hideDirectoryPage: false },
      { status: 'Stopped', hideDirectoryPage: true },
    ];

    const storedGarages = [];
    for (const { status, hideDirectoryPage } of garagesSpecs) {
      const res = await app.addGarage({ status, hideDirectoryPage });
      storedGarages.push(res);
    }

    // Unauthenticated request: making sure we don't mess with other tests
    let recoveredGarages = await Promise.allSettled(
      storedGarages.map(async (g) => {
        return await publicApi.garage(mockApps.app1.appId, g.garageId);
      })
    );
    recoveredGarages = recoveredGarages.filter(({ status }) => status == 'fulfilled');
    expect(recoveredGarages.length).equal(garagesSpecs.length);

    // Getting garages authenticated as GarageScore => should retrieve all garages
    recoveredGarages = await Promise.allSettled(
      storedGarages.map(async (g) => {
        return await publicApi.garage(mockApps.app1.appId, g.garageId);
      })
    );
    recoveredGarages = recoveredGarages.filter(({ status }) => status == 'fulfilled');
    expect(recoveredGarages.length).equal(garagesSpecs.length);

    // Getting garages authenticated as OuestFrance => should retrieve only running garages
    recoveredGarages.length = 0;
    for (let g of storedGarages) {
      try {
        let recoveredGarage = await publicApi.garage(mockApps.app2.appId, g.garageId);
        if (recoveredGarage) recoveredGarages.push(recoveredGarage);
      } catch (e) { }
    }

    let recoveredGaragesInstances = [];
    for (const { garageId } of recoveredGarages) {
      const res = await storedGarages.find(({ id }) => id.toString() === garageId).getInstance();
      recoveredGaragesInstances.push(res);
    }

    expect(recoveredGarages.length).equal(2);
    expect(recoveredGaragesInstances.map(({ status }) => status))
      .to.include('RunningAuto')
      .and.to.include('RunningManual');
    expect(recoveredGaragesInstances.map(({ hideDirectoryPage }) => hideDirectoryPage))
      .to.include(false)
      .and.not.to.include(true);

    // Getting launched garages even if they're not indexed
    recoveredGarages.length = 0;
    for (let g of storedGarages) {
      try {
        let recoveredGarage = await publicApi.garage(mockApps.app3.appId, g.garageId);
        if (recoveredGarage) recoveredGarages.push(recoveredGarage);
      } catch (e) { }
    }

    recoveredGaragesInstances = [];
    for (const { garageId } of recoveredGarages) {
      const res = await storedGarages.find(({ id }) => id.toString() === garageId).getInstance();
      recoveredGaragesInstances.push(res);
    }
    expect(recoveredGarages.length).equal(4);
    expect(recoveredGaragesInstances.map(({ status }) => status))
      .to.include('RunningAuto')
      .and.to.include('RunningManual');
    expect(recoveredGaragesInstances.map(({ hideDirectoryPage }) => hideDirectoryPage))
      .to.include(false)
      .and.to.include(true);
  });

  it('api.garageSearch gets only launched garages if appId is not garageScore', async function test() {
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
      const res = await app.addGarage({ status, hideDirectoryPage: false });
      storedGarages.push(res);
    }

    // Unauthenticated request: making sure we don't mess with other tests
    let recoveredGarages = [];
    for (const g of storedGarages) {
      const res = await publicApi.garageSearch(mockApps.app1.appId, { id: g.garageId });
      recoveredGarages.push(res);
    }

    recoveredGarages = recoveredGarages.filter((e) => e);
    expect(recoveredGarages.length).equal(statuses.length);

    // Getting reviews authenticated as GarageScore => should retrieve all reviews
    recoveredGarages = [];
    for (const g of storedGarages) {
      const res = await publicApi.garageSearch(mockApps.app1.appId, { id: g.garageId });
      recoveredGarages.push(res);
    }

    recoveredGarages = recoveredGarages.filter((e) => e);
    expect(recoveredGarages.length).equal(statuses.length);

    // Getting reviews authenticated as OuestFrance => should retrieve only reviews shared with partners
    recoveredGarages.length = 0;
    for (let g of storedGarages) {
      try {
        let recoveredGarage = await publicApi.garageSearch(mockApps.app2.appId, { id: g.garageId });
        if (recoveredGarage) recoveredGarages.push(recoveredGarage);
      } catch (e) { }
    }
    expect(recoveredGarages.length).equal(2); mockApps
    // expect(recoveredGarages.map(g => g.status)).to.include('RunningAuto').and.to.include('RunningManual');
  });

  describe('Yello Page partner', () => {
    beforeEach(async function beforeEach() {
      await app.reset();
      const addGarageFr = await app.addGarage({ locale: 'fr_FR' });
      const addGarageES = await app.addGarage({ locale: 'es_ES' });
      const addGarageBe = await app.addGarage({ locale: 'fr_BE' });
      const addGarageNc = await app.addGarage({ locale: 'fr_NC' });
    });

    const yellowPageId = '78abfe479c65ad9894073a2bb64d46a3';
    const fidgestId = 'ef6601b5ba298bb7b941308389233b0f';

    it('should get all garages with another partner', async function test() {
      const recoveredGarages = await publicApi.sharedReviewsGarages(fidgestId, undefined);
      expect(recoveredGarages.length).to.be.equal(4);
    });

    it('should only get garage with locale code "fr_FR" with another partner', async function test() {
      const recoveredGarages = await publicApi.sharedReviewsGarages(fidgestId, ['fr_FR']);
      expect(recoveredGarages.length).to.be.equal(1);
    });

    it('should get all garages if locale code is undefined', async function test() {
      const recoveredGarages = await publicApi.sharedReviewsGarages(yellowPageId, undefined);
      expect(recoveredGarages.length).to.be.equal(4);
    });

    it('should only get garage with locale code "fr_FR" and "fr_BE" from share-reviews/garages', async function test() {
      const recoveredGarages = await publicApi.sharedReviewsGarages(yellowPageId, [
        'fr_FR',
        'fr_BE',
      ]);
      expect(recoveredGarages.length).to.be.equal(2);
    });

    it('should not get access to api.sharedReviewsGarages without access', async function test() {
      let ok = true
      try {
        await publicApi.sharedReviewsGarages(mockApps.appNoAccess.appId)
      } catch (e) {
        ok = false
      }
      expect(ok).equal(false)
    });

    it('should only get garage with locale code "fr_FR" and "fr_BE" from share-reviews/garages2delete ', async function test() {
      const recoveredGarages = await publicApi.sharedReviewsAllGarageReviewsToDelete(
        yellowPageId,
        null,
        null,
        ['fr_FR', 'fr_BE']
      ); //null = no minDate, null = no maxDate
      expect(recoveredGarages.length).to.be.equal(2);
    });

    it('should not get access to api.sharedReviewsGarages without access', async function test() {
      let ok = true
      try {
        await publicApi.sharedReviewsAllGarageReviewsToDelete(mockApps.appNoAccess.appId, null, null, null)
      } catch (e) {
        ok = false
      }
      expect(ok).equal(false)
    });

    //!\ sharedReviewsModeratedReviewsToDelete search in Data models
    it('should get all garages from sharedReviewsModeratedReviewsToDelete', async function test() {
      const garages = ['Seat', 'BMW', 'Skoda', 'Toyota', 'Mazda'];

      const storedGarages = [];
      for (const brand of garages) {
        const res = await app.addGarage({ garages: brand });
        storedGarages.push(res);
      }

      const recoveredGarages = [];
      for (const garage of storedGarages) {
        const res = await publicApi.sharedReviewsModeratedReviewsToDelete(yellowPageId, null, null);
        recoveredGarages.push(res);
      }

      expect(recoveredGarages.length).to.be.equal(5);
    });

    it('should not get access to api.sharedReviewsModeratedReviewsToDelete without access', async function test() {

      let ok = true
      try {
        await publicApi.sharedReviewsModeratedReviewsToDelete(mockApps.appNoAccess.appId, null, null)
      } catch (e) {
        ok = false
      }
      expect(ok).equal(false)

    });

  });
});
