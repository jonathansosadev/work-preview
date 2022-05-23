const { AuthenticationError } = require('apollo-server-express');
const { ObjectID } = require('mongodb');

const { TIBO, log } = require('../../../../common/lib/util/log');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const GarageTypes = require('../../../../common/models/garage.type');
const DataTypes = require('../../../../common/models/data/type/data-types');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');
const SourceTypes = require('../../../../common/models/data/type/source-types');

const typePrefix = 'dataGetErepReviews';

module.exports.typeDef = `
  extend type Query {
    ${queries.ErepReviews.type}: ${typePrefix}Request
  }

  type ${typePrefix}Request {
    Reviews: [${typePrefix}ReviewWithThread],
    HasMore: Boolean,
    Error: String
  }

  type ${typePrefix}Reply {
      text: String,
      status: String,
      approvedAt: Date,
      rejectedReason: String,
      author: String,
      id: String,
      authorId: String,
      attachment: String,
      isFromOwner: Boolean
  }

  type ${typePrefix}Thread {
      text: String,
      status: String,
      approvedAt: Date,
      rejectedReason: String,
      author: String,
      id: String,
      authorId: String,
      attachment: String,
      isFromOwner: Boolean,
      replies: [${typePrefix}Reply]
  }

  type ${typePrefix}ReviewWithThread {
      id: String,
      garageId: String,
      garagePublicDisplayName: String,
      source: String,
      surveyComment: String,
      surveyRespondedAt: Date,
      surveyScore: Int,
      recommend: Boolean,
      surveyOriginalScore: Int,
      surveyOriginalScale: Int,
      customerFullName: String,
      publicReviewComment: String,
      publicReviewCommentStatus: String,
      publicReviewCommentRejectionReason: String,
      publicReviewCommentApprovedAt: Date,
      thread: [${typePrefix}Thread]
      frontDeskUserName: String
  }
`;

