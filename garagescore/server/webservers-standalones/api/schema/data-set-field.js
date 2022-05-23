const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { dataSetField } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetField';

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetField.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String
    status: Boolean
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
        const { id, field, value } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        const options = {};
        const data = await app.models.Data.findById(id);
        if (!data || !data.get(`customer.${field}`)) {
          return { message: 'Data not found', status: false };
        }

        if (data.get(`customer.${field}.value`) === value) {
          return { status: true };
        }

        if (field === 'contact.mobilePhone') {
          const garage = await app.models.Garage.getMongoConnector().findOne(
            { garageId: data.garageId },
            { projection: { locale: true } }
          );
          if (garage && garage.locale) options.country = garage.locale;
        }

        await data.customer_revise(field, value, options);
        await data.save();
        return { status: true };
      } catch (error) {
        log.error(IZAD, error);
        return error;
      }
    },
  },
};
