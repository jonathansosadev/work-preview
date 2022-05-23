/* Update user, set that a elearning resources has been watched */
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { JS, log } = require('../../../../common/lib/util/log');
const UserAuthorization = require('../../../../common/models/user-autorization');
const access = require('../../../../common/lib/garagescore/users-access/access');

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.UserUpdateCockpitHistory.type}: UserUpdateCockpitHistoryResult
  }
  type UserUpdateCockpitHistoryResult {
    debugMessage: String
    error: String
    status: String
  }
`;

function ensureHasCockpitAuthorization(user) {
  return user && user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT);
}
function _updateUser(user, routeName, req, app, isBackdoor) {
  try {
    const UserModel = app.models.User;
    const User = UserModel.getMongoConnector();
    const userId = user.getId();
    const $set = {};
    const accessLog = access.createFromName(req, routeName);
    if (routeName.includes('cockpit')) {
      if (isBackdoor) {
        $set.lastCockpitOpenWithBackdoorAt = new Date();
      } else {
        $set.lastCockpitOpenAt = new Date();
        if (accessLog) {
          $set[`lastOpenAt.${accessLog.section}`] = new Date();
        }
      }
      User.updateOne({ _id: userId }, { $set }); // dont wait before responding
    }
    // not used, we disable it to do not waste resources UserModel.addAccess(accessLog);
    return 'OK';
  } catch (error) {
    log.error(JS, error);
    return error.message;
  }
}

module.exports.resolvers = {
  Mutation: {
    UserUpdateCockpitHistory: async (obj, args, context) => {
      const { app } = context;
      const { logged, authenticationError, user, req } = context.scope;
      const { routeName, isBackdoor } = args;
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      if (!ensureHasCockpitAuthorization(user)) {
        log.error(JS, 'UserUpdateCockpitHistory called by an user without cockpit authorization');
        return { status: 'KO' };
      }
      if (!routeName) {
        return { status: 'KO' };
      }
      const status = _updateUser(user, routeName, req, app, isBackdoor);
      return { status };
    },
  },
};
