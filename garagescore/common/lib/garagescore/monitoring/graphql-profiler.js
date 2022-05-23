/**
 * Keep a journal of all graphql and their runTime
 */
const config = require('config');
const { ALL, log } = require('../../util/log');

const _enabled =
  config.has('profiler.enable') &&
  config.get('profiler.enable') &&
  config.has('profiler.namespace') &&
  config.get('profiler.namespace');
const _namespace = config.has('profiler.namespace') && config.get('profiler.namespace');
const _printSlowQueries = config.has('profiler.printSlowQueries') && config.get('profiler.printSlowQueries');

module.exports = {
  enabled: () => _enabled,
  namespace: () => _namespace,
  insert: async function (app, { name, query, variables, runTime }) {
    if (_printSlowQueries && runTime > 300) {
      log.warning(ALL, `GraphQL Profiler - ${name} ${runTime}ms`);
    }
    return app.models.GraphQLProfile.getMongoConnector().insertOne({
      namespace: _namespace,
      name,
      query,
      variables,
      runTime,
      createdAt: new Date(),
    });
  },
  getJournal: async function (app, projection = { name: 1, query: 1, variables: 1, runTime: 1, createdAt: 1 }) {
    return app.models.GraphQLProfile.getMongoConnector().find({ namespace: _namespace }, { projection }).toArray();
  },
  reset: async function (app) {
    return app.models.GraphQLProfile.getMongoConnector().deleteMany({});
  },
};
