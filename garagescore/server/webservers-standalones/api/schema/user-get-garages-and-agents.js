const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');

const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { getUserGarages } = require('../../../../common/models/user/user-mongo');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userGetGaragesAndAgents';
module.exports.typeDef = `
  extend type Query {
    ${queries.userGetGaragesAndAgents.type}: [${typePrefix}Garage]
  }
  type ${typePrefix}Garage {
    id: String
    type: String
    slug: String
    publicDisplayName: String
    agents: [${typePrefix}Agent]
  }
  type ${typePrefix}Agent {
    id: String
    publicDisplayName: String
    slug: String
    parent: ${typePrefix}AgentsParent
  }
  type ${typePrefix}AgentsParent {
    garageId: String
    shareLeadTicket: ${typePrefix}AgentsParentShareLeadTicket
  }
  type ${typePrefix}AgentsParentShareLeadTicket {
    enabled: Boolean
    NewVehicleSale: Boolean
    UsedVehicleSale: Boolean
  }
`;
module.exports.resolvers = {
  Query: {
    userGetGaragesAndAgents: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user: reqUser },
        } = context;
        const { id } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!reqUser.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized, need access to cockpit');
        }

        if (!id || !ObjectId.isValid(id)) {
          throw new UserInputError(`UserInputError: User id (${id}) is empty or wrong`);
        }

        const fields = {
          id: { $toString: '$_id' },
          type: true,
          slug: true,
          publicDisplayName: true,
          parent: true,
          agents: true,
        };
        const garages = await getUserGarages(app, [reqUser.getId(), id], fields, []);

        let agentsByIds = null;
        if (garages && garages.length) {
          const allAgents = await app.models.Garage.getAllAgentWhichShareLeadTicket(fields);
          agentsByIds = allAgents.reduce((acc, { id, parent, publicDisplayName, slug }) => {
            if (!acc[parent.garageId]) acc[parent.garageId] = []; // eslint-disable-line no-param-reassign
            if (parent.shareLeadTicket && parent.shareLeadTicket.enabled) {
              acc[parent.garageId].push({ id, parent, publicDisplayName, slug });
            }
            return acc;
          }, {});
        }

        return garages.map((garage) => ({ ...garage, agents: (agentsByIds && agentsByIds[garage.id]) || [] }));
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
