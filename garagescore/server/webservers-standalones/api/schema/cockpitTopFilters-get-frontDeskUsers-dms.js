const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { cockpitTopFiltersGetFrontDeskUsersDms } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { DataTypes } = require('../../../../frontend/utils/enumV2');
const lruCache = require('lru-cache');
const { unionWith } = require('lodash');
const { MOMO, log } = require('../../../../common/lib/util/log');
const typePrefix = 'cockpitTopFiltersGetFrontDeskUsersDms';

module.exports.typeDef = `
  extend type Query {
    ${cockpitTopFiltersGetFrontDeskUsersDms.type}: [${typePrefix}Result]
  }
  type ${typePrefix}Result {    
    id: ID
    frontDeskUserName: String
    garageId: ID
    garagePublicDisplayName: String
  }

`;

const GLOBAL = {
  cache: new lruCache({
    maxAge: 1000 * 60 * 60 * 24, // 24h,
    noDisposeOnSet: true,
    dispose: function () {
      // when cache is stale
      this.isOutdated = true;
    },
  }),
  cacheHasBeenSet: false,
  cacheIsBeingSet: false,
  eligibleDataTypes: [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE],
};

module.exports.GLOBAL = GLOBAL;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode, garageIds: userGarageIds },
        } = context;
        const { dataTypes = [], garageIds = [] } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const userGarageIdsString = userGarageIds.map((gId) => gId.toString());

        if (
          dataTypes.length &&
          !dataTypes.every((dataType) => GLOBAL.eligibleDataTypes.includes(dataType) || dataType === 'All')
        ) {
          throw new UserInputError(
            `Invalid argument: dataTypes with value ${JSON.stringify(
              dataTypes
            )}, allowed dataTypes are : ${JSON.stringify(GLOBAL.eligibleDataTypes)}`
          );
        }

        //--------------------------------------------------------------------------------------//
        //                               Process Query Arguments                                //
        //--------------------------------------------------------------------------------------//
        const processedArgs = {
          requestedAllGarageIds: garageIds.includes('All'),
          requestedAllDataTypes: dataTypes.includes('All') || dataTypes.length === GLOBAL.eligibleDataTypes.length,
          garageIds: [],
          dataTypes: [],
        };

        if (processedArgs.requestedAllGarageIds) {
          processedArgs.garageIds = [...userGarageIdsString];
        } else {
          // if some specific garageIds are requested (args) , keep only the ones that are present in the userGarageIds
          processedArgs.garageIds = garageIds.filter((gId) => userGarageIdsString.includes(gId));
        }

        if (processedArgs.requestedAllDataTypes) {
          processedArgs.dataTypes = [...GLOBAL.eligibleDataTypes];
        } else {
          processedArgs.dataTypes = [...dataTypes];
        }

        try {
          if (!GLOBAL.cacheHasBeenSet || GLOBAL.cache.isOutdated) {
            if (!GLOBAL.cacheIsBeingSet) {
              // Not putting await on purpose, the cache initilization will be triggered but the response will come from the query and awaiting the cache to initiliaze
              initializeCache(app);
            }
            const queryResult = await getFrontDeskUsersDMS(app, processedArgs);
            return queryResult || [];
          }
          /* if all or 1 dataTypes have been requested */
          if (processedArgs.requestedAllDataTypes || processedArgs.dataTypes.length === 1) {
            const cache =
              GLOBAL.cache.get(processedArgs.requestedAllDataTypes ? 'All' : processedArgs.dataTypes[0]) || {};

            return processedArgs.garageIds.flatMap((gId) => cache[gId.toString()] || []);
          } else {
            /* 2 dataTypes have been requested, we need to perform an union */

            const dataType_cache_1 = GLOBAL.cache.get(processedArgs.dataTypes[0]);
            const dataType_cache_2 = GLOBAL.cache.get(processedArgs.dataTypes[1]);

            return unionWith(
              [
                ...processedArgs.garageIds.flatMap((gId) => dataType_cache_1[gId.toString()] || []),
                ...processedArgs.garageIds.flatMap((gId) => dataType_cache_2[gId.toString()] || []),
              ],
              (a, b) => a.id === b.id && a.garageId === b.garageId
            );
          }
        } catch (error) {
          log.error(MOMO, `Cache error ${error.message}`);
          // if there is an error on the cache, perform the query without cache
          const queryResult = await getFrontDeskUsersDMS(app, processedArgs);
          return queryResult || [];
        }
      } catch (error) {
        log.error(MOMO, error);
        return error;
      }
    },
  },
};

