const { ApolloServer, gql } = require('apollo-server-express');
const lruCache = require('lru-cache');
require('dotenv').config({ silent: true });
const graphqlProfiler = require('../../../common/lib/garagescore/monitoring/graphql-profiler');

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
const schema = require('./schema');
const { log, ALL } = require('../../../common/lib/util/log');

const create = (loopback) => {
  // get scope according to auth (user, garage list etc.
  const getScope = async (authorizationHeader, req) => {
    if (!authorizationHeader) {
      return { logged: false, authenticationError: 'Auth Token missing' };
    }
    let token = tokensCache.get(authorizationHeader);
    if (!token) {
      token = await loopback.models.AccessToken.findById(authorizationHeader);
      tokensCache.set(authorizationHeader, token);
    }
    if (!token) {
      return { logged: false, authenticationError: 'Unknow Auth Token' };
    }
    const endAt = new Date(new Date(token.created).getTime() + token.ttl * 1000);
    if (Date.now() > endAt) {
      return { logged: false, authenticationError: 'Auth Token expired' };
    }
    const user = await loopback.models.User.findOne({ where: { id: token.userId } });
    if (!user) {
      return { logged: false, authenticationError: 'Auth Token refers to an unknown User' };
    }

    let fullLocale;
    let locale;
    if (req.headers && req.headers['gs-locale']) {
      fullLocale = req.headers['gs-locale'].split(',')[0];
      locale = req.headers['gs-locale'].split(',')[0].toLocaleLowerCase().substring(0, 2);
    }

    locale = ['en', 'es', 'fr', 'ca'].includes(locale) ? locale : 'fr';
    if (locale === 'es') {
      fullLocale = 'es_ES';
    } else if (locale === 'ca') {
      fullLocale = 'ca_ES';
    } else {
      fullLocale = ['fr_FR', 'fr_BE', 'fr_NC', 'nl_BE', 'en_US'].includes(fullLocale) ? fullLocale : 'fr_FR';
    }

    const { garageIds } = user;
    return {
      logged: true,
      user,
      godMode: user.isGod(),
      locale,
      fullLocale,
      garageIds,
      req: {
        // we dont want to have everything and having no control
        headers: req.headers,
        ip: req.ip,
        connection: {
          remoteAddress: req.connection && req.connection.remoteAddress,
        },
        session: req.session,
      },
    };
  };

  // get scope according to auth (user, garage list etc.
  const context = async (integrationContext) => {
    const { req } = integrationContext;
    const authorization = req.headers.authorization && req.headers.authorization.replace('Bearer ', '').trim();
    return {
      scope: await getScope(authorization, req),
      hasMore: req.hasMore || {},
      app: loopback,
    };
  };
  // log time and log errors
  const TimeAndErrorLogPlugin = {
    requestDidStart() {
      const start = Date.now();
      let op = 'unresolvedOperation';
      let ignore = false;
      return {
        didResolveOperation(ctx) {
          op = ctx.operationName || (ctx.request && ctx.request.query && JSON.stringify(ctx.request.query));
          if (op === 'IntrospectionQuery') {
            ignore = true;
            return;
          }
        },
        willSendResponse(ctx) {
          if (ignore) {
            return;
          }
          const stop = Date.now();
          const runTime = stop - start;
          const size = JSON.stringify(ctx.response).length * 2;
          if (ctx.response.errors && ctx.response.errors.length > 0) {
            log.error(ALL, `Operation '${op}' threw an error : ${ctx.response.errors[0].message}`);
          }
          graphqlProfiler.insert(loopback, {
            name: op,
            query: ctx.request.query,
            variables: ctx.request.variables,
            runTime,
          });
          log.debug(ALL, `Operation '${op}' completed in ${runTime} ms and returned ${size} bytes`);
        },
      };
    },
  };
  return new ApolloServer({
    ...schema,
    context,
    plugins: [TimeAndErrorLogPlugin],
  });
};
module.exports = { create };
