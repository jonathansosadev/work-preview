/**
 * Setup Mongo to log every request in the system.profile collection
 * If you config your app to print slow queries on console, every x seconds,
 * it will check new documents in system.profile and log them
 * Only documents with a commented command will appears in the logs (see get-mongo-connector)
 */
const config = require('config');
const { ALL, log } = require('../../util/log');
const stackCaller = require('./stack-caller');
const mongoProfilerLiveLogs = require('./mongo-profiler-live-logs');

let _db; // db connector
let _dbName; // db name

async function reset(app) {
  // connect to DB
  _dbName = app.models.User.getMongoConnector().dbName;
  if (_dbName === 'IN_MEMORY_MONGODB') {
    return;
  }
  _db = app.dataSources.GaragescoreMongoDataSource.connector.client.db(_dbName); // lost in loopback
  await _db.setProfilingLevel('off');
  await _db.dropCollection('system.profile');
  await _db.setProfilingLevel('all', { slowms: 0 });
  /* in mongo shell:
  db.setProfilingLevel(0)
  db.system.profile.drop()
  db.setProfilingLevel(1, { slowms: 0 })*/
}
const _enabled =
  config.has('profiler.enable') &&
  config.get('profiler.enable') &&
  config.has('profiler.namespace') &&
  config.get('profiler.namespace');
const _namespace = config.has('profiler.namespace') && config.get('profiler.namespace');
const _shouldPrintSlowQueries = config.get('profiler.printSlowQueries') && config.has('profiler.printSlowQueries');

// wrap collection to add a comment on every requests
// group: add a group field in the request comment (to group them during debug)
function wrapCollection(collection, { group = 'default' } = {}) {
  if (collection._profiled) return;
  collection._profiled = true;
  if (!_enabled) {
    return collection;
  }
  const cAggregate = collection.aggregate.bind(collection);
  const cFind = collection.find.bind(collection);
  const cFindOne = collection.findOne.bind(collection);
  const ns = _namespace;
  const hints = ['api/schema', 'graphql'];
  collection.aggregate = function aggregate(pipeline, options = {}, callback) {
    const comment = { requestId: stackCaller.getCaller({ hints }), namespace: ns, group };
    options.comment = JSON.stringify(comment); // node driver doesnt support comment obj for aggregate
    return callback ? cAggregate(pipeline, options, callback) : cAggregate(pipeline, options);
  };
  collection.find = function find(query, options = {}, callback) {
    const comment = { requestId: stackCaller.getCaller({ hints }), namespace: ns, group };
    options.comment = JSON.stringify(comment); // stringify to be coherent with aggregate
    return callback ? cFind(query, options, callback) : cFind(query, options);
  };
  collection.findOne = function findOne(query, options = {}, callback) {
    const comment = { requestId: stackCaller.getCaller({ hints }), namespace: ns, group };
    options.comment = JSON.stringify(comment); // strinigfy to be coherent with aggregate
    return callback ? cFindOne(query, options, callback) : cFindOne(query, options);
  };
  return collection;
}
let started = false;
module.exports = {
  enabled: () => _enabled,
  namespace: () => _namespace,
  wrapCollection,
  start: async (app) => {
    if (!_enabled) {
      return;
    }
    if (!_namespace) {
      log.error(ALL, 'No namespace defined for mongo-profiler');
      return;
    }
    if (started) return;
    started = true;
    await reset(app);
    if (_shouldPrintSlowQueries) {
      mongoProfilerLiveLogs.start(_db, _dbName);
    }
  },
  notify: mongoProfilerLiveLogs.notify,
  reset,
  getJournal: async function (
    app,
    projection = {
      'command.comment': 1,
      ts: 1,
      millis: 1,
      keysExamined: 1,
      nreturned: 1,
      planSummary: 1,
    }
  ) {
    const dbName = app.models.User.getMongoConnector().dbName;
    const db = app.dataSources.GaragescoreMongoDataSource.connector.client.db(dbName); // lost in loopback
    const filter = {};
    filter['command.comment'] = { $regex: _namespace };
    return db.collection('system.profile').find(filter, { projection }).toArray();
  },
};
