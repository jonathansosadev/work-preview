const debug = require('debug')('garagescore:server:boot:redirect-root-route'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:redirect-root-route');
const gsClient = require('../../common/lib/garagescore/client');
const UserAuthorization = require('../../common/models/user-autorization');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const GarageTypes = require('../../common/models/garage.type');
const config = require('config');


debugPerfs('Starting boot redirect-root-route');
/* Redirect connected user coming to / to its default page */
module.exports = function redirectRootRoute(app) {

  const _isVehicleInspectionUser = async (user) => {
    const mongo = await app.models.Garage.getMongoConnector();
    const userGarages = await mongo.find({ _id: { $in: user.garageIds } }, { projection: { type: 1 } }).toArray();
    return !userGarages.some(garage => garage.type !== GarageTypes.VEHICLE_INSPECTION)
  }
  const root =
    config.util.getEnv('NODE_APP_INSTANCE') === 'review' || config.util.getEnv('NODE_APP_INSTANCE') === 'staging'
      ? '/index'
      : '/';
  app.get(root, ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')), async (req, res) => {
    if (req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_DARKBO)) {
      res.redirect(302, gsClient.url.getShortUrl('ADMIN_HOME'));
    } else if (req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_WELCOME)) {
      res.redirect(302, gsClient.url.getShortUrl('COCKPIT_WELCOME'));
    } else if (req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
      res.redirect(302, gsClient.url.getShortUrl('COCKPIT_HOME'));
      /* }  else if (req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_ANALYTICS)) {
        res.redirect(302, gsClient.url.getUrl('ANALYTICS_HOME'));*/
    } else if (req.user && req.user.hasAuthorization(UserAuthorization.ACCESS_TO_ADMIN)) {
      res.redirect(302, `${gsClient.url.getUrl('CLIENT_BACKOFFICE')}/profile`);
    } else if (req.user && await _isVehicleInspectionUser(req.user)) {
      res.redirect(302, '/no-access');
    } else res.redirect(302, gsClient.url.getUrl('AUTH_SIGNIN'));
  });
};
