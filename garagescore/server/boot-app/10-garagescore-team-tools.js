/** Internal tools used by gscore teams */
var debugPerfs = require('debug')('perfs:server:boot:backoffice-routes');
var review = require('../routes/teamtools/review/review.controller');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var gsClient = require('../../common/lib/garagescore/client');
var loopback = require('loopback');
var path = require('path');

debugPerfs('Starting boot team tools');

module.exports = function mountTeamTools(app) {
  function ensureGarageScoreUser(req, res, next) {
    if (req.user.email.match(/@garagescore\.com|@custeed\.com/)) {
      next();
      return;
    }
    res.status(403).send('');
  }
  // REVIEW TOOL
  app.use(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.FRONT_END,
    loopback.static(path.resolve(__dirname, '../../common/templates/app/teamtools/review/'), {})
  );

  app.get(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.FRONT_END,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.index.bind(review)
  );

  app.get(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.GET_PROJECTS,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.getProjectsList.bind(review)
  );

  app.get(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.GET_COLUMNS,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.getProjectColumns.bind(review)
  );

  app.get(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.GET_CARDS,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.getColumnCards.bind(review)
  );

  app.post(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.ADD_CARD,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.addNote.bind(review)
  );

  app.delete(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.DELETE_CARD,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.deleteNote.bind(review)
  );

  app.put(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.UPDATE_CARD,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.updateNote.bind(review)
  );

  app.post(
    gsClient.url.getUrlNamespace('TEAM').REVIEW.MOVE_CARD,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGarageScoreUser,
    review.moveNote.bind(review)
  );
};
