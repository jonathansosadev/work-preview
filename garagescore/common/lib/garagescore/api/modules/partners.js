const debug = require('debug')('garagescore:common:lib:garagescore:api:modules:partners'); // eslint-disable-line max-len,no-unused-vars
const garageStatus = require('../../../../../common/models/garage.status.js');
const { routesPermissions } = require('../route-permissions');
const { UnauthorizedError } = require('../apiErrors');
/**
API methods for yellow pages and others partners
**/

/* eslint-disable no-param-reassign */
module.exports = (API, app, _hasAccess) => {
  function _lintGarage(g) {
    return {
      id: g.id,
      businessId: g.businessId,
      securedDisplayName: g.securedDisplayName,
      publicDisplayName: g.publicDisplayName,
      streetAddress: g.streetAddress,
      postalCode: g.postalCode,
      city: g.city,
      phone: g.phone,
    };
  }
  // return all review shared or not between tow dates
  const _reviewsByShareDate = async function _reviewsByShareDate(minShareDate, maxShareDate, isSharedWithPartners) {
    const where = {};
    where.and = [];
    where.and.push({ 'updatedAt': { gte: minShareDate } });
    where.and.push({ 'updatedAt': { lte: maxShareDate } });
    where.shouldSurfaceInStatistics = true;
    where['review.shareWithPartners'] = isSharedWithPartners;
    return await app.models.Data.find({ where });
  };

  /** garages with shareReviews: true and still plugged */
  const sharedReviewsGarages = async (appId, country) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.SHARED_REVIEWS, null);

    if (authErr) {
      throw authErr
    }

    const res = [];
    const where = {};
    where.and = [];
    if (country) {
      where.and.push({ locale: { inq: country } });
    }
    where.and.push({ shareReviews: true });
    where.and.push({ status: { inq: [garageStatus.RUNNING_AUTO, garageStatus.RUNNING_MANUAL] } });
    try {
      const garages = await app.models.Garage.find({ where });
      garages.forEach((g) => {
        res.push(_lintGarage(g));
      });
      return res
    } catch (err) {
      throw err
    }


  };
  /** reviews to delete because their garage don't share theirs reviews anymore */
  const sharedReviewsAllGarageReviewsToDelete = async (appId, minDate, maxDate, country) => {
    const { authErr, allGaragesAuthorized } = await _hasAccess(appId, routesPermissions.SHARED_REVIEWS, null);

    if (authErr) {
      throw authErr;
    }
    if (!allGaragesAuthorized) {
      throw new Error("You can't access to this resource.");

    }

    const whereGarages = {};
    whereGarages.or = [];
    whereGarages.or.push({ shareReviews: false });
    whereGarages.or.push({ status: { inq: [garageStatus.RUNNING_AUTO, garageStatus.RUNNING_MANUAL] } });
    whereGarages.and = [];
    if (country) {
      whereGarages.and.push({ locale: { inq: country } });
    }
    whereGarages.and.push({ stopShareReviewsAt: { gte: minDate } });
    whereGarages.and.push({ stopShareReviewsAt: { lte: maxDate } });
    try {
      return await app.models.Garage.find({ where: whereGarages });
    } catch (err) {
      throw err
    }
  };
  /** reviews to delete because thy have been moderated */
  const sharedReviewsModeratedReviewsToDelete = async (appId, minDate, maxDate) => {
    const { authErr } = await _hasAccess(appId, routesPermissions.SHARED_REVIEWS, null);

    if (authErr) {
      throw authErr;
    }
    try {
      return _reviewsByShareDate(minDate, maxDate, false);
    } catch (err) {
      throw err
    }

  };


  API.sharedReviewsGarages = sharedReviewsGarages;
  API.sharedReviewsAllGarageReviewsToDelete = sharedReviewsAllGarageReviewsToDelete;
  API.sharedReviewsModeratedReviewsToDelete = sharedReviewsModeratedReviewsToDelete;
};