module.exports.resolvers = {
  Query: {
    async ErepReviews(obj, args, context) {
      try {
        const { app } = context;
        const mongoData = app.models.Data.getMongoConnector();
        const mongoGarage = app.models.Garage.getMongoConnector();
        const { period, cockpitType, source, garageId, search, score, response, limit = 10, skip = 0 } = args;
        const { garageIds, godMode, logged, authenticationError } = context.scope;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        // 1. First, let's compute the GarageType from the CockpitType, we will need it for both Garages and Datas
        let garageTypes = null;
        if (cockpitType) {
          garageTypes = { $in: [...GarageTypes.getGarageTypesFromCockpitType(cockpitType)] };
          if (garageTypes.$in.length === 1) {
            garageTypes = garageTypes.$in.pop();
          }
        }

        // 2. We build the Query for the Data
        const dataQuery = {
          shouldSurfaceInStatistics: true,
          type: DataTypes.EXOGENOUS_REVIEW,
        };
        const sort = {
          'service.providedAt': -1,
        };

        // 2.1 Add solo Garage query if present, make sure it is a string

        if (garageId) {
          if(garageId.length <=1 && ObjectID.isValid(garageId[0])) {
            dataQuery.garageId = garageId[0].toString();
          } else {
            dataQuery.garageId = { $in: garageId.map((id) => id.toString())};
          }
        } else {
          if (!godMode) {
            dataQuery.garageId = { $in: garageIds.map((id) => id.toString()) };
          }
          if (garageTypes) {
            dataQuery.garageType = garageTypes;
          }
        }
        // 2.2 Add source filter if present
        if (source) {
          dataQuery['source.type'] = source;
        }

        // 2.3 Add period filter if present
        if (period && period !== GarageHistoryPeriod.ALL_HISTORY) {
          dataQuery.$and = dataQuery.$and || [];
          dataQuery.$and.push({ 'service.providedAt': { $gte: GarageHistoryPeriod.getPeriodMinDate(period) } });
          dataQuery.$and.push({ 'service.providedAt': { $lte: GarageHistoryPeriod.getPeriodMaxDate(period) } });
        }

        // 2.4 Add score level filter if present
        if (score === 'Promoter') {
          dataQuery['review.rating.value'] = { $gte: 9 };
        } else if (score === 'Detractor') {
          dataQuery['review.rating.value'] = { $lte: 6 };
        } else if (score === 'Neutral') {
          dataQuery.$and = dataQuery.$and || [];
          dataQuery.$and.push({ 'review.rating.value': { $gt: 6 } });
          dataQuery.$and.push({ 'review.rating.value': { $lt: 9 } });
        }

        // 2.5 Add search if present
        if (search) {
          let result = search.trim().replace(/^\+\d+\s/, '');
          if (result.match('@')) {
            // only search the left side
            const split = result
              .split('@')[0]
              .split('@')[0]
              .split(/[\\.-]/)
              .map((t) => `"${t}"`)
              .join(' ');
            // 'puyravaud.gilbert@neuf.fr' => 'puyravaud" "gilbert"'
            dataQuery['$text'] = { $search: split, $language: 'none' }; // eslint-disable-line no-param-reassign
          } else if (result.match(/\d/g) && result.match(/\d/g).length === 5) {
            dataQuery['$text'] = { $search: `"${result}"`, $language: 'none' }; // eslint-disable-line no-param-reassign
          } else if (result.match(/\d /g) && result.length > 5) {
            result = result.replace(/\s/g, '');
            // only keep the last 12 numbers
            result = result.slice(-6);
            // format them aa bb cc with a crazy chain
            result = result
              .split('')
              .reverse()
              .join('')
              .replace(/(.{2})/g, '$1 ')
              .split('')
              .reverse()
              .join('')
              .trim(); // eslint-disable-line newline-per-chained-call, max-len
            // '+33 7 69 34 19 95' => '34 19 95'
            dataQuery['$text'] = { $search: `"${result}"`, $language: 'none' }; // eslint-disable-line no-param-reassign
          } else {
            dataQuery['$text'] = { $search: result, $language: 'none' }; // eslint-disable-line no-param-reassign
          }
        }

        // 2.6 Add response filter if present
        if (response === 'NoResponse') {
          dataQuery['review.reply.status'] = { $exists: false };
        } else if (response === 'Rejected') {
          dataQuery['review.reply.status'] = 'Rejected';
        } else if (response === 'Approved') {
          dataQuery['review.reply.status'] = 'Approved';
        }

        // 3. Query reviews via mongo
        const results = await mongoData.find(dataQuery, { limit: limit + 1, sort, skip }).toArray();
        // 4. Map results to match requested fields
        return {
          Reviews: results.slice(0, limit).map((data) => ({
            ...data,
            ...{
              id: data._id.toString(),
              garageId: data.garageId,
              source: (data.source && data.source.type) || '',
              surveyComment: (data.review && data.review.comment && data.review.comment.text) || '',
              surveyRespondedAt: (data.review && data.review.createdAt) || null,
              surveyScore: (data.review && data.review.rating && data.review.rating.value) || null,
              recommend: (data.review && data.review.rating && data.review.rating.recommend) || null,
              surveyOriginalScore: (data.review && data.review.rating && data.review.rating.original) || null,
              surveyOriginalScale: (data.review && data.review.rating && data.review.rating.originalScale) || null,
              customerFullName: (data.customer && data.customer.fullName && data.customer.fullName.value) || '',
              publicReviewComment: (data.review && data.review.reply && data.review.reply.text) || '',
              publicReviewCommentStatus: (data.review && data.review.reply && data.review.reply.status) || '',
              publicReviewCommentRejectionReason:
                (data.review && data.review.reply && data.review.reply.rejectedReason) || '',
              publicReviewCommentApprovedAt: (data.review && data.review.reply && data.review.reply.approvedAt) || null,
              thread: (data.review && data.review.reply && data.review.reply.thread) || [],
              frontDeskUserName: data.service.frontDeskUserName
            },
          })),
          HasMore: results.length === limit + 1,
          Error: '',
        };
      } catch (e) {
        log.error(TIBO, `[APOLLO / DATA-GET-EREP-REVIEWS] ERROR :: ${e.toString()}`);
        return {
          Reviews: [],
          HasMore: false,
          Error: e.toString(),
        };
      }
    },
  },
};
