const _ = require('underscore');
const async = require('async');
const moment = require('moment');
const { ObjectId } = require('mongodb');

const { routesPermissions } = require('../route-permissions');
const { ServiceCategories } = require('../../../../../frontend/utils/enumV2');
const moderationStatus = require('../../../../models/data/type/moderation-status');
const unsatisfiedFollowupStatus = require('../../../../models/data/type/unsatisfied-followup-status');
const subratingLabels = require('../../../../models/data/type/subrating-labels');
const gsPublicScoreType = require('../../../../models/public-score.type');
const GarageTypes = require('../../../../models/garage.type.js');
const garageStatuses = require('../../../../models/garage.status');
const I18nRequire = require('../../i18n/i18n');

const gsClient = require('../../client');
const gsLogos = require('../../garage/logo');
const largestRemainder = require('../../../util/largest-remainder');
const { UnauthorizedError, NotFoundError, BadRequestError, ServerError } = require('../apiErrors');

/**
API methods used in the certificate, the widget
**/

/* eslint-disable no-param-reassign */
/* eslint-disable no-mixed-operators */
/* eslint-disable func-names */

module.exports = (API, app, _hasAccess) => {
  // Fields that are used in the function below : _garagePublicData
  const _garagePublicDataFields = {
    status: true,
    hideDirectoryPage: true,
    id: true,
    type: true,
    publicDisplayName: true,
    group: true,
    locale: true,
    streetAddress: true,
    city: true,
    postalCode: true,
    region: true,
    businessId: true,
    subregion: true,
    latitude: true,
    longitude: true,
    links: true,
    logoDirectoryPage: true,
    brandNames: true,
    slug: true,
    googleOpeningHours: true,
    phone: true,
    googleWebsiteUrl: true,
    securedDisplayName: true,
    shareReviews: true,
    stopShareReviewsAt: true,
    lastPostOnGoogleMyBusinessAt: true,
    certificateWording: true,
    ratingType: true,
  };
  const _garagePublicData = async (g, fromGroup) => {
    if (fromGroup && (!g.isRunning() || g.hideDirectoryPage)) {
      return { ignore: true };
    }
    try {
      const publicScores = await app.models.Garage.findPublicScores(g.getId().toString(), null, null, null, true);

      const res = {};
      res.respondentsCount = 0;
      res.garageId = g.getId().toString();
      res.rating = 0;
      if (publicScores && publicScores.length > 0) {
        publicScores.map((publicScore) => {
          const rating = publicScore.payload.rating.global;
          const type = publicScore.type;
          res.rating += rating.value * rating.respondentsCount;
          res.respondentsCount += rating.respondentsCount;
          res[type] = {
            rating: Math.round(rating.value * 10) / 10,
            respondentsCount: rating.respondentsCount,
          };
          if (g.ratingType === 'stars' && g.type === GarageTypes.VEHICLE_INSPECTION) {
            res[type].rating /= 2;
          }
          return null;
        });
        res.rating = Math.round((10 * res.rating) / res.respondentsCount) / 10;
        if (g.ratingType === 'stars' && g.type === GarageTypes.VEHICLE_INSPECTION) {
          res.rating /= 2;
        }
      }
      res.type = g.type;
      res.name = g.publicDisplayName;
      res.group = g.group;
      res.locale = g.locale;
      res.streetAddress = g.streetAddress;
      res.city = g.city;
      res.postalCode = g.postalCode;
      res.region = g.region;
      res.subRegion = g.subRegion;
      res.businessId = g.businessId;
      res.latitude = g.googlePlace && g.googlePlace.latitude;
      res.longitude = g.googlePlace && g.googlePlace.longitude;
      if (g.links) {
        g.links.forEach((link) => {
          if (link.name === 'appointment') {
            res.urlAppointment = link.url;
          }
          if (link.name === 'contact') {
            res.urlContact = link.url;
          }
        });
      }
      res.brandLogos = g.logoDirectoryPage
        ? g.logoDirectoryPage.map((logo) => gsClient.latestStaticUrl(gsLogos.getLogoPath(logo)))
        : g.brandNames.map((brandLogo) => gsClient.latestStaticUrl(gsLogos.brandLogo(brandLogo)));
      res.brandNames = g.brandNames;
      res.networkTypeDisplayName = g.type; // networkTypeDisplayName is a legacy field
      res.url = `${process.env.WWW_URL}/${GarageTypes.getSlug(g.type)}/${g.slug}`;
      res.noIndex = g.hideDirectoryPage;
      res.openingHours = (g.googlePlace && g.googlePlace.openingHours) || null;
      res.phone = g.phone || null;
      res.links = g.links || null;
      res.googleWebsiteUrl = (g.googlePlace && g.googlePlace.website) || null;
      // the following fields where return from the function 'sharedGarages' without duplication
      res.id = g.id;
      res.securedDisplayName = g.securedDisplayName;
      res.shareReviews = g.shareReviews;
      res.stopShareReviewsAt = g.stopShareReviewsAt;
      res.lastPostOnGoogleMyBusinessAt = g.lastPostOnGoogleMyBusinessAt;
      res.certificateWording = g.certificateWording;
      return res;
    } catch (err) {
      throw new ServerError(err.message);
    }
  };
  const getGarageFilter = (appId, garageId, allGaragesAuthorized, withheldGarageData, auths, runningGarages) => {
    if (allGaragesAuthorized !== true) {
      if (garageId && (withheldGarageData || runningGarages.includes(garageId))) {
        return garageId;
      } else if (auths && auths.length > 0 && withheldGarageData) {
        return { $in: auths };
      } else if (auths && auths.length > 0 && !withheldGarageData) {
        return { $in: _.intersection(auths, runningGarages) };
      } else if (auths && auths.length === 0) {
        return new UnauthorizedError(`App ${appId} has no authorized garages`);
      }
    } else if (!withheldGarageData) {
      if (!garageId) {
        return { $in: runningGarages };
      } else if (runningGarages.includes(garageId)) {
        return garageId;
      }
      return new UnauthorizedError('Not authorized to withheld garages');
    } else if (garageId) {
      return garageId;
    }
  };

  /** get one garage from where query */
  const _garageSearch = async (appId, where) => {
    const {
      authErr,
      auths,
      allGaragesAuthorized,
      withheldGarageData,
      nonIndexedGarages,
      garageTypesAuthorized,
    } = await _hasAccess(appId, routesPermissions.GARAGES, null);
    if (authErr) {
      throw authErr;
    }
    const q = { where };

    if (!withheldGarageData) {
      q.where = q.where || {};
      q.where.status = {
        inq: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL],
      };
    }
    if (!allGaragesAuthorized) {
      q.where.id = { inq: Array.isArray(auths) ? auths : [] };
    }
    try {
      const g = await app.models.Garage.findOne(q);

      if (!g || (g.hideDirectoryPage && !nonIndexedGarages)) {
        //console.log(`No garage found with ${JSON.stringify(q)}`);
        throw new NotFoundError(`No garage found with ${JSON.stringify(where)}`);
      }
      // Not authorized to see this type of garages
      if (garageTypesAuthorized && garageTypesAuthorized.length && !garageTypesAuthorized.includes(g.type)) {
        throw new UnauthorizedError(`Not authorized to garage ${g.id}`);
      }
      return await _garagePublicData(g);
    } catch (e) {
      throw e;
    }
  };

  /** get garages from where query paged or not */
  /** This method is not used, it looks like it has been deprecated */
  const _garagesSearch = async (appId, where, afterGarageId, limit) => {
    try {
      const { authErr, withheldGarageData, garageTypesAuthorized } = await _hasAccess(
        appId,
        routesPermissions.GARAGES,
        null
      );

      if (authErr) {
        throw authErr;
      }

      if (!limit) {
        limit = 10000;
      }
      const q = { where };
      let buildQuery = async () => q;

      if (afterGarageId) {
        buildQuery = async (cb) => {
          const g = await app.models.Garage.findById(afterGarageId);

          if (g) {
            q.where.createdAt = { gt: g.createdAt };
          }
          return q;
        };
      }
      const query = await buildQuery();

      query.limit = parseInt(limit, 10);
      if (!withheldGarageData) {
        query.where = query.where || {};
        query.where.status = {
          inq: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL],
        };
      }
      if (garageTypesAuthorized && garageTypesAuthorized.length) {
        query.where.type = { inq: garageTypesAuthorized };
      }
      const gs = await app.models.Garage.find(query);

      const res = [];

      for (g of gs) {
        const d = await _garagePublicData(g);
        res.push(d);
      }
      return res;
    } catch (e) {
      throw e;
    }
  };

  /** Global data and ratings about a garage */
  const _garage = async (appId, garageId, withoutPublicData, fromGroup) => {
    const {
      authErr,
      auths,
      allGaragesAuthorized,
      withheldGarageData,
      nonIndexedGarages,
      garageTypesAuthorized,
    } = await _hasAccess(appId, routesPermissions.GARAGES, garageId);

    if (authErr) {
      throw authErr;
    }

    if (!allGaragesAuthorized && !auths.map((gId) => gId.toString()).includes(garageId)) {
      throw new UnauthorizedError(`Cannot access garage ${garageId}`);
    }

    const query = {};
    try {
      const g = await app.models.Garage.findById(garageId, query);
      if (!g) {
        throw new NotFoundError(`No garage found for garageId ${garageId}`);
      }
      // Garage is not launched and as the requester isn't GarageScore, we're not allowed to get this garage
      const runningStatuses = [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL, garageStatuses.EREP_ONLY];
      if (!withheldGarageData && !runningStatuses.includes(g.status)) {
        throw new UnauthorizedError(`Not authorized to withheld garage ${garageId}`);
      }
      // Garage is not indexed
      if (!nonIndexedGarages && g.hideDirectoryPage) {
        throw new UnauthorizedError(`Not authorized to non indexed garage ${garageId}`);
      }
      // Not authorized to see this type of garages
      if (garageTypesAuthorized && garageTypesAuthorized.length && !garageTypesAuthorized.includes(g.type)) {
        throw new UnauthorizedError(`Not authorized to garage ${garageId}`);
      }
      if (withoutPublicData) {
        return g;
      }
      return await _garagePublicData(g, fromGroup);
    } catch (err) {
      throw err;
    }
  };
  /** Global data and ratings about all our garages paged or not */
  const _garages = async (appId, afterGarageId, limit) => {
    const {
      authErr,
      auths,
      allGaragesAuthorized,
      withheldGarageData,
      nonIndexedGarages,
      garageTypesAuthorized,
    } = await _hasAccess(appId, routesPermissions.GARAGES, null);
    if (authErr) {
      throw authErr;
    }
    let buildQuery = () => ({});

    if (afterGarageId) {
      buildQuery = async () => {
        const g = await app.models.Garage.findById(afterGarageId);
        if (!g) {
          throw new NotFoundError('No data for after parameter');
        }
        return { where: { createdAt: { gt: g.createdAt } } };
      };
    }
    try {
      const query = await buildQuery();

      // Preparing where clause
      const whereStatus = !withheldGarageData
        ? {
            status: {
              inq: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL],
            },
          }
        : {};
      const whereIds = !allGaragesAuthorized ? { id: { inq: Array.isArray(auths) ? auths : [] } } : {};
      const whereIndexation = !nonIndexedGarages ? { hideDirectoryPage: { neq: true } } : {};
      const where = {
        ...whereStatus,
        ...whereIds,
        ...whereIndexation,
        ...(query.where || {}), // That handles the after param if there's
      };

      if (garageTypesAuthorized && garageTypesAuthorized.length) {
        where.type = { inq: garageTypesAuthorized };
      }

      // Selecting fields (cf. _garagePublicData)
      const fields = _garagePublicDataFields;
      // Launch the query
      const garages = await app.models.Garage.find({ limit, where, fields });

      const res = [];

      for (garage of garages) {
        const garageData = await _garagePublicData(garage);
        res.push(garageData);
        console.log(res.length);
      }
      return res;
    } catch (e) {
      throw e;
    }
  };

  // group helpers
  const _cumulGaragesResults = async (remaining, garageIds, cumul) => {
    if (remaining) {
      try {
        const resultGarage = await _garage(null, garageIds[remaining - 1], false, true);
        if (resultGarage && !resultGarage.ignore) {
          cumul.push(resultGarage);
        }

        await _cumulGaragesResults(remaining - 1, garageIds, cumul);
      } catch (e) {
        throw e;
      }
    } else {
      return cumul;
    }
  };

  const _calcAverageField = (garagesResults, field, parent) => {
    let sum = 0;
    let nbGarage = garagesResults.length;

    for (const garageElem of garagesResults) {
      if (parent && !garageElem[parent]) {
        --nbGarage;
      } else {
        sum += parseFloat(parent ? garageElem[parent][field.f] : garageElem[field.f]);
      }
    }
    return nbGarage > 0 ? Math.round((sum / nbGarage) * 10) / 10 : 0;
  };

  const _calcSumField = (garagesResults, field, parent) => {
    let sum = 0;

    for (const garageElem of garagesResults) {
      if ((parent && garageElem[parent]) || !parent) {
        sum += parseFloat(parent ? garageElem[parent][field.f] : garageElem[field.f]);
      }
    }
    return sum;
  };

  const _calcObjField = (garagesResults, fieldsToCalc) => {
    const finalResult = {};

    for (const field of fieldsToCalc.arr) {
      finalResult[field.f] = field.op(garagesResults, field, fieldsToCalc.f);
    }
    return finalResult;
  };

  const _calcGroupResult = (garagesResults) => {
    const subObjectPattern = [
      {
        f: 'rating',
        op: _calcAverageField,
      },
      {
        f: 'respondentsCount',
        op: _calcSumField,
      },
    ];
    const fieldsToCalc = {
      arr: [
        {
          f: 'respondentsCount',
          op: _calcSumField,
        },
        {
          f: 'rating',
          op: _calcSumField,
        },
        {
          f: 'Maintenance',
          op: _calcObjField,
          arr: subObjectPattern,
          p: true,
        },
        {
          f: 'NewVehicleSale',
          op: _calcObjField,
          arr: subObjectPattern,
          p: true,
        },
        {
          f: 'UsedVehicleSale',
          op: _calcObjField,
          arr: subObjectPattern,
          p: true,
        },
      ],
    };

    return _calcObjField(garagesResults, fieldsToCalc);
  };

  const _group = async (appId, groupId) => {
    try {
      const groupElem = await app.models.Group.findById(groupId);

      const garagesResults = await _cumulGaragesResults(groupElem.garageIds.length, groupElem.garageIds, []);

      const res = _calcGroupResult(garagesResults);
      res.name = groupElem.name;
      res.rating = 0;
      let nr = 0;
      ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale', 'VehicleInspection'].forEach((job) => {
        if (res[job]) {
          nr += res[job].respondentsCount;
          res.rating += res[job].rating * res[job].respondentsCount;
        }
      });
      if (nr) {
        res.rating = Math.round(parseFloat(res.rating / nr) * 10) / 10;
      }
      return res;
    } catch (e) {
      throw e;
    }
  };
  // create a new reviews list from datas to return them as a result
  const _filterReviews = async (datas, totalReviewsCount, skipNormalizer) => {
    const garageExternalIdsByGarageIds = {};
    // when fullData = false, we just give 1/3 of the reviews
    // reviews are sorted by date desc
    // if o is the oldest review, we give o, o-3, o-6 etc.
    // we do that because, we know the oldest review will be always the oldest, while the newest change
    // So instead of taking every i % 3 === 0
    // we only keep i % 3 === (o-1) % 3
    // ex
    // var f = (r,i) => { if (i%3 == (r.length -1)%3) {console.log(r[i]);} }
    // A call to
    // var r = ['c','d','e','f','g','h','i','j']; // 'a', newer has been added
    // for(var i = 0; i<r.length; i++) { f(r,i) }
    // will return the same results than than
    // var r = ['b','c','d','e','f','g','h','i','j']; // 'a', newer has been added
    // for(var i = 0; i<r.length; i++) { f(r,i) }
    const filtered = await datas.reduce(async (res, d, i) => {
      const acc = await res;

      const data = new app.models.Data(d);
      // we use reduce ie of map to ignore the filtered elements and because its cooler than map
      const review = {};
      if (!totalReviewsCount) {
        // if we don't give totalReviewsCount, we want all the reviews
        review.authorCityPublicDisplayName = data.get('customer.city');
        if (!skipNormalizer) review.authorCityNormalizedName = data.customer_getCityNormalizedName();
        let cats = data.get('service.categories') || [];
        if (!Array.isArray(cats)) {
          cats = cats.split(',');
        } // hacky but loopback seems to give us a string instead of an array
        review.transactionPublicDisplayName = cats;
        review.vehicleMakePublicDisplayName = data.get('vehicle.make');
        review.vehicleModelPublicDisplayName = data.get('vehicle.model');
        const subRatings = data.get('review.subRatings') || [];
        review.scoreByItems = {};
        subRatings.forEach((r) => {
          review.scoreByItems[r.label] = r.value;
        });
        review.reply = data.get('review.reply');
        review.moderation = data.get('review.comment.moderated');
        review.followupRespondedAt = data.get('unsatisfied.detectedAt');
        review.followupUnsatisfiedStatus =
          review.followupRespondedAt && data.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.RESOLVED;
        review.shareWithPartners = data.get('review.shareWithPartners') || false;
        review.sharedWithPartnersAt = data.get('review.sharedWithPartnersAt') || null;
      } else if (i % 3 !== (totalReviewsCount - 1) % 3) {
        // else we only take one third (always the same third)
        return acc;
      }
      review.id = data.id || data._id;
      review.garageId = data.garageId;
      let garage;
      if (garageExternalIdsByGarageIds.hasOwnProperty(data.garageId)) {
        garage = garageExternalIdsByGarageIds[data.garageId];
      } else {
        garage = await app.models.Garage.getMongoConnector().findOne(
          { _id: new ObjectId(data.garageId) },
          { externalId: true }
        );
        garageExternalIdsByGarageIds[data.garageId] = garage;
      }
      review.externalId = (garage && garage.externalId) || '';
      review.createdAt = data.get('review.createdAt');
      review.type = data.type;

      if (data.type === GarageTypes.VEHICLE_INSPECTION) {
        review.score = data.get('review.rating.value') / 2;
        review.scoreOutOf = 5;
        const vehicleInspectionFields = _genVehicleInspectionFields(data);
        review.serviceMiddleMan = vehicleInspectionFields.serviceMiddleMan;
        review.recommend = vehicleInspectionFields.recommend;
        review.unsatisfiedCriterias = vehicleInspectionFields.unsatisfiedCriterias;
      } else {
        review.score = data.get('review.rating.value');
        review.scoreOutOf = 10;
      }

      review.authorPublicDisplayName = data.get('customer.fullName');
      review.authorEmail = data.get('customer.contact.email');
      review.authorPhone = data.get('customer.contact.mobilePhone');
      review.comment = data.get('review.comment.text');
      review.submittedAt = data.get('review.createdAt');
      review.providedCustomerId = data.get('service.frontDeskCustomerId');
      review.providedGarageId = data.get('service.frontDeskGarageId');
      review.completedAt = data.get('service.providedAt');
      review.vehiclePlate = data.get('vehicle.plate') || '';
      review.vehicleVin = data.get('vehicle.vin') || '';
      review.providedFrontDeskUserName = data.get('service.frontDeskUserName') || '';
      review.leadTicketStatus = data.get('leadTicket.status');
      review.firstContactedAt = data.get('campaign.contactScenario.firstContactedAt');
      review.unsatisfiedTicketStatus = data.get('unsatisfiedTicket.status');
      return [...acc, review];
    }, Promise.resolve([]));
    return filtered;
  };

  const _genVehicleInspectionFields = (data) => {
    const i18nVehicle = new I18nRequire('cockpit-exports/excels/_vehicle-inspection');
    const i18nUnsatisfied = new I18nRequire('cockpit-exports/excels/_unsatisfied-excel-configuration');
    const vehicleInspectionFields = data.survey.foreignResponses.reduce(
      (acc, response) => {
        if (response.payload.serviceMiddleMan) {
          response.payload.serviceMiddleMan.forEach((element) => {
            if (!acc.serviceMiddleMan.includes(i18nVehicle.$t(`${element}`))) {
              acc.serviceMiddleMan.push(i18nVehicle.$t(`${element}`));
            }
          });
        }
        if (response.payload.recommend) {
          acc.recommend = true;
        }
        return acc;
      },
      { serviceMiddleMan: [], recommend: false }
    );
    vehicleInspectionFields.unsatisfiedCriterias = data.get('unsatisfied.criteria')
      ? data.get('unsatisfied.criteria').map((criteria) => {
          if (criteria.values) {
            const values = criteria.values.map((value) => i18nUnsatisfied.$t(`_${value}`)).join(', ');
            return `${i18nUnsatisfied.$t(`${criteria.label}`)}: ${values}`;
          }
          return `${i18nUnsatisfied.$t(`${criteria.label}`)}`;
        })
      : [];
    return vehicleInspectionFields;
  };

  /**
  Latest reviews
  type : maintenance, sales... null of no type
  garageId : if null return every garages of the appId
  size: results size
  skip: offset
  */
  // REPLACED BY _reviews
  const _reviewsOld = async (appId, garageId, type, size, skip) => {
    try {
      const { authErr, auths, allGaragesAuthorized, allReviews, withheldGarageData } = await _hasAccess(
        appId,
        routesPermissions.REVIEWS,
        garageId
      );

      if (authErr) {
        throw authErr;
      }
      const w = {
        'review.comment.status': moderationStatus.APPROVED,
        shouldSurfaceInStatistics: true,
      };
      if (garageId) {
        w.garageId = garageId;
      } else if (auths && auths.length) {
        w.garageId = { inq: auths };
      }
      if (type) {
        w.type = type;
      } else {
        w.type = GarageTypes.getCorrespondingDataTypeQueryMongo();
      }
      if (!allReviews) {
        w['review.shareWithPartners'] = true;
      }

      let buildQuery = async () => w;

      if (!withheldGarageData) {
        buildQuery = async () => {
          let runningGarages = await app.models.Garage.find({
            where: {
              status: {
                inq: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL],
              },
            },
            fields: { id: 1 },
          });
          runningGarages = runningGarages.map((g) => g.id.toString());
          const garageFilter = getGarageFilter(
            appId,
            garageId,
            allGaragesAuthorized,
            withheldGarageData,
            auths,
            runningGarages
          );
          if (garageFilter instanceof Error) {
            throw garageFilter;
          } else if (garageFilter) {
            w.garageId = garageFilter;
          }
          return w;
        };
      }

      const where = await buildQuery();

      const datas = await app.models.Data.getMongoConnector()
        .find(where, { limit: parseInt(size, 10), skip, sort: { 'review.createdAt': -1 } })
        .toArray();

      if (!datas || datas.length === 0) {
        console.log(`No datas with review for appId ${appId}`);
        return [];
      }
      return await _filterReviews(datas);
    } catch (err) {
      throw err;
    }
  };

  /**
   * get reviews with minimum calc / variables (we just skipNormalizer for now)
   * @param appId
   * @param garageId
   * @param type
   * @param size
   * @param skip
   * @param callback
   * @private
   */
  const _reviews = async (appId, garageId, type, size, skip) => {
    try {
      const {
        authErr,
        auths,
        allGaragesAuthorized,
        allReviews,
        withheldGarageData,
        garageTypesAuthorized,
      } = await _hasAccess(appId, routesPermissions.REVIEWS, garageId);
      if (authErr) {
        throw authErr;
      }

      const w = {};
      if (garageId) {
        w.garageId = garageId;
      } else if (auths && auths.length) {
        w.garageId = { inq: auths };
      }

      if (garageTypesAuthorized && garageTypesAuthorized.length) {
        w.garageType = { inq: garageTypesAuthorized };
      }

      if (type) {
        w.type = type;
      } else {
        w.type = GarageTypes.getCorrespondingDataTypeQueryMongo();
      }
      if (!allReviews) {
        w['review.shareWithPartners'] = true;
      }
      w['review.comment.status'] = moderationStatus.APPROVED;
      w.shouldSurfaceInStatistics = true;

      let buildQuery = async () => w;

      if (!withheldGarageData) {
        buildQuery = async () => {
          let runningGarages = await app.models.Garage.getMongoConnector()
            .find(
              {
                ...(garageTypesAuthorized && garageTypesAuthorized.length
                  ? { type: { $in: garageTypesAuthorized } }
                  : {}),
                status: { $in: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL] },
              },
              { projection: { _id: 1 } }
            )
            .toArray();

          runningGarages = runningGarages.map((g) => g._id.toString());
          const garageFilter = getGarageFilter(
            appId,
            garageId,
            allGaragesAuthorized,
            withheldGarageData,
            auths,
            runningGarages
          );
          if (garageFilter instanceof Error) {
            throw garageFilter;
            return;
          } else if (garageFilter) {
            w.garageId = garageFilter;
          }
          return w;
        };
      }

      const where = await buildQuery();

      const datas = await app.models.Data.getMongoConnector()
        .find(where, { limit: parseInt(size, 10), skip, sort: { 'review.createdAt': -1 } })
        .toArray();

      if (!datas || datas.length === 0) {
        console.log(`No datas with review for appId ${appId}`);
        return [];
      }
      const res = await _filterReviews(datas, null, true);
      return res;
    } catch (err) {
      throw err;
    }
  };

  /**
  Count reviews by type
  type : maintenance, sales... if null returns a count for every type
  garageId : if null return every garages of the appId
  */
  const _reviewsCount = async (appId, garageId, type) => {
    const Data = app.models.Data;
    const where = {
      garageId,
      'review.comment.status': moderationStatus.APPROVED,
      shouldSurfaceInStatistics: true,
    };
    if (type) {
      where.type = type;
      console.log(`_reviewsCount count() ${JSON.stringify(where)}`);
      return await Data.count(where);
    } else {
      console.log(`_reviewsCount countApprovedReviewByType() ${JSON.stringify(where)}`);
      const groups = await promises.makeAsync(Data.review_countApprovedReviewByType)(where);
      const res = {};
      if (groups) {
        groups.forEach((g) => {
          res[g._id.type] = g.total;
        });
      }
      return res;
    }
  };
  /**
  Latest reviews of every garages from an appId by type
  size: results size
  skip: offset
  */
  const _reviewsByType = async (appId, type, size, skip) => {
    return await _reviewsOld(appId, null, type, size, skip);
  };

  /**
  Latest reviews of one garage from an appId
  size: results size
  skip: offset
  */
  const _reviewsByGarage = async (appId, garageId, size, skip) => {
    return await _reviewsOld(appId, garageId, null, size, skip);
  };

  // Reviews submitted during one day, sorted by descending date
  // garageId : if null return every garages of the appId
  // day: [1,31]
  // month: [1,12]
  // year: [20xx]

  const _reviewsByDate = async (appId, garageId, timezone, day, month, year, dateField, limit, after, callback) => {
    const {
      authErr,
      auths,
      allGaragesAuthorized,
      fullData,
      allReviews,
      withheldGarageData,
      garageTypesAuthorized,
    } = await _hasAccess(appId, routesPermissions.REVIEWS, garageId);
    if (authErr) {
      callback(new UnauthorizedError(authErr.message));
      return;
    }

    let dateMin = null;
    let dateMax = null;
    const filterOn = dateField || 'updatedAt';
    try {
      const d = moment.tz(`${day}/${month}/${year}`, 'DD/MM/YYYY', timezone);
      dateMin = moment(d).startOf('day').toDate();
      dateMax = moment(d).endOf('day').toDate();
    } catch (e) {
      callback(new BadRequestError('Incorrect date parameters ${day}/${month}/${year}'));
      return;
    }

    const garageQuery = {
      where: {
        status: {
          inq: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL],
        },
      },
      fields: { id: 1 },
    };
    const where = {
      'review.comment.status': moderationStatus.APPROVED,
      shouldSurfaceInStatistics: true,
      type: GarageTypes.getCorrespondingDataTypeQueryMongo(),
    };

    if (garageTypesAuthorized && garageTypesAuthorized.length) {
      where.garageType = { $in: garageTypesAuthorized };
      garageQuery.where.type = { inq: garageTypesAuthorized };
    }

    if (!allReviews) {
      where['review.shareWithPartners'] = true;
    }

    async.series([
      (cb) => {
        // Get running garages if restricted to running garages
        let garageFilter;
        if (!withheldGarageData) {
          app.models.Garage.find(garageQuery, (err, runningGarages) => {
            if (err) {
              callback(err);
              return;
            }
            runningGarages = runningGarages.map((g) => g.id.toString());
            garageFilter = getGarageFilter(
              appId,
              garageId,
              allGaragesAuthorized,
              withheldGarageData,
              auths,
              runningGarages
            );
            if (garageFilter instanceof Error) {
              callback(garageFilter);
              return;
            } else if (garageFilter) {
              where.garageId = garageFilter;
            }
            cb();
          });
        } else {
          garageFilter = getGarageFilter(appId, garageId, allGaragesAuthorized, withheldGarageData, auths);
          if (garageFilter instanceof Error) {
            callback(garageFilter);
            return;
          } else if (garageFilter) {
            where.garageId = garageFilter;
          }
          cb();
        }
      },
      (cb) => {
        // Get starting point data document if applicable
        where.$and = [];
        const fdn = {};
        const fdx = {};
        if (after) {
          app.models.Data.findById(after, (err0, singleData) => {
            if (err0) {
              callback(err0);
              return;
            }
            if (!singleData) {
              callback(new NotFoundError('No data for after parameter'));
              return;
            }
            fdn[filterOn] = { $gte: dateMin };
            fdx[filterOn] = { $lt: singleData.get(filterOn) };
            where.$and.push(fdn);
            where.$and.push(fdx);
            cb();
          });
        } else {
          fdn[filterOn] = { $gte: dateMin };
          fdx[filterOn] = { $lte: dateMax };
          where.$and.push(fdn);
          where.$and.push(fdx);
          cb();
        }
      },
      (cb) => {
        // Issue the actual query
        const options = { sort: { [`${filterOn}`]: -1 } };
        if (limit) {
          options.limit = parseInt(limit, 10);
        }
        app.models.Data.getMongoConnector()
          .find(where, options)
          .toArray()
          .catch(callback)
          .then(async (datas) => {
            if (!datas || datas.length === 0) {
              console.log(JSON.stringify({ where, options }));
              callback(new NotFoundError(`No datas for appId ${appId} on ${day}/${month}/${year}`));
              return;
            }
            const results = await _filterReviews(datas, fullData ? null : datas.length);
            callback(null, results, datas.length);
          });
        cb();
      },
    ]);
  };
  // Detailled scores and reviews count
  const _scores = async (appId, garageId) => {
    const count = _reviewsCount(appId, garageId, null);

    const res = { reviewsCount: count };
    try {
      const publicScores = await promises.makeAsync(app.models.Garage.findPublicScores)(
        garageId,
        null,
        null,
        null,
        true
      );
      if (findPublicScoresErr) {
        throw findPublicScoresErr;
      }
      if (!publicScores || publicScores.length === 0) {
        return null;
      }
      const dataRecordMaintenancePublicScore = _.findWhere(publicScores, { type: gsPublicScoreType.MAINTENANCE });
      const dataRecordNewVehicleSalePublicScore = _.findWhere(publicScores, {
        type: gsPublicScoreType.NEW_VEHICLE_SALE,
      });
      const dataRecordUsedVehicleSalePublicScore = _.findWhere(publicScores, {
        type: gsPublicScoreType.USED_VEHICLE_SALE,
      });
      res.scores = {};
      res.scores.Maintenance = dataRecordMaintenancePublicScore ? {} : null;
      res.scores.NewVehicleSale = dataRecordNewVehicleSalePublicScore ? {} : null;
      res.scores.UsedVehicleSale = dataRecordUsedVehicleSalePublicScore ? {} : null;
      res.scores.respondentsCount = 0;
      // sum respondentsCount and yesCount, find ratio/pct...
      if (dataRecordMaintenancePublicScore) {
        if (typeof dataRecordMaintenancePublicScore.payload.rating.global.respondentsCount !== 'undefined') {
          res.scores.respondentsCount += dataRecordMaintenancePublicScore.payload.rating.global.respondentsCount;
        }
      }
      if (dataRecordNewVehicleSalePublicScore) {
        if (typeof dataRecordNewVehicleSalePublicScore.payload.rating.global.respondentsCount !== 'undefined') {
          res.scores.respondentsCount += dataRecordNewVehicleSalePublicScore.payload.rating.global.respondentsCount;
        }
      }
      if (dataRecordUsedVehicleSalePublicScore) {
        if (typeof dataRecordUsedVehicleSalePublicScore.payload.rating.global.respondentsCount !== 'undefined') {
          res.scores.respondentsCount += dataRecordUsedVehicleSalePublicScore.payload.rating.global.respondentsCount;
        }
      }
      if (res.scores.Maintenance) {
        res.scores.Maintenance.respondentsCount =
          dataRecordMaintenancePublicScore.payload.rating.global.respondentsCount;
      }
      if (res.scores.NewVehicleSale) {
        res.scores.NewVehicleSale.respondentsCount =
          dataRecordNewVehicleSalePublicScore.payload.rating.global.respondentsCount;
      }
      if (res.scores.UsedVehicleSale) {
        res.scores.UsedVehicleSale.respondentsCount =
          dataRecordUsedVehicleSalePublicScore.payload.rating.global.respondentsCount;
      }
      /** rating distrib */
      const _val = (label, code, abbreviatedLabel, respondentsCount, value, valueType) => ({
        label,
        code,
        abbreviatedLabel,
        respondentsCount,
        value,
        valueType,
      });
      const distrib = (dataRecords, field) => {
        if (dataRecords && dataRecords.payload && dataRecords.payload.rating && dataRecords.payload.rating.perValue) {
          const d = res.scores[field];
          const pv = dataRecords.payload.rating.perValue;
          const totalPv =
            pv['10'] +
            pv['9'] +
            pv['8'] +
            pv['7'] +
            pv['6'] +
            pv['5'] +
            pv['4'] +
            pv['3'] +
            pv['2'] +
            pv['1'] +
            pv['0'];
          d.byValue = [
            _val(
              'Très satisfait',
              '',
              'Très satisfait',
              pv['10'] + pv['9'],
              100 * ((pv['10'] + pv['9']) / totalPv),
              'pct'
            ),
            _val('Satisfait', '', 'Satisfait', pv['8'] + pv['7'], 100 * ((pv['8'] + pv['7']) / totalPv), 'pct'),
            _val('Passable', '', 'Passable', pv['6'] + pv['5'], 100 * ((pv['6'] + pv['5']) / totalPv), 'pct'),
            _val('Mécontent', '', 'Mécontent', pv['4'] + pv['3'], 100 * ((pv['4'] + pv['3']) / totalPv), 'pct'),
            _val(
              'Très mécontent',
              '',
              'Très mécontent',
              pv['2'] + pv['1'] + pv['0'],
              100 * ((pv['2'] + pv['1'] + pv['0']) / totalPv),
              'pct'
            ), // eslint-disable-line max-len
          ];
          largestRemainder(
            d.byValue,
            (o) => o.value,
            (i, v, a) => {
              a[i].value = v;
            },
            100
          ); // eslint-disable-line no-param-reassign
        }
      };

      distrib(dataRecordMaintenancePublicScore, 'Maintenance');
      distrib(dataRecordNewVehicleSalePublicScore, 'NewVehicleSale');
      distrib(dataRecordUsedVehicleSalePublicScore, 'UsedVehicleSale');

      // Format DataRecord ByItem Ratings, in order
      const getRespondentsCount = (dataRecords, label) =>
        (dataRecords &&
          dataRecords.payload &&
          dataRecords.payload.rating &&
          dataRecords.payload.rating.byItem &&
          dataRecords.payload.rating.byItem[label] &&
          dataRecords.payload.rating.byItem[label].respondentsCount) ||
        0;
      const getValue = (dataRecords, label) =>
        (dataRecords &&
          dataRecords.payload &&
          dataRecords.payload.rating &&
          dataRecords.payload.rating.byItem &&
          dataRecords.payload.rating.byItem[label] &&
          parseFloat(dataRecords.payload.rating.byItem[label].value, 10)) ||
        0;

      const itemRating = (label, abbreviatedLabel, code, scoresO) => ({
        label,
        abbreviatedLabel,
        code,
        respondentsCount: getRespondentsCount(scoresO, label),
        value: getValue(scoresO, label),
        valueType: 'gradestr',
      });
      if (dataRecordMaintenancePublicScore) {
        res.scores.Maintenance.formattedByItemRatings = [
          itemRating(subratingLabels.MAINTENANCE_LAB_1, 'Accueil', 'crit1', dataRecordMaintenancePublicScore),
          itemRating(subratingLabels.MAINTENANCE_LAB_2, 'Conseils', 'crit2', dataRecordMaintenancePublicScore),
          itemRating(subratingLabels.MAINTENANCE_LAB_3, 'Devis', 'crit3', dataRecordMaintenancePublicScore),
          itemRating(subratingLabels.MAINTENANCE_LAB_4, 'Efficacité', 'crit4', dataRecordMaintenancePublicScore),
          itemRating(subratingLabels.MAINTENANCE_LAB_5, 'Qualité', 'crit5', dataRecordMaintenancePublicScore),
        ];
      }
      if (dataRecordNewVehicleSalePublicScore) {
        res.scores.NewVehicleSale.formattedByItemRatings = [
          itemRating(subratingLabels.SALE_NEW_LAB_1, 'Établissement', 'crit1', dataRecordNewVehicleSalePublicScore),
          itemRating(subratingLabels.SALE_NEW_LAB_2, 'Professionnalisme', 'crit2', dataRecordNewVehicleSalePublicScore),
          itemRating(subratingLabels.SALE_NEW_LAB_3, 'Services', 'crit3', dataRecordNewVehicleSalePublicScore),
          itemRating(subratingLabels.SALE_NEW_LAB_4, 'Livraison', 'crit4', dataRecordNewVehicleSalePublicScore),
          itemRating(subratingLabels.SALE_NEW_LAB_5, 'Véhicule', 'crit5', dataRecordNewVehicleSalePublicScore),
        ];
      }
      if (dataRecordUsedVehicleSalePublicScore) {
        res.scores.UsedVehicleSale.formattedByItemRatings = [
          itemRating(subratingLabels.SALE_USED_LAB_1, 'Historique', 'crit1', dataRecordUsedVehicleSalePublicScore),
          itemRating(
            subratingLabels.SALE_USED_LAB_2,
            'Professionnalisme',
            'crit2',
            dataRecordUsedVehicleSalePublicScore
          ),
          itemRating(subratingLabels.SALE_USED_LAB_3, 'Services', 'crit3', dataRecordUsedVehicleSalePublicScore),
          itemRating(subratingLabels.SALE_USED_LAB_4, 'Livraison', 'crit4', dataRecordUsedVehicleSalePublicScore),
          itemRating(subratingLabels.SALE_USED_LAB_5, 'Véhicule', 'crit5', dataRecordUsedVehicleSalePublicScore),
        ];
      }
      // Format Global Rating
      res.scores.formattedGlobalRating = {};
      res.scores.formattedGlobalRating.label = 'GarageScore';
      res.scores.formattedGlobalRating.abbreviatedLabel = 'GarageScore';

      // sort ratings and push them to a 'sorted' array
      const sortRatings = (ratings, sorted) => {
        const clone = Object.assign({}, ratings);
        _.each(clone, (value, key) => {
          clone[key].label = key;
        });
        _.each(
          _.sortBy(clone, (rating) => -rating.respondentsCount),
          (rating) => {
            const formattedRating = {};
            formattedRating.abbreviatedLabel =
              ServiceCategories.getPropertyFromValue(rating.label, 'shortName') || rating.label;
            formattedRating.respondentsCount = rating.respondentsCount;
            formattedRating.value = parseFloat(rating.value);
            sorted.push(formattedRating);
          }
        );
      };

      // Format DataRecord  CategoryLabel Ratings, in descending respondentsCount order
      const sortSubCategories = (dataRecords, field) => {
        const sorted = [];
        if (dataRecords) {
          const ratings = Object.assign({}, dataRecords.payload.rating[field]);
          sortRatings(ratings, sorted);
        }
        return sorted;
      };
      if (dataRecordMaintenancePublicScore) {
        res.scores.Maintenance.byAbbreviatedCategoryLabel = sortSubCategories(
          dataRecordMaintenancePublicScore,
          'byCategories'
        );
      }

      // Format DataRecord ByVehicleMake Ratings, in descending respondentsCount order
      const sortVehicleMakes = (dataRecords) => {
        const sorted = [];
        if (dataRecords) {
          const ratings = Object.assign({}, dataRecords.payload.rating.byVehicleMake);
          sortRatings(ratings, sorted);
        }
        return sorted;
      };

      if (dataRecordMaintenancePublicScore) {
        res.scores.Maintenance.byVehicleMake = sortVehicleMakes(dataRecordMaintenancePublicScore);
      }
      if (dataRecordNewVehicleSalePublicScore) {
        res.scores.NewVehicleSale.byVehicleMake = sortVehicleMakes(dataRecordNewVehicleSalePublicScore);
      }
      if (dataRecordUsedVehicleSalePublicScore) {
        res.scores.UsedVehicleSale.byVehicleMake = sortVehicleMakes(dataRecordUsedVehicleSalePublicScore);
      }
      res.scores.sectionCount = 0;
      if (res.scores.Maintenance) {
        res.scores.sectionCount++;
      }
      if (res.scores.NewVehicleSale) {
        res.scores.sectionCount++;
      }
      if (res.scores.UsedVehicleSale) {
        res.scores.sectionCount++;
      }

      return res;
    } catch (err) {
      throw err;
    }
  };

  API.garage = _garage;
  API.garageSearch = _garageSearch;
  API.garages = _garages;
  API.group = _group;
  API.reviews = _reviews;
  API.reviewsCount = _reviewsCount;
  API.reviewsByType = _reviewsByType;
  API.reviewsByGarage = _reviewsByGarage;
  API.reviewsByDate = _reviewsByDate;
  API.scores = _scores;
  API.garagesSearch = _garagesSearch;
};
