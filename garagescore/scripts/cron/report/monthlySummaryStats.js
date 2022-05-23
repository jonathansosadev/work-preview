const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const { log, ANASS } = require('../../../common/lib/util/log');
const timeHelper = require('../../../common/lib/util/time-helper');
const monthlySummaryStats = require('../../../common/lib/garagescore/report/monthlySummaryStats');

const runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Calcul les tops utilisés dans les rapports mensuels.',
  forceExecution: process.argv.includes('--force'),
});

/**
 * This CRON computes overall KPIs used in the Monthly Summaries Reports
 * Those KPIs are stocked in the Configuration collection
 * You can launch this CRON from the 11th of each month
 * You can launch it several time in a month if you want, it won't have an impact
 * This CRON does NOT send any report to anyone! It just computes KPIs and stock them in database!
 * Nevertheless, you should always launch this CRON before sending any MonthlySummaries as you will need
 * those KPIs for your reports
 */
app.on('booted', async () => {
  runner.execute = async (options, callback) => {
    const today = timeHelper.dayNumberToDate(options.executionStepNumber);

    // 1. If we are too early within the current month, we quit
    if (today.getDate() < 11) {
      log.info(ANASS, '[MONTHLY SUMMARIES STATS] COMPUTING ABORTED! NOT THE 11TH OF THE MONTH YET!');
      callback();
      return;
    }

    log.info(ANASS, '[MONTHLY SUMMARIES STATS] COMPUTING STARTED, PLEASE WAIT...');

    try {
      // 2. We try to compute the KPIs
      const results = await monthlySummaryStats.compute(app, options.executionStepNumber);

      // 3. If we don't have anything it's a problem
      if (!results || !results.top20Satisfaction || results.top20Satisfaction.length === 0) {
        log.error(ANASS, '[MONTHLY SUMMARIES STATS] No stats found in Mongo, we stop there...');
        callback(new Error('[MONTHLY SUMMARIES STATS] No stats found in Mongo, we stop there...'));
      }

      // 4. We save the result in the database, everything looks successful
      await monthlySummaryStats.save(app, results, options.executionStepNumber);
      log.info(ANASS, '[MONTHLY SUMMARIES STATS] COMPUTING DONE! THANK YOU FOR WAITING!');
      callback();
    } catch (err) {
      log.error(ANASS, '[MONTHLY SUMMARIES STATS] Error!', err);
      callback(err);
    }
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
