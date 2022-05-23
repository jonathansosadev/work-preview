const GsApiInterface = require('./GsApiInterface');
const moderationStatus = require('../../../../../models/data/type/moderation-status');
const unsatisfiedFollowupStatus = require('../../../../../models/data/type/unsatisfied-followup-status');
const GarageTypes = require('../../../../../../common/models/garage.type.js');

module.exports = class GarageReviews extends GsApiInterface {
  static async getGarageReviews(app, appId, garageId, garageType, type, limit, skip, fromCertificate = false) {
    const access = this.$hasAccess(appId, garageId);
    const query = this._buildQuery(access, garageId, garageType, type, limit, skip);
    const rawDatas = await this._fetchGarageReviews(app, query);

    return this._prepareReviewsForPublic(rawDatas, fromCertificate);
  }

  /** ***********************************************/
  /**               PRIVATE METHODS                **/
  /** ***********************************************/

  static _buildQuery(access, garageId, garageType, type, limit, skip) {
    const query = { where: {}, order: 'review.createdAt DESC', limit, skip };

    query.where['review.comment.status'] = moderationStatus.APPROVED;
    query.where.shouldSurfaceInStatistics = true;
    if (garageId) {
      query.where.garageId = garageId.toString();
    } else if (access.authorizedGarages && access.authorizedGarages.length > 1) {
      query.where.or = access.authorizedGarages.map((gId) => ({ garageId: gId }));
    } else if (access.authorizedGarages) {
      query.where.garageId = access.authorizedGarages[0].garageId;
    }
    if (type) query.where.type = type;
    else if (garageType) query.where.type = GarageTypes.getCorrespondingDataTypeQuery(garageType);
    return this.__buildQueryFields(query);
  }

  static __buildQueryFields(query) {
    query.fields = {
      id: true,
      garageId: true,
      type: true,
      review: true, // Would be cool if we could only select sub-object
      service: true,
      customer: true,
      vehicle: true,
      unsatisfied: true,
    };
    return query;
  }

  static async _fetchGarageReviews(app, query) {
    return new Promise((resolve, reject) => app.models.Data.find(query, (e, d) => (e ? reject(e) : resolve(d))));
  }

  static _prepareReviewsForPublic(rawDatas, fromCertificate) {
    const publicReviews = [];

    for (const rawData of rawDatas) {
      const publicReview = this.__prepareReviewsSimpleFields(rawData, fromCertificate);
      this.__prepareReviewTransactionName(publicReview, rawData);
      this.__prepareReviewScores(publicReview, rawData);
      publicReviews.push(publicReview);
    }
    return publicReviews;
  }

  static __prepareReviewsSimpleFields(rawData, skipAuthorCityNormalizedName = false) {
    return {
      id: rawData.id,
      garageId: rawData.garageId,
      createdAt: rawData.get('review.createdAt'),
      type: rawData.type,
      authorPublicDisplayName: rawData.customer_getCustomerPublicDisplayName(),
      score: rawData.get('review.rating.value'),
      comment: rawData.get('review.comment.text'),
      submittedAt: rawData.get('review.createdAt'),
      providedCustomerId: rawData.get('service.frontDeskCustomerId'),
      providedGarageId: rawData.get('service.frontDeskGarageId'),
      completedAt: rawData.get('service.providedAt'),
      authorCityPublicDisplayName: rawData.get('customer.city.value'),
      vehicleMakePublicDisplayName: rawData.get('vehicle.make'),
      vehicleModelPublicDisplayName: rawData.get('vehicle.model'),
      reply: rawData.get('review.reply'),
      moderation: rawData.get('review.comment.moderated'),
      followupRespondedAt: rawData.get('unsatisfied.detectedAt'),
      followupUnsatisfiedStatus:
        rawData.get('unsatisfied.detectedAt') &&
        rawData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.RESOLVED,
      shareWithPartners: rawData.get('review.shareWithPartners') || false,
      sharedWithPartnersAt: rawData.get('review.sharedWithPartnersAt') || null,
      authorCityNormalizedName: !skipAuthorCityNormalizedName ? rawData.customer_getCityNormalizedName() : '',
    };
  }

  static __prepareReviewTransactionName(publicReview, rawData) {
    let categories = rawData.get('service.categories') || [];

    if (!Array.isArray(categories)) {
      categories = categories.split(','); // Hacky Loopbacky Bugy
    }
    publicReview.transactionPublicDisplayName = categories;
  }

  static __prepareReviewScores(publicReview, rawData) {
    const subRatings = rawData.get('review.subRatings') || [];

    publicReview.scoreByItems = {};
    for (const subRating of subRatings) {
      publicReview.scoreByItems[subRating.label] = subRating.value;
    }
  }
};
