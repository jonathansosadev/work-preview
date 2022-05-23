const promises = require('../../util/promises');

// Cached generalStats
let generalStats = null;

module.exports = {
  getGeneralStats: async (app) => {
    if (!generalStats) {
      generalStats = await promises.wait((cb) => app.models.Configuration.getGeneralStats(cb));
    }
    return generalStats;
  },
};
