/**
 * Print slow queries on console, every x seconds,
 * it will check new documents in system.profile and log them
 * Only documents with a commented command will appears in the logs (see get-mongo-connector)
 */
const { ALL, log } = require('../../util/log');

let _db; // db connector
let _dbName; // db name
let _shouldSearchForNewQueries = 100; // a value from 0 to 100, if 100 then we should search in system.profile
let _skip = 0; // last document find in system.profile, warning: the collection is capped
//if your queries take to much time to appear in your console, decrease the following sleep values
let sleep = 10 * 1000; // time between 2 checks if we have been notified
let maxsleep = 60 * 1000; // max time without searching in system.profile (even without notification)
let _timeoutHandler = null;

/* notify a new query is going be run and executed in expectedTimeMs */
const notify = (expectedTimeMs = 500) => {
  setTimeout(() => {
    _shouldSearchForNewQueries = 100;
  }, expectedTimeMs);
};
/** main loop based on setTimeouts */
function _printSlowQueries() {
  if (_shouldSearchForNewQueries < 100) {
    // console.log('_printSlowQueries sleep:' + _shouldSearchForNewQueries);
    _shouldSearchForNewQueries += (100 * sleep) / maxsleep; // after one minute, we want search even if we had no notifications
    clearTimeout(_timeoutHandler);
    _timeoutHandler = setTimeout(_printSlowQueries, sleep);
    return;
  }
  const filter = {
    ns: { $ne: `${_dbName}.system.profile` },
  }; //filter for query
  const cursorOptions = {
    skip: _skip,
    tailable: true,
    awaitdata: true,
    numberOfRetries: -1,
  };

  // cant use change stream because: The collection is reserved for internal use and is not included in the replica set oplog, and because changestreams rely on the oplog it won’t be able to broadcast the change events.
  // const stream = db.collection('system.profile').watch();
  /// stream.on('change', function (document) {
  const stream = _db.collection('system.profile').find(filter, cursorOptions).stream();
  stream.on('data', function (document) {
    _skip++;
    if (document.command && document.command.comment) {
      const { millis, planSummary } = document;
      if (millis > 100) {
        const { requestId } = JSON.parse(document.command.comment);
        const { keysExamined, nreturned } = document;
        const msg = `Mongo Profiler - ${requestId} ${millis}ms - ${planSummary} examined/return=${keysExamined}/${nreturned}`;
        log.warning(ALL, msg);
      }
    }
  });
  stream.on('finish', () => {
    // 'finish stream mongo logger');
    _shouldSearchForNewQueries = 0;
    clearTimeout(_timeoutHandler);
    _timeoutHandler = setTimeout(_printSlowQueries, sleep);
  });
  stream.on('close', () => {
    // console.log('close stream mongo logger');
    _shouldSearchForNewQueries = 0;
    clearTimeout(_timeoutHandler);
    _timeoutHandler = setTimeout(_printSlowQueries, sleep);
  });
  stream.on('error', () => {
    // console.log('error stream mongo logger');
    _shouldSearchForNewQueries = 0;
    clearTimeout(_timeoutHandler);
    _timeoutHandler = setTimeout(_printSlowQueries, sleep);
  });
}

module.exports = {
  start: (db, dbName) => {
    _db = db;
    _dbName = dbName;
    _printSlowQueries();
  },
  notify,
};
