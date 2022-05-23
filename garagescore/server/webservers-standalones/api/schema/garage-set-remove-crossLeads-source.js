const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { BANG, log } = require('../../../../common/lib/util/log');
const { ObjectId } = require('mongodb');
const PhoneBucket = require('../../../../common/models/phone-bucket.types');
const typePrefix = 'garageSetRemoveCrossLeadsSource';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.garageSetRemoveCrossLeadsSource.type}: ${typePrefix}Request
  }

  type ${typePrefix}Request {
    message: String
    status: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    garageSetRemoveCrossLeadsSource: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { garageId, email, phone } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        // retrieve garage
        const garage = await app.models.Garage.getMongoConnector().findOne(
          { _id: ObjectId(garageId) },
          { projection: { crossLeadsConfig: 1 } }
        );
        if (!garage) {
          return { message: `garage ${garageId} not found`, status: 'KO' };
        }
        // remove crossleads source
        garage.crossLeadsConfig.sources = garage.crossLeadsConfig.sources.filter((source) => source.email !== email);
        // update garage crossLeadsConfig and set phone number available
        const [updateGarage, updatePhoneBucket] = await Promise.all([
          app.models.Garage.getMongoConnector().updateOne(
            { _id: ObjectId(garageId) },
            { $set: { 'crossLeadsConfig.sources': garage.crossLeadsConfig.sources } }
          ),
          app.models.PhoneBucket.getMongoConnector().updateOne(
            { value: phone, status: PhoneBucket.TAKEN, garageId: ObjectId(garageId) },
            { $set: { status: PhoneBucket.AVAILABLE, updatedAt: new Date() } }
          ),
        ]);

        return { message: `${updatePhoneBucket.modifiedCount} numéro remis en service`, status: 'OK' };
      } catch (error) {
        log.error(BANG, error);
        return { message: error.message, status: 'KO' };
      }
    },
  },
};
