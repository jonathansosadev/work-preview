const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../../../../client');
const IApiRoutes = require('../../../interfaces/configuration/api.interface.routes');

class SubscriptionsRoutes extends IApiRoutes {
  constructor(app) {
    super(app, {}, ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')));
  }
}

module.exports = SubscriptionsRoutes;
