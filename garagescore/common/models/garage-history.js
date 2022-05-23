const GarageHistoryPeriod = require('./garage-history.period');
const GarageHistoryAggregatorStream = require('../lib/garagescore/garage-history/aggregator-stream');
const GarageHistoryLeadAggregatorStream = require('../lib/garagescore/garage-history/lead-aggregator-stream');
const GarageHistoryUnsatisfiedAggregatorStream = require('../lib/garagescore/garage-history/unsatisfied-aggregator-stream');
const GarageHistoryExogenousWriter = require('../lib/garagescore/garage-history/exogenous-writer.js');
const unsatisfiedFollowupStatus = require('../models/data/type/unsatisfied-followup-status.js');
const _ = require('lodash');
const idTools = require('../lib/model-tool/id-tools.js');
const removeDiacritics = require('diacritics').remove;
const moment = require('moment');
const { promisify } = require('util');
const DataTypes = require('./data/type/data-types');
const SourceTypes = require('./data/type/source-types');
const debug = require('debug')('garagescore:common:models:garage-history'); // eslint-disable-line max-len,no-unused-vars
const Stream = require('stream');

const { ANASS, time, timeEnd } = require('../lib/util/log');

const arrayToStream = function ArrayToStream(array, closePipe = true) {
  const readableStream = new Stream.Readable({ objectMode: true });
  for (let i = 0; i < array.length; i++) readableStream.push(array[i]);
  if (closePipe) readableStream.push(null);
  return readableStream;
};

