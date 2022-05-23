const app = require('../../../server/server.js');
const SupervisorMessageType = require('../../../common/models/supervisor-message.type');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/service');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');

module.exports = {
  generatePeriods: async (periodsToGenerate, forceRegenerate, forcedPeriod = null, garageIds = null) => {
    // You can overwrite periods with what you need
    if (forcedPeriod) {
      periodsToGenerate = forcedPeriod.filter((id) => GarageHistoryPeriod.isValidPeriod(id)).map((id) => ({ id }));
    }
    if (garageIds) console.log(`[GH] REGENERATING ONLY FOR GARAGE ${garageIds}`);
    console.log(`[GH] final periods to generate: ${periodsToGenerate.map(({ id }) => id) || 'NOTHING !'}`);
    try {
      for (const period of periodsToGenerate) {
        const mustRegenerate = GarageHistoryPeriod.getMustRegeneratePeriods().includes(period.id) || forceRegenerate;

        console.log(`[GH] PERIOD : ${period.id}, REGENERATE : ${mustRegenerate ? 'TRUE' : 'FALSE'}`);
        console.time(period.id);

        // Calculating history for given period
        await app.models.GarageHistory.generateForGarages(period.id, garageIds, mustRegenerate, true, null);

        console.log(`[GH] ${period.id} DONE`);
        console.timeEnd(period.id);
      }
    } catch (e) {
      console.error(`[GH] ERROR IN GENERATION : ${e}`);
      GsSupervisor.warn(
        {
          type: SupervisorMessageType.STATS_SYNCHRONIZE_ERROR,
          payload: {
            error: e.toString() || JSON.stringify(e),
            context: 'generateGaragesHistory',
          },
        },
        () => {
          throw e;
        }
      );
    }
  },
  getParameters: () => {
    const params = {
      forceRegenerate: false,
      garageId: null,
      forcedPeriod: null,
    };
    process.argv.forEach((val, index) => {
      if (val === '--help') {
        console.log(
          'Usage node scripts/cron/garage-history/xxx.js [--force-regenerate] [--garageId <garageId>] [--period <periodToken>]'
        );
        process.exit(0);
      }
      if (val === '--force-regenerate') {
        // destroyAll of the periods before saving them again
        params.forceRegenerate = true;
      }
      if (val === '--garageId') {
        params.garageId = process.argv[index + 1];
      }
      if (val === '--period') {
        if (process.argv[index + 1]) params.forcedPeriod = process.argv[index + 1].replaceAll(' ', '').split(',');
      }
    });
    return params;
  },
};
