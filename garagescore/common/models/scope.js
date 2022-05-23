const { ObjectID } = require('mongodb');
let _cache = null;
let lastRefresh = 0;

module.exports = function (Scope) {
  const _init = async function () {
    if (_cache !== null && Date.now() - lastRefresh < 1000 * 60 * 60 * 6) {
      return;
    }
    await Scope.refreshCache();
  };

  Scope.refreshCache = async function () {
    _cache = new Map();
    const scopes = await Scope.find({ where: {}, fields: { id: 1, garageIds: 1 } });
    for (const scope of scopes) {
      _cache.set(scope.id, scope);
    }
    lastRefresh = Date.now();
  };

  /* return an array of scopeId where the garage is present */
  Scope.getScopeIdsFromGarageId = async function (garageId) {
    await _init();
    const scopeIds = [];
    _cache.forEach((value, key) => {
      for (const gId of value.garageIds) {
        if (ObjectID(garageId).equals(ObjectID(gId))) {
          scopeIds.push(ObjectID(key));
          break;
        }
      }
    });

    return scopeIds;
  };
};
