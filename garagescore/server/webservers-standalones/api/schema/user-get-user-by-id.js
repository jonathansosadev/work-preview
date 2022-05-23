const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');

const { ObjectId } = require('mongodb');
const { isGod } = require('../../../../common/models/user/user-methods');
const { getUserGarages } = require('../../../../common/models/user/user-mongo');
const { userGetUserById } = require('../../../../frontend/api/graphql/definitions/queries.json');
const { UserRoles } = require('../../../../frontend/utils/enumV2');
const { SIMON, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userGetUserById';

module.exports.typeDef = `
  extend type Query {
    ${userGetUserById.type}: ${typePrefix}User
  }
  type ${typePrefix}User {
    id: String!
    garageIds: [String!]
    lastName: String
    firstName: String
    email: String!
    civility: String
    phone: String
    mobilePhone: String
    businessName: String
    address: String
    postCode: String
    job: String
    role: String
    city: String
    subscriptionStatus: String
    isGod: Boolean
    defaultManagerGaragesIds: [String]
    allGaragesAlerts: ${typePrefix}AllGaragesAlerts
    authorization: ${typePrefix}Authorization
    reportConfigs: ${typePrefix}ReportConfigs
  }

  type ${typePrefix}Authorization {
    ACCESS_TO_COCKPIT: Boolean
    ACCESS_TO_ADMIN: Boolean
    WIDGET_MANAGEMENT: Boolean
    ACCESS_TO_WELCOME: Boolean
    ACCESS_TO_SATISFACTION: Boolean
    ACCESS_TO_UNSATISFIED: Boolean
    ACCESS_TO_LEADS: Boolean
    ACCESS_TO_AUTOMATION: Boolean
    ACCESS_TO_CONTACTS: Boolean
    ACCESS_TO_E_REPUTATION: Boolean
    ACCESS_TO_ESTABLISHMENT: Boolean
    ACCESS_TO_TEAM: Boolean
    ACCESS_TO_DARKBO: Boolean
    ACCESS_TO_GREYBO: Boolean
  }

  type ${typePrefix}AllGaragesAlerts {
    UnsatisfiedVI: Boolean
    UnsatisfiedVo: Boolean
    UnsatisfiedVn: Boolean
    UnsatisfiedMaintenance: Boolean
    LeadApv: Boolean
    LeadVn: Boolean
    LeadVo: Boolean
    ExogenousNewReview: Boolean
    EscalationUnsatisfiedMaintenance: Boolean
    EscalationUnsatisfiedVn: Boolean
    EscalationUnsatisfiedVo: Boolean
    EscalationUnsatisfiedVi: Boolean
    EscalationLeadMaintenance: Boolean
    EscalationLeadVn: Boolean
    EscalationLeadVo: Boolean
  }

  type ${typePrefix}ReportConfigs {
      daily: ${typePrefix}ReportConfig
      weekly:${typePrefix}ReportConfig
      monthly:${typePrefix}ReportConfig
      monthlySummary: ${typePrefix}MonthlySummaryConfig
  }

  type ${typePrefix}MonthlySummaryConfig {
      unsatisfiedApv: Boolean
      unsatisfiedVn: Boolean
      unsatisfiedVo: Boolean
      unsatisfiedVI: Boolean
      leadVn: Boolean
      leadVo: Boolean
      contactsApv: Boolean
      contactsVn: Boolean
      contactsVo: Boolean
      contactsVI: Boolean
  }

  type ${typePrefix}ReportConfig {
      unsatisfiedApv: Boolean
      unsatisfiedVn: Boolean
      unsatisfiedVo: Boolean
      UnsatisfiedVI: Boolean
      leadVn: Boolean
      leadVo: Boolean
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
        const { userId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!userId) {
          throw new UserInputError(`Invalid argument userId: ${userId}`);
        }
        if (user.role !== UserRoles.ADMIN && user.role !== UserRoles.SUPER_ADMIN && user.id.toString() !== userId) {
          throw new ForbiddenError('Not authorized');
        }

        const filter = { _id: new ObjectId(userId) };
        const projection = {
          id: '$_id',
          garageIds: true,
          lastName: true,
          firstName: true,
          email: true,
          civility: true,
          phone: true,
          mobilePhone: true,
          businessName: true,
          address: true,
          postCode: true,
          job: true,
          role: true,
          city: true,
          subscriptionStatus: true,
          allGaragesAlerts: true,
          authorization: true,
          reportConfigs: true,
        };
        const requestedUser = await app.models.User.getMongoConnector().findOne(filter, { projection });
        if (!requestedUser) {
          throw new ForbiddenError('Not authorized');
        }
        if (
          !requestedUser ||
          (requestedUser.garageIds.length &&
            !requestedUser.garageIds.find((id) =>
              garageIds.find((garageId) => id.toString() === garageId.toString())
            )) ||
          (user.role === UserRoles.ADMIN && requestedUser.role === UserRoles.SUPER_ADMIN)
        ) {
          throw new ForbiddenError('Not authorized');
        }
        return requestedUser;
      } catch (error) {
        log.error(SIMON, error);
        return error;
      }
    },
  },
  [`${typePrefix}User`]: {
    isGod: async ({ email, garageIds }) => {
      return isGod({ email, garageIds });
    },
    garageIds: async ({ email, garageIds }) => {
      if (isGod({ email, garageIds })) {
        return [];
      }
      return garageIds;
    },
    defaultManagerGaragesIds: async ({ email, garageIds, id }, args, { app }, { returnType }) => {
      if (isGod({ email, garageIds })) {
        return [];
      }
      console.time(returnType);
      const garageFields = { id: '$_id', ticketsConfiguration: 1 };
      const garages = await getUserGarages(app, id, garageFields);
      const defaultManagerGaragesIds = garages
        .filter(
          (g) =>
            g.ticketsConfiguration &&
            Object.values(g.ticketsConfiguration).some((assignee) => assignee && assignee.toString() === id.toString())
        )
        .map(({ id }) => id.toString());

      console.timeEnd(returnType);
      return defaultManagerGaragesIds;
    },
  },
};
