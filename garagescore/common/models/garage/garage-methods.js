const DataTypes = require('../data/type/data-types');
const GarageTypes = require('../garage.type');
const GarageStatuses = require('../garage.status');
const SourceTypes = require('../data/type/source-types');
const GarageSubscriptions = require('../garage.subscription.type');
const GarageHistoryPeriods = require('../garage-history.period');
const bonusBrands = require('../bonus-brands.type');
const garageCache = require('../../lib/garagescore/api/graphql/_common/garage-cache.js');

const ghc = require('../../lib/garagescore/garage-history/garage-history-cache');
const { setAutomaticReplies } = require('./garage-mongo');
const { ObjectId, Int32 } = require('mongodb');
const { getDeepFieldValue } = require('../../lib/util/object');

const { log, TIBO } = require('../../lib/util/log');

// If you modify this, modify hasMakeSurveysFilter !!!
const isSubscribed = (garageSubscriptions, subscription) =>
  !!(
    GarageSubscriptions.hasValue(subscription) &&
    garageSubscriptions &&
    garageSubscriptions.active &&
    garageSubscriptions[subscription] &&
    garageSubscriptions[subscription].enabled
  );

const isEreputationSourceConnected = (exogenousReviewsConfigurations, source) => {
  if (source === SourceTypes.PAGESJAUNES) {
    return !!(
      exogenousReviewsConfigurations &&
      exogenousReviewsConfigurations[source] &&
      exogenousReviewsConfigurations[source].token
    );
  }
  return !!(
    exogenousReviewsConfigurations &&
    exogenousReviewsConfigurations[source] &&
    exogenousReviewsConfigurations[source].token &&
    exogenousReviewsConfigurations[source].externalId
  );
};
const getScenario = (campaignScenarioId, app) => app.models.CampaignScenario.findById(campaignScenarioId);
// If you modify this, modify hasMakeSurveysFilter !!!
const hasMakeSurveys = ({ type, status, subscriptions, brandNames }) => {
  if (status !== GarageStatuses.RUNNING_AUTO || type !== GarageTypes.DEALERSHIP) {
    return false;
  }
  const subsToCheck = [
    GarageSubscriptions.MAINTENANCE,
    GarageSubscriptions.NEW_VEHICLE_SALE,
    GarageSubscriptions.USED_VEHICLE_SALE,
  ];
  if (!subsToCheck.some((sub) => isSubscribed(subscriptions, sub))) {
    return false;
  }
  if (brandNames && brandNames.length > 0) {
    return brandNames.some((brand) => bonusBrands.find((bonusBrand) => bonusBrand === brand));
  }
  return false;
};
const getDataImportStartedAt = ({ dataImportStartedAt, createdAt }) => dataImportStartedAt || createdAt;
const isSharingTickets = (parentGarage, type = null) => {
  const enabled =
    parentGarage && parentGarage.shareLeadTicket && parentGarage.shareLeadTicket.enabled && parentGarage.garageId;
  if (!enabled) return false;
  return type ? parentGarage.shareLeadTicket[type] : true;
};
const isSharingAllTickets = (parentGarage, sharingTickets = null) => {
  const garageIsSharing = sharingTickets === null ? isSharingTickets(parentGarage) : sharingTickets;
  if (!garageIsSharing) {
    return false;
  }
  const { shareLeadTicket } = parentGarage;
  return shareLeadTicket.NewVehicleSale && shareLeadTicket.UsedVehicleSale;
};

