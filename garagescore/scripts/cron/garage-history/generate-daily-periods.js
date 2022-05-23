/**
 * Generate daily periods (lastQuarter, 2021-quarterX, 2021-monthX)
 */
const app = require('../../../server/server.js');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const { generatePeriods, getParameters } = require('./_common.js');
const GhPeriods = require('../../../common/lib/garagescore/kpi/GhPeriods');

let startedAt = null;

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: "Génère les garages histories pour les périodes journalières 'lastQuarter, 2021-quarterX, 2021-monthX'",
  forceExecution: process.argv.includes('--force'),
});

app.on('booted', () => {
  runner.execute = async function execute(options, callback) {
    const refDate = timeHelper.dayNumberToDate(options.executionStepNumber);
    const { garageId, forcedPeriod } = getParameters();
    console.log(`[GH] GENERATE DAILY PERIODS ${new Date()}`);
    startedAt = Date.now();

    const periods = GarageHistoryPeriod.getCockpitAvailablePeriods().filter((period) => {
      return GhPeriods.getPeriodsToConsolidateDaily(refDate).includes(period.id);
    });

    try {
      await generatePeriods(periods, true, forcedPeriod, garageId ? [garageId] : null);
    } catch (e) {
      callback(e);
      return;
    }
    callback();
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    if (startedAt) {
      console.log(`[GH] GENERATE DAILY PERIODS in ${(new Date().getTime() - startedAt) / 1000 / 60} mins`);
    } else console.log('[GH] GENERATE DAILY PERIODS ENDED without doing anything');
    process.exit(err ? -1 : 0);
  });
});
