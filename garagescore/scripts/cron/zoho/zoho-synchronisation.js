/**
 * Synchronize all garage on Zoho
 * DON'T USE IT ON YOUR LOCAL COMPUTER IT WILL REPLACE zoho DATA !
 */

const usage = () => {
  console.log('');
  console.log('* Usage : node scripts/cron/zoho/zoho-synchronisation.js --force');
  console.log('* Synchronize all garage on Zoho');
  console.log('');
  process.exit(0);
};

if (process.argv.includes('--help')) usage();

/** require are here for better performances in case of argv errors */
require('dotenv').config({ silent: true });

const app = require('../../../server/server.js');
const CronRunner = require('../../../common/lib/cron/runner');
const TimeHelper = require('../../../common/lib/util/time-helper');
const zohoHandler = require('../../../common/lib/zoho/zoho-handler')

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Synchronizing all garage on Zoho',
  forceExecution: process.argv[2] === '--force',
});

const _parseArgs = (args) => ({
  UPDATE: args.includes('--update'), // Allow .post on zoho, PROD only
  SEND: args.includes('--send'), // Allow sending email
  QUICK_MODE: args.includes('--quick'), // Only take first page of every tables on zoho, for quick test
});

app.on('booted', () => {
  runner.execute = async (options, done) => {
    const { UPDATE, SEND, QUICK_MODE } = _parseArgs(process.argv);
    const executionDay = options.executionStepNumber
      ? TimeHelper.dayNumberToDate(options.executionStepNumber)
      : new Date();
    try {
      await zohoHandler.init({ SEND, UPDATE, QUICK_MODE }, executionDay);
    } catch (err) {
      console.error(err);
      done(err);
    }
    done();
  };
  runner.run(async (err) => {
    if (err) console.log(err);
    /** setTimeout on process.exit to wait until the emails are sent
     * If we don't the process ends before the message queue for emails is consumed
     * If the message queue isn't consumed, then the emails stays at Waiting status */
    setTimeout(() => process.exit(err ? -1 : 0), 1000);
  });
});
