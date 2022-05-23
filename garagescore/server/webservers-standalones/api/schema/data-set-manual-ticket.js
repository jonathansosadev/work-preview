const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { dataSetManualTicket } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { ObjectID } = require('mongodb');
const { decodePhone } = require('../../../../common/lib/garagescore/cross-leads/util');
const GarageTypes = require('../../../../common/models/garage.type');
const dataTypes = require('../../../../common/models/data/type/data-types.js');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetManualTicket';

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetManualTicket.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: Boolean
    message: String
    id: ID
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { ticketType, garageId, phone, unsatisfiedCriterias, sourceType } = args;
        let res = garageId;
        if (garageId.length > 0 && Object.prototype.toString.call(garageId) === '[object Array]'){
          res = garageId[0]
        }

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        const garage = await app.models.Garage.getMongoConnector().findOne(ObjectID(res), {
          projection: { type: true, locale: true },
        });

        if (!garage || !garage.locale) {
          return { message: "Garage couldn't be found", status: false };
        }
        const locale = garage.locale.substring(0, 2);
        args.phone = phone && decodePhone(phone, locale);
        const data = await app.models.Data.init(res, {
          type: ticketType,
          garageType: (garage && garage.type) || GarageTypes.DEALERSHIP,
          shouldSurfaceInStatistics: true,
          raw: {},
          sourceType: sourceType ? sourceType : '',
        });

        switch (ticketType) {
          case dataTypes.MANUAL_LEAD: {
            await data.addLeadTicket(null, {
              rawManagerId: user.id,
              source: 'manual',
              sourceData: args,
            });
            await data.save();
            return { message: 'Manual leadTicket added', status: true, id: data.getId().toString() };
          }
          case dataTypes.MANUAL_UNSATISFIED: {
            if (unsatisfiedCriterias) {
              args.unsatisfiedCriterias = JSON.parse(unsatisfiedCriterias); // eslint-disable-line no-param-reassign
            }
            await data.addUnsatisfiedTicket(null, { source: 'manual', rawManagerId: user.id, sourceData: args });
            await data.save();
            return {
              message: 'Manual unsatisfiedTicket added',
              status: true,
              id: data.getId().toString(),
            };
          }

          default:
            return { message: 'Unknown ticket type', status: false };
        }
      } catch (error) {
        log.error(IZAD, error);
        return { message: (error && error.message) || 'an error occured', status: false };
      }
    },
  },
};
