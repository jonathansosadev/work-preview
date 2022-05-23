const _ = require('underscore');
const config = require('config');
const async = require('async');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const lruCache = require('lru-cache');
const debug = require('debug')('garagescore:common:models:garage'); // eslint-disable-line max-len,no-unused-vars
const gsCampaignCreator = require('../lib/garagescore/campaign/creator');
const gsDataFileDataTypes = require('./data-file.data-type');
const gsS3DataPusher = require('../lib/garagescore/garage/data-s3-pusher');
const GarageHistoryPeriod = require('./garage-history.period');
const app = require('../../server/server');
const pathFunction = require('../lib/garagescore/data-file/paths/path-function');
const timeHelper = require('../lib/util/time-helper');
const garageStatus = require('./garage.status.js');
const alertTypes = require('./alert.types.js');
const GarageTypes = require('./garage.type.js');
const GarageStatus = require('./garage.status');
const bonusBrands = require('./bonus-brands.type.js');
const DataTypes = require('./data/type/data-types');
const garageSubscriptionTypes = require('./garage.subscription.type.js');
const queriesCommon = require('../lib/garagescore/api/graphql/queries/_common');
const OVH = require('../lib/garagescore/cross-leads/ovh-telephony-api.js');
const { decodePhone } = require('../lib/garagescore/cross-leads/util.js');
const { isEmail } = require('validator');
const SourceTypes = require('../../common/models/data/type/source-types');
const publicApi = require('../lib/garagescore/api/public-api');

const garageMethods = require('./garage/garage-methods');
const userMethods = require('./user/user-methods');

