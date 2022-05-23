/**
 * Generate ALL_HISTORY ONLY ('2020, 2021, LEAD_ALL_HISTORY , ...')
 */
const app = require('../../../server/server.js');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const { generatePeriods, getParameters } = require('./_common.js');

let startedAt = null;

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Génère le garage history ALL_HISTORY uniquement',
  forceExecution: process.argv.includes('--force'),
});

app.on('booted', () => {
  runner.execute = async function execute(options, callback) {
    const refDate = timeHelper.dayNumberToDate(options.executionStepNumber);
    const { forceRegenerate, garageId, forcedPeriod } = getParameters();
    console.log(`[GH] GENERATE ALL_HISTORY ONLY ${new Date()}`);
    startedAt = Date.now();
    const date = refDate.getDate();
    const day = refDate.getDay();
    const THE_TENTH = 10;
    const SATURDAY = 6;

    if (day !== SATURDAY && date !== THE_TENTH) {
      console.log(`[GH] Not today ! ${day} !== SATURDAY and ${date} !== ${THE_TENTH}`);
      callback();
      return;
    }
    // This is the interesting part
    let periodsToGenerate = GarageHistoryPeriod.getCockpitAvailablePeriods(); // GET ALL PERIODS
    periodsToGenerate = periodsToGenerate.filter(({ id }) => id === 'ALL_HISTORY');
    // This is end of the interesting part

    try {
      await generatePeriods(periodsToGenerate, forceRegenerate, forcedPeriod, garageId ? [garageId] : null);
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
      console.log(`[GH] GENERATE ALL_HISTORY ONLY in ${(new Date().getTime() - startedAt) / 1000 / 60} mins`);
    } else console.log('[GH] GENERATE ALL_HISTORY ONLY ENDED without doing anything');
    process.exit(err ? -1 : 0);
  });
});
