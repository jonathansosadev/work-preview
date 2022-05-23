const { ObjectID } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const GarageTypes = require('../../../../common/models/garage.type');
const GarageSubscriptions = require('../../../../common/models/garage.subscription.type');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const hint = require('../../../../common/lib/garagescore/kpi/hint');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const { isSubscribed } = require('../../../../common/models/garage/garage-methods');
const { searchGarages } = require('../_common/search-garages');
const KpiTypes = require('../../../../common/models/kpi-type');

const typePrefix = 'kpiByPeriodGetErepKpiList';
module.exports.typeDef = `
  extend type Query {
    ${queries.kpiByPeriodGetErepKpiList.type}: ${typePrefix}
  }
  type ${typePrefix} {
    kpiList: [${typePrefix}ErepKpi]
    hasMore: Boolean
  }
  type ${typePrefix}ErepKpi {
    garageId: String
    externalId: String
    garagePublicDisplayName: String
    garageSlug: String
    hasSubscription: Boolean
    score: Float
    scoreNPS: Float
    countReviews: Int
    countReviewsWithScore: Int
    countReviewsWithRecommendation: Int
    countPromotors: Int
    countDetractors: Int
    countDetractorsWithResponse: Int
    countNeutrals: Int
    promotorsPercent: Float
    detractorsPercent: Float
    neutralsPercent: Float
    countRecommend: Float
    recommendPercent: Float

    kpisBySource: ${typePrefix}KPIBySource
  }

  type ${typePrefix}KPIBySource {
    Google: ${typePrefix}KPIForSource
    Facebook: ${typePrefix}KPIForSource
    PagesJaunes: ${typePrefix}KPIForSource
  }

  type ${typePrefix}KPIForSource {
    countReviews: Int
    countReviewsWithScore: Int
    countReviewsWithRecommendation: Int
    score: Float
    countPromotors: Int
    countDetractors: Int
    countNeutrals: Int
    countDetractorsWithResponse: Int
    scoreNPS: Float
    promotorsPercent: Float
    detractorsPercent: Float
    neutralsPercent: Float
    countRecommend: Int
    recommendPercent: Float
    connection: ${typePrefix}SourceConnectionDetails
  }

  type ${typePrefix}SourceConnectionDetails {
    connected: Boolean
    error: String
    lastRefresh: String
  }
`;
module.exports.resolvers = {
  Query: {
    kpiByPeriodGetErepKpiList: async (obj, args, context) => {
      const {
        period,
        garageId,
        cockpitType,
        orderBy = 'scoreNPS',
        order = 'DESC',
        skip = 0,
        limit = 10,
        search,
      } = args;

      const {
        app,
        scope: { logged, authenticationError, godMode, garageIds },
      } = context;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }

      /**
       * AGGREGATION STAGE : $match
       * Filtering the data according to the query
       */
      const getGarageTypeFilter = () => {
        if (!cockpitType && (!godMode || garageId)) return null;
        let cockpitTypeToMatch;
        if (cockpitType) cockpitTypeToMatch = cockpitType || GarageTypes.DEALERSHIP;
        else if (!garageId && godMode) cockpitTypeToMatch = GarageTypes.DEALERSHIP;
        else return null;

        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitTypeToMatch);
        return garageTypesToMatch.length === 1
          ? GarageTypes.getIntegerVersion(cockpitType)
          : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
      };
      const garageTypesFilter = getGarageTypeFilter();

      const getGarageIdsFilter = async () => {
        if (search) {
          const foundGarageIds = await searchGarages(app, search, garageIds);
          if (foundGarageIds === false) return false;
          const filteredGarageIds = foundGarageIds
            .filter((foundGarageId) => !garageId || foundGarageId.toString() === garageId.toString())
            .map((filteredGarageId) => new ObjectID(filteredGarageId.toString()));
          if (!filteredGarageIds.length) return false;
          if (filteredGarageIds.length === 1) return filteredGarageIds[0];
          return { $in: filteredGarageIds };
        }
        if (garageId) {
          if (garageId.length <= 1) {
            return new ObjectID(garageId[0]);
          }
          return { $in: garageId.map((id) => new ObjectID(id)) };
        }
        if (!godMode) return { $in: garageIds.map((id) => new ObjectID(id)) };
        return null;
      };
      const garageIdsFilter = await getGarageIdsFilter();
      if (garageIdsFilter === false) {
        // In this case the search on garages produced no result, so we send empty results
        return { hasMore: false, kpiList: [] };
      }
      const getPeriodFilter = () => {
        const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period, { convertToMonthlyList: true });
        return Array.isArray(periods) ? { $in: periods } : periods;
      };

      const $match = {
        [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
        ...(garageTypesFilter ? { [KpiDictionary.garageType]: garageTypesFilter } : {}),
        ...(garageIdsFilter ? { [KpiDictionary.garageId]: garageIdsFilter } : {}),
        [KpiDictionary.period]: getPeriodFilter(),
      };

      /**
       * AGGREGATION STAGE : $project
       * Selecting the keys we need
       */
      // List of sources for which we will get the KPIs
      // The first element, '', is for all sources, which has no suffix
      const ErepSources = ['', 'Google', 'Facebook', 'PagesJaunes'];
      const keyForSource = (key, source) => `$${KpiDictionary[key + source]}`;
      const projectKpiBySource = (source) => ({
        [`countReviews${source}`]: keyForSource('erepCountReviews', source),
        [`countReviewsWithScore${source}`]: keyForSource('erepCountHasRating', source),
        [`countReviewsWithRecommendation${source}`]: keyForSource('erepCountHasRecommendation', source),
        [`sumRating${source}`]: keyForSource('erepSumRating', source),
        [`countPromotors${source}`]: keyForSource('erepCountPromoters', source),
        [`countDetractors${source}`]: keyForSource('erepCountDetractors', source),
        [`countNeutrals${source}`]: keyForSource('erepCountPassives', source),
        [`countDetractorsWithResponse${source}`]: {
          $subtract: [
            keyForSource('erepCountDetractors', source),
            { $ifNull: [keyForSource('erepCountDetractorsWithoutResponse', source), 0] },
          ],
        },
        [`countRecommend${source}`]: keyForSource('erepCountRecommend', source),
      });
      const $project = {
        garageId: `$${KpiDictionary.garageId}`,
        // History by source (global, Google, Facebook, PagesJaunes)
        // Flattened so they can be processed in the $group stage
        ...Object.fromEntries(ErepSources.map((source) => Object.entries(projectKpiBySource(source))).flat()),
      };

      /**
       * AGGREGATION STAGE : $group
       * Summing accumulative keys
       */
      const $group = {
        _id: '$garageId',
        // Summing all the keys from $project that can be directly summed
        ...Object.fromEntries(
          Object.keys($project)
            .filter((key) => !['garageId'].includes(key))
            .map((key) => [key, { $sum: `$${key}` }])
        ),
      };

      /**
       *  AGGREGATION STAGE : $addFields
       *  Now we'll add the non accumulative keys like, percentages and stuff
       */
      const safeDivide = (num, den) => ({ $cond: [{ $gt: [den, 0] }, { $divide: [num, den] }, null] });
      const addKeysForSource = (source) => ({
        [`score${source}`]: safeDivide(`$sumRating${source}`, `$countReviewsWithScore${source}`),
        [`promotorsPercent${source}`]: {
          $multiply: [safeDivide(`$countPromotors${source}`, `$countReviews${source}`), 100],
        },
        [`detractorsPercent${source}`]: {
          $multiply: [safeDivide(`$countDetractors${source}`, `$countReviews${source}`), 100],
        },
        [`neutralsPercent${source}`]: {
          $multiply: [safeDivide(`$countNeutrals${source}`, `$countReviews${source}`), 100],
        },
        [`scoreNPS${source}`]: {
          $multiply: [
            safeDivide(
              { $subtract: [`$countPromotors${source}`, `$countDetractors${source}`] },
              `$countReviews${source}`
            ),
            100,
          ],
        },
        [`recommendPercent${source}`]: {
          $multiply: [safeDivide(`$countRecommend${source}`, `$countReviews${source}`), 100],
        },
      });
      const $addFields = {
        garageId: '$_id',
        // Adding fields for each source: '', Google, Facebook & PagesJaunes
        // Fields to add: promotorsPercent, detractorsPercent, neutralsPercent, scoreNPS & recommendPercent
        ...Object.fromEntries(ErepSources.map((source) => Object.entries(addKeysForSource(source))).flat()),
      };

      /**
       *  AGGREGATION STAGES : $sort / $skip / $limit
       */
      // Sort
      const $sort = { [orderBy]: order === 'ASC' ? 1 : -1, _id: 1 };
      // Skip & limit
      const $skip = skip || 0;
      const $limit = limit + 1;

      /**
       * Performing the aggregate
       */
      const aggregate = [{ $match }, { $project }, { $group }, { $addFields }, { $sort }, { $skip }, { $limit }];

      const aggregationResult = await app.models.KpiByPeriod.getMongoConnector()
        .aggregate(aggregate, { hint: hint($match) })
        .toArray();

      /**
       * Find garages in order to enrich the aggregation result
       */
      const garageIdsFromKpis = aggregationResult.map(({ garageId }) => garageId);
      const garagesFields = {
        _id: true,
        externalId: true,
        publicDisplayName: true,
        slug: true,
        subscriptions: true,
        exogenousReviewsConfigurations: true,
      };
      const garages = await app.models.Garage.getMongoConnector()
        .find({ _id: { $in: garageIdsFromKpis } }, { projection: garagesFields })
        .toArray();
      const getErepSourcesConnections = (exogenousConfigs = {}, garageSubscriptions) => {
        const isSubscribedErep = isSubscribed(garageSubscriptions, GarageSubscriptions.E_REPUTATION);
        return Object.fromEntries(
          ErepSources.filter((s) => s).map((source) => {
            const { token, externalId, lastRefresh = null, error = '' } = exogenousConfigs[source] || {};
            const connected = !!(token && externalId && isSubscribedErep);
            return [source, { connected, error, lastRefresh }];
          })
        );
      };
      const garagesObj = Object.fromEntries(
        garages.map((garage) => [
          garage._id.toString(),
          {
            externalId: garage.externalId,
            garagePublicDisplayName: garage.publicDisplayName,
            garageSlug: garage.slug,
            hasSubscription: isSubscribed(garage.subscriptions, GarageSubscriptions.E_REPUTATION),
            connections: getErepSourcesConnections(garage.exogenousReviewsConfigurations, garage.subscriptions),
          },
        ])
      );
      
      /**
       * check if there is at least one connection
       * connections Object
       * @returns 
       */
       const isConnected = (connections) => {
        return Object.values(connections).some((values) => values.connected);
      };

      /**
       * Enrich our aggregation results and send them
       */
      const hasMore = aggregationResult.length === limit + 1;
      const keysList = [
        'countReviews',
        'countReviewsWithScore',
        'countReviewsWithRecommendation',
        'countPromotors',
        'countDetractors',
        'countNeutrals',
        'countDetractorsWithResponse',
        'countRecommend',
        'score',
        'promotorsPercent',
        'detractorsPercent',
        'neutralsPercent',
        'scoreNPS',
        'recommendPercent',
      ];
      const kpiList = aggregationResult.slice(0, limit).map((aggregationResult) => {
        const garageId = aggregationResult.garageId.toString();
        const { externalId, garagePublicDisplayName, garageSlug, hasSubscription, connections } = garagesObj[garageId];

        const globalKpis = isConnected(connections) ? Object.fromEntries(keysList.map((key) => [key, aggregationResult[key]])) : [];

        const getKpisForSource = (source) => {
          const isConnected = connections[source].connected;
          const kpisForSource = isConnected ? Object.fromEntries(keysList.map((key) => [key, aggregationResult[key + source]])) : {};
          return { ...kpisForSource, connection: connections[source] };
        };
        
        const kpisBySource = Object.fromEntries(ErepSources.filter((s) => s).map((source) => [source, getKpisForSource(source)]));

        return {
          garageId,
          externalId,
          garagePublicDisplayName,
          garageSlug,
          hasSubscription,
          ...globalKpis,
          kpisBySource,
        };
      });

      return { hasMore, kpiList };
    },
  },
};
