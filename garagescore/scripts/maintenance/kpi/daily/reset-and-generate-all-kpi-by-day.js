const app = require('../../../../server/server');
const _processArguments = require('./_process-arguments');
const Logger = require('../utils/_logger');
const generateKpis = require('../../../../common/lib/garagescore/daily-kpi/generate-kpis');

app.on('booted', async () => {
  try {
    const { periodIds, garageIds = [], mode = 'all', mep, endMep } = _processArguments(process.argv.slice(2));

    await generateKpis(app, { periods: periodIds.map((p) => p.token), garageIds, mode, mep, endMep });

    process.exit(0);
  } catch (e) {
    Logger.error(`ERROR : ${e}`);
    process.exit(1);
  }
});
