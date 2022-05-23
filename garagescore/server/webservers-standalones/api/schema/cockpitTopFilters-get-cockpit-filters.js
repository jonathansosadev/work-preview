const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const { cockpitTopFiltersGetCockpitFilters } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const GarageTypes = require('../../../../common/models/garage.type');
const { getSingleFilter } = require('../../../../common/lib/garagescore/api/cockpit-top-filters');
const { managerDisplayName } = require('../../../../frontend/util/user');

const { IZAD, log } = require('../../../../common/lib/util/log');
const userCache = {};
const typePrefix = 'cockpitTopFiltersGetCockpitFilters';

module.exports.typeDef = `
  extend type Query {
    ${cockpitTopFiltersGetCockpitFilters.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    garageId: [ID]
    garageType: [String]
    type: [String]
    source: [String]
    automationCampaignType: [String]
    frontDeskUserName: [${typePrefix}frontDeskUserName]
    leadSaleType: [String]
    manager: [${typePrefix}manager]
  }

  type ${typePrefix}frontDeskUserName {
    frontDeskUserName: String
    garageId: ID
    type: String
  }

  type ${typePrefix}manager {
    name: String
    userId: ID
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode, garageIds },
        } = context;
        const {
          source,
          cockpitType,
          type,
          ticketType,
          leadSaleType,
          filterToFetch,
          groupDistinctOnType = false,
        } = args;
        let { garageId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const garageIdsMerged = [...garageIds.map((gId) => gId.toString()), ...garageIds];
        let garageValues = garageIdsMerged;
        if (garageId){
          if (garageId.length <= 1){
            garageValues = [garageId[0], ObjectId(garageId[0])]
          }else {
            garageId = garageId.map((gId) => ObjectId(gId))
            garageValues = [...garageId.map((gId) => gId.toString()), ...garageId];
          }
        }

        const filterFields = [
          {
            label: 'garageId',
            values: garageValues,
          },
        ];
        if (cockpitType) {
          filterFields.push({
            label: 'garageType',
            values: GarageTypes.getGarageTypesFromCockpitType(cockpitType),
          });
        }
        if (type) {
          filterFields.push({
            label: 'type',
            values: [type],
          });
        }
        if (leadSaleType && ticketType === 'lead') {
          filterFields.push({
            label: 'leadSaleType',
            values: [leadSaleType],
          });
        }
        let propertyName = filterToFetch;
        if (propertyName === 'manager') {
          if (!ticketType) {
            throw new UserInputError('No ticketType was supplied for manager');
          }
          propertyName = `${ticketType}TicketManager`;
        }

        const filters = await getSingleFilter(app, propertyName, filterFields, source, groupDistinctOnType);
        if (!filters || !filters.values || filters.values.length === 0) {
          return { [filterToFetch]: [] };
        }

        if (filterToFetch === 'manager') {
          // In case the requesting user isn't a "manager" he has access only to tickets assigned to him & to nobody
          const isManager = godMode || (await user.isManager());
          if (!isManager) {
            filters.values = filters.values.filter((v) => [user.getId().toString(), 'undefined'].includes(v));
          }
          // We need to fetch user's datas, either from the cache or from the server
          // First, we detect which users arent cached
          const notCachedUserIds = filters.values
            .filter((e) => !userCache[e] && e !== 'undefined')
            .map((id) => new ObjectId(id));

          // Then we query them and set them in the cache
          const where = { _id: { $in: notCachedUserIds } };
          const projection = { _id: true, firstName: true, lastName: true, email: true };
          const users = (await app.models.User.getMongoConnector().find(where, { projection }).toArray()) || [];
          for (const user of users) {
            userCache[user._id.toString()] = managerDisplayName(user);
          }
          filters.values = filters.values.map((value) => {
            if (value && typeof value.toString === 'function') {
              return value.toString();
            }
            return value;
          });
          // Remove duplicates from values
          filters.values = [...new Set(filters.values)];
          // then we map our results to return name and userId to the front
          filters.values = filters.values
            .filter((e) => e !== 'undefined')
            .map((e) => ({ name: userCache[e], userId: e }));
        }
        return { [filterToFetch]: filters.values || [] };
      } catch (error) {
        log.error(IZAD, error);
        return error;
      }
    },
  },
};
