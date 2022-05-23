const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const { isGarageScoreUserByEmail } = require('../../../../common/lib/garagescore/custeed-users');

const {
  cockpitTopFiltersGetFrontDeskUsersCusteed,
} = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { DataTypes, LeadSaleTypes } = require('../../../../frontend/utils/enumV2');
const lruCache = require('lru-cache');
const { MOMO, log } = require('../../../../common/lib/util/log');
const typePrefix = 'cockpitTopFiltersGetFrontDeskUsersCusteed';

const GLOBAL = {
  // this is not a mistake, we can query all dataTypes and all LeadSaleTypes
  // leadSaleTypes are basically dataTypes plus the "Unknown" value
  eligibleDataTypes: [...LeadSaleTypes.values()],
  processedArgs: {
    dataTypes: [],
    garageIds: [],
    isManager: false,
  },
  userCache: {},
  cache: new lruCache({
    maxAge: 1000 * 60 * 60 * 24, // 24h,
    noDisposeOnSet: true,
    dispose: function () {
      // when cache is stale
      this.isOutdated = true;
    },
  }),
  cacheHasBeenSet: false,
};

module.exports.GLOBAL = GLOBAL;

module.exports.typeDef = `
  extend type Query {
    ${cockpitTopFiltersGetFrontDeskUsersCusteed.type}: [${typePrefix}Result]
  }
  type ${typePrefix}Result {    
    id: ID
    frontDeskUserName: String
    garageId: ID
    garagePublicDisplayName: String
  }

`;

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

        if (!garageIds || !garageIds.length) {
          throw new UserInputError(`Invalid argument: garageIds are empty`);
        }

        if (!garageIds.every((gId) => gId === 'All' || ObjectId.isValid(gId.toString()))) {
          throw new UserInputError(`Invalid argument: garageIds`);
        }

        if (garageIds.includes('All')) {
          GLOBAL.processedArgs.garageIds = [...userGarageIdsString];
        } else {
          // if some specific garageIds are requested (args) , keep only the ones that are present in the userGarageIds
          GLOBAL.processedArgs.garageIds = garageIds
            .filter((gId) => userGarageIdsString.includes(gId))
            .map((gId) => gId.toString());
        }

        //--------------------------------------------------------------------------------------//
        //                                         Query Arguments                              //
        //--------------------------------------------------------------------------------------//
        if (!dataTypes || !dataTypes.length) {
          throw new UserInputError(
            `Invalid argument: dataTypes are empty, they are required when the type lead is specified`
          );
        }

        if (!dataTypes.every((type) => type === 'All' || GLOBAL.eligibleDataTypes.includes(type))) {
          throw new UserInputError(
            `Invalid argument: dataTypes. Available values are ${[
              'All',
              ...Object.values(GLOBAL.eligibleDataTypes),
            ].join(', ')}`
          );
        }

        if (dataTypes.includes('All') || dataTypes.length === GLOBAL.eligibleDataTypes.length) {
          GLOBAL.processedArgs.dataTypes = [...GLOBAL.eligibleDataTypes];
        } else {
          GLOBAL.processedArgs.dataTypes = [...dataTypes];
        }

        GLOBAL.processedArgs.isManager = godMode || (await user.isManager());

        if (!GLOBAL.cacheHasBeenSet || GLOBAL.cache.isOutdated) {
          await initializeCache(app);
        }

        const res = queryFromCache(user.getId().toString(), GLOBAL.processedArgs);

        return res;
      } catch (error) {
        log.error(MOMO, error);
        return error;
      }
    },
  },
};

