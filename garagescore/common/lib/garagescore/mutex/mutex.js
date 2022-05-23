const locks = require('locks');

const __dataMutex = {};
const awaitingMaxTime = 10000;

module.exports = {
  async lockByDataId(dataId) {
    if (!__dataMutex[dataId]) {
      __dataMutex[dataId] = locks.createMutex();
    }
    await new Promise((res) => __dataMutex[dataId].timedLock(awaitingMaxTime, () => res()));
  },

  mutexExistsByDataId(dataId) {
    return !!__dataMutex[dataId];
  },

  unlockByDataId(dataId) {
    if (__dataMutex[dataId]) {
      __dataMutex[dataId].unlock();
    }
  },

  isLockedByDataId(dataId) {
    if (__dataMutex[dataId]) {
      return __dataMutex[dataId].isLocked;
    }
    return false;
  },

  deleteMutexByDataId(dataId) {
    delete __dataMutex[dataId];
  },
};
