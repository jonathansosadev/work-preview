/**
 * Query KPIs source list, aggregate created by Simon/keysim
 */
const graphql = require('graphql');
const { ObjectID } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');

const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const DataTypes = require('../../../../common/models/data/type/data-types');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiEncoder = require('../../../../common/lib/garagescore/kpi/KpiEncoder');
const { GARAGE_KPI, USER_KPI } = require('../../../../common/models/kpi-type');
const { $match: buildMatch } = require('../../../../common/lib/garagescore/kpi/buildMatch.js');
const { getSingleFilter } = require('../../../../common/lib/garagescore/api/cockpit-top-filters');
const { BANG, log } = require('../../../../common/lib/util/log');
const computePercentKeys = require('../../../../common/lib/garagescore/kpi/kpiPercent');
const { managerDisplayName } = require('../../../../frontend/util/user');

const listFields = KpiDictionary.keysAsArray.map((key) => {
  return `${key}: ${KpiDictionary.keyTypes[key] === String ? graphql.GraphQLString : graphql.GraphQLInt}`;
});

const typePrefix = 'kpiByPeriodGetList';


module.exports.typeDef = `
  extend type Query {
    ${queries.kpiByPeriodGetList.type}: ${typePrefix}Request
  }

  type ${typePrefix}Request {
    list: [${typePrefix}List]
    hasMore: Boolean
  }

  type ${typePrefix}List {
	  externalId: String
    displayName: String
    hideDirectoryPage: Boolean
    garageSlug: String
    garagePublicDisplayName: String
    isDeleted: Boolean
    isUnassigned: Boolean
    ${listFields.toString()}
  }
`;

