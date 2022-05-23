const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');

const { expect } = chai;
const app = new TestApp();
const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const { ObjectId } = require('mongodb');

describe('Reviews', () => {
  beforeEach(async function () {
    await app.reset();
    await app.models.Garage.create({
      type: 'Dealership',
      slug: 'nc',
      publicDisplayName: 'erep_duplicate',
      securedDisplayName: 'erep_duplicate',
      brandNames: ['Audi'],
      exogenousReviewsConfigurations: {
        Google: {
          connectedBy: 'marketing@oxylio.com',
          error: '',
          token: '1/P03Pp5veOzGyb1nn5cAocuiRuysY6TmtmlPWH9wvgmwBBycvLszBAeg26gKUW9uo',
          externalId: 'accounts/111518281035316778357/locations/4265459932460275560',
          lastError: '2020-07-04T10:03:31.347Z',
          lastRefresh: '2019-08-12T07:31:13.998Z',
          lastFetch: '2020-07-15T02:53:24.736Z',
        },
        PagesJaunes: {
          connectedBy: '',
          error: "[Contexte : SpiderScore / Crawling] : Couldn't find review date for PagesJaunes, parsing error",
          token: 'https://www.pagesjaunes.fr/pros/57388566',
          externalId: 'https://www.pagesjaunes.fr/pros/57388566',
          lastError: '2020-07-15T02:53:26.936Z',
          lastRefresh: '2019-07-01T08:32:04.262Z',
          lastFetch: '2020-07-06T11:08:29.548Z',
        },
        Facebook: {
          connectedBy: '',
          error: '',
          token: '',
          externalId: '',
          lastError: null,
          lastRefresh: null,
          lastFetch: null,
        },
        Allogarage: {
          error: '',
          token: '',
          lastRefresh: null,
        },
      },
      ratingType: 'rating',
      certificateWording: 'appointment',
      hideDirectoryPage: true,
      disableAutoAllowCrawlers: false,
      updateFrequency: 'never',
      status: 'Stopped',
      group: 'Chopard',
      enrichScriptEnabled: false,
      automaticBillingBillNow: false,
      postOnGoogleMyBusiness: true,
      locale: 'fr_FR',
      timezone: 'Europe/Paris',
    });
  });

  it('it should not create duplicate review', async () => {
    const garage = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });
    const user = await app.addUser({
      email: 'plopi@plopa.com',
      allGaragesAlerts: { ExogenousNewReview: true },
      garageIds: [new ObjectId(garage.id.toString())],
    });
    // await user.addGarage(garage);
    // create reviews for test
    const req = {
      body: {
        sourceType: 'Google',
        method: 'FULL',
        reviews: [
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BFLWlqwz3qGBnCfbAsLD0lVZROCZklTPlhIoC4cKuzzq_Y4dEteaXdvjea_WtkzE7q6vaA-c8CFukrtMWtXWXP6Rh6Ks3AjgItqPdrAx-09dAri1bk',
            text: 'service is ok',
          },
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BHAFUK2tNBZL25dLQ0jVdh0sL9afblbJ7FIbUUvTwAbnZGWP1gq4koL8lya3p2j5fy_MAE4ROLFnpRVIUXPOL8Y4lUAKKOrFMVaJ5OTWDxV_mVdr8U',
            text: 'price is expensive',
          },
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BFLWlqwz3qGBnCfbAsLD0lVZROCZklTPlhIoC4cKuzzq_Y4dEteaXdvjea_WtkzE7q6vaA-c8CFukrtMWtXWXP6Rh6Ks3AjgItqPdrAx-09dAri1bk',
            text: "I'm a copy",
          } /*,
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BHAFUK2tNBZL25dLQ0jVdh0sL9afblbJ7FIbUUvTwAbnZGWP1gq4koL8lya3p2j5fy_MAE4ROLFnpRVIUXPOL8Y4lUAKKOrFMVaJ5OTWDxV_mVdr8U',
            text: "I'm a copy",
          },*/,
        ],
      },
    };

    const before = await app.models.Data.find();
    // add reviews
    await gsAPI.addReviews(garage.id, req.body);
    // only 2 reviews should created
    const after = await app.models.Data.find();
    expect(before.length).equal(0);
    expect(after.length).equal(2);
    expect(after[0].source.raw.text).equal('service is ok');
    expect(after[1].source.raw.text).equal('price is expensive');
  });

  it('it should update existing reviews', async () => {
    const garage = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });
    // create reviews for test
    const req = {
      body: {
        sourceType: 'Google',
        method: 'FULL',
        reviews: [
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BFLWlqwz3qGBnCfbAsLD0lVZROCZklTPlhIoC4cKuzzq_Y4dEteaXdvjea_WtkzE7q6vaA-c8CFukrtMWtXWXP6Rh6Ks3AjgItqPdrAx-09dAri1bk',
            text: 'service is ok',
          },
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BHAFUK2tNBZL25dLQ0jVdh0sL9afblbJ7FIbUUvTwAbnZGWP1gq4koL8lya3p2j5fy_MAE4ROLFnpRVIUXPOL8Y4lUAKKOrFMVaJ5OTWDxV_mVdr8U',
            text: 'price is expensive',
          },
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BFLWlqwz3qGBnCfbAsLD0lVZROCZklTPlhIoC4cKuzzq_Y4dEteaXdvjea_WtkzE7q6vaA-c8CFukrtMWtXWXP6Rh6Ks3AjgItqPdrAx-09dAri1bk',
            text: "I'm a copy",
          },
          {
            id:
              'accounts/111518281035316778357/locations/4265459932460275560/reviews/AIe9_BHAFUK2tNBZL25dLQ0jVdh0sL9afblbJ7FIbUUvTwAbnZGWP1gq4koL8lya3p2j5fy_MAE4ROLFnpRVIUXPOL8Y4lUAKKOrFMVaJ5OTWDxV_mVdr8U',
            text: "I'm a copy",
          },
        ],
      },
    };

    const before = await app.models.Data.find();
    await gsAPI.addReviews(garage.id, req.body); // create reviews
    await gsAPI.addReviews(garage.id, req.body); // should update reviews
    await gsAPI.addReviews(garage.id, req.body); // should update reviews
    const after = await app.models.Data.find(); // only 2 reviews should created
    expect(before.length).equal(0);
    expect(after.length).equal(2);
  });

  it('it should empty the error field and update lastFetch', async () => {
    const garage = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });
    const req = {
      body: {
        sourceType: 'PagesJaunes',
        spider: true,
        method: 'FULL',
        reviews: [
          {
            id: '5d23375d84037d000158ecb7',
            score: 2,
            rawScore: '1',
            rawScoreScale: 5,
            recommend: true,
            date: '2019-07-8T00:00:00',
            text:
              'Qualité de travail qui laisse a désirer quand au résultat.  A savoir il reste un voile sur les retouches réalisés, mais ils ne veulent pas en entendre parler',
            author: 'Profil924991',
            authorCity: 'Pontarlier',
            origin: 'PagesJaunes',
            replies: [
              {
                id: '',
                text:
                  "Bonjour, nous sommes étonnés par votre commentaire car nous restons à l'écoute de nos clients en cas d'insatisfaction. Nous vous proposons de nous recontacter pour que nous puissions réintervenir sur votre véhicule, si le travail effectué n'est pas conforme. \nDans l'attente de vous revoir, \nBien cordialement,\nLinda MARGUIER, responsable de l'entreprise.",
                author: '',
                date: '2019-07-10T00:00:00',
                isFromOwner: true,
                authorId: '',
                attachment: '',
                replies: [],
              },
            ],
          },
          {
            id: '596cba055135dc7477c6a1e0',
            score: 8,
            rawScore: '4',
            rawScoreScale: 5,
            recommend: true,
            date: '2017-07-17T00:00:00',
            text:
              "Super carrosserie. j'avais un pare brise à changer il prête un véhicule pour la journée et s'occupe très bien de la notre. seul petit bémol: il ne sont plus en partenariat avec notre assurance. il font le dossier auprès de notre assurance et il faut les payer. mais ils sont très très compréhensif , en fesant un chèque, ils attendent pour l'encaissement que notre assurance nous ai rembourser donc génial.",
            author: 'Choupette',
            authorCity: "Longevilles Mont d'Or",
            origin: 'PagesJaunes',
            replies: [],
          },
          {
            id: '5667c8bbd1db7e18d3f83ea0',
            score: 2,
            rawScore: '1',
            rawScoreScale: 5,
            recommend: true,
            date: '2015-11-17T00:00:00',
            text:
              "Très très dessus pour cette carrosserie qui se vend être à la pointe du service et des prestations.\n\nrécupère véhicule abimé. pièces réparées loin d'être parfaite. \nResponsable de mauvaise fois.\n\nOn comprend mieux pourquoi les concessionnaires du coin ne fond pas appelle à eux mais préfère payer le déplacement de carrossiers à plus de 60km.\n\nSi vous êtes exigeant ou soigneux, passez votre chemin. Si vous ne l'êtes pas, sachez que vous ne paierez pas moins cher chez eux.\n\nPlus jamais !!!!",
            author: 'JeanJ25',
            authorCity: '',
            origin: 'PagesJaunes',
            replies: [],
          },
        ],
      },
    };
    await gsAPI.addReviews(garage.id, req.body);
    const {
      exogenousReviewsConfigurations: {
        PagesJaunes: { error, lastFetch },
      },
    } = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });

    // lastFetch should have been updated
    expect(new Date().getTime() - lastFetch.getTime()).to.be.lessThan(1000);
    // error should have been emptied
    expect(error).to.be.empty;
  });

  it('empty reviews : it should empty the error field and update lastFetch', async () => {
    const garage = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });
    const req = {
      body: {
        sourceType: 'PagesJaunes',
        spider: true,
        method: 'FULL',
        reviews: [],
      },
    };
    await gsAPI.addReviews(garage.id, req.body);
    const {
      exogenousReviewsConfigurations: {
        PagesJaunes: { error, lastFetch },
      },
    } = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });

    // lastFetch should have been updated
    expect(new Date().getTime() - lastFetch.getTime()).to.be.lessThan(1000);
    // error should have been emptied
    expect(error).to.be.empty;
  });

  it('in case of a crawling error, it should only update the error field and the lastError field', async () => {
    const {
      id,
      exogenousReviewsConfigurations: {
        PagesJaunes: { error: original_error, lastFetch: original_lastFetch, lastError: original_lastError },
      },
    } = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });
    const errorMessage = '[Contexte : SpiderScore / Crawling] : Incorrect proId for PagesJaunes';
    const params = {
      message: errorMessage,
      sourceType: 'PagesJaunes',
    };

    //send error
    await gsAPI.signalExogenousReviewError(null, id, params);

    const {
      exogenousReviewsConfigurations: {
        PagesJaunes: { error, lastFetch, lastError },
      },
    } = await app.models.Garage.findOne({ publicDisplayName: 'erep_duplicate' });

    // lastError should have been updated
    expect(new Date().getTime() - lastError.getTime()).to.be.lessThan(1000);
    expect(lastError).to.not.equal(original_lastError);

    //error should have been updated
    expect(error).to.not.equal(original_error);
    expect(error).to.be.equal(errorMessage);

    //lastFetch should not have been updated
    expect(lastFetch).to.be.deep.equal(original_lastFetch);
  });
});
