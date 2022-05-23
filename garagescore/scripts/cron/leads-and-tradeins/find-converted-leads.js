/* eslint-disable no-restricted-syntax */
const app = require('../../../server/server.js');
const CronRunner = require('../../../common/lib/cron/runner');

const { findConvertedLeads } = require('../../../common/lib/garagescore/find-converted-leads/find-converted-leads');

/**
 * Check our sales and leads history to see if we have any leads related to a sale
 * If:
 * - lead.info === sale.info (info can be email, customerId etc.)  => convertedSale
 * - sale.plate === lead.plate  => convertedTradeIn
 */

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Croise les leads et les ventes.',
  forceExecution: process.argv.includes('--force'),
});

const _parseArgs = (args) => {
  const dataId = args.includes('--dataId') && args[args.indexOf('--dataId') + 1];

  return {
    dataId
  };
};

runner.execute = function execute(options, callback) {
  const { dataId } = _parseArgs(process.argv);
  if (dataId) {
    console.log(`Launching the cron on the data id ${dataId}`);
  }

  (async () => {
    await findConvertedLeads(options, callback, app, dataId);
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