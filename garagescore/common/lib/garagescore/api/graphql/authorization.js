/**
 * authorization check tool
 */

const UserAuthorization = require('../../../../models/user-autorization');

module.exports = {
  ensureHasCockpitAuthorization(req) {
    return req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT);
  },
  hasAccessToGreyBO(req) {
    return req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO);
  },
};
