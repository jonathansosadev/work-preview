const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../../../../client');
const IApiRoutes = require('../../../interfaces/configuration/api.interface.routes');

class BillingAccountsRoutes extends IApiRoutes {
  constructor(app) {
    super(app, gsClient.url.getUrls().GREYBO.BILLING, ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')));
  }
}

module.exports = BillingAccountsRoutes;
