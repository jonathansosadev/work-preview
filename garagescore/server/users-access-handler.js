/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["req", "user"] }] */
/** userAccessHandler is used to save the user connexions and access
 * Since user-agent sent by the browsers are not clean anymore, here is associative array to understand who is who.
 * https://techblog.willshouse.com/2012/01/03/most-common-user-agents/
 * Here is a example of my user-agent (I'm on windows, using chrome) :
 * "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
 * */

const userAccess = require('../common/lib/garagescore/users-access/access');

module.exports = function handler() {
  return function userAccessHandler(req, res, next) {
    const access = userAccess.create(req);
    if (req.session && access && req.url && req.url.indexOf('/auth') < 0) {
      if (!req.session.lastReturns) {
        req.session.lastReturns = [];
      }
      req.session.returnTo = req.url;
      req.session.lastReturns.push(req.url);
    }
    next(); // We don't let the user wait. We don't need him to save access
    if (req.session && req.cookies && req.cookies.fingerprint) {
      req.session.fingerPrint = req.cookies.fingerprint; // Save the fingerPrint into the session
    }
    if (req.method !== 'GET' || !req.user || !req.session) return; // !req.user mean we are not connected
    req.user.addAccess(access);
  };
};
