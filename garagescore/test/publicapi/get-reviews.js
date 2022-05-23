const TestApp = require('../../common/lib/test/test-app');
const { DataTypes, ServiceCategories } = require('../../frontend/utils/enumV2');

const dataFileTypes = require('../../common/models/data-file.data-type');

const chai = require('chai');
const moment = require('moment');
const publicApi = require('../../common/lib/garagescore/api/public-api');
const appInfos = require('../../common/lib/garagescore/api/app-infos');
const appIdGenerator = require('../../common/lib/garagescore/api/app-id-generator');
const promises = require('../../common/lib/util/promises');
const { routesPermissions } = require('../../common/lib/garagescore/api/route-permissions');

const expect = chai.expect;
const app = new TestApp();

const exampleDataNewReview = require('./examples/data-new-review');

describe('Get review from the api', () => {
  let garage;

  beforeEach(async function beforeEach() {
    await app.reset();
    garage = await app.addGarage();
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
    await promises.wait(app.models.CensoredWords.updateAllCachedCensoredWords);
  });

  const addReview = async function (forcedGarage, rating, comment, categories, shareWithPartners) {
    forcedGarage = forcedGarage || garage;
    const campaign = await forcedGarage.runNewCampaign(dataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey
      .rate(rating)
      .setReview(comment, shareWithPartners || false)
      .setCategories(categories)
      .setProvidedGarageId(3)
      .submit();
    return;
  };
  const appsOptions = [
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: true, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: true, // True: get data from all garages, False: get data from launched garages only
      permissions: [routesPermissions.REVIEWS, routesPermissions.LEADS],
    },
    {
      ...appIdGenerator(),
      allGaragesAuthorized: true,
      allReviews: false, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: false, // True: get data from all garages, False: get data from launched garages only
      permissions: [routesPermissions.REVIEWS, routesPermissions.LEADS],
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
    appNoAccess: appInfos.addApp(appsOptions[2]),
  };
  it('api.reviewOpti', async function test() {
    await addReview(null, 9, 'mon comentaire numéro 1', [ServiceCategories.MAINTENANCE_CAT_2]);
    await addReview(null, 7, 'mon comentaire numéro 2', [
      ServiceCategories.MAINTENANCE_CAT_1,
      ServiceCategories.MAINTENANCE_CAT_2,
    ]);
    const reviews = await publicApi.reviews(mockApps.app1.appId, garage.garageId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);
    expect(reviews[0].authorCityPublicDisplayName).to.exist;
    expect(reviews[0].transactionPublicDisplayName).to.exist;
    expect(reviews[0].vehicleMakePublicDisplayName).to.exist;
    expect(reviews[0].vehicleModelPublicDisplayName).to.exist;
    expect(reviews[0].id).to.exist;
    expect(reviews[0].createdAt).to.exist;
    expect(reviews[0].type).to.exist;
    expect(reviews[0].authorPublicDisplayName).to.exist;
    expect(reviews[0].score).to.exist;
    expect(reviews[0].comment).equal('mon comentaire numéro 2');
    expect(reviews[0].submittedAt).to.exist;
  });
  it('api.reviews filters reviews shared with partners if appId is not garageScore', async function test() {
    await addReview(null, 9, 'my shared comment', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(null, 8, 'my NOT shared comment', [ServiceCategories.MAINTENANCE_CAT_2], false);

    // Unauthenticated request: making sure we don't mess with other tests
    let reviews = await publicApi.reviews(mockApps.app1.appId, garage.garageId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);
    expect(reviews[0].comment).equal('my NOT shared comment');
    expect(reviews[1].comment).equal('my shared comment');
    expect(reviews[0].shareWithPartners).equal(false);
    expect(reviews[1].shareWithPartners).equal(true);

    // Getting reviews authenticated as GarageScore => should retrieve all reviews
    reviews = await publicApi.reviews(mockApps.app1.appId, garage.garageId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);
    expect(reviews[0].comment).equal('my NOT shared comment');
    expect(reviews[1].comment).equal('my shared comment');
    expect(reviews[0].shareWithPartners).equal(false);
    expect(reviews[1].shareWithPartners).equal(true);

    // Getting reviews authenticated as OuestFrance => should retrieve only reviews shared with partners
    reviews = await publicApi.reviews(mockApps.app2.appId, garage.garageId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(1);
    expect(reviews[0].comment).equal('my shared comment');
    expect(reviews[0].shareWithPartners).equal(true);
  });
  it('api.reviews get reviews only from launched garages if appId is not garageScore', async function test() {
    const withheldGarage = await app.addGarage({ status: 'Stopped' });
    const manualLaunchGarage = await app.addGarage({ status: 'RunningManual' });

    await addReview(null, 9, 'comment on RunningAuto garage', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(
      manualLaunchGarage,
      9,
      'comment on RunningManual garage',
      [ServiceCategories.MAINTENANCE_CAT_2],
      true
    );
    await addReview(withheldGarage, 9, 'comment on Stopped garage', [ServiceCategories.MAINTENANCE_CAT_2], true);

    // Unauthenticated request: making sure we don't mess with other tests
    let reviews = await publicApi.reviews(mockApps.app1.appId, null, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(3);
    reviews = await publicApi.reviews(mockApps.app1.appId, null, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(3);
    reviews = await publicApi.reviews(mockApps.app2.appId, null, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);
    expect(reviews.map((r) => r.comment))
      .to.include('comment on RunningAuto garage')
      .and.to.include('comment on RunningManual garage');
  });
  it('api.reviewsCount', async function test() {
    console.log('ici');
    await addReview(null, 9, 'mon comentaire numéro 1', [ServiceCategories.MAINTENANCE_CAT_2]);
    await addReview(null, 7, 'mon comentaire numéro 2', [
      ServiceCategories.MAINTENANCE_CAT_1,
      ServiceCategories.MAINTENANCE_CAT_2,
    ]);
    const count = await publicApi.reviewsCount(mockApps.app1.appId, garage.garageId, DataTypes.MAINTENANCE);
    expect(count).equal(2);
  });

  it('should not get access to api.reviews without access', async function test() {
    let accessError = false;
    try {
      await publicApi.reviews(mockApps.appNoAccess.appId);
    } catch (e) {
      accessError = true;
    }
    expect(accessError).equal(true);
  });

  it('api.reviewsByType', async function test() {
    await addReview(null, 9, 'mon comentaire numéro 1', [ServiceCategories.MAINTENANCE_CAT_2]);
    await addReview(null, 7, 'mon comentaire numéro 2', [
      ServiceCategories.MAINTENANCE_CAT_1,
      ServiceCategories.MAINTENANCE_CAT_2,
    ]);
    const reviews = await publicApi.reviewsByType(mockApps.app1.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);
  });
  it('api.reviewsByType filters reviews shared with partners if appId is not garageScore', async function test() {
    await addReview(null, 9, 'my shared comment', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(null, 8, 'my NOT shared comment', [ServiceCategories.MAINTENANCE_CAT_2], false);

    let reviews = await publicApi.reviewsByType(mockApps.app1.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);

    reviews = await publicApi.reviewsByType(mockApps.app1.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);

    reviews = await publicApi.reviewsByType(mockApps.app2.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(1);
    expect(reviews[0].comment).equal('my shared comment');
    expect(reviews[0].shareWithPartners).equal(true);
  });
  it('api.reviewsByType get reviews only from launched garages if appId is not garageScore', async function test() {
    const withheldGarage = await app.addGarage({ status: 'Stopped' });
    const manualLaunchGarage = await app.addGarage({ status: 'RunningManual' });

    await addReview(null, 9, 'comment on RunningAuto garage', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(
      manualLaunchGarage,
      9,
      'comment on RunningManual garage',
      [ServiceCategories.MAINTENANCE_CAT_2],
      true
    );
    await addReview(withheldGarage, 9, 'comment on Stopped garage', [ServiceCategories.MAINTENANCE_CAT_2], true);

    let reviews = await publicApi.reviewsByType(mockApps.app1.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(3);

    reviews = await publicApi.reviewsByType(mockApps.app1.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(3);

    reviews = await publicApi.reviewsByType(mockApps.app2.appId, DataTypes.MAINTENANCE, 10, 0);
    expect(reviews.length).equal(2);
    expect(reviews.map((r) => r.comment))
      .to.include('comment on RunningAuto garage')
      .and.to.include('comment on RunningManual garage');
  });

  it('api.reviewsByGarage', async function test() {
    await addReview(null, 9, 'mon comentaire numéro 1', [ServiceCategories.MAINTENANCE_CAT_2]);
    await addReview(null, 7, 'mon comentaire numéro 2', [
      ServiceCategories.MAINTENANCE_CAT_1,
      ServiceCategories.MAINTENANCE_CAT_2,
    ]);
    const reviews = await publicApi.reviewsByGarage(mockApps.app1.appId, garage.garageId, 10, 0);
    expect(reviews.length).equal(2);
    expect(reviews[0].providedGarageId).equal('3');
  });
  it('api.reviewsByGarage filters reviews shared with partners if appId is not garageScore', async function test() {
    await addReview(null, 9, 'my shared comment', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(null, 8, 'my NOT shared comment', [ServiceCategories.MAINTENANCE_CAT_2], false);

    let reviews = await publicApi.reviewsByGarage(mockApps.app1.appId, garage.garageId, 10, 0);
    expect(reviews.length).equal(2);

    reviews = await publicApi.reviewsByGarage(mockApps.app1.appId, garage.garageId, 10, 0);
    expect(reviews.length).equal(2);

    reviews = await publicApi.reviewsByGarage(mockApps.app2.appId, garage.garageId, 10, 0);
    expect(reviews.length).equal(1);
    expect(reviews[0].comment).equal('my shared comment');
    expect(reviews[0].shareWithPartners).equal(true);
  });

  it('api.reviewsByGarage review check Plate - Vin - providedFrontDeskUserName', async function test() {
    const Data = app.models.Data.getMongoConnector();
    await Data.insertOne(exampleDataNewReview);

    const reviews = await publicApi.reviewsByGarage(mockApps.app1.appId, exampleDataNewReview.garageId, 10, 0);

    expect(reviews[0].comment).equal('Très bien accueilli, et très bon conseil, très satisfait rien à redire ');
    expect(reviews[0].vehicleMakePublicDisplayName).equal('Opel');
    expect(reviews[0].vehiclePlate).equal('FR199BC');
    expect(reviews[0].vehicleVin).equal('VXKUPHNKKL4196562');
    expect(reviews[0].providedFrontDeskUserName).equal('Kévin Briand');
  });

  it('api.reviewsByDate', async function test() {
    await addReview(null, 9, "C'est pas mal comme garage, je valide.", [ServiceCategories.MAINTENANCE_CAT_2]);
    await addReview(null, 7, "Vraiment un bon garage, c'est très bien.", [
      ServiceCategories.MAINTENANCE_CAT_1,
      ServiceCategories.MAINTENANCE_CAT_2,
    ]); // eslint-disable-line max-len
    const reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app1.appId,
      garage.garageId,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    // Normalement ça devrait être 2 mais comme on a un mécanisme qui ne renvoie qu' 1 review sur 3 on aura qu' 1 resultat dans la query
    expect(reviews.length).equal(1);
  });
  it('api.reviewsByDate filters reviews shared with partners if appId is not garageScore', async function test() {
    await addReview(null, 9, 'my shared comment', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(null, 8, 'my NOT shared comment', [ServiceCategories.MAINTENANCE_CAT_2], false);

    let reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app1.appId,
      garage.garageId,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    // Normalement ça devrait être 2 mais comme on a un mécanisme qui ne renvoie qu' 1 review sur 3 on aura qu' 1 resultat dans la query
    expect(reviews.length).equal(1);

    reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app1.appId,
      garage.garageId,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    // Normalement ça devrait être 2 mais comme on a un mécanisme qui ne renvoie qu' 1 review sur 3 on aura qu' 1 resultat dans la query
    // appId = null n'est pas impacté par cette remarque
    expect(reviews.length).equal(1);

    reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app2.appId,
      garage.garageId,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    expect(reviews.length).equal(1);
    expect(reviews[0].comment).equal('my shared comment');
  });
  it('api.reviewsByDate get reviews only from launched garages if appId is not garageScore', async function test() {
    const withheldGarage = await app.addGarage({ status: 'Stopped' });
    const manualLaunchGarage = await app.addGarage({ status: 'RunningManual' });

    await addReview(null, 9, 'comment on RunningAuto garage', [ServiceCategories.MAINTENANCE_CAT_2], true);
    await addReview(
      manualLaunchGarage,
      9,
      'comment on RunningManual garage',
      [ServiceCategories.MAINTENANCE_CAT_2],
      true
    );
    await addReview(withheldGarage, 9, 'comment on Stopped garage', [ServiceCategories.MAINTENANCE_CAT_2], true);

    let reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app1.appId,
      null,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    // Normalement ça devrait être 3 mais comme on a un mécanisme qui ne renvoie qu' 1 review sur 3 on aura qu' 1 resultat dans la query
    expect(reviews.length).equal(1);

    reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app1.appId,
      null,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    // Normalement ça devrait être 2 mais comme on a un mécanisme qui ne renvoie qu' 1 review sur 3 on aura qu' 1 resultat dans la query
    expect(reviews.length).equal(1);

    reviews = await promises.makeAsync(publicApi.reviewsByDate)(
      mockApps.app2.appId,
      null,
      null,
      moment().format('DD'),
      moment().format('MM'),
      moment().format('YYYY'),
      false,
      null,
      null
    );
    expect(reviews.length).equal(1);
    // Normalement ça devrait être 2 mais comme on a un mécanisme qui ne renvoie qu' 1 review sur 3 on aura qu' 1 resultat dans la query
    expect(reviews.map((r) => r.comment)).to.include('comment on RunningAuto garage');
    // .or.to.include('comment on RunningManual garage');
  });

  // ------------------------ API.addReviews ------------------------ //

  it('API.addReviews - Should not update when the review has not changed', async function () {
    const garageFoo = await app.addGarage();
    const fooReviews = [
      {
        id:
          'accounts/105438385188086962790/locations/18236971804710744914/reviews/AIe9_BFhqAtkXvUqdYNeMuBBGjaAhlPLTdVuFqMhmQA6NM0kroZkBn2t2XjYyvi1gitP_ooaEBasCT_CInwNvL8BzZ0kSYqhdQueIWVvxv9yTiVN1PkdWjw',
        score: 4,
        rawScore: 2,
        rawScoreScale: 5,
        recommend: false,
        date: '2013-01-19T15:27:03.854561Z',
        text:
          "Le harcelement publicitaire au téléphone est inssupportable et l' accueil téléphonique\nplus que médiocre ! \nA éviter si on veut garder cette marque !",
        author: 'chantal vaux',
        authorCity: '',
        origin: 'Google',
        replies: [
          {
            id: '',
            text:
              "Bonjour,\nMerci d'avoir pris le temps de rédiger un commentaire suite à votre passage chez Peugeot AZUR. La satisfaction de nos clients est au centre de nos priorités et nous sommes navrés que vous ayez été déçu par notre concession. \nN'hésitez pas à transmettre vos coordonnées à notre service clients : service-client@mpsa.com\nNous nous engageons à vous recontacter dans les meilleurs délais.\nCordialement, \nL'équipe PEUGEOT AZUR",
            author: 'HOPCAR SCP NICE',
            date: '2017-10-24T09:06:35.719938Z',
            isFromOwner: true,
            authorId: '',
            attachment: '',
            replies: [],
          },
        ],
      },
    ];

    let changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(1);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(0);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(1);
  });

  it('API.addReviews - Should should detect correctly when a review changed', async function () {
    const garageFoo = await app.addGarage();
    const fooReviews = [
      {
        id: '1',
        score: 7,
        rawScore: 3.5,
        rawScoreScale: 5,
        recommend: true,
        date: new Date(),
        text: 'Oki goodi',
        author: 'Jesus',
        authorCity: 'Nazareth',
        origin: 'Google',
        replies: [],
      },
      {
        id: '2',
        score: 5,
        rawScore: 2.5,
        rawScoreScale: 5,
        recommend: false,
        date: new Date(),
        text: 'Nopi baddy',
        author: 'Donald',
        authorCity: 'Duck',
        origin: 'Google',
        replies: [
          {
            id: 21,
            text: 'Sorry you feel that way',
            author: 'God Himself',
            date: new Date(),
            isFromOwner: true,
          },
        ],
      },
    ];

    let changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(2);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(0);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(2);

    fooReviews[1].text = 'Nopi baddy doo';

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(1);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(1);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(2);

    fooReviews[1].replies[0].author = 'God NotHimself';

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(1);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(1);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(2);

    const datas = await app.models.Data.find({ garageId: garageFoo.id });

    expect(datas.length, 'datas.length').to.equals(2);
    expect(datas[0].type, 'datas[0].type').to.equals('ExogenousReview');
    expect(datas[1].type, 'datas[1].type').to.equals('ExogenousReview');
    expect(typeof datas[0].source.checksum, 'typeof datas[0].source.checksum').to.equals('string');
    expect(typeof datas[1].source.checksum, 'typeof datas[1].source.checksum').to.equals('string');
  });

  it('API.addReviews - Should should remove a review when it is not sent anymore', async function () {
    const garageFoo = await app.addGarage();
    const fooReviews = [
      {
        id: '666',
        score: 7,
        rawScore: 3.5,
        rawScoreScale: 5,
        recommend: true,
        date: new Date(),
        text: 'Oki goodi',
        author: 'Jesus',
        authorCity: 'Nazareth',
        origin: 'Google',
        replies: [],
      },
      {
        id: '2',
        score: 5,
        rawScore: 2.5,
        rawScoreScale: 5,
        recommend: false,
        date: new Date(),
        text: 'Nopi baddy',
        author: 'Donald',
        authorCity: 'Duck',
        origin: 'Google',
        replies: [
          {
            id: 21,
            text: 'Sorry you feel that way',
            author: 'God Himself',
            date: new Date(),
            isFromOwner: true,
          },
        ],
      },
    ];

    let changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(2);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(0);
    expect(changes.deletedCount, 'changes.deletedCount').to.equals(0);

    fooReviews.splice(1);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviews,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(1);
    expect(changes.deletedCount, 'changes.deletedCount').to.equals(1);

    const datas = await app.models.Data.find({ garageId: garageFoo.id });

    expect(datas.length, 'datas.length').to.equals(1);
    expect(datas[0].type, 'datas[0].type').to.equals('ExogenousReview');
    expect(typeof datas[0].source.checksum, 'typeof datas[0].source.checksum').to.equals('string');
    expect(datas[0].source.sourceId, 'datas[0].source.sourceId').to.equals('666');
  });

  it('API.addReviews - Should not delete other exogenous source', async function () {
    const garageFoo = await app.addGarage();
    const fooReviewsGoogle = [
      {
        id: 'g666',
        score: 7,
        rawScore: 3.5,
        rawScoreScale: 5,
        recommend: true,
        date: new Date(),
        text: 'Oki goodi',
        author: 'Jesus',
        authorCity: 'Nazareth',
        origin: 'Google',
        replies: [],
      },
      {
        id: 'g2',
        score: 5,
        rawScore: 2.5,
        rawScoreScale: 5,
        recommend: false,
        date: new Date(),
        text: 'Nopi baddy',
        author: 'Donald',
        authorCity: 'Duck',
        origin: 'Google',
        replies: [
          {
            id: 21,
            text: 'Sorry you feel that way',
            author: 'God Himself',
            date: new Date(),
            isFromOwner: true,
          },
        ],
      },
    ];
    const fooReviewsFacebook = [
      {
        id: 'f666',
        score: 7,
        rawScore: 3.5,
        rawScoreScale: 5,
        recommend: true,
        date: new Date(),
        text: 'Oki goodif',
        author: 'Jesusf',
        authorCity: 'Nazarethf',
        origin: 'Facebook',
        replies: [],
      },
    ];

    let changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviewsGoogle,
      sourceType: 'Google',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(2);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(0);
    expect(changes.deletedCount, 'changes.deletedCount').to.equals(0);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviewsFacebook,
      sourceType: 'Facebook',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(1);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(0);
    expect(changes.deletedCount, 'changes.deletedCount').to.equals(0);

    changes = await publicApi.addReviews(garageFoo.getId().toString(), {
      reviews: fooReviewsFacebook,
      sourceType: 'Facebook',
      method: 'FULL',
    });

    expect(changes.saved.length, 'changes.saved.length').to.equals(0);
    expect(changes.updated.length, 'changes.updated.length').to.equals(0);
    expect(changes.skipped.length, 'changes.skipped.length').to.equals(1);
    expect(changes.deletedCount, 'changes.deletedCount').to.equals(0);
  });
});
