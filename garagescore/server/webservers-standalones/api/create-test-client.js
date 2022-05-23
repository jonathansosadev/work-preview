/***
 * Apollo test client doesnt have access to 'req', its imposssible for us to check the headers for example
 * https://github.com/apollographql/apollo-server/issues/2277
 *
 * Inspired by
 * https://github.com/KristianWEB/fakebooker-backend/blob/master/__tests__/util/testClient.js
 *
 * Call ir like that
 *
 * {query} = createTestClient(app, { req: { headers: { authorization: `JWT ${tokenA}` } } });
 *  */
const { createTestClient } = require('apollo-server-testing');

const apolloServer = require('./apollo-server');

/**
 * Test client with custom context argument that can be set per query or mutate call
 * @param ctxArg Default argument object to be passed
 */
module.exports = (app, ctxArg) => {
  const server = apolloServer.create(app);
  const ctxOrg = server.context;
  server.context = () => ctxOrg(currentCtxArg);
  const baseCtxArg = ctxArg;
  let currentCtxArg = baseCtxArg;

  const { query, mutate, ...others } = createTestClient(server);

  // Wraps query and mutate function to set context arguments
  // eslint-disable-next-line no-shadow
  const wrap = (fn) => ({ ctxArg, ...args }) => {
    currentCtxArg = ctxArg != null ? ctxArg : baseCtxArg;
    return fn(args);
  };

  return { query: wrap(query), mutate: wrap(mutate), ...others };
};
