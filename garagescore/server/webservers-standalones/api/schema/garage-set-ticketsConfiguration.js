const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { BANG, log } = require('../../../../common/lib/util/log');
const { ObjectId } = require('mongodb');

const typePrefix = 'garageSetTicketsConfiguration';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.garageSetTicketsConfiguration.type}: ${typePrefix}Request
  }

  type ${typePrefix}Request {
    message: String
    status: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    garageSetTicketsConfiguration: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { garageId, userId, oldUserId, alertType } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        const garagesAlerts = {
          Unsatisfied_Maintenance: 'UnsatisfiedMaintenance',
          Unsatisfied_NewVehicleSale: 'UnsatisfiedVn',
          Unsatisfied_UsedVehicleSale: 'UnsatisfiedVo',
          Lead_Maintenance: 'LeadApv',
          Lead_NewVehicleSale: 'LeadVn',
          Lead_UsedVehicleSale: 'LeadVo',
          VehicleInspection: 'UnsatisfiedVI',
        };
        // check if user manage this garage
        const usersByGarage = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(garageId, { id: 1 });
        const findUser = usersByGarage.find((u) => u.id.toString() === userId);
        let findOldUser = true;
        
        if (oldUserId !== '') {
          findOldUser = usersByGarage.find((u) => u.id.toString() === oldUserId);
        }
        if (!findUser || !findOldUser) {
          return { message: 'Users is not part of the garage', status: 'KO' };
        }
        await Promise.all([
          // update garage ticketsConfiguration
          app.models.Garage.getMongoConnector().updateOne(
            { _id: ObjectId(garageId) },
            { $set: { [`ticketsConfiguration.${alertType}`]: ObjectId(userId) } }
          ),
          // update new user
          app.models.User.getMongoConnector().updateOne(
            { _id: ObjectId(userId) },
            { $set: { [`allGaragesAlerts.${garagesAlerts[alertType]}`]: true } }
          ),
        ]);
        if (oldUserId !== '') {
          // update for old user
          await app.models.User.getMongoConnector().updateOne(
            { _id: ObjectId(oldUserId) },
            { $set: { [`allGaragesAlerts.${garagesAlerts[alertType]}`]: false } }
          );
        }
        return { message: '', status: 'OK' };
      } catch (error) {
        log.error(BANG, error);
        return { message: error.message, status: 'KO' };
      }
    },
  },
};
