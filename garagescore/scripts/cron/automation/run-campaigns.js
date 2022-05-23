/* eslint-disable no-restricted-syntax */

const app = require('../../../server/server');

const intro = '[CRON Automation - Run campaigns] :';

const timeHelper = require('../../../common/lib/util/time-helper');
const CronRunner = require('../../../common/lib/cron/runner');
const { TIBO, log } = require('../../../common/lib/util/log');
const { ObjectID } = require('mongodb');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Lance les campagnes automation.',
  forceExecution: process.argv.includes('--force'),
});

process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', error);
  process.exit();
});

runner.execute = function execute(options, callback) {
  (async () => {
    // The day of execution of the campaigns. Either an argument or the cron exec step number
    const executionDayNumber = process.argv.includes('--dayNumber')
      ? parseInt(process.argv[process.argv.indexOf('--dayNumber') + 1], 10)
      : options.executionStepNumber;
    // Amount of times the script will be run. For each iteration after the first one, the dayNumber is incremented. default 1
    const iterations = process.argv.includes('--iterations')
      ? parseInt(process.argv[process.argv.indexOf('--iterations') + 1])
      : 1;
    // If --authorizeFutureIterations is provided, the script will be authorized to run a campaign in the future. Shouldn't be used on 99% of the cases.
    const authorizeFutureIterations = process.argv.includes('--authorizeFutureIterations');
    // if --garageId is provided, only the campaigns from the garage provided will be run
    const garageId = process.argv.includes('--garageId')
      ? new ObjectID(process.argv[process.argv.indexOf('--garageId') + 1])
      : null;
    // if --campaignId is provided, only the campaign provided will be run
    const campaignId = process.argv.includes('--campaignId')
      ? new ObjectID(process.argv[process.argv.indexOf('--campaignId') + 1])
      : null;
    // today's day number. Shouldn't be exceeded, except with authorizeFutureIterations argument
    const todayDayNumber = timeHelper.dayNumber(new Date());

    const garageIdLog = garageId ? ` and for garageId ${garageId.toString()}` : '';
    const campaignIdLog = campaignId ? ` and for campaignId ${campaignId.toString()}` : '';

    for (let iteration = 0; iteration < iterations; ++iteration) {
      const dayNumber = executionDayNumber + iteration;
      if (dayNumber > todayDayNumber && !authorizeFutureIterations) {
        log.warning(
          TIBO,
          `${intro} dayNumber : ${dayNumber} is ahead of today. Campaigns shouldn't be run in the future, aborting.`
        );
        return;
      }
      log.info(
        TIBO,
        `${intro} running for dayNumber : ${dayNumber}${garageIdLog}${campaignIdLog}`
      );
      await app.models.AutomationCampaign.runCampaigns(timeHelper.dayNumberToDate(dayNumber), garageId, campaignId);
    }
  })()
    .then((res) => callback(null, res))
    .catch(callback);
};

runner.run((err) => {
  if (err) {
    console.log(err);
  }
  process.exit(err ? -1 : 0);
});
