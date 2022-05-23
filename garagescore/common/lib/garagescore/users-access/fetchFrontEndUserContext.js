const GarageTypes = require('../../../models/garage.type');
const GarageSubscriptionTypes = require('../../../models/garage.subscription.type.js');
const { getUserGarages } = require('../../../models/user/user-mongo');
const { isPriorityProfile } = require('../../../models/user/user-methods');
const {
  isSubscribed,
  hasMakeSurveys,
  isSharingTickets,
  isSharingAllTickets,
} = require('../../../models/garage/garage-methods');
const generalStatsCommon = require('../generalStats/_common.js');
const { backOfficeTabs } = require('../analytics/tabs');
const UserContextUtils = require('./user-context-utils');

const { JS, FED, SIMON, time, timeEnd, log } = require('../../util/log');

const userJobsCache = {
  _data: [],
  _TTL: 1000 * 60 * 10, // Lasts 10 minutes
  _lastRefresh: 0, // Last time it was refreshed
  _mustRefresh() {
    return Date.now() - this._lastRefresh > this._TTL;
  },
  async _refresh(app) {
    this._data = await app.models.UserJob.find();
    this._lastRefresh = Date.now();
  },
  async values(app) {
    if (this._data.length && !this._mustRefresh()) {
      return this._data;
    }
    await this._refresh(app);
    return this._data;
  },
};
// get all userJobs
const getUserJobs = async (app) => userJobsCache.values(app);

const getAnalyticsConfig = () => {
  // BIME AccessToken and UserGroupId are now coming from .env as we noticed that only 1 user have them in our whole DB
  // BIME DashboardIds are now hardcoded because we noticed that no matter what we were always returning the ones for god@custeed.com
  const bimeDashboardIds = ['dataRecord', 'team', 'catchment-area'];
  const analyticsTabsConfig = Object.fromEntries(
    backOfficeTabs.filter((tab) => bimeDashboardIds.includes(tab.id)).map((tab) => [tab.id, tab])
  );
  return {
    analyticsAccessToken: process.env.BIME_USER_ACCESS_TOKEN,
    analyticsTabsConfig,
  };
};

module.exports = async (app, user, refresh = false, timeLog = false) => {
  /* First fetching maintenance mode */
  if (timeLog) time(FED, '#2272 fetchFrontEndUserContext maintenanceMode');
  const maintenance =
    (await new Promise((res, rej) => {
      app.models.Configuration.getMaintenanceMode((err, maintenanceMode) => {
        if (err) {
          rej(err);
          return;
        }
        res(maintenanceMode);
      });
    })) || false;
  if (timeLog) timeEnd(FED, '#2272 fetchFrontEndUserContext maintenanceMode');
  /* Preparing for operations, getting all garages and all users that we'll either return or use in here */
  if (timeLog) time(JS, '#1335 fetchFrontEndUserContext getUserGarages');
  if (refresh) log.info(SIMON, `GARAGE REFRESH asked by ${user.id.toString()}...`);
  const garageFields = {
    id: '$_id',
    externalId: true,
    type: true,
    locale: true,
    publicDisplayName: true,
    slug: true,
    status: true,
    exogenousReviewsConfigurations: true,
    subscriptions: true,
    brandNames: true,
    tags: true,
    dataImportStartedAt: true,
    createdAt: true,
    parent: true,
  };
  const garages = await getUserGarages(app, user.getId(), garageFields);
  if (timeLog) timeEnd(JS, '#1335 fetchFrontEndUserContext getUserGarages');

  if (timeLog) time(JS, '#1335 fetchFrontEndUserContext getUserJobs');
  const userJobs = await getUserJobs(app);
  if (timeLog) timeEnd(JS, '#1335 fetchFrontEndUserContext getUserJobs');

  // Am I a manager and is my profile prioritary ?
  const myJob = userJobs.find((job) => job.name === user.job);
  const isManagerJob = myJob ? !!myJob.isManager : true;

  // Am I concerned by make surveys ?
  if (timeLog) time(JS, '#1335 fetchFrontEndUserContext isConcernedMakeSurveys');
  const makeSurveysJobs = [
    'Actionnaire / Président',
    'Directeur général',
    'Direction marketing groupe',
    'Direction qualité & méthodes groupe',
    'Directeur de marque',
    'Directeur de concession',
    'Responsable qualité concession',
    'Responsable marketing concession',
    'Custeed',
  ];
  const isConcernedByMakeSurveys = makeSurveysJobs.includes(user.job) && garages.some((g) => hasMakeSurveys(g));
  if (timeLog) timeEnd(JS, '#1335 fetchFrontEndUserContext isConcernedMakeSurveys');

  // Get my config for analytics
  const accessToTeam = user.authorization && user.authorization.ACCESS_TO_TEAM;

  if (timeLog) time(JS, '#1335 fetchFrontEndUserContext getGarages subscriptions');
  const subscriptionsMap = new Map();
  for (const garage of garages) {
    const sub = {};
    for (const subName of GarageSubscriptionTypes.values()) {
      sub[subName] = isSubscribed(garage.subscriptions, subName);
    }
    sub.active = !!(garage.subscriptions && garage.subscriptions.active); // To know if the garage is still running
    sub.restrictMobile =
      garage.subscriptions[GarageSubscriptionTypes.CROSS_LEADS] &&
      garage.subscriptions[GarageSubscriptionTypes.CROSS_LEADS].restrictMobile;
    subscriptionsMap.set(garage.id, sub);
  }
  if (timeLog) timeEnd(JS, '#1335 fetchFrontEndUserContext getGarages subscriptions');

  const isAAgentSharingHisLeads = ({ type, parent }) => type === GarageTypes.AGENT && isSharingTickets(parent);
  const isAgentSharingAllTickets = ({ type, parent }) =>
    isAAgentSharingHisLeads({ type, parent }) && isSharingAllTickets(parent, true);
  const garageFormatter = (g) => ({
    id: g.id,
    externalId: g.externalId,
    type: g.type,
    status: g.status,
    publicDisplayName: g.publicDisplayName,
    locale: g.locale,
    exogenousReviewsConfigurations: g.exogenousReviewsConfigurations,
    slug: g.slug,
    allTypes: g.allTypes,
    subscriptions: subscriptionsMap.get(g.id),
    isAAgentSharingHisLeads: isAAgentSharingHisLeads(g),
    isAgentSharingAllTickets: isAgentSharingAllTickets(g),
    brandNames: g.brandNames,
    tags: g.tags,
  });

  const generalStats = await generalStatsCommon.getGeneralStats(app);

  if (timeLog) time(JS, '#1335 fetchFrontEndUserContext getCockpitAvailablePeriodsForUser');
  const periods = UserContextUtils.getCockpitAvailablePeriodsForUser(user, garages);
  if (timeLog) timeEnd(JS, '#1335 fetchFrontEndUserContext getCockpitAvailablePeriodsForUser');

  return {
    maintenance,
    isManagerJob,
    isPriorityProfile: isPriorityProfile(user),
    isConcernedByMakeSurveys,
    userJobs,
    analyticsConfig: accessToTeam && getAnalyticsConfig(),
    allGarages: garages.map(garageFormatter),
    periods,
    generalStats,
  };
};
