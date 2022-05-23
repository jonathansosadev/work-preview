const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../common/lib/garagescore/client');
const cockpitRoutes = require('../routes/cockpit.js');
const UserAuthorization = require('../../common/models/user-autorization');
const usersRoutes = require('../routes/backoffice/users');
const contactRoutes = require('../routes/backoffice/contact.js');

function ensureHasAdminAuthorization() {
  return function (req, res, next) {
    if (!req.user || !req.user.hasAuthorization(UserAuthorization.ACCESS_TO_ADMIN)) {
      res.status(403).send('Not authorized (global)');
      return;
    }
    next();
  };
}

module.exports = function mountCockpitRoutes(app) {
  function ensureHasCockpitAuthorization() {
    return function (req, res, next) {
      if (!req.user || !req.user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
        res.status(403).send('Not authorized (global)');
        return;
      }
      next();
    };
  }
  app.get(
    gsClient.url.getUrl('USER_GARAGES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureHasAdminAuthorization(),
    usersRoutes.getGarages.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('COCKPIT_DATA_RECORD_STATISTICS_DOWNLOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureHasCockpitAuthorization(),
    cockpitRoutes.downloadXLS.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('COCKPIT_PREVIEW_EMAIL'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.contactPreviewContent.bind(null, app)
  );
};
