const app = require('../../../../server/server');
const { checkPermissions } = require('./route-permissions');
const { UnauthorizedError } = require('./apiErrors');

/**
Public API methods
Authorized customers can request our api and get various informations about their garage
*/
const appInfos = require('./app-infos.js');

/** get api secret from appId */
const getAppSecret = (appId, callback) => {
  if (appInfos.getApp(appId)) {
    return callback(null, appInfos.getApp(appId).appSecret);
  }
  return callback(new Error(`Unknown appId [${appId}]`));
};

/**
  A list of access rights an appId has
*/
const getAppAuthorizations = (appId, callback) => {
  if (appId === null) {
    // internal use
    return {
      authorizedGarages: null,
      allGaragesAuthorized: true,
      fullData: true,
      allReviews: true,
      withheldGarageData: true,
      nonIndexedGarages: true
    }
  }
  const appAuthorizations = appInfos.getApp(appId);
  const authorizedGarages = appAuthorizations.authorizedGarages || [];
  const allGaragesAuthorized = appAuthorizations.allGaragesAuthorized || false;
  const fullData = appAuthorizations.fullData || false;
  const allReviews = appAuthorizations.allReviews || false;
  const withheldGarageData = appAuthorizations.withheldGarageData || false;
  const nonIndexedGarages = appAuthorizations.nonIndexedGarages || false;
  const garageTypesAuthorized = appAuthorizations.garageTypesAuthorized || null;
  const userPermissions = appAuthorizations.permissions || [];

  return {
    authorizedGarages,
    allGaragesAuthorized,
    fullData,
    allReviews,
    withheldGarageData,
    nonIndexedGarages,
    garageTypesAuthorized,
    userPermissions
  };
};
// check permissions for a garage
const _hasAccess = async (appId, requiredPermissions, garageId) => {
  const {
    authorizedGarages,
    allGaragesAuthorized,
    fullData,
    allReviews,
    withheldGarageData,
    nonIndexedGarages,
    garageTypesAuthorized,
    userPermissions,
  } = getAppAuthorizations(appId);

  let authErr = null

  if (!checkPermissions(userPermissions, requiredPermissions)) {
    authErr = new UnauthorizedError(`Not authorized`);
  }
  if (appId && !allGaragesAuthorized && authorizedGarages.length === 0) {
    authErr = new Error('No garage authorized');
  }
  if (appId && garageId && !allGaragesAuthorized) {
    let found = false;
    authorizedGarages.forEach((a) => {
      found = found || a === garageId;
    });
    if (appId && !found) {
      authErr = new Error(`No authorization for ${garageId}`);
    }
  }
  return {
    authErr,
    auths: authorizedGarages,
    allGaragesAuthorized,
    fullData,
    allReviews,
    withheldGarageData,
    nonIndexedGarages,
    garageTypesAuthorized,
    userPermissions,

  };

};

const api = {
  getAppSecret,
  getAppAuthorizations,
};
api.addModule = (module) => {
  module(api, app, _hasAccess);
};

api.addModule(require('./modules/garageData'));
api.addModule(require('./modules/aws'));
api.addModule(require('./modules/leads'));
api.addModule(require('./modules/reviews'));
api.addModule(require('./modules/partners'));
api.addModule(require('./modules/misc'));
api.addModule(require('./modules/internal-events'));

module.exports = api;
