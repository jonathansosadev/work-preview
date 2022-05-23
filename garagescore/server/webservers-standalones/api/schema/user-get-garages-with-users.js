const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const queriesCommon = require('../../../../common/lib/garagescore/api/graphql/queries/_common');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type');
const { getUsersByGarageId, isGarageScoreUser, isGhost } = require('../../../../common/models/user/user-methods');
const { isSubscribed } = require('../../../../common/models/garage/garage-methods');
const { UserRoles } = require('../../../../frontend/utils/enumV2');

const typePrefix = 'userGetGaragesWithUsers';
module.exports.typeDef = `
  extend type Query {
    ${queries.userGetGaragesWithUsers.type}: [${typePrefix}Garage]
  }
  type ${typePrefix}Garage {
    id: String
    externalId: String
    usersQuota: Int
    countAllSubscribedUsers: Int
    publicDisplayName: String
    users: [${typePrefix}Users]
    subscriptions: ${typePrefix}Subscriptions
    ticketsConfiguration: ${typePrefix}ticketsConfiguration
  }
  type ${typePrefix}Subscriptions {
    Maintenance: Boolean
    NewVehicleSale: Boolean
    UsedVehicleSale: Boolean
    Lead: Boolean
  }
  type ${typePrefix}ReportConfig {
    enable: Boolean
    generalVue: Boolean
    lead: Boolean
    leadVn: Boolean
    leadVo: Boolean
    unsatisfiedApv: Boolean
    unsatisfiedVn: Boolean
    unsatisfiedVo: Boolean
  }
  type ${typePrefix}SummaryConfig {
    enable: Boolean
    generalVue: Boolean
    unsatisfiedApv: Boolean
    unsatisfiedVn: Boolean
    unsatisfiedVo: Boolean
    unsatisfiedVI: Boolean
    lead: Boolean
    leadVn: Boolean
    leadVo: Boolean
    contactsApv: Boolean
    contactsVn: Boolean
    contactsVo: Boolean
    contactsVI: Boolean
  }
  type ${typePrefix}ReportConfigs {
    daily: ${typePrefix}ReportConfig
    weekly:${typePrefix}ReportConfig
    monthly: ${typePrefix}ReportConfig
    monthlySummary: ${typePrefix}SummaryConfig
  }
  type ${typePrefix}AllGaragesAlerts {
      Lead: Boolean
      LeadVn: Boolean
      LeadVo: Boolean
      UnsatisfiedFollowup: Boolean
      UnsatisfiedMaintenance: Boolean
      UnsatisfiedVn: Boolean
      UnsatisfiedVo: Boolean
      ExogenousNewReview: Boolean
      EscalationUnsatisfiedMaintenance: Boolean
      EscalationUnsatisfiedVn: Boolean
      EscalationUnsatisfiedVo: Boolean
      EscalationUnsatisfiedVi: Boolean
      EscalationLeadMaintenance: Boolean
      EscalationLeadVn: Boolean
      EscalationLeadVo: Boolean
    }
  type ${typePrefix}Users {
    id: String
    email: String
    role: String
    job: String
    fullName: String
    reportConfigs: ${typePrefix}ReportConfigs
    allGaragesAlerts: ${typePrefix}AllGaragesAlerts
  }
  type ${typePrefix}ticketsConfiguration {
    Unsatisfied_Maintenance: String
    Unsatisfied_NewVehicleSale: String
    Unsatisfied_UsedVehicleSale: String
    Lead_Maintenance: String
    Lead_NewVehicleSale: String
    Lead_UsedVehicleSale: String
    VehicleInspection: String
  }
`;
module.exports.resolvers = {
  Query: {
    userGetGaragesWithUsers: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user: reqUser },
        } = context;
        const { search, skip, limit } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!reqUser.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized, need access to cockpit');
        }
        if (reqUser.role !== UserRoles.ADMIN && reqUser.role !== UserRoles.SUPER_ADMIN) {
          throw new ForbiddenError('Not authorized');
        }

        const garageIdsFilter = reqUser.garageIds;
        const garagesWhere = {};
        if (search) garagesWhere.$or = queriesCommon.addTextSearchToFiltersForGarages(null, search);
        if (garageIdsFilter) garagesWhere._id = { $in: garageIdsFilter };
        const garagesQueryOpts = {
          projection: {
            _id: true,
            externalId: true,
            publicDisplayName: true,
            subscriptions: true,
            usersQuota: true,
            ticketsConfiguration: true,
          },
          limit: limit || 10,
          skip: skip || 0,
          sort: { publicDisplayName: 1 },
        };
        const garages = await app.models.Garage.getMongoConnector().find(garagesWhere, garagesQueryOpts).toArray();
        if (!garages) return [];

        const garageIds = garages.map((g) => g._id);
        const usersFields = {
          email: true,
          firstName: true,
          lastName: true,
          job: true,
          role: true,
          reportConfigs: true,
          allGaragesAlerts: true,
        };
        // Format is: { 'garageId': [user1, user2, ...] }
        const usersByGarageId = await getUsersByGarageId(app, garageIds, usersFields);

        const formatUser = ({ id, email, firstName, lastName, job, role, reportConfigs, allGaragesAlerts }) => ({
          id,
          email,
          fullName: `${firstName} ${lastName}`.trim(),
          job,
          role,
          reportConfigs,
          allGaragesAlerts,
        });
        return garages.map((garage) => {
          const garageId = garage._id.toString();

          const garageUsers = (usersByGarageId[garageId] || []).filter(({ email }) => !isGarageScoreUser({ email }));

          const subscriptions = {};
          for (const subscription of GarageSubscriptionTypes.values()) {
            subscriptions[subscription] = isSubscribed(garage.subscriptions, subscription);
          }
          return {
            id: garageId,
            externalId: garage.externalId,
            publicDisplayName: garage.publicDisplayName,
            countAllSubscribedUsers: garageUsers.filter(({ email }) => !isGhost({ email })).length,
            users: garageUsers.map(formatUser),
            ticketsConfiguration: garage.ticketsConfiguration,
            subscriptions,
          };
        });
      } catch (error) {
        console.error(error);
        return error;
      }
    },
  },
};