module.exports = function GarageDefinition(Garage) {
  // eslint-disable-line no-unused-vars
  Garage.defaultWorkingHoursPerDay = 9;
  Garage.observe('before save', (ctx, next) => {
    if (ctx.instance && garageStatus.isRunning(ctx.instance.status) && !ctx.instance.runningSince) {
      ctx.instance.runningSince = new Date(); // eslint-disable-line no-param-reassign
      next();
      return;
    }
    if (ctx.data && garageStatus.isRunning(ctx.data.status)) {
      Garage.findById(ctx.data.id, (err, instance) => {
        if (err) {
          next(err);
          return;
        }
        if (!instance.runningSince) {
          ctx.data.runningSince = new Date(); // eslint-disable-line no-param-reassign
        }
        next();
      });
      return;
    }
    next();
  });

  /**
   * Get all taken numbers (previously was: await app.models.PhoneBucket.takenPhones();)
   */
  Garage.getAllTakenPhones = async function _getAllTakenPhones(garageIds = null) {
    const mongo = Garage.getMongoConnector();
    return mongo
      .aggregate([
        { $match: { 'crossLeadsConfig.enabled': true, ...(garageIds ? { _id: { $in: garageIds } } : {}) } },
        { $project: { source: '$crossLeadsConfig.sources', garageId: '$_id' } },
        { $unwind: '$source' },
        { $project: { value: '$source.phone', sourceType: '$source.type', garageId: '$garageId' } },
      ])
      .toArray();
  };

  /**
   * Get a garage's sources
   */
  Garage.prototype.getSources = function getSources() {
    if (!this.crossLeadsConfig || !this.crossLeadsConfig.sources) return [];
    return this.crossLeadsConfig.sources;
  };

  /**
   * When we removed the CrossLeads  subscription from greyBo, we need to disable "crossLeadsConfig.enabled"
   * enabled = false will disable the retrieve-ovh-calls.js and handle-incoming-email.js
   */
  Garage.prototype.unsubscribeToCrossLeads = function unsubscribeToCrossLeads() {
    if (!this.crossLeadsConfig) return;
    this.crossLeadsConfig.enabled = false;
    for (const source of this.crossLeadsConfig.sources) source.enabled = false;
  };
  /**
   * if CrossLeads subscription is enable and garage got crossLeadsConfig,
   *  re-active all sources
   */
  Garage.prototype.enableAllSourcesCrossLeads = function enableAllSourcesCrossLeads() {
    if (!this.crossLeadsConfig || this.crossLeadsConfig.sources.length < 1) return;
    this.crossLeadsConfig.enabled = true;
    for (const source of this.crossLeadsConfig.sources) source.enabled = true;
  };
  /**
   * Is the garage source is enabled
   */
  Garage.isSourceEnabled = async function isSourceEnabled(garageId, sourceType) {
    const garage = await Garage.findById(garageId.toString(), { fields: { crossLeadsConfig: 1 } });
    if (
      !garage ||
      !garage.crossLeadsConfig ||
      !garage.crossLeadsConfig.sources ||
      !garage.crossLeadsConfig.sources.find
    )
      return false;
    if (!garage.crossLeadsConfig.sources.find((c) => c.type === sourceType)) return false;
    return garage.crossLeadsConfig.sources.find((c) => c.type === sourceType).enabled;
  };

  const _generateEmail = (garageId, sourceType) => `${sourceType.toLowerCase()}.${garageId}@discuss.garagescore.com`;

  /**
   * Add a source configuration into the garage
   */
  Garage.setSource = async function _setSource(source, userId) {
    if (!source) throw new Error('setSource: source not given');
    if (!source.garageId || !ObjectID.isValid(source.garageId)) throw new Error('setSource: source.garageId not given');
    if (source.type && !SourceTypes.hasValue(source.type)) throw new Error('setSource: source.type not given');
    if (source.followed_email && !isEmail(source.followed_email))
      throw new Error('setSource: source.followed_email not given');
    if (source.followed_phones && !source.followed_phones.length)
      throw new Error('setSource: source.followed_phones not given');
    // Clean phone +330621982935 -> +33621982935
    source.followed_phones = source.followed_phones.map((p) => decodePhone(p));
    const garage = await Garage.getMongoConnector().findOne(
      { _id: ObjectID(source.garageId) },
      {
        fields: { publicDisplayName: 1, _id: 1, crossLeadsConfig: 1, phone: 1 },
      }
    );
    if (!garage) {
      throw new Error('setSource: unknown garageId');
    }
    if (!garage.crossLeadsConfig) garage.crossLeadsConfig = { enabled: true, sources: [] };
    if (!garage.crossLeadsConfig.sources) garage.crossLeadsConfig.sources = [];
    let sourceConfig = garage.crossLeadsConfig.sources.find((s) => s.type === source.type);
    if (!sourceConfig) {
      // Should push a new source and generate phone and email
      const phone = await Garage.app.models.PhoneBucket.draw(
        Garage.app.models.PhoneBucket.getArea(garage, source.followed_phones || []),
        source.garageId,
        garage.publicDisplayName
      );
      sourceConfig = {
        enabled: true,
        email: _generateEmail(source.garageId, source.type),
        phone: phone.value,
        type: source.type,
        createdAt: new Date(),
        createdBy: userId,
      };
      garage.crossLeadsConfig.sources.push(sourceConfig);
    } else {
      sourceConfig.updatedAt = new Date();
      sourceConfig.updatedBy = userId;
    }
    sourceConfig.followed_email = source.followed_email;
    const shouldUpdateOvh = (sourceConfig.followed_phones || []).toString() !== source.followed_phones.toString(); // Only update if changed
    sourceConfig.followed_phones = source.followed_phones;
    if (shouldUpdateOvh) await OVH.configurePhonesAsAgents(sourceConfig.followed_phones, sourceConfig.phone);
    await Garage.getMongoConnector().updateOne(
      { _id: ObjectID(source.garageId) },
      { $set: { crossLeadsConfig: garage.crossLeadsConfig } }
    );
    return { garageId: source.garageId, garagePublicDisplayName: garage.publicDisplayName, ...sourceConfig };
  };

  /**
   * Get all sources config in a list filter on garageIds user scope
   */
  Garage.getAllSources = async function _getAllSources(garageIds) {
    if (!garageIds || !garageIds.length) throw new Error('garageIds missing in args');
    const mongo = Garage.getMongoConnector();
    return mongo
      .aggregate([
        { $match: { 'crossLeadsConfig.enabled': true, _id: { $in: garageIds } } },
        { $project: { publicDisplayName: 1, source: '$crossLeadsConfig.sources' } },
        { $unwind: '$source' },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [{ garagePublicDisplayName: '$publicDisplayName', garageId: '$_id' }, '$source'],
            },
          },
        },
      ])
      .toArray();
  };

  /*
   * Dynamic Methods
   */
  Garage.getAgents = async function _getAgents(garageIds) {
    // ['5a6278f68447f20300836f27'] or '5a6278f68447f20300836f27'
    if (!garageIds || (Array.isArray(garageIds) && !garageIds.length)) return [];
    return Garage.find({
      where: {
        'parent.garageId': Array.isArray(garageIds) ? { inq: garageIds } : garageIds,
        'parent.shareLeadTicket.enabled': true,
      },
    });
  };

  Garage.prototype.getAgents = async function _getAgents() {
    return Garage.getAgents(this.id);
  };

  /** Is the garage sharing his lead tickets ? If you specify the type, it will check if this type in particular is shared */
  Garage.prototype.isSharingTickets = function _isSharingTickets(type = null) {
    return garageMethods.isSharingTickets(this.parent, type);
  };

  Garage.prototype.isSharingAllTickets = function _isSharingAllTickets(sharingTickets = null) {
    return garageMethods.isSharingAllTickets(this.parent, sharingTickets);
  };

  Garage.getAllAgentWhichShareLeadTicket = async function _getAllAgentWhichShareLeadTicket(fields = {}) {
    return Garage.find({ where: { 'parent.shareLeadTicket.enabled': true }, fields });
  };

  /** Terminate a garage and stop sharing reviews to partners */
  Garage.terminate = function terminate(garageId, cb) {
    // eslint-disable-line no-param-reassign
    Garage.findByIdAndUpdateAttributes(garageId, { shareReviews: false }, cb);
  };
  // folder in S3 where campaign files are stored
  Garage.prototype.getUploadFolder = function getUploadFolder() {
    // eslint-disable-line no-param-reassign
    return this.dms && this.dms.uploadFolder;
  };
  Garage.prototype.getSensitiveThreshold = function getSensitiveThreshold(dataType) {
    if (!this.thresholds || !this.thresholds.alertSensitiveThreshold) return 6;
    if (dataType === DataTypes.MAINTENANCE) return this.thresholds.alertSensitiveThreshold.maintenance || 6;
    else if (dataType === DataTypes.NEW_VEHICLE_SALE) return this.thresholds.alertSensitiveThreshold.sale_new || 6;
    else if (dataType === DataTypes.USED_VEHICLE_SALE) return this.thresholds.alertSensitiveThreshold.sale_used || 6;
    else if (dataType === DataTypes.VEHICLE_INSPECTION)
      return this.thresholds.alertSensitiveThreshold.vehicle_inspection || 6;
    return 6;
  };
  // get annex garages
  Garage.prototype.getAnnexes = async function getAnnexes() {
    // eslint-disable-line no-param-reassign
    const annexes = await app.models.Garage.find({
      where: {
        'subscriptions.active': true,
        annexGarageId: { neq: null },
      },
    });
    if (annexes.length === 0) {
      return [];
    }
    return annexes;
  };
  // Date of start of importing contacts (should be the reference of cockpit history)
  Garage.prototype.getDataImportStartedAt = function getDataImportStartedAt() {
    // eslint-disable-line no-param-reassign
    return garageMethods.getDataImportStartedAt({
      dataImportStartedAt: this.dataImportStartedAt,
      createdAt: this.createdAt,
    });
  };
  // Suffix of uploaded files for a dataType
  Garage.prototype.getUploadedFileSuffix = function getUploadedFileSuffix(dataType) {
    // eslint-disable-line no-param-reassign
    return this.dms && this.dms[dataType] && this.dms[dataType].fileSuffix;
  };
  // Upload method used by this garage for a dataType
  Garage.prototype.getUploadMethod = function getUploadMethod(dataType) {
    // eslint-disable-line no-param-reassign
    return this.dms && this.dms[dataType] && this.dms[dataType].method;
  };
  /* V // If you modify isSubscribed, modify hasMakeSurveysFilter !!! */
  Garage.prototype.isSubscribed = function isSubscribed(subscription) {
    // eslint-disable-line no-param-reassign
    return garageMethods.isSubscribed(this.subscriptions, subscription);
  };
  Garage.prototype.addExogenousConfiguration = function addExogenousConfiguration(
    source,
    code,
    externalId,
    connectedBy
  ) {
    if (!this.exogenousReviewsConfigurations) {
      this.exogenousReviewsConfigurations = { Google: {}, Facebook: {}, PagesJaunes: {} };
    }
    this.exogenousReviewsConfigurations[source] = {
      token: code,
      error: '',
      lastRefresh: new Date(),
      externalId,
      lastError: null,
      lastFetch: null,
      connectedBy,
    };
    return this;
  };
  Garage.prototype.softDisconnectFromSource = function softDisconnectFromSource(source) {
    if (!this.exogenousReviewsConfigurations) {
      this.exogenousReviewsConfigurations = { Google: {}, Facebook: {}, PagesJaunes: {} };
    }
    this.exogenousReviewsConfigurations[source] = {
      token: this.exogenousReviewsConfigurations[source].token || '',
      error: '',
      lastRefresh: null,
      externalId: '',
      lastError: null,
      lastFetch: null,
      connectedBy: '',
    };
    return this;
  };
  Garage.prototype.hardDisconnectFromSource = function hardDisconnectFromSource(source) {
    if (!this.exogenousReviewsConfigurations) {
      this.exogenousReviewsConfigurations = { Google: {}, Facebook: {}, PagesJaunes: {} };
    }
    this.exogenousReviewsConfigurations[source] = {
      token: '',
      error: '',
      lastRefresh: null,
      externalId: '',
      lastError: null,
      lastFetch: null,
      connectedBy: '',
    };
    return this;
  };
  Garage.prototype.hasMakeSurveys = function hasMakeSurveys() {
    return garageMethods.hasMakeSurveys({
      type: this.type,
      status: this.status,
      subscriptions: this.subscriptions,
      brandNames: this.brandNames,
    });
  };
  Garage.prototype.hasMakeSurveysFilter = function hasMakeSurveysFilters(search, isMongo = false) {
    // With isMongo we can choose whether to launch the query on the direct connector or on loopback
    // Did this because of the override-user-model migration I ended up using this fct return value on both sides
    const and = isMongo ? '$and' : 'and';
    const or = isMongo ? '$or' : 'or';
    const inq = isMongo ? '$in' : 'in';
    if (!search) {
      search = '';
    }
    return {
      [and]: [
        {
          [or]: [
            { 'subscriptions.Maintenance.enabled': true },
            { 'subscriptions.NewVehicleSale.enabled': true },
            { 'subscriptions.UsedVehicleSale.enabled': true }, // eslint-disable-line max-len
          ],
        },
        {
          [or]: queriesCommon.addTextSearchToFiltersForGarages(null, search),
        },
      ],
      brandNames: { [inq]: bonusBrands },
      status: garageStatus.RUNNING_AUTO,
      type: GarageTypes.DEALERSHIP,
    };
  };
  Garage.hasMakeSurveysFilter = Garage.prototype.hasMakeSurveysFilter;
  Garage.prototype.getScenario = async function getScenario() {
    return garageMethods.getScenario(this.campaignScenarioId, Garage.app);
  };
  /**
   * Get all real time subscribers to one particular alertType
   * @param garageId
   * @param alertType (default to all)
   * @returns {Promise<*>}
   */
  Garage.getRealTimeSubscribers = async function getRealTimeSubscribers(garageId, alertType = null) {
    const fields = { id: true, email: true, fullName: true, allGaragesAlerts: true };
    const garageUsers = await Garage.app.models.User.getUsersForGarage(garageId, fields);
    if (!garageUsers || !garageUsers.length) return [];
    if (alertType) return garageUsers.filter((user) => user.allGaragesAlerts && user.allGaragesAlerts[alertType]);

    const subscribersByAlertTypes = {};
    garageUsers.forEach((u) => {
      if (u.allGaragesAlerts) {
        Object.keys(u.allGaragesAlerts).forEach((type) => {
          if (alertTypes.hasValue(type) && u.allGaragesAlerts[type]) {
            if (!subscribersByAlertTypes[type]) subscribersByAlertTypes[type] = [];
            subscribersByAlertTypes[type].push(u);
          }
        });
      }
    });
    return subscribersByAlertTypes;
  };
  /**
   * Return garages subscribed to only clients and not to GarageScore and ghost users
   * @param garagId
   * @param callback
   * @constructor
   */
  Garage.prototype.getUsersForGarageWithoutCusteedUsers = async function getUsersForGarageWithoutCusteedUsers(
    projection
  ) {
    return Garage.getUsersForGarageWithoutCusteedUsers(this.getId(), projection);
  };
  Garage.getUsersForGarageWithoutCusteedUsers = async function getUsersForGarageWithoutCusteedUsers(
    garageId,
    projection = {}
  ) {
    // eslint-disable-line no-param-reassign
    if (typeof garageId === 'string') garageId = new ObjectID(garageId);
    // Special case where we need all the fields because right after a save is performed right after
    let fields = projection !== false ? { ...projection, email: true } : false;
    const garageUsers = await Garage.app.models.User.getUsersForGarage(garageId, fields);
    return garageUsers.filter((user) => !user.isGarageScoreUser() && !user.isGhost());
  };
  Garage.getUsersForGaragesWithoutCusteedUsers = async function getUsersForGaragesWithoutCusteedUsers(
    garageIds,
    projection = {}
  ) {
    let fields = projection !== false ? { ...projection, email: true } : false;
    const garagesUsers = await Garage.app.models.User.getUsersForGarages(garageIds, fields);
    return garagesUsers.filter((user) => !userMethods.isGarageScoreUser(user) && !userMethods.isGhost(user));
  };
  Garage.countReallySubscribedUsers = async function countReallySubscribedUsers(garageId) {
    const subscribedUsers = await Garage.getUsersForGarageWithoutCusteedUsers(garageId);
    return (subscribedUsers && subscribedUsers.length) || 0;
  };
  /*
   * Static Methods
   */
  /** link to the garage page in our web directory*/
  Garage.directoryURL = function directoryURL(garage, utm, noCache = false) {
    // eslint-disable-line no-param-reassign
    const slug = garage.slug ? garage.slug.toString() : 'no-slug';
    let link = `${config.get('client.www.url')}/${GarageTypes.getSlug(garage.type)}/${slug}`;
    const queryParams = {};
    if (!(_.isUndefined(utm) || utm === null)) {
      queryParams.utm_source = utm.source;
      queryParams.utm_medium = utm.medium;
      queryParams.utm_campaign = slug;
    }
    if (noCache) {
      queryParams.nocache = '1';
    }
    if (Object.keys(queryParams).length > 0) {
      link += `?${Object.keys(queryParams)
        .map((param) => `${param}=${queryParams[param]}`)
        .join('&')}`;
    }
    return link;
  };
  // Garage.directoryURLFromSlug = function directoryURLFromSlug(slug, utm) { // eslint-disable-line no-param-reassign
  //   let link = `${config.get('client.www.url')}/garage/${slug}?nocache=true`;
  //   if (!(_.isUndefined(utm) || utm === null)) {
  //     link += `?utm_source=${utm.source}&utm_medium=${utm.medium}&utm_campaign=${slug}`;
  //   }
  //   return link;
  // };

  /*
   * Remote Methods
   */

  // findPublicScores is slow and may be called multiple time when a visitor scroll trough the comments, a small cache
  const publicScoresCache = lruCache({
    max: 100000, // this is gonna take a lot of ram
    length() {
      return 1;
    },
    maxAge: 1000 * 60 * 60 * 4, // last 4 hours
  });
  // city, vehicleMake, vehicleModel, service => we do not handle those filters yet
  Garage.findPublicScores = async function findPublicScores(
    garageId,
    vehicleMake,
    vehicleModel,
    service,
    useCache,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    const cacheKey = garageId + (vehicleMake || '') + (vehicleModel || '') + (service || '');
    const s = publicScoresCache.get(cacheKey);
    if (useCache && s) {
      if (callback) {
        callback(null, s);
      }
      return s;
    }

    let scores;
    const pipeline = [
      {
        $match: {
          garageId: ObjectID(garageId),
        },
      },
      {
        $sort: {
          synthesizedAt: -1,
        },
      },
      {
        $group: {
          _id: '$type',
          payload: {
            $first: '$$ROOT.payload',
          },
          type: {
            $first: '$$ROOT.type',
          },
        },
      },
    ];

    try {
      scores = await Garage.app.models.PublicScore.getMongoConnector().aggregate(pipeline).toArray();
    } catch (err) {
      console.error(err);
    }

    if (scores) publicScoresCache.set(cacheKey, scores, 1000 * 60 * 5);
    if (callback) {
      callback(null, scores);
    }
    return scores;
  };
  Garage.createPublicScore = function createPublicScore(garageId, publicScoreType, callback) {
    // eslint-disable-line no-param-reassign
    Garage.app.models.PublicScore.createForGarage(publicScoreType, garageId, callback);
  };
  /** pushed data from a dms to s3 */
  Garage.pushDMSDataToS3 = function pushDMSDataToS3(garageId, date, dataType, callback) {
    // eslint-disable-line no-param-reassign
    Garage.findById(garageId, (getByIdErr, garage) => {
      if (getByIdErr) {
        callback(getByIdErr);
        return;
      }
      gsS3DataPusher.pushToS3(garage, date, dataType, callback);
    });
  };
  /** latest pushed data from a dms to s3 OR from Datafiles if the garage is set to manual */
  Garage.latestPushes = async function latestPushes(garageIds, numPerGarage) {
    // eslint-disable-line no-param-reassign
    const res = {};

    // Get all garages from the garages ids
    const garages = await app.models.Garage.getMongoConnector()
      .find(
        {
          _id: { $in: garageIds.map((id) => new ObjectID(id)) },
          status: { $in: [garageStatus.RUNNING_AUTO, garageStatus.RUNNING_MANUAL] },
        },
        {
          projection: { _id: true, publicDisplayName: true, status: true },
        }
      )
      .toArray();

    // Get the {{numPerGarage}} latest files from s3
    for (const { _id: garageId, publicDisplayName, status } of garages) {
      res[garageId] = {
        garageId: garageId,
        name: publicDisplayName,
        files: [],
      };

      if (status === garageStatus.RUNNING_AUTO) {
        res[garageId].s3files = await gsS3DataPusher.listLatestPushes(garageId.toString(), numPerGarage);
      }
    }

    // Get the {{numPerGarage}} + 30 latest dataFiles from our db
    for (const { _id: garageId } of garages) {
      res[garageId].dataFiles = await app.models.DataFile.getMongoConnector()
        .find(
          {
            garageId,
          },
          {
            projection: {
              filePath: true,
              status: true,
              importStatus: true,
              createdAt: true,
              noContactableData: true,
              hasAutomationData: true,
              nbDatasCreated: true,
              nbDatasAutomation: true,
              datasCreatedIds: true,
              datasAutomationIds: true,
            },
          }
        )
        .sort({ createdAt: -1 })
        .limit(numPerGarage + 30)
        .toArray();
    }

    // Fill up the files array
    for (const { _id: garageId, status } of garages) {
      if (res[garageId].s3files || res[garageId].dataFiles) {
        const manual = status === garageStatus.RUNNING_MANUAL;
        const files = manual ? res[garageId].dataFiles : res[garageId].s3files;

        for (let i = 0; i < files.length; i++) {
          let dataFile = files[i];
          const file = files[i];
          res[garageId].files[i] = {
            path: manual ? file.filePath : file.path,
            pushedAt: moment(file.pushedAt).format('YYYY-MM-DD HH:mm'),
            dataFile: {
              exist: false,
            },
          };
          if (!manual) {
            dataFile = res[garageId].dataFiles.find(({ filePath }) => filePath === file.path);
          }
          if (dataFile) {
            res[garageId].files[i].dataFile = {
              exist: true,
              id: dataFile._id,
              status: dataFile.status,
              importStatus: dataFile.importStatus,
              importedAt: moment(dataFile.createdAt).format('YYYY-MM-DD HH:mm'),
              noContactableData: dataFile.noContactableData,
              hasAutomationData: dataFile.hasAutomationData,
              nbDatasCreated: dataFile.nbDatasCreated,
              nbDatasAutomation: dataFile.nbDatasAutomation,
              datasCreatedIds: (dataFile.datasCreatedIds && dataFile.datasCreatedIds.map((e) => e.toString())) || [],
              datasAutomationIds:
                (dataFile.datasAutomationIds && dataFile.datasAutomationIds.map((e) => e.toString())) || [],
            };
          }
        }
      }
    }

    return res;
  };

  Garage.updateSubscriptionsHistory = async function (garageId, subscriptionName, subscription) {
    const garage = await Garage.app.models.Garage.getMongoConnector().findOne(
      { _id: ObjectID(garageId.toString()) },
      { projection: { subscriptionsHistory: true } }
    );
    const updateName = `subscriptionsHistory.${subscriptionName}`;

    if (!garage.subscriptionsHistory) {
      garage.subscriptionsHistory = {
        [subscriptionName]: [subscription],
      };
    } else if (garage.subscriptionsHistory && !garage.subscriptionsHistory[subscriptionName]) {
      garage.subscriptionsHistory[subscriptionName] = [subscription];
    } else {
      garage.subscriptionsHistory[subscriptionName].push(subscription);
    }

    return Garage.app.models.Garage.getMongoConnector().updateOne(
      { _id: ObjectID(garageId.toString()) },
      { $set: { [updateName]: garage.subscriptionsHistory[subscriptionName] } }
    );
  };

  /** Import a datafile from s3 for a garage/data/datatype*/
  Garage.importDMSDataFromS3 = async function importDMSDataFromS3(garageId, date, dataType) {
    return new Promise((resolve) => {
      Garage.findById(garageId, (getByIdErr, garage) => {
        if (getByIdErr) {
          console.error(
            `[requestDailyImportsForGarage] Error during import of ${garageId} : ${
              (getByIdErr && getByIdErr.message) || getByIdErr
            }`
          ); // eslint-disable-line
          resolve();
          return;
        }
        const filePath = pathFunction(garage, date, dataType);
        if (filePath === null) {
          console.error('[DataFileCreator] Cannot determine path on S3');
          resolve();
          return;
        }
        gsCampaignCreator.createCampaignsFromPath(garage, filePath, dataType, date, (err, campaignsSaved) => {
          if (err) {
            console.error(
              `[requestDailyImportsForGarage] Error during import of ${garageId} : ${(err && err.message) || err}`
            );
            resolve();
          } else resolve(campaignsSaved);
        });
      });
    });
  };
  /** Import a datafile from s3 for a garage for one date and every dataTypes */
  Garage.requestDailyImportsForGarage = async function requestDailyImportsForGarage(garageId, date) {
    // eslint-disable-line no-param-reassign, max-len
    const dataFileIds = [];
    const formatedDate = moment(date).format('YYYY-MM-DD');
    console.log(`[requestDailyImportsForGarage] Daily import of ${garageId} for ${formatedDate}`);

    for (const dataType of gsDataFileDataTypes.values()) {
      console.log(`[requestDailyImportsForGarage] Daily import of ${garageId} for ${formatedDate} ${dataType}`);
      const ids = await Garage.importDMSDataFromS3(garageId, date, dataType);
      if (ids) dataFileIds.push(ids);
    }
    return dataFileIds;
  };
  /** Import a datafile from s3 for a garage for today and one dataType */
  Garage.requestDailyImportsForGarageDataTypeAndDate = function requestDailyImportsForGarageDataTypeAndDate(
    garageId,
    dataType,
    date,
    callback
  ) {
    // eslint-disable-line no-param-reassign, max-len
    if (!gsDataFileDataTypes.hasValue(dataType)) {
      callback(new Error(`The dataType ${dataType} is not available`));
      return;
    }
    console.log(`[requestDailyImportsForGarage] Daily import of ${garageId} ${dataType} ${date}`);
    const formatedDate = moment(date).format('YYYY-MM-DD');
    Garage.importDMSDataFromS3(garageId, date, formatedDate, dataType)
      .then((data) => {
        callback(null, data);
      })
      .catch(callback);
  };

  /** create campaigns of all our customers garages */
  Garage.requestDailyImportsForDate = function requestDailyImportsForDate(date, callback, filters = {}) {
    // eslint-disable-line no-param-reassign
    console.log('[requestDailyImports] Starting the daily imports...');
    Garage.dailyUpdatedGarages(filters, (errGG, garages) => {
      if (errGG) {
        callback(errGG);
        return;
      }
      let dataFileIds = [];
      const done = function done(err) {
        console.log('[requestDailyImports] Daily imports done !');
        if (err) {
          callback(err);
          return;
        }
        console.log(`[requestDailyImports] Datafiles processed : ${dataFileIds}`);
        callback(null, dataFileIds);
      };
      const processGarage = function processGarage(garage, i, next) {
        Garage.requestDailyImportsForGarage(garage.id, date).then((ids) => {
          if (ids) {
            dataFileIds = dataFileIds.concat(ids);
          }
          next();
        });
      };
      async.forEachOfSeries(garages, processGarage, done);
    });
  };
  /** create today campaigns of all our customers garages */
  Garage.requestDailyImports = function requestDailyImports(callback) {
    // eslint-disable-line no-param-reassign
    Garage.requestDailyImportsForDate(new Date(), callback);
  };
  Garage.prototype.scenarioStartsDelays = function scenarioStartsDelays(callback) {
    // eslint-disable-line no-param-reassign
    this.getCampaignScenario((err, scenario) => {
      if (err) {
        callback(err);
        return;
      }
      const scenarioDelays = { Maintenance: 0, NewVehicleSale: 0, UsedVehicleSale: 0 };
      Object.keys(scenarioDelays).forEach((type) => {
        if (scenario && scenario.chains && scenario.chains[type] && scenario.chains[type].contacts) {
          scenarioDelays[type] = (scenario.chains[type].contacts[0] && scenario.chains[type].contacts[0].delay) || 0;
        }
      });
      callback(null, scenarioDelays);
    });
  };

  Garage.getFirstContactDelay = function getFirstContactDelay(garage, dataType) {
    return garage.firstContactDelay &&
      garage.firstContactDelay[dataType] &&
      (garage.firstContactDelay[dataType].value || garage.firstContactDelay[dataType].value === 0)
      ? garage.firstContactDelay[dataType].value
      : null;
  };
  Garage.prototype.getFirstContactDelay = function getFirstContactDelay(dataType) {
    return Garage.getFirstContactDelay(this, dataType);
  };

  /** Garages with an indexed directory page */
  Garage.garagesToIndex = async function garagesToIndex(locale) {
    const garages = await app.models.Garage.getMongoConnector()
      .find(
        {
          locale,
          hideDirectoryPage: { $ne: true },
        },
        {
          projection: {
            slug: true,
            publicDisplayName: true,
            type: true,
            locale: true,
          },
          sort: {
            updatedAt: -1,
          },
        }
      )
      .toArray();
    return garages;
  };
  /** Do we allow indexation of the garage's directory page */
  Garage.prototype.shouldIndex = function shouldIndex() {
    // eslint-disable-line no-param-reassign
    return typeof this.hideDirectoryPage === 'undefined' || this.hideDirectoryPage === false;
  };
  /** Return the list of 'branchés' garages, ie for which we have a daily campaign automatically created*/
  Garage.dailyUpdatedGarages = function dailyUpdatedGarages(filter, callback) {
    // eslint-disable-line no-param-reassign
    const where = { status: garageStatus.RUNNING_AUTO, ...filter };
    const fields = { id: 1, slug: 1, publicDisplayName: 1, dms: 1 };
    app.models.Garage.find({ where, fields }, callback);
  };

  /* Campaign scenarisation */
  const scenarioCache = lruCache({
    max: 100,
    length() {
      return 100;
    },
    maxAge: 1000 * 60 * 60, // last 1 hour
  });
  /* Clear the scenarios cache */
  Garage.emptyScenariosCache = function emptyScenariosCache() {
    // eslint-disable-line no-param-reassign
    scenarioCache.reset();
  };
  /* Return the campaign scenario for a garage or the default one if the garage has no scenario configured */
  Garage.getCampaignScenario = function getCampaignScenario(garageId, callback) {
    // eslint-disable-line no-param-reassign
    if (!garageId) {
      callback(new Error('garageId not provided in getCampaignScenario !'));
      return;
    }
    Garage.findById(garageId, (err, garage) => {
      if (err || !garage || !garage.campaignScenarioId) {
        callback(err || new Error(`${garageId} does'nt have any scenario...`));
        return;
      }
      const cacheKey = garage.campaignScenarioId.toString();
      const scenario = scenarioCache.get(cacheKey);
      if (scenario) {
        callback(null, scenario);
        return;
      }
      app.models.CampaignScenario.findById(garage.campaignScenarioId, (err2, cs) => {
        if (err2 || !cs) {
          callback(err2 || new Error(`campaignScenarioId ${garage.campaignScenarioId} not found (Garage.findById)`));
          return;
        }
        scenarioCache.set(cacheKey, cs);
        callback(null, cs);
      });
    });
  };

  Garage.addExogenousConfiguration = async (
    { _id, exogenousReviewsConfigurations: garageExogenousReviewsConfigurations },
    source,
    token,
    externalId,
    connectedBy,
    updateNow = false
  ) => {
    if (!garage) {
      throw new TypeError('No garage was supplied');
    }
    const exogenousReviewsConfigurations = {
      Google: {},
      Facebook: {},
      PagesJaunes: {},
      ...garageExogenousReviewsConfigurations,
    };

    exogenousReviewsConfigurations[source] = {
      token,
      error: '',
      lastRefresh: new Date(),
      externalId,
      lastError: null,
      lastFetch: null,
      connectedBy,
    };

    if (!updateNow) {
      return exogenousReviewsConfigurations;
    }
    await app.models.Garage.getMongoConnector().updateOne(
      { _id },
      { $set: { exogenousReviewsConfigurations: exogenousReviewsConfigurations } }
    );
  };

  Garage.softDisconnectFromSource = async (
    { _id, exogenousReviewsConfigurations: garageExogenousReviewsConfigurations },
    source
  ) => {
    const exogenousReviewsConfigurations = {
      Google: {},
      Facebook: {},
      PagesJaunes: {},
      ...garageExogenousReviewsConfigurations,
    };

    exogenousReviewsConfigurations[source] = {
      token: exogenousReviewsConfigurations[source].token || '',
      error: '',
      lastRefresh: null,
      externalId: '',
      lastError: null,
      lastFetch: null,
      connectedBy: '',
    };
    await app.models.Garage.getMongoConnector().updateOne(
      { _id },
      { $set: { exogenousReviewsConfigurations: exogenousReviewsConfigurations } }
    );
  };

  Garage.prototype.getCampaignScenario = function getCampaignScenario(callback) {
    // eslint-disable-line no-param-reassign
    Garage.getCampaignScenario(this.id, callback);
  };

  Garage.prototype.isThisEreputationServiceConnected = function isThisEreputationServiceConnected(serviceName) {
    return (
      this.exogenousReviewsConfigurations &&
      this.exogenousReviewsConfigurations[serviceName] &&
      this.exogenousReviewsConfigurations[serviceName].token &&
      !this.exogenousReviewsConfigurations[serviceName].error
    );
  };

  Garage.prototype.isRunning = function isRunning() {
    return [GarageStatus.RUNNING_AUTO, GarageStatus.RUNNING_MANUAL, GarageStatus.EREP_ONLY].includes(this.status);
  };

  Garage.prototype.updateFromObject = async function updateFromObject(updates) {
    // We add userContextCache as an ugly argument because of a cyclic require if we put it in garage-methods
    return garageMethods.updateFromObject(this.toObject(), updates, Garage.app, publicApi);
  };
};