const updateFromObject = async (
  { _id, id, type, publicDisplayName, subscriptions, exogenousReviewsConfigurations },
  updates,
  app,
  publicApi
) => {
  const garageTypeChanged = updates.type && updates.type !== type;
  let updateManyResult = null;
  let exogenousReviewsDeleted = false;
  let needAutomationCampaignsRefresh = false;

  // 1. Update attributes
  log.info(TIBO, `[GarageModel - UpdateFromObject] - Updating Garage ${publicDisplayName}`);
  const garageId = _id || id;
  await app.models.Garage.getMongoConnector().updateOne({ _id: garageId }, { $set: updates });
  const updatedGarage = await app.models.Garage.getMongoConnector().findOne({ _id: garageId });

  Object.keys(updates).forEach((key) => {
    if (key === 'status' || key.includes('subscriptions')) {
      needAutomationCampaignsRefresh = true;
    }
  });
  if (needAutomationCampaignsRefresh) {
    await app.models.AutomationCampaign.setCampaigns(
      garageId,
      updatedGarage.subscriptions,
      updatedGarage.dataFirstDays,
      updatedGarage.locale,
      updatedGarage.status
    );
  }

  // 2. If we changed garage type we will need to update associated datas
  if (garageTypeChanged) {
    log.info(
      TIBO,
      `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Changed Of Type (${type} -> ${updates.type}). Will Update Associated Datas...`
    );
    updateManyResult = await app.models.Data.getMongoConnector().updateMany(
      {
        garageId: garageId.toString(),
        garageType: { $ne: updates.type },
      },
      {
        $set: { garageType: updates.type },
      }
    );
    log.info(
      TIBO,
      `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Changed Of Type (${type} -> ${updates.type}). ${updateManyResult.modifiedCount} Datas Updated!`
    );
  }

  // 3. Now let's worry about possible change in the EReputation subscription or disconnection from any exogenous source
  const oldEreputationSubscription = subscriptions && subscriptions.EReputation && subscriptions.EReputation.enabled;
  const newEreputationSubscription =
    updatedGarage.subscriptions &&
    updatedGarage.subscriptions.EReputation &&
    updatedGarage.subscriptions.EReputation.enabled;

  if (oldEreputationSubscription && !newEreputationSubscription) {
    log.info(
      TIBO,
      `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Unsubscribed EReputation. Will Remove All Of Its ExogenousReviews`
    );
    updateManyResult = await app.models.Data.getMongoConnector().deleteMany({
      garageId: garageId.toString(),
      type: DataTypes.EXOGENOUS_REVIEW,
    });
    exogenousReviewsDeleted = true;
    log.info(
      TIBO,
      `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Unsubscribed EReputation. ${updateManyResult.result.n} Datas Removed!`
    );
  } else if (exogenousReviewsConfigurations) {
    await Promise.all(
      Object.keys(exogenousReviewsConfigurations).map(async (key) => {
        if (
          exogenousReviewsConfigurations[key] &&
          exogenousReviewsConfigurations[key].token &&
          exogenousReviewsConfigurations[key].externalId &&
          (!updatedGarage.exogenousReviewsConfigurations ||
            !updatedGarage.exogenousReviewsConfigurations[key] ||
            !updatedGarage.exogenousReviewsConfigurations[key].token ||
            !updatedGarage.exogenousReviewsConfigurations[key].externalId)
        ) {
          log.info(
            TIBO,
            `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Disconnected ${key}. Will Remove All Of Its ExogenousReviews`
          );
          updateManyResult = await app.models.Data.getMongoConnector().deleteMany({
            garageId: garageId.toString(),
            type: DataTypes.EXOGENOUS_REVIEW,
            'source.type': key,
          });
          exogenousReviewsDeleted = true;
          log.info(
            TIBO,
            `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Disconnected ${key}. ${updateManyResult.result.n} Datas Removed!`
          );
        }
      })
    );
  }

  // 4. Let's refresh some cache in the case we touched some exogenous reviews
  if (exogenousReviewsDeleted) {
    GarageHistoryPeriods.getCockpitAvailablePeriods(new Date('1970-01-01'))
      .map((periodObj) => periodObj.id)
      .forEach((periodId) => {
        ghc.revokeKey(
          ghc.getKey('garageHistory', { garageId: garageId.toString(), garageType: type, periodId, exogenous: true })
        );
      });
  }

  log.info(TIBO, `[GarageModel - UpdateFromObject] - Garage ${publicDisplayName} Update Successful.`);
  return updatedGarage;
};

const getDefaultRatingType = (garageType) => {
  return garageType === GarageTypes.VEHICLE_INSPECTION ? 'stars' : 'rating';
};

// Automatic replies
const activateAutomaticReplies = (app, garageId, automaticRepliesConfig = {}) => {
  const automaticReplies = {
    enabled: true,
    ...automaticRepliesConfig,
  };

  // write in db with db method
  try {
    return setAutomaticReplies(app, garageId, automaticReplies);
  } catch (err) {
    log.debug(ANASS, `ERR : activateAutomaticReplies: ${err}`);
    throw err;
  }
};
const deactivateAutomaticReplies = (app, garageId) => {
  return setAutomaticReplies(app, garageId, { enabled: false });
};

