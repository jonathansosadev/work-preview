const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { garageSetMatch } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { getOneGarage } = require('../../../../common/models/garage/garage-mongo');
const { addExogenousConfiguration } = require('../../../../common/models/garage/garage-methods');
const { IZAD, log } = require('../../../../common/lib/util/log');
const SourceTypes = require('../../../../common/models/data/type/source-types');
const googleUtil = require('../../../../common/lib/util/google');
const { getPlaceDetails, mergePlaceDetailsWithGarage } = require('../../../../common/lib/util/google-place-api.js');
const gmb = require('../../../../common/lib/garagescore/google-my-business/gmb');
const spiderscore = require('../../../../common/lib/garagescore/spiderscore/spiderscore');

const prefix = 'garageSetMatch';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetMatch.type}: ${prefix}Result
  }
  type ${prefix}Result {
    success: Boolean
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
        const { garageId, oldGarageId, externalGarageId, baseGarageId, source } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        let googleSet = {};
        const baseGarage = await getOneGarage(app, baseGarageId);
        const garage = await getOneGarage(app, garageId);
        const oldGarage = oldGarageId ? await getOneGarage(app, oldGarageId) : null;
        if (!garage || !baseGarage || (!oldGarage && oldGarageId)) {
          return { success: false };
        }
        const conf = baseGarage.exogenousReviewsConfigurations;
        const token = conf && conf[source] && conf[source].token;
        if (!token) {
          return { success: false };
        }

        const exogenousReviewsConfigurations = await addExogenousConfiguration(
          app.models.Garage.getMongoConnector(),
          garage,
          source,
          token,
          externalGarageId,
          user.email
        );
        if (oldGarage) {
          await app.models.Garage.softDisconnectFromSource(oldGarage, source);
        }
        if (source === SourceTypes.GOOGLE) {
          try {
            const loc = await googleUtil.fetchSingleLocation(token, externalGarageId);
            if (loc && loc.locationKey && loc.locationKey.placeId) garage.googlePlaceId = loc.locationKey.placeId;
            const garagePlacedetails = await getPlaceDetails(garage);
            googleSet = mergePlaceDetailsWithGarage(garage, garagePlacedetails);
            await app.models.Garage.getMongoConnector().updateOne({ _id: garage._id }, { $set: { ...googleSet } });
          } catch (e) {
            console.error('Unable to fetch garage details from google', e && e.message);
          }
        }

        // Don't wait for those async operation to end, they are not essential
        setImmediate(async () => {
          try {
            await spiderscore.requestCrawl(garage, source, true);
          } catch (e) {
            log.error(IZAD, JSON.stringify(e));
          }
        });
        setImmediate(async () => {
          try {
            if (source === 'Google' && gmb.garageRespectsConditionsToPostOnGmb(garage)) {
              await gmb.generateTextAndPostOnGmb(app, garage);
              await app.models.Garage.getMongoConnector().updateOne(
                { _id: garage._id },
                { $set: { lastPostOnGoogleMyBusinessAt: new Date() } }
              );
            }
          } catch (e) {
            log.error(IZAD, JSON.stringify(e));
          }
        });

        return { success: true };
      } catch (error) {
        log.error(IZAD, error);
        return { success: false };
      }
    },
  },
};
