const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { garageSetDisconnectFromSource } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const SourceTypes = require('../../../../common/models/data/type/source-types');
const { ObjectId } = require('mongodb');
const DataTypes = require('../../../../common/models/data/type/data-types');
const publicApi = require('../../../../common/lib/garagescore/api/public-api');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');
const ghc = require('../../../../common/lib/garagescore/garage-history/garage-history-cache');
const { hardDisconnectFromSource } = require('../../../../common/models/garage/garage-methods');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'garageSetDisconnectFromSource';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetDisconnectFromSource.type}: ${prefix}Result
  }
  type ${prefix}Result {
    baseGarageId: ID
    message: Boolean
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      // root called first
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { source } = args;
        let { garageId } = args;
        if (Object.prototype.toString.call(garageId) === '[object String]') {
          garageId = ObjectId(garageId);
        } else if (Object.prototype.toString.call(garageId) === '[object Array]' && garageId.length > 0) {
          garageId = garageId[0];
        }
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }
        if (!SourceTypes.isExogenous(source)) {
          return { message: false };
        }
        const garage = await app.models.Garage.getMongoConnector().findOne(
          { _id: garageId },
          { projection: { exogenousReviewsConfigurations: true } }
        );
        if (!garage) {
          return { message: false };
        }
        await hardDisconnectFromSource(app.models.Garage.getMongoConnector(), garage, source);
        await app.models.Data.getMongoConnector().deleteMany({
          garageId: garageId.toString(),
          type: DataTypes.EXOGENOUS_REVIEW,
          'source.type': source,
        });
        GarageHistoryPeriod.getCockpitAvailablePeriods(new Date('1970-01-01'))
          .map((periodObj) => periodObj.id)
          .forEach((periodId) => {
            const ghcKeyExogenous = ghc.getKey('garageHistory', {
              garageId,
              garageType: garage.type,
              periodId,
              exogenous: true,
            });
            ghc.revokeKey(ghcKeyExogenous);
          });
        return { message: true, baseGarageId: garageId.toString() };
      } catch (error) {
        log.error(IZAD, error);
        return { message: false };
      }
    },
  },
};