const addExogenousConfiguration = async (
  GarageMongoModels,
  { _id, exogenousReviewsConfigurations: garageExogenousReviewsConfigurations },
  source,
  token,
  externalId,
  connectedBy
) => {
  const defaultReviewsConfigurations = { Google: {}, Facebook: {}, PagesJaunes: {} };
  const exogenousReviewsConfigurations = garageExogenousReviewsConfigurations || defaultReviewsConfigurations;

  exogenousReviewsConfigurations[source] = {
    token,
    error: '',
    lastRefresh: new Date(),
    externalId,
    lastError: null,
    lastFetch: null,
    connectedBy,
  };
  return await GarageMongoModels.updateOne({ _id }, { $set: { exogenousReviewsConfigurations } });
};
const hardDisconnectFromSource = async (
  GarageMongoModels,
  { _id, exogenousReviewsConfigurations: garageExogenousReviewsConfigurations },
  source
) => {
  if (!garageExogenousReviewsConfigurations || !garageExogenousReviewsConfigurations[source]) {
    throw new Error('Trying to delete something that does not exist!');
  }
  const exogenousReviewsConfigurations = garageExogenousReviewsConfigurations;

  exogenousReviewsConfigurations[source] = {
    token: '',
    error: '',
    lastRefresh: null,
    externalId: '',
    lastError: null,
    lastFetch: null,
    connectedBy: '',
  };
  return await GarageMongoModels.updateOne({ _id }, { $set: { exogenousReviewsConfigurations } });
};
const getGaragesAutomaticReviewResponseDelayByPage = async (app, garageIds = [], limit = 50, page = 0) => {
  const query = app.models.Garage.getMongoConnector().find(
    { _id: { $in: garageIds.map(ObjectId) } },
    { automaticReviewResponseDelay: true }
  );
  const count = await query.count();
  const hasMore = limit * (page + 1) < count;
  return {
    garages: await query
      .skip(page * limit)
      .limit(limit)
      .toArray(),
    hasMore: hasMore,
  };
};
const setGarageAutomaticReviewResponseDelay = async (app, id, delay) => {
  if (typeof delay !== 'number') {
    return undefined;
  }
  if (delay === 0) {
    return app.models.Garage.getMongoConnector().findOneAndUpdate(
      { _id: ObjectId(id) },
      { $unset: { automaticReviewResponseDelay: '' } },
      { projection: { automaticReviewResponseDelay: 1 }, returnOriginal: false }
    );
  } else {
    return app.models.Garage.getMongoConnector().findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: { automaticReviewResponseDelay: delay } },
      { projection: { automaticReviewResponseDelay: 1 }, returnOriginal: false }
    );
  }
};
//If a garage of a list lacks delay for automatic response, sets it to the default (4hrs)
const checkAndSetGarageAutomaticResponseDelay = async (app, garageIds) => {
  return app.models.Garage.getMongoConnector().updateMany(
    { _id: { $in: garageIds }, automaticReviewResponseDelay: { $exists: false } },
    { $set: { automaticReviewResponseDelay: Int32(14400000) } }
  );
};

const getGaragesDefaultSignature = async (garageIds = []) => {
  const garages = await garageCache.getGarages(garageIds);
  const result = garages.map(({ _id, surveySignature, group }) => {
    return {
      _id: _id,
      lastName: getDeepFieldValue(surveySignature, 'defaultSignature.lastName'),
      firstName: getDeepFieldValue(surveySignature, 'defaultSignature.firstName'),
      job: getDeepFieldValue(surveySignature, 'defaultSignature.job'),
      group: group,
    };
  });
  return result;
};
module.exports = {
  isSubscribed,
  isEreputationSourceConnected,
  getScenario,
  hasMakeSurveys,
  getDataImportStartedAt,
  isSharingTickets,
  isSharingAllTickets,
  updateFromObject,
  getDefaultRatingType,
  // Automatic replies
  activateAutomaticReplies,
  deactivateAutomaticReplies,
  addExogenousConfiguration,
  hardDisconnectFromSource,
  getGaragesAutomaticReviewResponseDelayByPage,
  setGarageAutomaticReviewResponseDelay,
  getGaragesDefaultSignature,
  checkAndSetGarageAutomaticResponseDelay,
};