async function initializeCache(app) {
  try {
    const where = {
      type: { $in: [...GLOBAL.eligibleDataTypes] },
      source: { $ne: 'automation' },
    };

    const group = {
      _id: '$garageId',
      values: {
        $addToSet: {
          id: '$frontDeskUserName',
          frontDeskUserName: '$frontDeskUserName',
          garageId: '$garageId',
          garagePublicDisplayName: '$garagePublicDisplayName',
        },
      },
      valuesWithTypes: {
        $addToSet: {
          id: '$frontDeskUserName',
          frontDeskUserName: '$frontDeskUserName',
          garageId: '$garageId',
          garagePublicDisplayName: '$garagePublicDisplayName',
          type: '$type',
        },
      },
    };

    const project = {
      _id: true,
      All: '$values',
      [DataTypes.MAINTENANCE]: {
        $filter: {
          input: '$valuesWithTypes',
          as: 'frontDesk',
          cond: {
            $eq: ['$$frontDesk.type', DataTypes.MAINTENANCE],
          },
        },
      },
      [DataTypes.NEW_VEHICLE_SALE]: {
        $filter: {
          input: '$valuesWithTypes',
          as: 'frontDesk',
          cond: {
            $eq: ['$$frontDesk.type', DataTypes.NEW_VEHICLE_SALE],
          },
        },
      },
      [DataTypes.USED_VEHICLE_SALE]: {
        $filter: {
          input: '$valuesWithTypes',
          as: 'frontDesk',
          cond: {
            $eq: ['$$frontDesk.type', DataTypes.USED_VEHICLE_SALE],
          },
        },
      },
    };

    const CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
    const res = await CockpitTopFilter.aggregate([
      { $match: where },
      { $group: group },
      { $project: project },
    ]).toArray();

    // reset cache
    GLOBAL.cache.reset();

    // set the initial empty cache
    GLOBAL.cache.set('All', {});
    GLOBAL.cache.set(DataTypes.MAINTENANCE, {});
    GLOBAL.cache.set(DataTypes.NEW_VEHICLE_SALE, {});
    GLOBAL.cache.set(DataTypes.USED_VEHICLE_SALE, {});

    // fill the cache
    res.forEach((DMSbyGarage) => {
      const All = GLOBAL.cache.get('All') || {};
      const Apv = GLOBAL.cache.get(DataTypes.MAINTENANCE) || {};
      const Vn = GLOBAL.cache.get(DataTypes.NEW_VEHICLE_SALE) || {};
      const Vo = GLOBAL.cache.get(DataTypes.USED_VEHICLE_SALE) || {};

      GLOBAL.cache.set('All', { ...All, [DMSbyGarage._id.toString()]: DMSbyGarage.All });
      GLOBAL.cache.set(DataTypes.MAINTENANCE, {
        ...Apv,
        [DMSbyGarage._id.toString()]: DMSbyGarage[DataTypes.MAINTENANCE],
      });
      GLOBAL.cache.set(DataTypes.NEW_VEHICLE_SALE, {
        ...Vn,
        [DMSbyGarage._id.toString()]: DMSbyGarage[DataTypes.NEW_VEHICLE_SALE],
      });
      GLOBAL.cache.set(DataTypes.USED_VEHICLE_SALE, {
        ...Vo,
        [DMSbyGarage._id.toString()]: DMSbyGarage[DataTypes.USED_VEHICLE_SALE],
      });
    });
    // the cache have been successfully set
    GLOBAL.cacheHasBeenSet = true;
    GLOBAL.cache.isOutdated = false;
  } catch (error) {
    log.error(MOMO, `Failed to build the cache : ${error.message}`);
  }
}
/**
 * @param {*} app
 * @param {{garageIds : String[], dataTypes : String[]}} processedArgs
 * @returns {Promise<{id : String, frontDeskUserName : String, garageId : String, type : String}[]>} Query result
 */
async function getFrontDeskUsersDMS(app, { garageIds = [], dataTypes = [] }) {
  const where = {
    garageId: garageIds.length === 1 ? garageIds[0] : { $in: [...garageIds] },
    type: dataTypes.length === 1 ? dataTypes[0] : { $in: [...dataTypes] },
    source: { $ne: 'automation' },
  };

  const groupDistinct = {
    _id: null,
    values: {
      $addToSet: {
        id: '$frontDeskUserName',
        frontDeskUserName: '$frontDeskUserName',
        garageId: '$garageId',
        garagePublicDisplayName: '$garagePublicDisplayName',
      },
    },
  };

  const CockpitTopFilter = app.models.CockpitTopFilter.getMongoConnector();
  const res = await CockpitTopFilter.aggregate([{ $match: where }, { $group: groupDistinct }]).toArray();
  return res[0] ? res[0].values : [];
}
