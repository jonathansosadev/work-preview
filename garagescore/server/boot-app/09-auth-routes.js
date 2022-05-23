const config = require('config');
const debugPerfs = require('debug')('perfs:server:boot:auth-routes');
const gsClient = require('../../common/lib/garagescore/client');
const ensureLoggedOut = require('connect-ensure-login').ensureLoggedOut;

debugPerfs('Starting boot auth-routes');

module.exports = function mountAuthRoutes(app) {
  app.post(gsClient.url.getUrl('AUTH_REQUEST_NEW_PASSWORD'), ensureLoggedOut('/'), (req, res) => {
    function returnResponse(err) {
      res.json({
        status: err ? 'ko' : 'ok',
        message: err || null,
      });
    }
    const email = req.query.email || req.params.email || req.body.email;
    if (!email) {
      returnResponse('noEmail');
      return;
    }
    try {
      // It's like a findOne, won't bother to specify fields
      req.app.models.User.find({ where: { email: email.toLowerCase() } }, (err, users) => {
        if (err) {
          returnResponse(err);
          return;
        }
        if (users.length !== 1) {
          returnResponse('notFoundInDb');
          return;
        }
        users[0].resetPasswordAndSendEmail(returnResponse);
      });
    } catch (e) {
      returnResponse(e.toString());
    }
  });

  app.post(gsClient.url.getUrl('AUTH_RESET_PASSWORD_BACK'), ensureLoggedOut('/'), (req, res) => {
    function returnResponse(err) {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(
        JSON.stringify({
          status: err ? 'ko' : 'ok',
          message: err || 'success',
        })
      );
    }
    if (!req.body.token) {
      returnResponse('Demande de réinitialisation invalide : code 583');
      return;
    }
    if (!req.body.password) {
      returnResponse('noPassword');
      return;
    }
    if (!req.body.password.match(/^\S{8,}$/)) {
      returnResponse('invalidPassword');
      return;
    }
    // It's like a findOne, won't bother to specify fields
    req.app.models.User.find(
      { where: { 'resetPassword.token': req.body.token.replace(/==.+$/, '==') } },
      (err, users) => {
        if (err) {
          returnResponse(err);
          return;
        }
        if (users.length !== 1) {
          returnResponse('Demande de réinitialisation invalide : code 582');
          return;
        }
        const user = users[0];
        user.resetPassword.oldToken = user.resetPassword.token;
        user.resetPassword.token = null;
        user.updateAttributes({ password: req.body.password, resetPassword: user.resetPassword }, returnResponse);
      }
    );
  });

  app.post(gsClient.url.getUrl('AUTH_CHECK_RESET_TOKEN'), ensureLoggedOut('/'), async (req, res) => {
    function returnResponse(err, type, email) {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(
        JSON.stringify({
          status: err ? 'ko' : 'ok',
          message: err || '',
          type,
          email,
        })
      );
    }
    if (!req.body.token) {
      returnResponse('noToken');
      return;
    }
    // It's like a findOne, won't bother to specify fields
    const users = await req.app.models.User.find({
      where: { 'resetPassword.token': req.body.token.replace(/==.+$/, '==') },
    });
    if (users.length !== 1) {
      // Token invalid, check for the oldToken entry
      const oldTokenUsers = await req.app.models.User.find({
        where: { 'resetPassword.oldToken': req.body.token.replace(/==.+$/, '==') },
      });
      if (oldTokenUsers.length !== 1) {
        returnResponse('invalidToken');
      } else {
        returnResponse(null, 'invalidToken', oldTokenUsers[0].email);
      }
    } else {
      const user = users[0];
      if (user.lastCockpitOpenAt) {
        returnResponse(null, 'reset', user.email);
      } else {
        returnResponse(null, 'new', user.email);
      }
    }
  });

  app.get('/auth/signout', (req, res) => {
    req.session.destroy(() => {
      res.clearCookie(config.get('session.cookieName'));
      res.clearCookie('access_token'); // TODO: Should also be invalidated in Mongo
      if(req.query.token) {
        res.redirect(`/auth/signin?token=${req.query.token}&finishSession=true`);
      } else {
        res.redirect('/auth/signin'); // Modification en accord avec le ticket.
      }
    });
  });
};
