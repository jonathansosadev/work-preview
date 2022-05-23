const customersAlreadyContacted = require('./-customers-already-contacted');
const customersBlacklisted = require('./-customers-blacklisted');
const {
  isGarageScoreUserByEmail,
  isGarageScoreUserByPhone,
} = require('../../../../../common/lib/garagescore/custeed-users.js');
const locks = require('locks');
const { GaragesTest } = require('../../../../../frontend/utils/enumV2');

const initMutex = locks.createMutex();
/**
 * Filter customers if they have been already contacted, if they are blacklisted, unsuscribed ...
 * */

let _customersBlacklistedCached = null;
let _customersBlacklistedLastComputedAt = 0;
let _customersAlreadyContactedCached = {};
let _customersAlreadyContactedLastComputedAt = {};

// special exception for garagescore
const _garageScore = (garageId, contact) => {
  /** SKIP all tests for dupond, durant or dubois **/
  if (GaragesTest.hasValue(garageId.toString())) {
    return true;
  }
  return isGarageScoreUserByEmail(contact) || isGarageScoreUserByPhone(contact);
};

const THREE_HOURS = 1000 * 60 * 60 * 3;

// compute a new customersAlreadyContacted or use cache
const _getCustomersAlreadyContacted = (garageId, callback) => {
  const lastComputed = _customersAlreadyContactedLastComputedAt[garageId] || 0;
  const cached = _customersAlreadyContactedCached[garageId] || null;
  initMutex.lock(() => {
    const now = new Date().getTime();
    if (now - lastComputed < THREE_HOURS && cached) {
      // we use the cache
      initMutex.unlock();
      callback(null, cached);
      return;
    }
    customersAlreadyContacted(garageId, 30, (e, list) => {
      initMutex.unlock();
      if (e) {
        callback(e);
        return;
      }
      _customersAlreadyContactedLastComputedAt[garageId] = new Date().getTime();
      _customersAlreadyContactedCached[garageId] = list;
      callback(null, _customersAlreadyContactedCached[garageId]);
    });
  });
};
// compute a new customersBlacklisted or use cache
const _getCustomersBlacklisted = (callback) => {
  /* callback(null, {
      isDropped() { return false; },
      isUnsubscribed() { return false; },
      isComplained() { return false; }    });
  return; */
  initMutex.lock(() => {
    const now = new Date().getTime();
    if (now - _customersBlacklistedLastComputedAt < THREE_HOURS && _customersBlacklistedCached) {
      // we use the cache
      initMutex.unlock();
      callback(null, _customersBlacklistedCached);
      return;
    }
    customersBlacklisted((e, list) => {
      initMutex.unlock();
      if (e) {
        callback(e);
        return;
      }
      _customersBlacklistedLastComputedAt = new Date().getTime();
      _customersBlacklistedCached = list;
      callback(null, _customersBlacklistedCached);
    });
  });
};

module.exports = {
  getFilter: function getFilter(garageId, callback) {
    if (_garageScore(garageId)) {
      callback(null, {
        previouslyContactedByEmail: () => false,
        previouslyContactedByPhone: () => false,
        previouslyDroppedEmail: () => false,
        previouslyDroppedPhone: () => false,
        previouslyUnsubscribedByEmail: () => false,
        previouslyUnsubscribedByPhone: () => false,
        previouslyComplainedByEmail: () => false,
      });
      return;
    }
    _getCustomersAlreadyContacted(garageId, (e1, already) => {
      if (e1) {
        callback(e1);
        return;
      }
      _getCustomersBlacklisted((e2, blacklist) => {
        if (e2) {
          callback(e2);
          return;
        }
        callback(null, {
          previouslyContactedByEmail: (email, type) =>
            email && type && !_garageScore(garageId, email) && already.emailContacted(email, type),
          previouslyContactedByPhone: (mobilePhone, type) =>
            mobilePhone &&
            type &&
            !_garageScore(garageId, mobilePhone) &&
            already.mobilePhoneContacted(mobilePhone, type),
          previouslyDroppedEmail: (email) => email && !_garageScore(garageId, email) && blacklist.isDropped(email),
          previouslyDroppedPhone: (mobilePhone) =>
            mobilePhone && !_garageScore(garageId, mobilePhone) && blacklist.isDropped(mobilePhone),
          previouslyUnsubscribedByEmail: (email) =>
            email && !_garageScore(garageId, email) && blacklist.isUnsubscribed(garageId, email),
          previouslyUnsubscribedByPhone: (mobilePhone) =>
            mobilePhone && !_garageScore(garageId, mobilePhone) && blacklist.isUnsubscribed(garageId, mobilePhone),
          previouslyComplainedByEmail: (email) =>
            email && !_garageScore(garageId, email) && blacklist.isComplained(email),
        });
      });
    });
  },
  removeCache: function removeCache(garageId) {
    _customersBlacklistedCached = null;
    _customersBlacklistedLastComputedAt = 0;
    if (garageId) {
      _customersAlreadyContactedCached[garageId] = null;
      _customersAlreadyContactedLastComputedAt[garageId] = 0;
    } else {
      _customersAlreadyContactedCached = {};
      _customersAlreadyContactedLastComputedAt = {};
    }
  },
};
