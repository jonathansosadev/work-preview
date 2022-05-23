var _ = require('underscore');
var debug = require('debug')('garagescore:server:boot:authentication'); // eslint-disable-line max-len,no-unused-vars
var debugPerfs = require('debug')('perfs:server:boot:authentication');
var util = require('util');
const lruCache = require('lru-cache');
const { JS, log } = require('../../common/lib/util/log');

debugPerfs('Starting boot authentication');

module.exports = function enableAuthentication(app) {
  // enable authentication
  app.enableAuth();

  /*
   * Passport
   */
  debugPerfs('Starting passport');
  var loopbackComponentPassport = require('../../common/lib/loopback-component-passport/lib');
  var passportConfigurator = new loopbackComponentPassport.PassportConfigurator(app);

  passportConfigurator.init();

  var passportProvidersConfig = {};
  try {
    passportProvidersConfig = require('../passport-providers.json');
  } catch (err) {
    console.trace(err);
    process.exit(1);
  }

  _.each(_.keys(passportProvidersConfig), function (providerName) {
    debug('Configuring Passport Provider "%s" …', providerName);
    passportProvidersConfig[providerName].session = passportProvidersConfig[providerName].session !== false;
    passportConfigurator.configureProvider(providerName, passportProvidersConfig[providerName]);
  });

  passportConfigurator.setupModels({
    userModel: app.models.User,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential,
  });

  app.middleware(
    'auth',
    app.loopback.token({
      model: app.models.AccessToken,
      currentUserLiteral: 'me',
    })
  );

  const existingUsers = lruCache({
    max: 500,
    length() {
      return 1;
    },
  });
  const unknownUsers = lruCache({
    max: 500,
    length() {
      return 1;
    },
  });
  app.middleware('auth', function setCurrentUser(req, res, next) {
    if (!req.user) {
      next();
      return;
    }
    if (!req.accessToken) {
      next();
      return;
    }
    const { userId } = req.accessToken;
    if (!userId) {
      next(new Error('Access token without user'));
      return;
    }
    const uId = userId.toString();
    if (unknownUsers.get(uId)) {
      next(new Error(`unknown user ${uId}`));
      return;
    }
    if (existingUsers.get(uId)) {
      next();
      return;
    }
    app.models.User.findOne({ where: { id: userId }, fields: { id: true } }, function (err, user) {
      if (err) {
        log.error(JS, err);
        next(err);
        return;
      }
      if (!user) {
        unknownUsers.set(uId, true);
        next(new Error(`unknown user ${uId}`));
        return;
      }
      existingUsers.set(uId, true);
      next();
      return;
    });
  });
};
