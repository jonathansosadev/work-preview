const chalk = require('chalk');
const config = require('config');
const debug = require('debug')('garagescore:common:lib:bime:api'); // eslint-disable-line max-len,no-unused-vars
//const request = require('superagent');
const axios = require('axios');

/*
 * Config
 */
const apiBearerToken = config.get('bime.api.accessToken');
const apiBaseUrl = config.get('bime.api.baseUrl');

function _wrapBimeRequest(method, url, data, callback) {
  axios({
    method,
    baseURL: apiBaseUrl,
    url,
    ...(data ? { data: { ...data } } : {}),
    headers: {
      Authorization: `Bearer ${apiBearerToken}`,
      Accept: 'application/json',
      ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}),
    },
  })
    .then((response) => {
      debug('[BIME] Request Success:', method, url, chalk.green(response.status));
      callback(null, response.data.result);
    })
    .catch((err) => {
      debug('[BIME] Request Error:', method, url, chalk.red(err.message));
      debug(data);
      callback(err);
    });
  /*  const bimeRequest = request(method, apiBaseUrl + resource);

  bimeRequest.set('Authorization', 'Bearer ' + apiBearerToken);
  bimeRequest.set('Accept', 'application/json');

  if (method === 'POST') {
    bimeRequest.set('Content-Type', 'application/json');
  }
  if (body) {
    bimeRequest.send(body);
  }

  bimeRequest.end(function (err, response) {
    if (err) {
      debug('[BIME] Request Error:', method, resource, chalk.red(err.message));
      debug(body);
      callback(err);
      return;
    }
    /!*
     * We have a body! With status, error and result properties.
     *!/
    debug('[BIME] Request Success:', method, resource, chalk.green(response.body.status));
    callback(null, response.body.result);
  });*/
}

/*
 * Public API
 * Expose all available methods for resources described in BIME API documentation:
 * http://www.bimeanalytics.com/documentation/api/
 */

/*
 * Connections
 * http://www.bimeanalytics.com/documentation/api/ressource-connections/
 */
function getConnections(callback) {
  _wrapBimeRequest('GET', '/connections', {}, callback);
  return;
}

function getConnection(connectionId, callback) {
  _wrapBimeRequest('GET', '/connections/' + connectionId, {}, callback);
  return;
}

/*
 * Dashboard Subscriptions
 * http://www.bimeanalytics.com/documentation/api/ressource-dashboard-subscriptions/
 */
function getDashboardSubscriptions(callback) {
  _wrapBimeRequest('GET', '/dashboard_subscriptions', {}, callback);
  return;
}

function getDashboardSubscription(dashboardSubscriptionId, callback) {
  _wrapBimeRequest('GET', '/dashboard_subscriptions/' + dashboardSubscriptionId, {}, callback);
  return;
}

function createDashboardSubscription(dashboardSubscription, callback) {
  _wrapBimeRequest('POST', '/dashboard_subscriptions', dashboardSubscription, callback);
  return;
}

function updateDashboardSubscription(dashboardSubscriptionId, dashboardSubscriptionPatch, callback) {
  _wrapBimeRequest('PUT', '/dashboard_subscriptions/' + dashboardSubscriptionId, dashboardSubscriptionPatch, callback);
  return;
}

function deleteDashboardSubscription(dashboardSubscriptionId, callback) {
  // Resource id should be in the URL, right ? Appearent error in the doc http://www.bimeanalytics.com/documentation/api/ressource-dashboard-subscriptions/
  _wrapBimeRequest('DELETE', '/dashboard_subscriptions/' + dashboardSubscriptionId, {}, callback);
  return;
}

/*
 * Dashboards
 * http://www.bimeanalytics.com/documentation/api/ressource-dashboards/
 */
function getDashboards(callback) {
  _wrapBimeRequest('GET', '/dashboards', {}, callback);
  return;
}

function getDashboard(dashboardId, callback) {
  _wrapBimeRequest('GET', '/dashboards/' + dashboardId, {}, callback);
  return;
}

/*
 * Data Security Rules
 * http://www.bimeanalytics.com/documentation/api/ressource-data-security-rules/
 */
function getDataSecurityRules(callback) {
  _wrapBimeRequest('GET', '/data_security_rules', {}, callback);
  return;
}

function getDataSecurityRule(dataSecurityRuleId, callback) {
  _wrapBimeRequest('GET', '/data_security_rules/' + dataSecurityRuleId, {}, callback);
  return;
}
function createDataSecurityRule(dataSecurityRule, callback) {
  _wrapBimeRequest('POST', '/data_security_rules', dataSecurityRule, callback);
  return;
}

function updateDataSecurityRule(dataSecurityRuleId, dataSecurityRulePatch, callback) {
  _wrapBimeRequest('PUT', '/data_security_rules/' + dataSecurityRuleId, dataSecurityRulePatch, callback);
  return;
}

