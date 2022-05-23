const debugPerfs = require('debug')('perfs:server:boot:www-auth-blocker');
const gsClient = require('../../common/lib/garagescore/client');
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;

debugPerfs('Starting boot www-auth-blocker');

// Dev for the #1876 ticket where we noticed that auth pages were available.
// We were never able to block them in prod :/
module.exports = function blockAuthRoutes(app) {
  if (process.env.NODE_APP_INSTANCE !== 'review') {
    app.get(gsClient.url.getUrl('AUTH_SIGNIN'), ensureLoggedOut('/'), (req, res) => {
      res.send(404);
    });
    app.get(gsClient.url.getUrl('AUTH_BACKDOOR'), ensureLoggedOut('/'), (req, res) => {
      res.send(404);
    });
    app.get('/auth/msg', ensureLoggedOut('/'), (req, res) => {
      res.send(404);
    });
    app.get('/auth/reset_password/:token?', ensureLoggedOut('/'), (req, res) => {
      res.send(404);
    });
  }
};
