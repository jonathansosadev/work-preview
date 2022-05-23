const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { garageSetExogenousConfiguration } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const SourceTypes = require('../../../../common/models/data/type/source-types');
const { ObjectId } = require('mongodb');
const googleUtil = require('../../../../common/lib/util/google');
const facebookUtil = require('../../../../common/lib/util/facebook');
const spiderscore = require('../../../../common/lib/garagescore/spiderscore/spiderscore');
const { addExogenousConfiguration } = require('../../../../common/models/garage/garage-methods');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'garageSetExogenousConfiguration';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetExogenousConfiguration.type}: ${prefix}Result
  }
  type ${prefix}Result {
    baseGarageId: ID
    garagesToMatch: [${prefix}GaragesToMatch]
    rejectionReason: String
  }

  type ${prefix}GaragesToMatch {
      name: String
      externalId: ID
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
        const { garageId, source, code } = args;
        let token = null;
        let locations = [];
        const needExternalId = [SourceTypes.GOOGLE, SourceTypes.FACEBOOK];

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        if (!SourceTypes.isExogenous(source)) {
          return { rejectionReason: 'Source not supported' };
        }

        const garage = await app.models.Garage.getMongoConnector().findOne(
          { _id: ObjectId(garageId) },
          { projection: { exogenousReviewsConfigurations: true } }
        );
        if (!garage) {
          return { rejectionReason: 'Garage not found' };
        }

        if (source === SourceTypes.GOOGLE) {
          token = await googleUtil.generateRefreshTokenFromCode(code);
          locations = await googleUtil.fetchLocations(token);
          locations = locations.map((e) => ({
            name: `${e.locationName}${e.address && e.address.locality ? ` / ${e.address.locality}` : ''}`,
            externalId: e.name,
          }));
        } else if (source === SourceTypes.FACEBOOK) {
          token = await facebookUtil.generateLongTimeToken(code);
          locations = await facebookUtil.fetchLocations(code);
          locations = locations.map((e) => ({
            name: `${e.name}${e.location && e.location.city ? ` / ${e.location.city}` : ''}`,
            externalId: e.id,
          }));
        }

        const externalId = needExternalId.includes(source) ? '' : code;
        await addExogenousConfiguration(
          app.models.Garage.getMongoConnector(),
          garage,
          source,
          token || code,
          externalId,
          user.email
        );

        setImmediate(async () => {
          try {
            if (!needExternalId.includes(source)) {
              spiderscore.requestCrawl(garage, source);
            }
          } catch (e) {
            log.error(IZAD, JSON.stringify(e));
          }
        });
        return { garagesToMatch: locations, baseGarageId: garage._id.toString() };
      } catch (error) {
        log.error(IZAD, error);
        return { rejectionReason: 'An error occured' };
      }
    },
  },
};