function smartSearch(query, values) {
  const results = [];
  const normalizedSearch = (query || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  for (const item of values) {
    if (!item.searchField) item.searchField = '';
    if (
      item.searchField
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(normalizedSearch)
    ) {
      results.push(item.id);
    }
  }
  return results;
}

// ( Collection garages )
// INDEX publicDisplayName && externalId && type && _id
async function getGaragesIdsByName(garagesCollection, text, types, garageIds) {
  const filters = {
    $or: [{ publicDisplayName: { $regex: text, $options: 'i' } }, { externalId: { $regex: text, $options: 'i' } }],
    ...(garageIds && { _id: { $in: garageIds } }),
    ...(types && types.length > 0 && { type: { $in: types } }),
  };
  const res = await garagesCollection.find(filters, { projection: { _id: 1 } }).toArray();
  return res.map((x) => x._id);
}

// add search paramaters to $match
// return false if no results
async function addSearchToMatch(
  app,
  $match,
  query,
  isManager,
  garageIds,
  cockpitInterface,
  userId,
  garageId,
  cockpitType,
  dataType,
  listType
) {
  // search (to optimize if necessary)
  if (!query) return true;

  if (cockpitInterface === 'garages') {
    const garageCollection = app.models.Garage.getMongoConnector();
    const garageIds = Array.isArray(garageId) ? garageId.map((id) => ObjectID(id)) : [ObjectID(garageId)];
    const tmp = await getGaragesIdsByName(garageCollection, query, cockpitType ? [cockpitType] : null, garageIds)
    const filteredGarageIds = [...new Set(tmp)];
    if (filteredGarageIds.length > 1) {
      $match.garageId = { $in: filteredGarageIds };
    } else if (filteredGarageIds.length === 1) {
      $match.garageId = filteredGarageIds[0];
    } else {
      return false;
    }
  } else if (isManager) {
    // search user
    let userIds = [];
    if (!userId) {
      const filterFields = [];
      if (garageId) {
        filterFields.push({
          label: 'garageId',
          values: garageId,
        });
      }
      if (cockpitType) {
        filterFields.push({
          label: 'garageType',
          values: [cockpitType],
        });
      }
      if (dataType) {
        filterFields.push({
          label: 'type',
          values: [dataType],
        });
      }
      const propertyName = `${listType}TicketManager`;
      const singleFilters = await getSingleFilter(app, propertyName, filterFields);
      userIds = singleFilters.values.filter((uId) => uId && uId !== 'undefined').map((uId) => uId.toString());
    } else {
      userIds = [userId.toString()];
    }
    const users = await app.models.User.getMongoConnector()
      .find(
        { _id: { $in: userIds.map((uId) => new ObjectID(uId)) } },
        { projection: { _id: true, email: true, firstName: true, lastName: true } }
      )
      .toArray();

    let filteredUserIds = [];
    for (const wordToSearch of query.split(' ')) {
      filteredUserIds.push(
        ...smartSearch(
          wordToSearch,
          users.map(({ _id, firstName }) => ({ searchField: firstName, id: _id }))
        )
      );
      filteredUserIds.push(
        ...smartSearch(
          wordToSearch,
          users.map(({ _id, lastName }) => ({ searchField: lastName, id: _id }))
        )
      );
      filteredUserIds.push(
        ...smartSearch(
          wordToSearch,
          users.map(({ _id, email }) => ({ searchField: email, id: _id }))
        )
      );
    }
    filteredUserIds = [...new Set(filteredUserIds)].map((e) => new ObjectID(e.toString()));
    if (filteredUserIds.length > 1) {
      $match.userId = { $in: filteredUserIds };
    } else if (filteredUserIds.length === 1) {
      $match.userId = filteredUserIds[0];
    } else {
      return false;
    }
  }
  return true;
}

const suffixes = {
  [DataTypes.MAINTENANCE]: 'Apv',
  [DataTypes.NEW_VEHICLE_SALE]: 'Vn',
  [DataTypes.USED_VEHICLE_SALE]: 'Vo',
  [DataTypes.UNKNOWN]: 'Unknown',
};

const $t = (key) => `$${KpiDictionary[key]}`;
// const $pct = (num, den) => ({ $cond: [{ $ne: [den, 0] }, { $divide: [num, den] }, null] });
// project only field we want to return or sort
const $projects = (listType, dataType) => {
  const suffix = suffixes[dataType] || '';
  const common = {
    userId: $t('userId'),
    kpiType: $t('kpiType'),
    garageId: $t('garageId'),
    period: $t('period'),
  };
  if (listType === 'lead') {
    return {
      ...common,
      countLeads: $t(`countLeads${suffix}`),
      countLeadsTouched: $t(`countLeadsTouched${suffix}`),
      countLeadsUntouched: $t(`countLeadsUntouched${suffix}`),
      countLeadsClosedWithSale: $t(`countLeadsClosedWithSale${suffix}`),
      countLeadsReactive: $t(`countLeadsReactive${suffix}`),
    };
  }
  return {
    ...common,
    countUnsatisfied: $t(`countUnsatisfied${suffix}`),
    countUnsatisfiedTouched: $t(`countUnsatisfiedTouched${suffix}`),
    countUnsatisfiedUntouched: $t(`countUnsatisfiedUntouched${suffix}`),
    countUnsatisfiedClosedWithResolution: $t(`countUnsatisfiedClosedWithResolution${suffix}`),
    countUnsatisfiedReactive: $t(`countUnsatisfiedReactive${suffix}`),
  };
};

const $addPercetageValues = (listType) => {
  if (listType === 'lead') {
    return {
      ...computePercentKeys([
        'countLeadsTouchedPercent',
        'countLeadsUntouchedPercent',
        'countLeadsClosedWithSalePercent',
        'countLeadsReactivePercent',
      ]),
    };
  }
  return {
    ...computePercentKeys([
      'countUnsatisfiedTouchedPercent',
      'countUnsatisfiedUntouchedPercent',
      'countUnsatisfiedClosedWithResolutionPercent',
      'countUnsatisfiedReactivePercent',
    ]),
  };
};

// group
const $groups = ($project, cockpitInterface) => {
  // cockpitInterface === 'garages'
  const _id = cockpitInterface === 'garages' ? { garageId: '$garageId' } : { garageId: '$garageId', userId: '$userId' };

  const groupOperations = Object.fromEntries(
    Object.entries($project).map(([key]) => {
      return key.includes('count') ? [key, { $sum: `$${key}` }] : [key, { $first: `$${key}` }];
    })
  );
  return { _id, ...groupOperations };
};

// add User infos on project
const getUsersInfos = async (app, kpiList) => {
  const userIds = kpiList.map(({ _id }) => _id.userId).filter((e, i, a) => e && a.indexOf(e) === i);

  const projection = { _id: true, email: true, firstName: true, lastName: true };
  const users = await app.models.User.getMongoConnector()
    .find({ _id: { $in: userIds } }, { projection })
    .toArray();

  const userInfos = Object.fromEntries(
    users.map(({ _id, email, firstName, lastName }) => [
      _id.toString(),
      { _id, email, fullName: managerDisplayName({ firstName, lastName, email }) },
    ])
  );

  // add unassigned and deletedUser infos
  userInfos.unassigned = { _id: 'unassigned', fullName: 'unassigned' };
  userInfos.deletedUser = { _id: 'deletedUser', fullName: 'deletedUser' };

  return userInfos;
};

module.exports.resolvers = {
  Query: {
    kpiByPeriodGetList: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const {
          periodId,
          cockpitType,
          garageId,
          dataType,
          listType,
          cockpitInterface,
          search: query,
          limit,
          skip,
          sort,
          order,
        } = args;
        let { userId: selectedUserId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!periodId) {
          return Promise.reject(new Error('periodId argument is missing'));
        }

        const isGodLike = user.isGod();
        const isManager = isGodLike || (await user.isManager()); // (children && children.length > 0);

        if (isManager && selectedUserId) {
          selectedUserId = new ObjectID(selectedUserId.toString());
        } else if (!isManager) {
          selectedUserId = user.id; // Is it how I should do it ? I found a non defined var
        }
        const { garageIds } = user;

        const garageFields = {
          _id: true,
          publicDisplayName: true,
          slug: true,
          hideDirectoryPage: true,
          externalId: true,
        };
        const garages = await app.models.Garage.getMongoConnector()
          .find({ _id: { $in: garageIds } }, { projection: garageFields })
          .toArray();

        const $search = {};
        const searchWithResults = await addSearchToMatch(
          app,
          $search,
          query,
          isManager,
          garages,
          cockpitInterface,
          selectedUserId,
          garageId,
          cockpitType,
          dataType,
          listType
        );
        if (!searchWithResults) {
          return {
            list: [],
            hasMore: false,
          };
        }
        KpiEncoder.encodeObject($search);

        const type = cockpitInterface === 'garages' ? GARAGE_KPI : USER_KPI;
        const $match = await buildMatch(
          type,
          isGodLike,
          cockpitType,
          periodId,
          selectedUserId,
          garageId,
          garageIds,
          listType
        );
        Object.assign($match, $search);

        /* Project and group */
        const $project = $projects(listType, dataType);
        const $group = $groups($project, cockpitInterface); // should be before the project encode
        const $addFields = $addPercetageValues(listType);
        /* Sort */
        const $sort = { [sort]: order === 'DESC' ? -1 : 1, _id: 1 };

        /* Limit */
        let $limit = limit < 1 || limit > 100 ? 11 : limit + 1;

        // create aggregate
        let aggregate = [{ $match }, { $project }, { $group }, { $addFields }, { $sort }, { $skip: skip }, { $limit }];

        /** * Let's go  */
        let list = await app.models.KpiByPeriod.getMongoConnector().aggregate(aggregate).toArray();
        if (!list) list = [];

        // Handle the hasMore trick, do not return ALL the elements! We need to pop() first
        const hasMore = list.length === $limit;
        if (hasMore) {
          list.pop();
        }

        // TODO : Next time we touch this query, 1 resolver for garages & nest garage props in fields
        const garagesMap = Object.fromEntries(
          garages.map(({ _id, slug, publicDisplayName, hideDirectoryPage, externalId }) => [
            _id.toString(),
            { _id, slug, publicDisplayName, hideDirectoryPage, externalId },
          ])
        );
        const usersMap = await getUsersInfos(app, list);

        const getInfo = (map, id, prop) => {
          return map[id.toString()] && map[id.toString()][prop];
        };

        list = list.map(({ _id, ...kpis }) => ({
          ...kpis,
          garageId: _id.garageId.toString(),
          externalId: getInfo(garagesMap, _id.garageId, 'externalId'),
          garagePublicDisplayName: getInfo(garagesMap, _id.garageId, 'publicDisplayName'),
          garageSlug: getInfo(garagesMap, _id.garageId, 'slug'),
          ...(cockpitInterface === 'garages'
            ? {
                displayName: getInfo(garagesMap, _id.garageId, 'publicDisplayName'),
                hideDirectoryPage: getInfo(garagesMap, _id.garageId, 'hideDirectoryPage'),
              }
            : {
                userId: _id.userId.toString(),
                displayName: getInfo(usersMap, _id.userId, 'fullName') || getInfo(usersMap, _id.userId, 'email'),
                isUnassigned: !_id.userId,
                isDeleted: !_id.userId,
              }),
        }));

        return {
          list: list || [],
          hasMore,
        };
      } catch (error) {
        log.error(BANG, error);
        return error;
      }
    },
  },
};
