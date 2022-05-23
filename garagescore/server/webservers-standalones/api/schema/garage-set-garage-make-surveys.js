const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { FED, log } = require('../../../../common/lib/util/log');
const { isSubscribed } = require('../../../../common/models/garage/garage-methods');
const { concurrentpromiseAll } = require('../../../../common/lib/util/concurrentpromiseAll');
const garageSubscriptions = require('../../../../common/models/garage.subscription.type.js');
const { getUserGarages } = require('../../../../common/models/user/user-mongo');
const { hasMakeSurveys } = require('../../../../common/models/garage/garage-methods');
const { UserRoles } = require('../../../../frontend/utils/enumV2');

const typePrefix = 'GarageSetGarageMakeSurveys';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.GarageSetGarageMakeSurveys.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    success: Boolean
  }

  input ${typePrefix}Modifications {
    value: Int,
    brand: String,
    isMaker: Boolean,
    garageId: String,
    type: String
  }
`;

const authorizedTypes = [
  garageSubscriptions.MAINTENANCE,
  garageSubscriptions.NEW_VEHICLE_SALE,
  garageSubscriptions.USED_VEHICLE_SALE,
];

const treatAndSendAlerts = async (app, alertEmailData, userWhoChangedIt, isAlertAdmin) => {
  const usersMap = new Map();
  const notifyModificationsCusteed = [];
  const changerUserName = {
    changerUserName: userWhoChangedIt.getFullName() || userWhoChangedIt.email,
    changerUserEmail: userWhoChangedIt.email,
    changerUserJob: userWhoChangedIt.job,
  };
  for (const itemArray of Array.from(alertEmailData.values())) {
    // itemArray is an array of modifications per garage
    const fields = { id: true, job: true, unsubscribedMakeSurveys: true, role: true };
    const allUsers = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(itemArray[0].garage._id, fields);
    const users = allUsers.filter(({ role }) => [UserRoles.ADMIN, UserRoles.SUPER_ADMIN].includes(role));

    for (const user of users) {
      if (!usersMap.get(user.getId().toString())) {
        usersMap.set(user.getId().toString(), {
          user,
          modifications: [],
        });
      }
      const modification = {
        garageName: itemArray[0].garage.publicDisplayName,
        groupName: itemArray[0].garage.group,
        changes: itemArray.map(({ isMaker, value, prevValue, type, brand }) => ({
          isMaker,
          value,
          prevValue,
          type,
          brand,
        })),
      };
      usersMap.get(user.getId().toString()).modifications.push(modification);
      if (!notifyModificationsCusteed.some(({ garageName }) => garageName === modification.garageName)) {
        notifyModificationsCusteed.push(modification);
      }
    }
  }
  // alert user admin of garages
  if (isAlertAdmin) {
    for (const userItem of Array.from(usersMap.values())) {
      const notifyPerformers = userItem.modifications.some((garageModifs) =>
        garageModifs.changes.some((e) => e.isMaker)
      );
      const payloadData = {
        modifications: userItem.modifications,
        ...changerUserName,
      };
      userItem.user.notifyMakeSurveyChanges(payloadData, notifyPerformers);
    }
  }
  // alert customer_success@custeed.com
  if (notifyModificationsCusteed.length > 0) {
    app.models.User.notifyCustomerCusteed({ modifications: notifyModificationsCusteed, ...changerUserName });
  }
};

const updateGarage = async (app, garageId, firstContactDelay) => {
  return app.models.Garage.getMongoConnector().updateOne(
    { _id: ObjectId(garageId.toString()) },
    { $set: { firstContactDelay } }
  );
};

module.exports.resolvers = {
  Mutation: {
    GarageSetGarageMakeSurveys: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { isAlertAdmin, modifications } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (!(await user.isConcernedByMakeSurveys())) {
          throw new Error('Forbidden : User not concerned by make surveys');
        }
        const garagesToSaveMap = new Map(); // Garages with garagescore surveys to me modified and saved.
        const alertEmailData = new Map(); // This map will be sent to treatAndSendAlerts
        let garages = await getUserGarages(app, user.id, {
          type: true,
          publicDisplayName: true,
          group: true,
          subscriptions: true,
          status: true,
          brandNames: true,
          campaignScenarioId: true,
          firstContactDelay: true,
        });
        garages = garages.filter(({ type, status, subscriptions, brandNames }) =>
          hasMakeSurveys({ type, status, subscriptions, brandNames })
        );
        for (const modification of modifications) {
          if (modification.isMaker) {
            // Maker's survey delta has been changed, process for every garage with this brand.
            for (const selectedGarage of garages) {
              const prevValue =
                (selectedGarage.firstContactDelay &&
                  selectedGarage.firstContactDelay[modification.type] &&
                  selectedGarage.firstContactDelay[modification.type].makerSurvey &&
                  selectedGarage.firstContactDelay[modification.type].makerSurvey[modification.brand] &&
                  selectedGarage.firstContactDelay[modification.type].makerSurvey[modification.brand].value) ||
                0;
              if (
                selectedGarage.brandNames &&
                selectedGarage.brandNames.includes(modification.brand) &&
                isSubscribed(selectedGarage.subscriptions, modification.type) &&
                modification.value !== prevValue
              ) {
                garagesToSaveMap.set(selectedGarage._id, selectedGarage);
                selectedGarage.firstContactDelay = selectedGarage.firstContactDelay || {};
                selectedGarage.firstContactDelay[modification.type] =
                  selectedGarage.firstContactDelay[modification.type] || {};
                selectedGarage.firstContactDelay[modification.type].makerSurvey =
                  selectedGarage.firstContactDelay[modification.type].makerSurvey || {};
                selectedGarage.firstContactDelay[modification.type].makerSurvey[modification.brand] = {
                  value: modification.value,
                  prevValue,
                  userId: user.getId().toString(),
                  date: new Date(),
                };
                // -- Sending process
                if (!alertEmailData.get(selectedGarage._id.toString())) {
                  alertEmailData.set(selectedGarage._id.toString(), []);
                }
                alertEmailData.get(selectedGarage._id.toString()).push({
                  // To send the alerts
                  isMaker: true,
                  garage: selectedGarage,
                  value: modification.value,
                  prevValue,
                  type: modification.type,
                  brand: modification.brand,
                });
                // -- End of sending process
              }
            }
          } else {
            const garageToModify = garages.find((g) => g._id.toString() === modification.garageId);
            if (!garageToModify) {
              throw Error(`Garage not found in user's garages : ${modification.garageId}`);
            }
            garageToModify.scenario = await app.models.CampaignScenario.findById(garageToModify.campaignScenarioId);
            if (!garagesToSaveMap.get(garageToModify._id)) {
              garagesToSaveMap.set(garageToModify._id, garageToModify);
            }
            // We set all metiers' delay if none exists
            if (!garageToModify.firstContactDelay) {
              garageToModify.firstContactDelay = {};
              authorizedTypes.forEach((type) => {
                garageToModify.firstContactDelay[type] = {
                  value: garageToModify.scenario.chains[type].contacts[0].delay,
                  history: [],
                };
              });
            }
            // checks to see and set what exists and what doesn't
            if (!garageToModify.firstContactDelay[modification.type]) {
              garageToModify.firstContactDelay[modification.type] = {
                value: garageToModify.scenario.chains[modification.type].contacts[0].delay,
                history: [],
              };
            }
            if (
              !garageToModify.firstContactDelay[modification.type].value &&
              garageToModify.firstContactDelay[modification.type].value !== 0
            ) {
              garageToModify.firstContactDelay[modification.type].value =
                garageToModify.scenario.chains[modification.type].contacts[0].delay;
            }
            if (!garageToModify.firstContactDelay[modification.type].history) {
              garageToModify.firstContactDelay[modification.type].history = [];
            }
            const history = garageToModify.firstContactDelay[modification.type].history;
            if (!modification.isMaker && history && history.length === 3) {
              history.pop();
            }
            const prevValue = garageToModify.firstContactDelay[modification.type].value;
            history.unshift({
              userId: user.getId().toString(),
              date: new Date(),
              value: modification.value,
              prevValue,
            });
            garageToModify.firstContactDelay[modification.type].history = history;
            garageToModify.firstContactDelay[modification.type].value = modification.value;
            // -- Sending process
            if (!alertEmailData.get(garageToModify._id)) {
              alertEmailData.set(garageToModify._id, []);
            }
            alertEmailData.get(garageToModify._id).push({
              // To send the alerts
              isMaker: false,
              garage: garageToModify,
              value: modification.value,
              prevValue,
              type: modification.type,
              brand: modification.brand,
            });
            // -- End of sending process
          }
        }
        // Save of all firstContactDelay modified
        const keys = [...garagesToSaveMap.keys()];
        const promises = keys.map((key) => () => updateGarage(app, key, garagesToSaveMap.get(key).firstContactDelay));
        await concurrentpromiseAll(promises, 100);
        await treatAndSendAlerts(app, alertEmailData, user, isAlertAdmin);

        return { success: true };
      } catch (error) {
        log.error(FED, error);
        return error;
      }
    },
  },
};
