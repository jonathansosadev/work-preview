const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../common/lib/garagescore/client');
const ensureGarageScoreUser = require('../../common/lib/garagescore/middleware/garagescore-user');
const UserAuthorization = require('../../common/models/user-autorization');
const path = require('path');
const nunjucks = require('nunjucks');

/**
 * Ensure the user has GreyBo Authorizations (ACCESS_TO_GREYBO)
 * @returns {Function}
 * @private
 */
function _ensureHasGreyBoAuthorization() {
  return function (req, res, next) {
    if (!req.user || !req.user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
      const templates = path.normalize(path.join(__dirname, '../..'));
      const nunjucksEnv = nunjucks.configure(templates, { autoescape: true, watch: false });
      nunjucksEnv.addGlobal('lib', { client: gsClient });
      const content = nunjucksEnv.render('common/templates/errors/error.nunjucks', {
        message: 'Non autorisé',
        description:
          "Vous n'avez pas accès à la page que vous avez demandée. <br/>" +
          "Merci de vous rapprocher auprès de notre équipe technique si vous pensez que c'est une erreur.",
      });
      res.status(403).send(content);
      return;
    }
    next();
  };
}

module.exports = function mountGreyBackofficeRoutes(app) {
  app.get(
    gsClient.url.getUrlNamespace('GREYBO').SUBSCRIPTIONS.GET_ALL,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    _ensureHasGreyBoAuthorization(),
    (req, res) => {
      app.models.SubscriptionsQueue.find({ order: 'createdAt DESC' }, (e, data) => {
        res.send(JSON.stringify(data));
        return true;
      });
    }
  );
};
