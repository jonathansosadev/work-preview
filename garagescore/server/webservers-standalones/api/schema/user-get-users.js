const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const moment = require('moment');

const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const { UserRoles, UserLastCockpitOpenAt } = require('../../../../frontend/utils/enumV2');
const querySearch = require('../../../../common/lib/garagescore/api/graphql/queries/_common');
const { SIMON, log } = require('../../../../common/lib/util/log');
const { getUserGarages } = require('../../../../common/models/user/user-mongo.js');
const { isResetPasswordVeryRecent } = require('../../../../common/models/user/user-methods');

const typePrefix = 'userGetUsers';

module.exports.typeDef = `
  extend type Query {
    ${queries[typePrefix].type}: [${typePrefix}User]
  }
  type ${typePrefix}User {
    id: String!
    email: String!
    firstName: String
    lastName: String
    job: String
    role: String
    garagesCount: Int
    lastCockpitOpenAt: Date
    isDefaultTicketManagerSomewhere: Boolean
    resetPasswordVeryRecent: Boolean
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds, user },
        } = context;
        const { search, skip, limit, role, job, lastCockpitOpenAt = null } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (!UserRoles.getPropertyFromValue(user.role, 'canCreateUser')) {
          throw new ForbiddenError(`You can't access users when your role is ${user.role}`);
        }
        let query = { garageIds: { $in: garageIds }, job: { $ne: 'Custeed' } };
        //if (!user.isGarageScoreUser()) { // If we want a custeed users to see custeed users
        if (role) {
          query.role = role;
        }
        if (job && job !== 'Custeed') {
          query.job = job;
        }

        if (lastCockpitOpenAt) {
          if (!UserLastCockpitOpenAt.hasValue(lastCockpitOpenAt)) {
            throw new UserInputError(`${user.lastCockpitOpenAt} is not a valid value for lastCockpitOpenAt`);
          }
          query.lastCockpitOpenAt = lastCockpitOpenAtHandler(lastCockpitOpenAt);
        }

        // if (user.role === UserRoles.ADMIN) { // If we don't want Admin users to see SuperAdmin users
        //   query.role = { $in: [UserRoles.ADMIN, UserRoles.USER] };
        // }
        if (search) {
          query = { ...query, ...querySearch.addTextSearchToFiltersForUsers(search) };
        }
        const queryOptions = {
          projection: {
            id: '$_id',
            email: true,
            firstName: true,
            lastName: true,
            job: true,
            role: true,
            garageIds: true, // used for garagesCount
            lastCockpitOpenAt: true,
            resetPassword: true,
          },
          limit: limit || 10,
          skip: skip || 0,
          sort: { firstName: 1 },
        };
        console.time(`[${typePrefix}]`);
        const users = await app.models.User.getMongoConnector().find(query, queryOptions).toArray();
        /** We find the garages count per user and if they are manager for in one of them */
        const defaultManagersByUser = {};
        const $projectGarage = {
          _id: 1,
          ticketsConfiguration: { $objectToArray: { $ifNull: ['$ticketsConfiguration', {}] } }, // transform in key/value to make the count easier
        };
        for (const user of users) {
          const aggregate = [
            {
              $group: {
                _id: 1,
                count: { $sum: 1 },
                isManager: {
                  $sum: { $cond: [{ $in: [user._id, '$ticketsConfiguration.v'] }, 1, 0] },
                },
              },
            },
          ];
          let gsInfos = await getUserGarages(app, user._id.toString(), $projectGarage, aggregate);
          if (gsInfos && gsInfos.length) {
            user.isDefaultTicketManagerSomewhere = !!gsInfos[0].isManager;
          }
          user.resetPasswordVeryRecent = isResetPasswordVeryRecent({ resetPassword: user.resetPassword });
        }
        console.timeEnd(`[${typePrefix}]`);
        return users;
      } catch (error) {
        log.error(SIMON, error);
        return error;
      }
    },
  },
  [`${typePrefix}User`]: {
    garagesCount: async ({ garageIds }) => {
      return (garageIds && garageIds.length) || 0;
    },
  },
};

function lastCockpitOpenAtHandler(lastCockpitOpenAt) {
  const daysBefore = (nbDaysToSubtract) => {
    return new Date(moment().subtract(nbDaysToSubtract, 'days').toISOString());
  };

  const periods = {
    recent: {
      $gte: daysBefore(30),
    },
    intermediate: {
      $lt: daysBefore(30),
      $gte: daysBefore(60),
    },
    longTime: {
      $lt: daysBefore(60),
    },
    never: {
      $eq: null,
    },
  };

  return periods[lastCockpitOpenAt];
}
