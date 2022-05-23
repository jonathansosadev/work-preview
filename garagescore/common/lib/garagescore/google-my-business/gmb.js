const googleUtil = require('../../util/google');
const GarageTypes = require('../../../models/garage.type');
const garageStatus = require('../../../models/garage.status');
const i18nRequire = require('../i18n/i18n');

module.exports = class GoogleMyBusinessHelper {
  static generateCertificateTextFromGarage({ locale, publicDisplayName }, scores) {
    const i18n = new i18nRequire('data/gmb', {locale});
    return i18n.$t('title', {
      respondentsCount: scores.respondentsCount,
      garageName: publicDisplayName,
      rating: scores.rating,
    });
  }

  static async generateScoresFromGarage(app, garageId) {
    let publicScores = null;
    let rating = 0;
    let respondentsCount = 0;

    try {
      publicScores = await new Promise((res, rej) =>
        app.models.Garage.findPublicScores(garageId.toString(), null, null, null, true, (e, s) => (e ? rej(e) : res(s)))
      );
      if (publicScores && publicScores.length > 0) {
        publicScores.forEach((publicScore) => {
          rating += publicScore.payload.rating.global.value * publicScore.payload.rating.global.respondentsCount;
          respondentsCount += publicScore.payload.rating.global.respondentsCount;
        });
      }
      if (!respondentsCount) {
        return Promise.reject('No respondents');
      }
      rating = Math.round((10 * rating) / respondentsCount) / 10;
      return Promise.resolve({ rating, respondentsCount });
    } catch (e) {
      return Promise.reject(e.message || JSON.stringify(e));
    }
  }

  static async generateTextAndPostOnGmb(
    app,
    { id, type, slug, publicDisplayName, locale, exogenousReviewsConfigurations },
    wait = false,
    noThrow = true
  ) {
    try {
      const scores = await this.generateScoresFromGarage(app, id);
      const url = `${process.env.WWW_URL}/${GarageTypes.getSlug(type)}/${slug}`;
      const imageUrl = `${process.env.APP_URL}/static/latest/images/gmb/gmb_${scores.rating}.png`;
      const text = this.generateCertificateTextFromGarage({ locale, publicDisplayName }, scores);
      const post = googleUtil.generateGmbPostFromText(text, url, imageUrl);
      const token =
        exogenousReviewsConfigurations &&
        exogenousReviewsConfigurations.Google &&
        exogenousReviewsConfigurations.Google.token;
      const locationId =
        exogenousReviewsConfigurations &&
        exogenousReviewsConfigurations.Google &&
        exogenousReviewsConfigurations.Google.externalId;
      if (wait) {
        await googleUtil.postOnGmb(token, locationId, post);
        return Promise.resolve();
      } else {
        googleUtil
          .postOnGmb(token, locationId, post)
          .then(() => Promise.resolve())
          .catch((e) => Promise.reject(e));
      }
    } catch (e) {
      return Promise[`${noThrow ? 'resolve' : 'reject'}`](e.message || JSON.stringify(e));
    }
  }

  static garageRespectsConditionsToPostOnGmb(garage) {
    const authorizedStatus = [garageStatus.RUNNING_AUTO, garageStatus.RUNNING_MANUAL];

    return (
      garage.postOnGoogleMyBusiness &&
      !garage.hideDirectoryPage &&
      authorizedStatus.includes(garage.status) &&
      garage.exogenousReviewsConfigurations &&
      garage.exogenousReviewsConfigurations.Google &&
      garage.exogenousReviewsConfigurations.Google.externalId &&
      garage.exogenousReviewsConfigurations.Google.token
    );
  }

  static generateLoopbackFindQuery(garageId = null) {
    return {
      where: {
        postOnGoogleMyBusiness: true,
        hideDirectoryPage: false,
        or: [{ status: garageStatus.RUNNING_AUTO }, { status: garageStatus.RUNNING_MANUAL }],
        ...(garageId ? { id: garageId } : {}),
      },
    };
  }
};
