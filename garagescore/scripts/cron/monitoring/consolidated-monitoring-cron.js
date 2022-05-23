const app = require('../../../server/server');
const momentTz = require('moment-timezone');
const async = require('async');

const CronRunner = require('../../../common/lib/cron/runner');
const Consolidator = require('../../monitoring/consolidator');

const frequency = CronRunner.supportedFrequencies.DAILY;
const SLICE_SIZE = 100;

/**
 * Consolidate Garage statistic every day, dataFiles imported, surveys created, contacts created, campaigns created...
 * ---------------
 * This file is not very important
 * It only uses the CRON Runner and the Consolidator
 * and make them work together, I suggest you go read the documentation
 * of those tools instead.
 * Anyhow, the purpose of this script is to execute the Consolidator every day
 * thanks to the CRON Runner
 */

/**
 * Helpers Functions
 */
function setDateTimeOptions(obj, currentDay, currentWeekWithOffset) {
  obj.daysFromEpoch = Math.floor(currentDay / 8.64e7);
  obj.weeksFromEpoch = Math.floor(currentWeekWithOffset / 60.48e7);
  obj.monthsFromEpoch = (currentDay.getFullYear() - 1970) * 12 + currentDay.getMonth();
  obj.yearsFromEpoch = currentDay.getFullYear() - 1970;
  return obj;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * CRON SETUP
 */
const runner = new CronRunner({
  frequency,
  description: "Consolidation des données de monitoring d'hier et d'aujourdh'ui",
});

runner.execute = (options, finalCallback) => {
  if (!options.executionStepNumber) {
    finalCallback(new Error('option.executionStepNumber not found'));
    return;
  }
  const maxDaysToKeep = 15;
  const step = options.executionStepNumber;
  const ms = step * frequency;
  const toCreateByGarage = [];
  const toCreateForAll = [];

  async.series(
    {
      destroyOldDataForAllGarages: (cb) => {
        app.models.ConsolidatedGaragesStatistic.destroyAll({ daysFromEpoch: { lt: step - maxDaysToKeep } }, cb);
      },
      destroyDataFromYesterdayForAllGarages: (cb) => {
        app.models.ConsolidatedGaragesStatistic.destroyAll({ daysFromEpoch: step - 1 }, cb);
      },
      consolidateYesterday: (cb) => {
        const yesterdayStart = momentTz(ms).tz('UTC').subtract(1, 'day').hour(0).minute(0).second(0).millisecond(0);
        const yesterdayEnd = momentTz(ms).tz('UTC').subtract(1, 'day').hour(23).minute(59).second(59).millisecond(999);
        const yesterdayConsolidator = new Consolidator(app, yesterdayStart.valueOf(), yesterdayEnd.valueOf());
        const currentDay = yesterdayStart.toDate();
        const currentWeekWithOffset = yesterdayStart.clone().subtract(3, 'day').add(12, 'hour').toDate();

        yesterdayConsolidator.start((errConsolidation, result) => {
          if (errConsolidation) {
            cb(errConsolidation);
            return;
          }
          for (const garageId of Object.keys(result.byGarages)) {
            setDateTimeOptions(result.byGarages[garageId], currentDay, currentWeekWithOffset);
            toCreateByGarage.push(result.byGarages[garageId]);
          }
          setDateTimeOptions(result.forAll, currentDay, currentWeekWithOffset);
          toCreateForAll.push(result.forAll);
          cb();
        });
      },
      consolidateToday: (cb) => {
        const todayStart = momentTz(ms).tz('UTC').hour(0).minute(0).second(0).millisecond(0);
        const todayEnd = momentTz(ms).tz('UTC').hour(12).minute(0).second(0).millisecond(0);
        const todayConsolidator = new Consolidator(app, todayStart.valueOf(), todayEnd.valueOf());
        const currentDay = todayStart.toDate();
        const currentWeekWithOffset = todayStart.clone().subtract(3, 'day').add(12, 'hour').toDate();

        todayConsolidator.start((errConsolidation, result) => {
          if (errConsolidation) {
            cb(errConsolidation);
            return;
          }
          for (const garageId of Object.keys(result.byGarages)) {
            setDateTimeOptions(result.byGarages[garageId], currentDay, currentWeekWithOffset);
            toCreateByGarage.push(result.byGarages[garageId]);
          }
          setDateTimeOptions(result.forAll, currentDay, currentWeekWithOffset);
          toCreateForAll.push(result.forAll);
          cb();
        });
      },
      createForAll: async (cb) => {
        console.log('Create stats for all');
        let sliceStartAt = 0;
        while (toCreateForAll.slice(sliceStartAt, sliceStartAt + SLICE_SIZE).length > 0) {
          try {
            const res = await app.models.ConsolidatedGaragesStatistic.create(
              toCreateForAll.slice(sliceStartAt, sliceStartAt + SLICE_SIZE)
            );
            console.log(
              `Created stats for all from ${sliceStartAt} to ${sliceStartAt + SLICE_SIZE} SUCCESS (${
                res && res.length
              } added)`
            );
          } catch (e) {
            cb(e);
            return;
          }
          await sleep(200);
          sliceStartAt += SLICE_SIZE;
        }
        cb();
      },
    },
    finalCallback
  );
};

runner.run((err) => {
  if (err) {
    console.log(err);
  }
  console.log('bye');
  process.exit(err ? -1 : 0);
});
