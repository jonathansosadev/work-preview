const app = require('../../../../server/server');

let _cache = null;
let lastRefresh = 0;
const refreshGodsList = async () => {
  _cache = {};
  const garages = await app.models.Garage.find({ where: {}, fields: { id: 1, type: 1 } });
  garages.forEach((g) => {
    if (!_cache[g.type]) {
      _cache[g.type] = [];
    }
    _cache[g.type].push(g.id);
  });
  lastRefresh = Date.now();
};

const _init = async () => {
  if (_cache !== null && Date.now() - lastRefresh < 1000 * 60 * 5) {
    return;
  }
  await refreshGodsList();
};

const isGod = (user) => user.email && user.email.match(/@garagescore\.com|@custeed\.com/) && user.godMode;

// return all garages for the gods
const getGarages = async (garageType = null) => {
  await _init();
  if (!garageType) {
    let g = [];
    Object.keys(_cache).forEach((t) => {
      g = g.concat(_cache[t]);
    });
    return g;
  }
  return _cache[garageType] || [];
};
module.exports = { isGod, getGarages, refreshGodsList };
