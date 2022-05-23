/**
 * Generate daily periods ('2020, 2021, LEAD_ALL_HISTORY , ...')
 */
const app = require('../../../server/server.js');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const { generatePeriods, getParameters } = require('./_common.js');

let startedAt = null;

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: "Génère les garages histories pour les grosses périodes '2020, 2021, LEAD_ALL_HISTORY , ...'",
  forceExecution: process.argv.includes('--force'),
});

app.on('booted', () => {
  runner.execute = async function execute(options, callback) {
    const refDate = timeHelper.dayNumberToDate(options.executionStepNumber);
    const { forceRegenerate, garageId, forcedPeriod } = getParameters();
    console.log(`[GH] GENERATE BIG PERIODS ${new Date()}`);
    startedAt = Date.now();
    const date = refDate.getDate();
    const day = refDate.getDay();
    const THE_TENTH = 10;
    const SATURDAY = 6;

    // Don't generate if it's not SATURDAY or the 10th
    if (day !== SATURDAY && date !== THE_TENTH) {
      console.log(`[GH] Not today ! ${day} !== SATURDAY and ${date} !== ${THE_TENTH}`);
      callback();
      return;
    }
    // This is the interesting part
    let periodsToGenerate = GarageHistoryPeriod.getCockpitAvailablePeriods(); // GET ALL PERIODS
    periodsToGenerate.push({ id: GarageHistoryPeriod.LEAD_ALL_HISTORY });
    periodsToGenerate.push({ id: GarageHistoryPeriod.UNSATISFIED_ALL_HISTORY });
    periodsToGenerate = periodsToGenerate.filter(({ id }) => !['lastQuarter', 'ALL_HISTORY'].includes(id));
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
      console.log(`[GH] GENERATE BIG PERIODS in ${(new Date().getTime() - startedAt) / 1000 / 60} mins`);
    } else console.log('[GH] GENERATE BIG PERIODS ENDED without doing anything');
    process.exit(err ? -1 : 0);
  });
});