async function initializeCache(app) {
  try {
    //--------------------------------------------------------------------------------------//
    //                                       Utility                                        //
    //--------------------------------------------------------------------------------------//
    const getFrontDeskUserName = (userId) => {
      return GLOBAL.userCache[userId.toString()];
    };

    const addNewCacheItem = (garageId, values) => {
      GLOBAL.cache.set(
        garageId,
        values.reduce((acc, { userId, type, garagePublicDisplayName }) => {
          const obj = acc.find((e) => e.id === userId);

          if (obj) {
            obj.types.push(type);
          } else if (userId.toString() in GLOBAL.userCache) {
            acc.push({
              id: userId,
              frontDeskUserName: getFrontDeskUserName(userId),
              types: [type],
              garageId: garageId,
              garagePublicDisplayName: garagePublicDisplayName,
            });
          }

          return acc;
        }, [])
      );
    };

    const updateCachedItemType = (garageId, userId, type, garagePublicDisplayName) => {
      const cachedItem = GLOBAL.cache.get(garageId);
      if (!cachedItem) {
        return;
      }

      const cachedFrontDeskUser = cachedItem.find((e) => e.id === userId);
      if (!cachedFrontDeskUser && userId.toString() in GLOBAL.userCache) {
        cachedItem.push({
          id: userId,
          frontDeskUserName: getFrontDeskUserName(userId),
          types: [type],
          garageId: garageId,
          garagePublicDisplayName: garagePublicDisplayName,
          addedBy: 'Unsatisifed',
        });
      } else if (cachedFrontDeskUser && !cachedFrontDeskUser.types.includes(type)) {
        cachedFrontDeskUser.types.push(type);
      }
    };

    //--------------------------------------------------------------------------------------//
    //                                         User                                         //
    //--------------------------------------------------------------------------------------//
    const userConnector = app.models.User.getMongoConnector();
    /* filter out custeed users */
    const users = await userConnector
      .find({})
      .project({ _id: true, firstName: true, lastName: true, email: true })
      .toArray();

    const custeedUsers = [];
    for (const user of users) {
      if (isGarageScoreUserByEmail(user.email)) {
        custeedUsers.push(user._id.toString());
        continue;
      }

      if (user.firstName || user.lastName) {
        GLOBAL.userCache[user._id.toString()] = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      } else {
        GLOBAL.userCache[user._id.toString()] = user.email;
      }
    }

    //--------------------------------------------------------------------------------------//
    //                                         Lead                                         //
    //--------------------------------------------------------------------------------------//
    const cockpitTopFilterConnector = app.models.CockpitTopFilter.getMongoConnector();
    const leadAggregate = [
      {
        $match: {
          $and: [
            {
              leadTicketManager: {
                $ne: null,
              },
            },
            {
              leadTicketManager: {
                $ne: 'undefined',
              },
            },
          ],
          leadSaleType: {
            $in: [...LeadSaleTypes.values()],
          },
          source: {
            $ne: 'automation',
          },
        },
      },
      {
        $project: {
          _id: true,
          type: '$leadSaleType',
          garageId: true,
          userId: '$leadTicketManager',
          garagePublicDisplayName: true,
        },
      },
      {
        $group: {
          _id: '$garageId',
          values: {
            $addToSet: {
              userId: '$userId',
              type: '$type',
              garageId: '$garageId',
              garagePublicDisplayName: '$garagePublicDisplayName',
            },
          },
        },
      },
    ];

    const leadRes = await cockpitTopFilterConnector.aggregate(leadAggregate).toArray();

    for (const { _id: garageId, values } of leadRes) {
      addNewCacheItem(garageId, values);
    }

    //--------------------------------------------------------------------------------------//
    //                                     Unsatisfied                                      //
    //--------------------------------------------------------------------------------------//
    const unsatisfiedAggregate = [
      {
        $match: {
          $and: [
            {
              unsatisfiedTicketManager: {
                $ne: null,
              },
            },
            {
              unsatisfiedTicketManager: {
                $ne: 'undefined',
              },
            },
          ],
          type: {
            $in: [...DataTypes.values()],
          },
          source: {
            $ne: 'automation',
          },
        },
      },
      {
        $project: {
          _id: true,
          type: true,
          garageId: true,
          userId: '$unsatisfiedTicketManager',
          garagePublicDisplayName: true,
        },
      },
      {
        $group: {
          _id: '$garageId',
          values: {
            $addToSet: {
              userId: '$userId',
              type: '$type',
              garageId: '$garageId',
              garagePublicDisplayName: '$garagePublicDisplayName',
            },
          },
        },
      },
    ];

    const unsatisfiedRes = await cockpitTopFilterConnector.aggregate(unsatisfiedAggregate).toArray();
    for (const { _id: garageId, values } of unsatisfiedRes) {
      if (!GLOBAL.cache.has(garageId)) {
        addNewCacheItem(garageId, values);
      } else {
        values.forEach((value) => {
          updateCachedItemType(garageId, value.userId, value.type, value.garagePublicDisplayName);
        });
      }
    }

    GLOBAL.cacheHasBeenSet = true;
    GLOBAL.cache.isOutdated = false;
  } catch (error) {
    log.error(MOMO, `[initializeCache] : ${error.message}`);
  }
}

function queryFromCache(userId, { garageIds = [], dataTypes = [], isManager = false }) {
  const filtered = [];
  garageIds.forEach((garageId) => {
    const cachedElement = GLOBAL.cache.get(garageId) || [];

    let tmp = [...cachedElement];
    // In case the requesting user isn't a "manager" he has access only to tickets assigned to him
    if (!isManager) {
      tmp = tmp.filter((e) => e.id.toString() === userId.toString());
    }

    // if not all types selected ,filter by types
    if (dataTypes.length && dataTypes.length !== GLOBAL.eligibleDataTypes.length) {
      tmp = tmp.filter((e) => dataTypes.some((type) => e.types.includes(type)));
    }

    filtered.push(...tmp);
  });

  return filtered;
}
