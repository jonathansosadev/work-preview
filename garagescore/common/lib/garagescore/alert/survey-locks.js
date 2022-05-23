/**
 * Created by oussama on 13/09/16.
 * Mutex mechanism for Surveys by their ids
 * It make processing a survey exclusive at the same time if their are many process would be executed on one surveyInstance
 * It generate a lock for every survey and save them in a limited size cache
 * Used mainly to avoid multiple process of same survey and send of multiple alerts for the same Survey
 */

const lruCache = require('lru-cache');
const locks = require('locks');

const surveyLocks = lruCache(50);

const getLock = function getLock(surveyId) {
  if (surveyLocks.has(surveyId.toString())) {
    return surveyLocks.get(surveyId.toString());
  }
  const lock = locks.createMutex();
  surveyLocks.set(surveyId.toString(), lock);
  return lock;
};

module.exports = {
  getLock,
};