function deleteDataSecurityRule(dataSecurityRuleId, callback) {
  _wrapBimeRequest('DELETE', '/data_security_rules/' + dataSecurityRuleId, {}, callback);
  return;
}

/*
 * Named User Group Securities
 * http://www.bimeanalytics.com/documentation/api/ressource-named-user-group-securities/
 */
function getNamedUserGroupSecurities(callback) {
  _wrapBimeRequest('GET', '/data_security_subscriptions', {}, callback);
  return;
}

function getNamedUserGroupSecurity(namedUserGroupSecurityId, callback) {
  _wrapBimeRequest('GET', '/data_security_subscriptions/' + namedUserGroupSecurityId, {}, callback);
  return;
}
function createNamedUserGroupSecurity(namedUserGroupSecurity, callback) {
  _wrapBimeRequest('POST', '/data_security_subscriptions', namedUserGroupSecurity, callback);
  return;
}

function updateNamedUserGroupSecurity(namedUserGroupSecurityId, namedUserGroupSecurityPatch, callback) {
  _wrapBimeRequest(
    'PUT',
    '/data_security_subscriptions/' + namedUserGroupSecurityId,
    namedUserGroupSecurityPatch,
    callback
  );
  return;
}

function deleteNamedUserGroupSecurity(namedUserGroupSecurityId, callback) {
  _wrapBimeRequest('DELETE', '/data_security_subscriptions/' + namedUserGroupSecurityId, {}, callback);
  return;
}

/*
 * Named User Groups
 * http://www.bimeanalytics.com/documentation/api/ressource-named-user-groups/
 */
function getNamedUserGroups(callback) {
  _wrapBimeRequest('GET', '/named_user_groups', {}, callback);
  return;
}

function getNamedUserGroup(namedUserGroupId, callback) {
  _wrapBimeRequest('GET', '/named_user_groups/' + namedUserGroupId, {}, callback);
  return;
}
function createNamedUserGroup(namedUserGroup, callback) {
  _wrapBimeRequest('POST', '/named_user_groups', namedUserGroup, callback);
  return;
}

function updateNamedUserGroup(namedUserGroupId, namedUserGroupPatch, callback) {
  _wrapBimeRequest('PUT', '/named_user_groups/' + namedUserGroupId, namedUserGroupPatch, callback);
  return;
}

function deleteNamedUserGroup(namedUserGroupId, callback) {
  _wrapBimeRequest('DELETE', '/named_user_groups/' + namedUserGroupId, {}, callback);
  return;
}

/*
 * Named Users
 * http://www.bimeanalytics.com/documentation/api/ressource-named-users/
 */
function getNamedUsers(callback) {
  _wrapBimeRequest('GET', '/named_users', {}, callback);
  return;
}

function getNamedUser(namedUserId, callback) {
  _wrapBimeRequest('GET', '/named_users/' + namedUserId, {}, callback);
  return;
}
function createNamedUser(namedUser, callback) {
  _wrapBimeRequest('POST', '/named_users', namedUser, callback);
  return;
}

function updateNamedUser(namedUserId, namedUserPatch, callback) {
  _wrapBimeRequest('PUT', '/named_users/' + namedUserId, namedUserPatch, callback);
  return;
}

function deleteNamedUser(namedUserId, callback) {
  _wrapBimeRequest('DELETE', '/named_users/' + namedUserId, {}, callback);
  return;
}

module.exports = {
  getConnection: getConnection,
  getConnections: getConnections,
  getDashboardSubscriptions: getDashboardSubscriptions,
  getDashboardSubscription: getDashboardSubscription,
  createDashboardSubscription: createDashboardSubscription,
  updateDashboardSubscription: updateDashboardSubscription,
  deleteDashboardSubscription: deleteDashboardSubscription,
  getDashboards: getDashboards,
  getDashboard: getDashboard,
  getDataSecurityRules: getDataSecurityRules,
  getDataSecurityRule: getDataSecurityRule,
  createDataSecurityRule: createDataSecurityRule,
  updateDataSecurityRule: updateDataSecurityRule,
  deleteDataSecurityRule: deleteDataSecurityRule,
  getNamedUserGroupSecurities: getNamedUserGroupSecurities,
  getNamedUserGroupSecurity: getNamedUserGroupSecurity,
  createNamedUserGroupSecurity: createNamedUserGroupSecurity,
  updateNamedUserGroupSecurity: updateNamedUserGroupSecurity,
  deleteNamedUserGroupSecurity: deleteNamedUserGroupSecurity,
  getNamedUserGroups: getNamedUserGroups,
  getNamedUserGroup: getNamedUserGroup,
  createNamedUserGroup: createNamedUserGroup,
  updateNamedUserGroup: updateNamedUserGroup,
  deleteNamedUserGroup: deleteNamedUserGroup,
  getNamedUsers: getNamedUsers,
  getNamedUser: getNamedUser,
  createNamedUser: createNamedUser,
  updateNamedUser: updateNamedUser,
  deleteNamedUser: deleteNamedUser,
};
