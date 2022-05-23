const debugPerfs = require('debug')('perfs:server:boot:auth-catcher');
const config = require('config');
const lruCache = require('lru-cache');
const { JS, log } = require('../../common/lib/util/log');
const subscriptionStatus = require('../../common/models/user-subscription-status.js');
const fetchFrontEndUserContext = require('../../common/lib/garagescore/users-access/fetchFrontEndUserContext');

debugPerfs('Starting boot auth-catcher');

module.exports = function mountAuthCatcher(app) {
  // passport redirect to  this url in case of success
  app.get('/auth/signin/success', (req, res) => {
    if (!req.user) {
      log.error(JS, 'AuthCatcher - No user');
      res.status(400).send('An error occured');
      return;
    }
    app.models.User.findById(req.user.id, (err, user) => {
      if (err || !user) {
        res.status(400).send('An error occured');
        log.error(JS, err ? `AuthCatcher - ${err.message}` : ' AuthCatcher - User not found');
        return;
      }
      // db.getCollection('AccessToken').createIndex({userId: 1, created: -1}, {name: 'authCatcher', background: true})
      app.models.AccessToken.findOne({ where: { userId: user.id }, order: 'created DESC' }, (err2, token) => {
        if (err2 || !token) {
          res.status(400).send('An error occured');
          log.error(JS, err ? `AuthCatcher - ${err.message}` : ' AuthCatcher - Token not found');
          return;
        }
        // do not work if if "successRedirect" option is  set in passport-providers.json, we need to take it from the db
        // if (req.authInfo && req.authInfo.accessToken && req.authInfo.accessToken.id) {
        res.cookie('access_token', token.id, {
          httpOnly: true,
          signed: true,
          maxAge: 24 * 60 * 60 * 1000, // To get the same age as connect.sid
        });
        log.debug(JS, `AuthCatcher - access_token cookie : ${token.id}`);
        const root =
          config.util.getEnv('NODE_APP_INSTANCE') === 'review' || config.util.getEnv('NODE_APP_INSTANCE') === 'staging'
            ? '/index'
            : '/';
        let url = req.session && req.session.returnTo;
        if (url && url.indexOf('/auth') >= 0) {
          url = '';
        } // don't loop on auth
        url = url || root;
        // new user, redirect to profil page
        res.send({
          email: req.user && req.user.email,
          url,
          authToken: token.getId().toString(),
          authTokenExpireTime: 1,
        });
      });
    });
  });

  // passport redirect to  this url in case of failure
  app.get('/auth/signin/failure', (req, res) => {
    res.status(401).send('Not authorized');
  });
  /**
   * Loopback doesn't invalidate the tokens after a signout,
   * ie the AccessToken stay in db afeter a signout
   * We can use a cache, in the future if the AccessToken is deleted in db, the cache would have to sync
   */
  const tokensCache = lruCache({
    max: 50,
    length() {
      return 1;
    },
    maxAge: 1000 * 60 * 10, // 10 minutes
  });
  app.use('/auth/fetchContext', async (req, res) => {
    const authorizationHeader =
      req.headers && req.headers.authorization && req.headers.authorization.replace('Bearer ', '').trim();
    if (!authorizationHeader) {
      log.error(JS, 'Auth Token missing');
      res.status(404).send('Auth Token missing');
      return;
    }
    let token = tokensCache.get(authorizationHeader);
    if (!token) {
      token = await app.models.AccessToken.findById(authorizationHeader);
      tokensCache.set(authorizationHeader, token);
    }
    if (!token) {
      log.error(JS, 'Unknow Auth Token');
      res.status(404).send('Unknow Auth Token');
      return;
    }
    const endAt = new Date(new Date(token.created).getTime() + token.ttl * 1000);
    if (Date.now() > endAt) {
      log.error(JS, 'Auth Token expired');
      res.status(404).send('Auth Token expired');
      return;
    }
    if (!req.body.userId || req.body.userId.toString() !== token.userId.toString()) {
      log.error(JS, 'Wrong user Id');
      res.status(404).send('Wrong user Id');
      return;
    }
    const user = await app.models.User.findOne({ where: { _id: token.userId } });
    if (!user) {
      log.error(JS, 'Auth Token refers to an unknown User');
      res.status(404).send('Auth Token refers to an unknown User');
      return;
    }
    const content = await fetchFrontEndUserContext(app, user, req.body.refresh, req.body.timeLog);
    res.send(JSON.stringify(content, null, 2));
  });
  /*
  app.get('/redirect-for-ie', (req, res) => {
    let url = '/';
    if (req.session && req.session.lastReturns) {
      for (let i = req.session.lastReturns.length - 1; i >= 0; i--) {
        if (req.session.lastReturns[i].indexOf('auth') === -1) {
          url = req.session.lastReturns[i];
          break;
        }
      }
    }
    res.send(`<html><body><script>window.location = "${url}"</script></body></html>`);
  });
  */
};
