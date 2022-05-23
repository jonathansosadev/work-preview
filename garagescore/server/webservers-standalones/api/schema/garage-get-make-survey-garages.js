/* Template file to define a new Apollo GraphQL query */
/* Read _README.txt, copy this file, rename the copy, don't forget the extension */
const { AuthenticationError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const bonusBrands = require('../../../../common/models/bonus-brands.type.js');
const garageSubscriptions = require('../../../../common/models/garage.subscription.type.js');
const { getUserGarages } = require('../../../../common/models/user/user-mongo');
const { isSubscribed, hasMakeSurveys, getScenario } = require('../../../../common/models/garage/garage-methods');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'garageGetMakeSurveyGarages';
const resolveFunctions = {
  Date: GraphQLDate,
};
module.exports.typeDef = `
  extend type Query {
    ${queries.garageGetMakeSurveyGarages.type}: [${typePrefix}makeSurveysGarage]
  }
  type ${typePrefix}makeSurveysGarage {
    id: String
    publicDisplayName: String
    brands: [String]
    contactIds: ${typePrefix}contactIds
    garageType: String
    firstContactDelay: ${typePrefix}firstContactDelay
    surveySignature: ${typePrefix}SurveySignature
  }
  type ${typePrefix}contactIds {
    Maintenance: String
    NewVehicleSale: String
    UsedVehicleSale: String
  }
  type ${typePrefix}firstContactDelay {
    Maintenance: ${typePrefix}deltaEntity
    NewVehicleSale: ${typePrefix}deltaEntity
    UsedVehicleSale: ${typePrefix}deltaEntity
  }
  type ${typePrefix}historyItem {
    brand: String
    userId: String
    userFirstName: String
    userLastName: String
    userEmail: String
    date: Date
    value: Int
    prevValue: Int
  }
  type ${typePrefix}deltaEntity {
    value: Int
    history: [${typePrefix}historyItem]
    brandHistory: [${typePrefix}historyItem]
  }
  type ${typePrefix}SurveySignature {
    useDefault: Boolean
    defaultSignature: ${typePrefix}Signature
    Maintenance: ${typePrefix}Signature
    NewVehicleSale: ${typePrefix}Signature
    UsedVehicleSale: ${typePrefix}Signature
  }
  type ${typePrefix}Signature {
    lastName: String
    firstName: String
    job: String
  }
`;

module.exports.resolvers = {
  Query: {
    garageGetMakeSurveyGarages: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { page, search } = args;

        const authorizedTypes = ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale'];
        // SAME ORDER THAN AUTHORIZEDTYPES
        const subscriptions = [
          garageSubscriptions.MAINTENANCE,
          garageSubscriptions.NEW_VEHICLE_SALE,
          garageSubscriptions.USED_VEHICLE_SALE,
        ];
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const $project = {
          _id: true,
          type: true,
          status: true,
          subscriptions: true,
          publicDisplayName: true,
          brandNames: true,
          campaignScenarioId: true,
          firstContactDelay: true,
          surveySignature: true,
        };
        const additionalStages = [
          { $match: app.models.Garage.hasMakeSurveysFilter(search, true) },
          { $sort: { _id: 1 } },
          { $skip: page * 10 },
          { $limit: 11 },
        ];
        let garages = await getUserGarages(app, user.getId(), $project, additionalStages);
        if (!garages.length) return [];
        garages = garages.filter((g) => hasMakeSurveys(g)); // Double verification, is this useful ? unsure (failsafe)
        const result = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const g of garages) {
          const scenario = await getScenario(g.campaignScenarioId, app);
          const chains = scenario && scenario.chains;
          const returnGarage = {
            id: g._id.toString(),
            publicDisplayName: g.publicDisplayName,
            firstContactDelay: g.firstContactDelay,
            garageType: g.type,
            contactIds: {},
            brands: g.brandNames.filter((brand) => bonusBrands.indexOf(brand) > -1),
            surveySignature: g.surveySignature,
          };
          if (!returnGarage.firstContactDelay) {
            returnGarage.firstContactDelay = {};
          }

          authorizedTypes.forEach(async (type) => {
            returnGarage.contactIds[type] =
              chains &&
              chains[type] &&
              chains[type].contacts &&
              chains[type].contacts[0] &&
              chains[type].contacts[0].key;
            if (!returnGarage.firstContactDelay[type]) {
              returnGarage.firstContactDelay[type] = {
                value: scenario.chains[type].contacts[0].delay,
                history: [],
                brandHistory: [],
              };
            }
          });

          for (let i = 0; i < subscriptions.length; i++) {
            if (!isSubscribed(g.subscriptions, subscriptions[i])) {
              returnGarage.firstContactDelay[authorizedTypes[i]] = null;
            } else {
              if (
                returnGarage.firstContactDelay[authorizedTypes[i]] &&
                returnGarage.firstContactDelay[authorizedTypes[i]].history &&
                returnGarage.firstContactDelay[authorizedTypes[i]].history.length > 0
              ) {
                // eslint-disable-line max-len
                for (let j = 0; j < returnGarage.firstContactDelay[authorizedTypes[i]].history.length; j++) {
                  // eslint-disable-line max-len
                  const userData = await app.models.User.findById(
                    returnGarage.firstContactDelay[authorizedTypes[i]].history[j].userId
                  );
                  returnGarage.firstContactDelay[authorizedTypes[i]].history[j].userFirstName =
                    (userData && userData.firstName) || null;
                  returnGarage.firstContactDelay[authorizedTypes[i]].history[j].userLastName =
                    (userData && userData.lastName) || null;
                  returnGarage.firstContactDelay[authorizedTypes[i]].history[j].userEmail =
                    (userData && userData.email) || null;
                  returnGarage.firstContactDelay[authorizedTypes[i]].history[j].date = returnGarage.firstContactDelay[
                    authorizedTypes[i]
                  ].history[j].date
                    ? new Date(returnGarage.firstContactDelay[authorizedTypes[i]].history[j].date)
                    : null; // eslint-disable-line max-len
                }
              }
              for (let k = 0; k < g.brandNames.length; k++) {
                // eslint-disable-line max-len
                if (
                  g.firstContactDelay &&
                  g.firstContactDelay[authorizedTypes[i]] &&
                  g.firstContactDelay[authorizedTypes[i]].makerSurvey &&
                  g.firstContactDelay[authorizedTypes[i]].makerSurvey[g.brandNames[k]]
                ) {
                  const makerSurvey = g.firstContactDelay[authorizedTypes[i]].makerSurvey[g.brandNames[k]];
                  const userData = await app.models.User.findById(makerSurvey.userId);
                  if (!returnGarage.firstContactDelay[authorizedTypes[i]].brandHistory) {
                    returnGarage.firstContactDelay[authorizedTypes[i]].brandHistory = [];
                  }
                  returnGarage.firstContactDelay[authorizedTypes[i]].brandHistory.push({
                    userFirstName: (userData && userData.firstName) || null,
                    userLastName: (userData && userData.lastName) || null,
                    userEmail: (userData && userData.email) || null,
                    userId: makerSurvey.userId,
                    date: makerSurvey.date ? new Date(makerSurvey.date) : null,
                    value: makerSurvey.value || null,
                    brand: g.brandNames[k],
                    prevValue: makerSurvey.prevValue,
                  });
                }
              }
            }
          }

          result.push(returnGarage);
        }
        return result;
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
