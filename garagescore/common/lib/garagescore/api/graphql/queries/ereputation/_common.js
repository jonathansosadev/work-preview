/**
 * this file contain the common arguments and filter for the list and the export query
 */
const graphql = require('graphql');
const config = require('config');
const GarageHistoryPeriod = require('../../../../../../models/garage-history.period');
const decodeArguments = require('../../decodeArguments.js');
const dataTypes = require('../../../../../../../common/models/data/type/data-types.js');
const queriesCommon = require('../_common');

module.exports = {
  argumentsDefinition: {
    limit: {
      name: 'limit',
      default: 10, // for documentation only graphgl not support default attribute
      type: graphql.GraphQLInt,
    },
    skip: {
      name: 'skip',
      type: graphql.GraphQLInt,
    },
    periodId: {
      name: 'periodId',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    garageId: {
      name: 'garageId',
      type: graphql.GraphQLString,
    },
    cockpitType: {
      name: 'cockpitType',
      type: graphql.GraphQLString,
    },
    search: {
      name: 'search',
      type: graphql.GraphQLString,
    },
    satisfactionLevel: {
      name: 'satisfactionLevel',
      type: graphql.GraphQLString,
    },
    source: {
      name: 'source',
      type: graphql.GraphQLString,
    },
    publicReviewCommentStatus: {
      name: 'publicReviewCommentStatus',
      type: graphql.GraphQLString,
    },
  },
  // FOR MIGRATION ADD YOUR METHODS IN : server/webservers-standalones/api/_common/data-generate-filters.js
  async generateFilters(args, req) {
    args = decodeArguments.decodeArguments(args); // eslint-disable-line no-param-reassign
    const filters = {
      limit: args.limit < 1 || args.limit > 100 ? config.get('server.queryLimits.list') : args.limit,
      where: { type: dataTypes.EXOGENOUS_REVIEW, 'review.createdAt': { gt: new Date(0) } },
      order: 'review.createdAt DESC',
    };
    if (args.periodId !== GarageHistoryPeriod.ALL_HISTORY) {
      if (!filters.where.and) {
        filters.where.and = []; // eslint-disable-line no-param-reassign
      }
      filters.where.and.push({ 'review.createdAt': { gte: GarageHistoryPeriod.getPeriodMinDate(args.periodId) } });
      filters.where.and.push({ 'review.createdAt': { lte: GarageHistoryPeriod.getPeriodMaxDate(args.periodId) } });
    }
    await queriesCommon.addGarageIdToFilters(req, args, filters);

    if (args.satisfactionLevel === 'Promoter') {
      filters.where['review.rating.value'] = { gte: 9 };
    }
    if (args.satisfactionLevel === 'Detractor') {
      filters.where['review.rating.value'] = { lte: 6 };
    }
    if (args.satisfactionLevel === 'Neutral') {
      if (!filters.where.and) {
        filters.where.and = [];
      }
      filters.where.and.push({ 'review.rating.value': { gt: 6 } });
      filters.where.and.push({ 'review.rating.value': { lt: 9 } });
    }

    if (args.publicReviewCommentStatus) {
      filters.where['review.reply.status'] =
        args.publicReviewCommentStatus !== 'NoResponse'
          ? args.publicReviewCommentStatus
          : { nin: ['Rejected', 'Approved'] };
    }

    if (args.source) {
      filters.where['source.type'] = args.source;
    }

    if (args.search) {
      queriesCommon.addTextSearchToFilters(filters, args.search);
    }

    return filters;
  },
  getLocale(req) {
    let locale;
    if (req.headers && req.headers['gs-locale']) {
      locale = req.headers['gs-locale'].split(',')[0].toLocaleLowerCase().substring(0, 2);
    }
    return locale && ['en', 'es', 'fr'].includes(locale) ? locale : 'fr';
  },
};
