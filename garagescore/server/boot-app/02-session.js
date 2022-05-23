/*
 * Apprently, using the loopback.session middleware in conjunction with Redis does not work:
 * https://github.com/strongloop/loopback/issues/1032
 * So we're using vanilla session, along with connect-redis
 */

const debugPerfs = require('debug')('perfs:server:boot:session');
const connectRedis = require('connect-redis');
const session = require('express-session');
const redis = require('redis');
const config = require('config');
const URI = require('urijs');
const captchaHandler = require('../captcha-handler');

debugPerfs('Starting boot session');

module.exports = function mountSession(app) {
  const tls = process.env.REDIS_URL.includes('rediss://') ? { tls: { rejectUnauthorized: false } } : {};
  const options = {
    //legacyMode: true,
    url: process.env.REDIS_URL,
    ...tls,
  };
  console.log('Starting redis client...', options);
  const client = redis.createClient(options);

  const RedisStore = connectRedis(session);
  const store = new RedisStore({
    client,
  });

  const sessionMiddleWare = session({
    store,
    name: config.get('session.cookieName'),
    secret: config.get('session.secret'),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
    saveUninitialized: true,
    rolling: true,
    resave: true,
    unset: 'destroy',
  });

  /** Do not use session in specific cases where there is no need to create a session token */
  const dontAlwaysUseSessions = function (req, res, next) {
    if (req.path && (req.path.indexOf('/public-api/') === 0 || req.path.indexOf('/webhook/') === 0)) {
      next();
    } else {
      sessionMiddleWare(req, res, next);
    }
  };
  app.middleware('session', dontAlwaysUseSessions);
  app.middleware('parse', captchaHandler.captchaHandler());
};
