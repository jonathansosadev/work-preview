/**
 * Script to retrieve ovh last calls
 * API see: https://api.ovh.com/console/#/telephony
 */

require('dotenv').config({ silent: true });
const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const { handleIncomingCalls } = require('../../../common/lib/garagescore/cross-leads/handle-incoming-calls.js');
const { decaMinuteToDate } = require('../../../common/lib/util/time-helper');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DECA_MINUTE,
  description: 'Récupérations des derniers appels reçu et manqué sur OVH puis crée des tickets.',
});

function _parseArgs(fieldsToParse) {
  const options = {};
  for (let i = 0; i < process.argv.length; i++) {
    const field = process.argv[i].replace('--', '');
    if (fieldsToParse.includes(field)) {
      options[field] = process.argv[i + 1] && !process.argv[i + 1].includes('--') ? process.argv[i + 1] : true;
    }
  }
  return options;
}
// Example: "node scripts/cron/cross-leads/retrieve-ovh-calls.js --length 3" will retrieve calls from 30min ago
let { length } = _parseArgs(['length']);
if (length) length = parseInt(length);

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    if (!options.executionStepNumber) {
      callback(new Error('option.executionStepNumber not found'));
      return;
    }
    if (length < 0 || length > 6) {
      callback(new Error(`--length ${length} is not a good value, please choose between 1 to 6`));
      return;
    }
    const from = decaMinuteToDate(options.executionStepNumber - (length || 1));
    const to = decaMinuteToDate(options.executionStepNumber);
    try {
      const phones = await app.models.Garage.getAllTakenPhones();
      await handleIncomingCalls(phones, from, to, true);
      callback();
    } catch (e) {
      callback(e);
    }
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
