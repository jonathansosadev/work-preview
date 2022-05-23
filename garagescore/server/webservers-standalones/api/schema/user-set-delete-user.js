const { ObjectID } = require('mongodb');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { UserRoles } = require('../../../../frontend/utils/enumV2.js');
const { userSetDeleteUser } = require('../../../../frontend/api/graphql/definitions/mutations.json');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userSetDeleteUser';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetDeleteUser.type}: ${typePrefix}User
  }
  type ${typePrefix}User {
    statusReason: String
    status: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { userId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!UserRoles.getPropertyFromValue(user.role, 'canCreateUser')) {
          throw new ForbiddenError('Not authorized');
        }

        const userToDelete = await app.models.User.getMongoConnector().findOne(
          { _id: new ObjectID(userId) },
          {
            projection: {
              id: '$_id',
              firstName: 1,
              lastName: 1,
              job: 1,
              email: 1,
              mobilePhone: 1,
              phone: 1,
              garageIds: 1,
            },
          }
        );
        if (!userToDelete) {
          console.error(`User ${userId} not found.`);
          return { status: 'KO', statusReason: 'userNotFound' };
        }
        const $match = {
          _id: { $in: userToDelete.garageIds },
          $or: [
            { 'ticketsConfiguration.Unsatisfied_Maintenance': userToDelete.id },
            { 'ticketsConfiguration.Unsatisfied_NewVehicleSale': userToDelete.id },
            { 'ticketsConfiguration.Unsatisfied_UsedVehicleSale': userToDelete.id },
            { 'ticketsConfiguration.Lead_Maintenance': userToDelete.id },
            { 'ticketsConfiguration.Lead_NewVehicleSale': userToDelete.id },
            { 'ticketsConfiguration.Lead_UsedVehicleSale': userToDelete.id },
            { 'ticketsConfiguration.VehicleInspection': userToDelete.id },
          ],
        };
        const isUserInOneOfTheTicketsConfigurations = await app.models.Garage.getMongoConnector().findOne($match, {
          projection: { _id: 1 },
        });
        if (isUserInOneOfTheTicketsConfigurations) {
          return { status: 'KO', statusReason: 'userInOneOfTheTicketsConfigurations' };
        }
        const loggedUser = user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
        await app.models.User.destroyByIdAndClean(userToDelete, loggedUser);
        return { status: 'OK', statusReason: 'deletedWithSuccess' };
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