module.exports = function GarageHistoryDefinition(GarageHistory) {
  /**
   * Aggregate Data Model to become a garageHistory
   * @param filters must be a filters of Data Model
   * @param options
   * @param callback
   */
  GarageHistory.getOverallStats = function getOverallStats(filters, options, callback) {
    // eslint-disable-line no-param-reassign
    // const readStream = GarageHistory.app.models.Data.findStream(filters);
    GarageHistory.app.models.Data.find(filters, (err, datas) => {
      const readStream = arrayToStream(datas);
      const aggregatorStream = new GarageHistoryAggregatorStream(options);
      readStream.pipe(aggregatorStream).on('finish', () => callback(null, aggregatorStream.getAggregationResult()));
      readStream.on('error', callback);
      aggregatorStream.on('error', callback);
    });
  };
  GarageHistory.getLeadOverallStats = function getLeadOverallStats(garageId, frontDesk, callback) {
    // eslint-disable-line no-param-reassign
    const filters = { where: { garageId, 'leadTicket.createdAt': { gt: new Date(0) } } };
    const readStream = GarageHistory.app.models.Data.findStream(filters); // TODO Do the same as getOverallStats
    const aggregatorStream = new GarageHistoryLeadAggregatorStream();
    readStream.pipe(aggregatorStream).on('finish', () => {
      const gHistory = aggregatorStream.getAggregationResult();
      callback(null, gHistory);
    });
    readStream.on('error', callback);
    aggregatorStream.on('error', callback);
  };
  GarageHistory.getUnsatisfiedOverallStats = function getUnsatisfiedOverallStats(garageId, frontDesk, callback) {
    // eslint-disable-line
    const filters = { where: { garageId, 'unsatisfiedTicket.createdAt': { gt: new Date(0) } } };
    const readStream = GarageHistory.app.models.Data.findStream(filters);
    const aggregatorStream = new GarageHistoryUnsatisfiedAggregatorStream();
    readStream.pipe(aggregatorStream).on('finish', () => {
      const gHistory = aggregatorStream.getAggregationResult();
      callback(null, gHistory);
    });
    readStream.on('error', callback);
    aggregatorStream.on('error', callback);
  };
  /* return garage from garageId */
  GarageHistory.prototype.garage = function garage(cb) {
    // eslint-disable-line no-param-reassign
    GarageHistory.app.models.Garage.findById(this.garageId, cb);
  };
  /** Generate lead conversion stats for the last 12 months */
  GarageHistory.generateLeadConversionStats = async function generateLeadConversionStats(garageId) {
    // eslint-disable-line no-param-reassign, max-len
    const lastYear = moment().subtract(1, 'years').toDate();
    const conversions = [
      {
        label: 'countConversionsVN',
        options: {
          'lead.isConvertedToSale': true,
          'lead.convertedSaleType': DataTypes.NEW_VEHICLE_SALE,
          'lead.convertedToSaleAt': { gte: lastYear },
          'source.type': { inq: [SourceTypes.DATAFILE, SourceTypes.AGENT] },
        },
        sum: true,
      },
      {
        label: 'countConversionsVO',
        options: {
          'lead.isConvertedToSale': true,
          'lead.convertedSaleType': DataTypes.USED_VEHICLE_SALE,
          'lead.convertedToSaleAt': { gte: lastYear },
          'source.type': { inq: [SourceTypes.DATAFILE, SourceTypes.AGENT] },
        },
        sum: true,
      },
      {
        label: 'countConversionsTradeins',
        options: {
          'lead.isConvertedToTradeIn': true,
          'lead.convertedToTradeInAt': { gte: lastYear },
          'source.type': { inq: [SourceTypes.DATAFILE, SourceTypes.AGENT] },
        },
        sum: true,
      },
      {
        label: 'countPotentialSales',
        options: {
          'lead.potentialSale': true,
          'service.providedAt': { gte: lastYear },
          'source.type': { inq: [SourceTypes.DATAFILE, SourceTypes.AGENT] },
        },
        sum: false,
      },
    ];
    let countConversions = 0;
    for (let i = 0; i < conversions.length; i++) {
      conversions[i].value = await GarageHistory.app.models.Data.count({
        garageId,
        ...conversions[i].options,
      });
      countConversions += conversions[i].sum ? conversions[i].value : 0;
    }

    return {
      countConversions,
      ...conversions.reduce((acc, e) => {
        acc[e.label] = e.value;
        return acc;
      }, {}),
    };
  };
  GarageHistory.generateSavedUnsatisfiedStats = async function generateSavedUnsatisfiedStats(garageId) {
    // eslint-disable-line no-param-reassign, max-len
    const lastYear = moment().subtract(1, 'years').toDate();
    const savedUnsatisfied = [
      {
        label: 'countSolvedAPVUnsatisfied',
        options: {
          type: DataTypes.MAINTENANCE,
          or: [
            { 'unsatisfied.followupStatus': unsatisfiedFollowupStatus.RESOLVED },
            {
              'unsatisfied.followupStatus': { neq: unsatisfiedFollowupStatus.NOT_RESOLVED },
              'unsatisfiedTicket.unsatisfactionResolved': true,
            }, // eslint-disable-line max-len
          ],
          'review.createdAt': { gte: lastYear },
          'review.rating.value': { lte: 6 },
        },
        value: 0,
      },
      {
        label: 'countSolvedVNUnsatisfied',
        options: {
          type: DataTypes.NEW_VEHICLE_SALE,
          or: [
            { 'unsatisfied.followupStatus': unsatisfiedFollowupStatus.RESOLVED },
            {
              'unsatisfied.followupStatus': { neq: unsatisfiedFollowupStatus.NOT_RESOLVED },
              'unsatisfiedTicket.unsatisfactionResolved': true,
            }, // eslint-disable-line max-len
          ],
          'review.createdAt': { gte: lastYear },
          'review.rating.value': { lte: 6 },
        },
        value: 0,
      },
      {
        label: 'countSolvedVOUnsatisfied',
        options: {
          type: DataTypes.USED_VEHICLE_SALE,
          or: [
            { 'unsatisfied.followupStatus': unsatisfiedFollowupStatus.RESOLVED },
            {
              'unsatisfied.followupStatus': { neq: unsatisfiedFollowupStatus.NOT_RESOLVED },
              'unsatisfiedTicket.unsatisfactionResolved': true,
            }, // eslint-disable-line max-len
          ],
          'review.createdAt': { gte: lastYear },
          'review.rating.value': { lte: 6 },
        },
        value: 0,
      },
      {
        label: 'countSolvedVIUnsatisfied',
        options: {
          type: DataTypes.VEHICLE_INSPECTION,
          or: [
            { 'unsatisfied.followupStatus': unsatisfiedFollowupStatus.RESOLVED },
            {
              'unsatisfied.followupStatus': { neq: unsatisfiedFollowupStatus.NOT_RESOLVED },
              'unsatisfiedTicket.unsatisfactionResolved': true,
            }, // eslint-disable-line max-len
          ],
          'review.createdAt': { gte: lastYear },
          'review.rating.value': { lte: 6 },
        },
        value: 0,
      },
      {
        label: 'countUnsatisfiedYear',
        options: {
          'review.createdAt': { gte: lastYear },
          'review.rating.value': { lte: 6 },
        },
        value: 0,
      },
    ];
    for (let i = 0; i < savedUnsatisfied.length; i++) {
      savedUnsatisfied[i].value = await GarageHistory.app.models.Data.count({
        garageId,
        ...savedUnsatisfied[i].options,
      });
    }

    return {
      ...savedUnsatisfied.reduce((acc, e) => {
        acc[e.label] = e.value;
        return acc;
      }, {}),
    };
  };
  GarageHistory.generate = async function generate(config) {
    // eslint-disable-line no-param-reassign
    const Garage = GarageHistory.app.models.Garage;
    let garageId = config.garageId;
    const periodToken = config.periodToken;
    const minDate = config.minDate;
    const maxDate = config.maxDate;
    const forceRegenerate = config.forceRegenerate;
    const noGeneration = config.noGeneration;
    const frontDesk = config.frontDesk || 'ALL_USERS';
    const saveInDb = config.saveInDb;
    const generateOnlyFrontDeskGiven = config.generateOnlyFrontDeskGiven || false; // used to generate only ALL_USERS for example
    const referenceField = config.referenceField || 'service.providedAt';
    if (!garageId || !periodToken || !minDate || !maxDate) {
      throw new Error('Invalid GarageHistory configuration');
    }
    if (typeof garageId === 'string') {
      garageId = idTools.formatId(garageId, GarageHistory.getConnector().name);
    }
    const garageHistory = await GarageHistory.findOne({ where: { garageId, periodToken, frontDesk } });
    if (garageHistory && !forceRegenerate) {
      return garageHistory;
    }
    if (noGeneration) {
      return {};
    }
    if (saveInDb) {
      await GarageHistory.destroyAll({
        garageId,
        periodToken,
        frontDesk: generateOnlyFrontDeskGiven ? frontDesk : undefined,
      });
    }
    const whereObj = {
      type: { inq: [...DataTypes.getJobs(), DataTypes.MANUAL_LEAD, DataTypes.MANUAL_UNSATISFIED] },
      garageId: garageId.toString(),
    };
    if (
      (periodToken !== GarageHistoryPeriod.ALL_HISTORY || !periodToken.includes(GarageHistoryPeriod.ALL_HISTORY)) &&
      periodToken !== GarageHistoryPeriod.LEAD_ALL_HISTORY &&
      periodToken !== GarageHistoryPeriod.UNSATISFIED_ALL_HISTORY
    ) {
      whereObj.and = [];
      const firstObj = {};
      firstObj[referenceField] = { gte: minDate };
      whereObj.and.push(firstObj);
      const secondObj = {};
      secondObj[referenceField] = { lte: maxDate };
      whereObj.and.push(secondObj);
    }
    let stats = null;
    if (periodToken === GarageHistoryPeriod.LEAD_ALL_HISTORY) {
      stats = await promisify(GarageHistory.getLeadOverallStats)(garageId, frontDesk);
    } else if (periodToken === GarageHistoryPeriod.UNSATISFIED_ALL_HISTORY) {
      stats = await promisify(GarageHistory.getUnsatisfiedOverallStats)(garageId, frontDesk);
    } else {
      stats = await promisify(GarageHistory.getOverallStats)(
        {
          where: whereObj,
          order: 'service.providedAt ASC',
        },
        {
          generateHistoryDetails: GarageHistoryPeriod.needDetailedHistory(periodToken),
        }
      );
    }
    const garage = await Garage.findById(garageId);
    const frontDeskNames = Object.keys(stats);
    let returnGH = null;
    for (const frontDeskName of frontDeskNames) {
      if ((generateOnlyFrontDeskGiven && frontDesk === frontDeskName) || !generateOnlyFrontDeskGiven) {
        const statObj = stats[frontDeskName];
        statObj.garageId = garage.getId();
        statObj.externalId = garage.externalId;
        statObj.periodToken = periodToken;
        statObj.frontDesk = frontDeskName;
        statObj.garagePublicDisplayName = garage.publicDisplayName;
        statObj.garagePublicSubscriptions = garage.subscriptions;
        statObj.garageGooglePlaceRating = garage.googlePlace && garage.googlePlace.rating;
        statObj.garagePublicSearchName = removeDiacritics(garage.publicDisplayName);
        statObj.garageSlug = garage.slug;
        statObj.hideDirectoryPage = garage.hideDirectoryPage;
        // Always the last twelve months
        const leadConversionStats = await GarageHistory.generateLeadConversionStats(garage.getId().toString());
        const savedUnsatisfiedStats = await GarageHistory.generateSavedUnsatisfiedStats(garage.getId().toString());
        Object.assign(statObj, leadConversionStats);
        Object.assign(statObj, savedUnsatisfiedStats);
        // common assignments
        this.addPercentValues(statObj);
        this.cleanGarageHistory(statObj);
        returnGH = statObj;
        if (saveInDb) {
          const saved = await new GarageHistory(statObj);
          await saved.save();
          if (frontDesk === frontDeskName) {
            returnGH = saved;
          }
        }
      }
    }
    return returnGH;
  };

  GarageHistory.cleanGarageHistory = (stat) => {
    const exceptions = ['frontDesk', 'price'];
    const recursive = (o) => {
      Object.keys(o).forEach((key) => {
        if (typeof o[key] === 'object' && o[key] !== null) {
          recursive(o[key]);
        }
        if (o[key] === 0 && !exceptions.includes(key)) {
          delete o[key];
        }
      });
    };
    // iterate through properties to erase any zero
    recursive(stat);
  };

  GarageHistory.addPercentValues = (stat) => {
    if (stat.historyByType) {
      for (const key of Object.keys(stat.historyByType)) {
        const item = stat.historyByType[key];
        const countReceivedAndScheduledSurveys = (item.countReceivedSurveys || 0) + (item.countScheduledContacts || 0);
        item.countPromotorsPercent = item.countSurveyResponded
          ? ((item.countSurveyPromotor || 0) / item.countSurveyResponded) * 100
          : undefined;
        item.countDetractorsPercent = item.countSurveyResponded
          ? ((item.countSurveyDetractor || 0) / item.countSurveyResponded) * 100
          : undefined;
        item.countSurveysResponded = item.countSurveyResponded || 0;
        item.countSurveysRespondedPercent = item.countSurveys
          ? ((item.countSurveyResponded || 0) / countReceivedAndScheduledSurveys) * 100
          : undefined;
        item.countValidEmails = item.countValidEmails || 0;
        const totalEmails =
          item.countValidEmails +
          (item.countWrongEmails || 0) +
          (item.countBlockedByEmail || 0) +
          (item.countNotPresentEmails || 0);
        item.countValidEmailsPercent = ((item.countValidEmails + (item.countBlockedByEmail || 0)) / totalEmails) * 100;

        item.countValidPhones = item.countValidPhones || 0;
        const totalPhones =
          item.countValidPhones +
          (item.countBlockedByPhone || 0) +
          (item.countWrongPhones || 0) +
          (item.countNotPresentPhones || 0);
        item.countValidPhonesPercent = ((item.countValidPhones + (item.countBlockedByPhone || 0)) / totalPhones) * 100;

        item.countNotContactable = item.countNotContactable || 0;
        item.countNotContactablePercent = item.totalShouldSurfaceInCampaignStats
          ? ((item.countNotContactable || 0) / item.totalShouldSurfaceInCampaignStats) * 100
          : undefined;
      }
    }
    const countReceivedAndScheduledSurveys = (stat.countReceivedSurveys || 0) + (stat.countScheduledContacts || 0);
    stat.countPromotorsPercent = stat.countSurveyResponded
      ? ((stat.countSurveyPromotor || 0) / stat.countSurveyResponded) * 100
      : undefined;
    stat.countDetractorsPercent = stat.countSurveyResponded
      ? ((stat.countSurveyDetractor || 0) / stat.countSurveyResponded) * 100
      : undefined;
    stat.countSurveysResponded = stat.countSurveyResponded || 0;
    stat.countSurveysRespondedPercent = stat.countSurveys
      ? ((stat.countSurveyResponded || 0) / countReceivedAndScheduledSurveys) * 100
      : undefined;
    stat.countValidEmails = stat.countValidEmails || 0;
    const totalEmails =
      stat.countValidEmails +
      (stat.countBlockedByEmail || 0) +
      (stat.countWrongEmails || 0) +
      (stat.countNotPresentEmails || 0);
    stat.countValidEmailsPercent = ((stat.countValidEmails + (stat.countBlockedByEmail || 0)) / totalEmails) * 100;

    stat.countValidPhones = stat.countValidPhones || 0;
    const totalPhones =
      stat.countValidPhones +
      (stat.countBlockedByPhone || 0) +
      (stat.countWrongPhones || 0) +
      (stat.countNotPresentPhones || 0);
    stat.countValidPhonesPercent = ((stat.countValidPhones + (stat.countBlockedByPhone || 0)) / totalPhones) * 100;

    stat.countNotContactable = stat.countNotContactable || 0;
    stat.countNotContactablePercent = stat.totalShouldSurfaceInCampaignStats
      ? ((stat.countNotContactable || 0) / stat.totalShouldSurfaceInCampaignStats) * 100
      : undefined;
  };

  GarageHistory.generateForPeriod = async function generateForPeriod(
    periodId,
    garageId,
    forceRegenerate = false,
    saveInDb = true,
    noGeneration = false,
    frontDesk = 'ALL_USERS',
    generateOnlyFrontDeskGiven = false
  ) {
    // eslint-disable-line
    if (!GarageHistoryPeriod.isValidPeriod(periodId)) {
      return new Error(`Invalid period : ${periodId}`);
    }
    if (!garageId) {
      return new Error('garageId is mandatory');
    }
    return GarageHistory.generate({
      /* useless? garage: garage, */
      garageId: garageId.toString(),
      periodToken: periodId,
      frontDesk,
      generateOnlyFrontDeskGiven,
      minDate: GarageHistoryPeriod.getPeriodMinDate(periodId),
      maxDate: GarageHistoryPeriod.getPeriodMaxDate(periodId),
      referenceField: GarageHistoryPeriod.getReferenceField(periodId),
      forceRegenerate,
      saveInDb,
      noGeneration,
    });
  };
  /**
   * Generate for a group of garages
   * @param periodId
   * @param garageIds
   * @param forceRegenerate
   * @param callback
   * @param saveInDb
   * @param fields
   * @param generateAllUsers
   * @param frontDesk
   */
  GarageHistory.generateForGarages = async function generateForGarages(
    periodId,
    garageIds,
    forceRegenerate,
    saveInDb = true,
    fields,
    frontDesk = 'ALL_USERS',
    generateOnlyFrontDeskGiven = false
  ) {
    // eslint-disable-line no-param-reassign, max-len
    const sizeof = require('object-sizeof'); // eslint-disable-line
    const _d = `TRACE generateForGarages_${Math.random()}`;
    const _s = Date.now();
    const debug = (s) => console.log(`${_d} - After ${Date.now() - _s}ms : ${s}`); // eslint-disable-line
    const Garage = GarageHistory.app.models.Garage;
    const filter = { where: { periodToken: periodId, frontDesk } };
    if (fields) {
      filter.fields = fields;
    }
    if (garageIds) {
      filter.where.garageId = { inq: [...garageIds] }; // copy of array is to prevent the garageIds list to be transformed into a weird object
    }
    const garageHistories = await GarageHistory.find(filter);
    if (Array.isArray(garageIds) && garageIds.length === garageHistories.length && !forceRegenerate) {
      return garageHistories;
    }
    const garages = await Garage.find({
      where: { ...(garageIds ? { id: { inq: [...garageIds] } } : {}) },
      fields: { id: true },
    });
    if (garages.length === garageHistories.length && !forceRegenerate) {
      return garageHistories;
    }
    const garageHistoryPerGarageId = {};
    garageHistories.forEach((h) => (garageHistoryPerGarageId[h.garageId.toString()] = h));
    // let nb = 0;

    const histories = [];
    for (const g of garages) {
      const garageHistory = garageHistoryPerGarageId[g.getId().toString()];
      if (garageHistory && !forceRegenerate) {
        histories.push(garageHistory);
      } else {
        histories.push(
          await GarageHistory.generateForPeriod(
            periodId,
            g.getId(),
            forceRegenerate,
            saveInDb,
            false,
            frontDesk,
            generateOnlyFrontDeskGiven
          )
        );
      }
    }
    return histories;
  };

  GarageHistory.aggregate = function aggregate(garageHistories) {
    // eslint-disable-line no-param-reassign
    let nb = 0;

    return _.reduce(
      garageHistories,
      (a, b) => {
        if (!b || Object.keys(b).length === 0) {
          return a;
        }
        const results = a;
        for (var key in b) {
          // eslint-disable-line
          if (key.indexOf('count') === 0 || key.indexOf('total') === 0) {
            results[key] += b[key] ? parseInt(b[key], 10) : 0;
          } else if (key === 'score' && (b[key] || b[key] === 0)) {
            results.score = results.score === null ? b[key] || 0 : (results.score * nb + (b[key] || 0)) / ++nb;
          }
        }
        return results;
      },
      GarageHistory.getEmptyObject()
    );
  };

  GarageHistory.aggregateExogenousForGlobalStatistics = function aggregateExogenousForGlobalStatistics(histories) {
    const result = {
      countReviews: 0,
      countDetractors: 0,
      countDetractorsWithResponse: 0,
      score: 0,
      countRecommend: 0,
      recommendPercent: 0,
      historyBySource: {},
    }; /* eslint-disable-line */

    for (const history of histories) {
      if (history.countReviews) {
        result.score =
          (result.score * result.countReviews + history.score * history.countReviews) /
          (result.countReviews + history.countReviews); /* eslint-disable-line */
        result.countReviews += history.countReviews;
        result.countRecommend += history.countRecommend;
        result.recommendPercent = (result.countRecommend / result.countReviews) * 100;
      }
      result.countDetractors += history.countDetractors;
      result.countDetractorsWithResponse += history.countDetractorsWithResponse;
      for (const source of Object.keys(history.historyBySource)) {
        if (!result.historyBySource[source]) {
          result.historyBySource[source] = {
            countReviews: 0,
            countDetractors: 0,
            countDetractorsWithResponse: 0,
            score: 0,
            countRecommend: 0,
            recommendPercent: 0,
            countGarages: 0,
            countConnectedGarages: 0,
            connectionList: [],
          }; /* eslint-disable-line */
        }
        GarageHistory._aggregateExogenousForGlobalStatistics(result, source, history);
      }
    }
    return result;
  };

  GarageHistory._aggregateExogenousForGlobalStatistics = function _aggregateExogenousForGlobalStatistics(
    result,
    source,
    history
  ) {
    const r = result.historyBySource[source];
    const h = history.historyBySource[source];

    r.countGarages++;
    if (history.hasSubscription && h.connection && h.connection.token && h.connection.externalId) {
      r.countConnectedGarages++;
      r.connectionList.push({
        hasSubscription: history.hasSubscription,
        garageId: history.garageId.toString(),
        garagePublicDisplayName: history.garagePublicDisplayName,
        connected: true,
        error: h.connection.error,
        externalId: h.connection.externalId,
      }); /* eslint-disable-line */
      r.countDetractors += h.countDetractors;
      r.countDetractorsWithResponse += h.countDetractorsWithResponse;
      if (h.countReviews) {
        r.score = (r.score * r.countReviews + h.score * h.countReviews) / (r.countReviews + h.countReviews);
        r.countReviews += h.countReviews;
        r.countRecommend += h.countRecommend;
        r.recommendPercent = (r.countRecommend / r.countReviews) * 100;
      }
    } else {
      r.connectionList.push({
        hasSubscription: history.hasSubscription,
        garageId: history.garageId.toString(),
        garagePublicDisplayName: history.garagePublicDisplayName,
        connected: false,
        error: h.connection.error,
        externalId: '',
      }); /* eslint-disable-line */
    }
  };

  GarageHistory.getEmptyObject = function getEmptyObject() {
    // eslint-disable-line no-param-reassign
    return GarageHistoryAggregatorStream.prototype.getEmptyGarageHistory();
  };
  GarageHistory.getDoubles = function getDoubles(callback) {
    // eslint-disable-line no-param-reassign
    const collection = GarageHistory.getMongoConnector();
    if (!collection) {
      callback(new Error('MongoDb collection not found'));
    }
    collection
      .aggregate([
        {
          $group: {
            _id: { garageId: '$garageId', periodToken: '$periodToken' },
            count: { $sum: 1 },
            ids: { $addToSet: '$_id' },
          },
        },
        { $match: { count: { $gt: 1 } } },
      ])
      .toArray(callback);
  };

  GarageHistory.generateForGaragesAndPeriod = async function generateForGaragesAndPeriod(periodToken, garageIds) {
    // EXOGENOUS
    garageIds = garageIds && !Array.isArray(garageIds) ? [garageIds] : garageIds;
    if (garageIds && garageIds.length > 500) garageIds = null;
    // For next optimisation stages, that's a part that takes too long IMO, but not the slowest
    // time(ANASS, 'generateForGaragesAndPeriod :: preparation');
    const minDate = GarageHistoryPeriod.getPeriodMinDate(periodToken);
    const maxDate = GarageHistoryPeriod.getPeriodMaxDate(periodToken);
    const referenceField = GarageHistoryPeriod.getReferenceField(periodToken);
    const gFields = {
      id: true,
      slug: true,
      publicDisplayName: true,
      subscriptions: true,
      exogenousReviewsConfigurations: true,
    };
    const gFilter = garageIds ? { where: { id: { inq: garageIds } }, fields: gFields } : { fields: gFields };
    const garages = await GarageHistory.app.models.Garage.find(gFilter);
    const where = { type: DataTypes.EXOGENOUS_REVIEW };
    const result = {};

    for (const garage of garages) {
      result[garage.id.toString()] = GarageHistoryExogenousWriter.getEmptyResultObject(garage, periodToken);
    }
    if (!periodToken.includes(GarageHistoryPeriod.ALL_HISTORY)) {
      where.$and = [{ [referenceField]: { $gte: minDate } }, { [referenceField]: { $lte: maxDate } }];
    }
    if (garageIds) {
      where.garageId = { $in: garageIds.map((gId) => gId.toString()) };
    }
    // timeEnd(ANASS, 'generateForGaragesAndPeriod :: preparation');
    const dFields = { projection: { garageId: true, service: true, source: true, review: true } };
    // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
    const directMongoDatas = GarageHistory.app.models.Data.getMongoConnector();
    const datasCursor = await directMongoDatas.find(where, dFields).sort({ type: 1 });
    // For next optimisation stages, that's the crucial, slowest part
    // time(ANASS, 'generateForGaragesAndPeriod :: process datas');
    while (await datasCursor.hasNext()) {
      const data = await datasCursor.next();
      GarageHistoryExogenousWriter.write(result, data);
    }
    // timeEnd(ANASS, 'generateForGaragesAndPeriod :: process datas');
    if (garageIds && Array.isArray(garageIds)) {
      return garageIds.map((id) => result[id.toString()]); // To keep ORDER BY
    }
    return garages.map((g) => result[g.id.toString()]);
  };

  GarageHistory.prototype.getHistoryByType = function getHistoryByType(dataType, mustIncludeGlobalScore) {
    if (this.historyByType && this.historyByType[dataType]) {
      const {
        periodId,
        garageId,
        garagePublicDisplayName,
        garagePublicSearchName,
        garagePublicSubscriptions,
        garageSlug,
        frontDesk,
      } = this;
      const tmpHistory = {
        id: this.getId().toString(),
        periodId,
        garageId,
        garagePublicDisplayName,
        garagePublicSearchName,
        garagePublicSubscriptions,
        garageSlug,
        frontDesk,
        ...this.historyByType[dataType],
      };
      if (mustIncludeGlobalScore) {
        tmpHistory.score = this.score;
        tmpHistory.countSurveyRespondedAll = this.countSurveysResponded;
        DataTypes.getAcronyms().forEach((job) => {
          // ['APV', 'VN', ...]
          tmpHistory[`score${job}`] = this[`score${job}`];
          tmpHistory[`countSurveyResponded${job}`] = this[`countSurveyResponded${job}`];
        });
      }
      /* lead fields doesn't depend of dataType */
      tmpHistory.countSurveyLead = this.countSurveyLead;
      tmpHistory.countSurveyLeadVn = this.countSurveyLeadVn;
      tmpHistory.countSurveyLeadVo = this.countSurveyLeadVo;
      tmpHistory.countSurveyLeadTrade = this.countSurveyLeadTrade;

      return new GarageHistory(tmpHistory);
    }
    console.error(
      `garage History of id ${this.periodToken} and garage ${this.garageId} has no history by type please reset history`
    );
    return this;
  };

  GarageHistory.getHistoryByTypeGen = function getHistoryByTypeGen(h, dataType, mustIncludeGlobalScore) {
    if (h.historyByType && h.historyByType[dataType]) {
      const {
        periodId,
        garageId,
        garagePublicDisplayName,
        garagePublicSearchName,
        garagePublicSubscriptions,
        garageSlug,
        frontDesk,
      } = h;
      const tmpHistory = {
        periodId,
        garageId,
        garagePublicDisplayName,
        garagePublicSearchName,
        garagePublicSubscriptions,
        garageSlug,
        frontDesk,
        ...h.historyByType[dataType],
      };
      if (mustIncludeGlobalScore) {
        tmpHistory.score = h.score;
        tmpHistory.countSurveyRespondedAll = h.countSurveysResponded;
        DataTypes.getAcronyms().forEach((job) => {
          // ['APV', 'VN', ...]
          tmpHistory[`score${job}`] = h[`score${job}`];
          tmpHistory[`countSurveyResponded${job}`] = h[`countSurveyResponded${job}`];
        });
      }
      /* lead fields doesn't depend of dataType */
      tmpHistory.countSurveyLead = h.countSurveyLead;
      tmpHistory.countSurveyLeadVn = this.countSurveyLeadVn;
      tmpHistory.countSurveyLeadVo = this.countSurveyLeadVo;
      tmpHistory.countSurveyLeadTrade = h.countSurveyLeadTrade;

      return new GarageHistory(tmpHistory);
    }
    console.error(
      `garage History of id ${h.periodToken} and garge ${h.garageId} has no history by type please reset history`
    );
    return h;
  };

  GarageHistory.remoteMethod('getDoubles', {
    http: {
      path: '/get-doubles',
      verb: 'get',
    },
    accepts: [],
    returns: [{ arg: 'doubles', type: 'array' }],
  });
};
