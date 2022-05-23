const GarageGlobalData = require('../api/modules/garage/GarageGlobalData');
const GarageReviews = require('../api/modules/garage/GarageReviews');
const GarageScores = require('../api/modules/garage/GarageScores');
const KpiPeriods = require('../kpi/KpiPeriods');
const KpiDictionary = require('../kpi/KpiDictionary');
const KpiTypes = require('../../../models/kpi-type');
const moderationStatus = require('../../../models/data/type/moderation-status');
const GarageTypes = require('../../../../common/models/garage.type.js');
const moment = require('moment');
const sizeof = require('object-sizeof');
const lru = require('lru-cache');

const _slugPerPath = {
  garage: 'garage',
  garaje: 'garage',
  'controle-technique': 'controle-technique',
  'inspeccion-tecnica': 'controle-technique',
  'inspeccio-tecnica  ': 'controle-technique',
};

module.exports = class CertificateBuilder {
  // /////////////////////////////////////////////////
  // /                INITIALIZATION               ///
  // /////////////////////////////////////////////////

  /**
   * Build the instance
   * @param app your expressJs main app thing
   * @param withCache do you want us to build and handle cache ?
   * @constructor
   */
  constructor(app, withCache = true) {
    this._app = app;
    const options = {
      max: 100,
      maxAge: 60 * 60 * 1000,
    };
    this._CACHE_ = lru(options);
    if (withCache) {
      this._buildCache();
    }
  }

  // /////////////////////////////////////////////////
  // /                PUBLIC METHODS               ///
  // /////////////////////////////////////////////////

  /**
   * Take a garage slug and a vue-router route object and return the context of the certificate
   * @param garageSlug
   * @param route
   * @returns {Promise<{garage: *, reviews: *, scores: *, selectedServiceType: string}>}
   * @public
   */
  async BuildContext(garageSlug, route, nocache) {
    const dataContext = await this._buildDataContext(garageSlug, nocache);
    const garage = dataContext.garage;
    if (_slugPerPath[route.path.split('/')[1]] !== GarageTypes.getSlug(garage.type)) {
      throw new Error(
        `Garage slug type '${GarageTypes.getSlug(garage.type)}' doesn't match route.path '${route.path}'.split('/')[1]`
      );
    }
    const reviews = dataContext.reviews;
    const scores = dataContext.scores;
    const selectedServiceType = this._getSelectedServiceType(route, garage);
    return { garage, reviews, scores, selectedServiceType };
  }

  /**
   * Take a garage slug a type, a pageNumber and a reviewsPerPage and return the corresponding reviews
   * @param garageSlug
   * @param type Maintenance, UsedVehicleSale, NewVehicleSale, VehicleInspection
   * @param pageNumber the desired page
   * @params reviewsPerPage you already know this one
   * @returns [] Array of reviews
   * @public
   */
  async FetchReviewsForTypeAndPage(garageSlug, type, pageNumber, reviewsPerPage) {
    const skip = pageNumber && pageNumber > 1 ? (pageNumber - 1) * reviewsPerPage : 0;
    const limit = reviewsPerPage || 150;
    const garage = await GarageGlobalData.garageFromSlug(this._app, garageSlug);
    return this._cleanReviews(
      await GarageReviews.getGarageReviews(this._app, null, garage.id, garage.type, type, limit, skip, true)
    );
  }

  // /////////////////////////////////////////////////
  // /               PRIVATE METHODS               ///
  // /////////////////////////////////////////////////

  async _fetchTopGarageIds() {
    return this._app.models.KpiByPeriod.getMongoConnector()
      .find(
        {
          [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
          [KpiDictionary.period]: KpiPeriods.LAST_90_DAYS,
        },
        {
          projection: {
            [KpiDictionary.garageId]: true,
            [KpiDictionary.contactsCountSurveysResponded]: true,
          },
          limit: 100,
          sort: {
            [KpiDictionary.contactsCountSurveysResponded]: -1,
          },
        }
      )
      .toArray();
  }

  /**
   * Build cache for the garages with the most reviews
   * @returns {Promise<void>}
   * @private
   */
  async _buildCache() {
    const topGaragesIds = await this._fetchTopGarageIds();

    // get garages from topGaragesIds with theur index data
    let garages = await this._app.models.Garage.getMongoConnector()
      .find(
        {
          _id: { $in: topGaragesIds.map((t) => t[KpiDictionary.garageId]) },
        },
        {
          projection: {
            _id: true,
            slug: true,
            hideDirectoryPage: true,
          },
        }
      )
      .toArray();

    const startTime = new Date().getTime();
    let nk = 0;
    garages = garages.filter((g) => !g.hideDirectoryPage);
    console.log(`\n[CERTIFICATE] Starting building cache, ${garages.length} garages to process`);

    for (const garage of garages) {
      // TODO: Replace null by the req param
      this._CACHE_.set(garage.slug, await this._buildDataContext(garage.slug, true));
      nk++;
      if (nk === 1 || nk % 50 === 0 || nk === garages.length) {
        console.log(`[CERTIFICATE] ## Building cache ${nk}/${garages.length}`);
        console.log(
          `[CERTIFICATE] ## Size: ${Math.round((sizeof(this._CACHE_) / (1024 * 1024)) * 10) / 10} Mo for ${nk} garages`
        );
      }
      await this._sleep(100); // going easy with the db
    }
    console.log(`[CERTIFICATE] Finished building cache in ${new Date().getTime() - startTime} milliseconds !`);
  }

  /**
   * Little helper function, so we can pause the execution a given time.
   * Maybe we should put those kind of function in an external library?
   * @param ms your time in ms
   * @returns {Promise<any>}
   * @private
   */
  async _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * This is kinda the main function, it returns most of the context you need to render your certificate
   * @param garageSlug slug of the garage
   * @param noCache are we allowed to pick the context from the cache ?
   * @returns {Promise<*>}
   * @private
   */
  async _buildDataContext(garageSlug, noCache = false) {
    if (this._CACHE_.has(garageSlug) && !noCache) {
      // console.log(`[CERTIFICATE] ## Garage ${garageSlug} found in cache.`);
      return this._CACHE_.peek(garageSlug);
    }
    const garage = await GarageGlobalData.garageFromSlug(this._app, garageSlug);
    const reviews = this._cleanReviews(
      await GarageReviews.getGarageReviews(this._app, null, garage.id, garage.type, null, 150, 0, true)
    );
    const scores = this._cleanScores(await GarageScores.getGarageScores(this._app, garage.id));
    const reviewsAndScores = await Promise.all([reviews, scores]);

    this._CACHE_.set(garageSlug, { garage, reviews: reviewsAndScores[0], scores: reviewsAndScores[1] });
    return this._CACHE_.peek(garageSlug);
  }

  /**
   * We get the reviews from the GsAPI but we might need some modification for the certificate
   * @param publicReviews the publicReiews returned by our api
   * @returns {Promise<Array>}
   * @private
   */
  async _cleanReviews(publicReviews) {
    const cleanedReviews = [];

    for (const publicReview of publicReviews) {
      if (publicReview.score || publicReview.score === 0) {
        publicReview.score_fr = String(publicReview.score).replace('.', ',');
        publicReview.displayDate = publicReview.submittedAt
          ? `le ${moment(publicReview.submittedAt).locale('fr').format('D MMM YYYY')}`
          : '';
        publicReview.submittedAt_time = moment(publicReview.submittedAt).locale('fr').unix() * 1000;
        publicReview.metaDate = publicReview.submittedAt ? moment(publicReview.submittedAt).format('YYYY-MM-DD') : '';
        publicReview.rating_scale = Math.floor(publicReview.score);
        this.__cleanReviewReply(publicReview);
        cleanedReviews.push(publicReview);
      }
    }
    return cleanedReviews;
  }

  __cleanReviewReply(publicReview) {
    const comments = publicReview.publicComments;
    const comment = comments && comments.length > 0 ? comments[0] : null;

    if (comment && comment.status === moderationStatus.APPROVED) {
      publicReview.reply = {
        author:
          comment.authorPublicDisplayName === '[owner]'
            ? "Réponse de l'établissement"
            : comment.authorPublicDisplayName,
        comment: comment.body,
        date: moment(comment.createdAt).locale('fr').format('D MMM YYYY'),
      };
    }
  }

  /**
   * We get the scores from the GsAPI but we might need some modification for the certificate
   * @param scores the scores returned by our api
   * @returns {Promise<*>}
   * @private
   */
  async _cleanScores(scores) {
    if (scores) {
      for (const t of Object.keys(scores.scores)) {
        if (scores.scores[t] && scores.scores[t].byValue) {
          scores.scores[t].byValue.forEach(function (cat) {
            cat.width = cat.value;
            cat.scale = 10;
          });
        }
        if (scores.scores[t] && scores.scores[t].byVehicleMake) {
          scores.scores[t].byVehicleMake.forEach(function (cat) {
            cat.width = 10 * cat.value;
            cat.scale = Math.round(cat.value);
            cat.value = (Math.floor(cat.value * 10) / 10).toFixed(1);
            if (cat.value[cat.value.length - 1] === '0') {
              cat.value = cat.value.substring(0, cat.value.length - 2);
            }
          });
        }
        if (scores.scores[t] && scores.scores[t].formattedByItemRatings) {
          scores.scores[t].formattedByItemRatings.forEach(function (cat) {
            cat.width = 10 * cat.value;
            cat.scale = Math.round(cat.value);
            cat.value = (Math.floor(cat.value * 10) / 10).toFixed(1);
            if (cat.value[cat.value.length - 1] === '0') {
              cat.value = cat.value.substring(0, cat.value.length - 2);
            }
          });
        }
        if (scores.scores[t] && scores.scores[t].byAbbreviatedCategoryLabel) {
          scores.scores[t].byAbbreviatedCategoryLabel.forEach(function (cat) {
            cat.width = 10 * cat.value;
            cat.scale = Math.round(cat.value);
            cat.value = (Math.floor(cat.value * 10) / 10).toFixed(1);
            if (cat.value[cat.value.length - 1] === '0') {
              cat.value = cat.value.substring(0, cat.value.length - 2);
            }
          });
        }
      }
    }
    return scores;
  }

  /**
   * This is to handle the tab inside link (foo.bar?tab=baz) USED BY LA-CENTRALE
   * @param route the vue-router object
   * @param garage you know it
   * @returns {string}
   * @private
   */
  _getSelectedServiceType(route, garage) {
    const desiredService = route.query && route.query.service;
    let desiredServiceExists = false;
    let result = 'Maintenance';

    if (desiredService === 'apv' && garage.Maintenance) {
      result = 'Maintenance';
      desiredServiceExists = true;
    } else if (desiredService === 'vn' && garage.NewVehicleSale) {
      result = 'NewVehicleSale';
      desiredServiceExists = true;
    } else if (desiredService === 'vo' && garage.UsedVehicleSale) {
      result = 'UsedVehicleSale';
      desiredServiceExists = true;
    }
    if (!desiredServiceExists) {
      if (garage.Maintenance) {
        result = 'Maintenance';
      } else if (garage.NewVehicleSale) {
        result = 'NewVehicleSale';
      } else {
        result = 'UsedVehicleSale';
      }
    }
    return result;
  }
};
