/**
 * Test external providers
 */
const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const testExternalProvidersRunner = require('../../../test-external-providers/test-external-providers-runner');

let startedAt = null;

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.TWO_HOURS,
  description: 'Teste des fournisseurs externes',
  forceExecution: process.argv.includes('--force'),
});

app.on('booted', () => {
  runner.execute = async function execute(options, callback) {
    console.log(`[TEST EXTERNAL PROVIDERS] TEST EXTERNAL PROVIDERS ${new Date()}`);
    startedAt = Date.now();

    await testExternalProvidersRunner.run(callback);
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    if (startedAt) {
      console.log(`[TEST EXTERNAL PROVIDERS] TEST EXTERNAL PROVIDERS in ${(new Date().getTime() - startedAt) / 1000 / 60} mins`);
    } else console.log('[TEST EXTERNAL PROVIDERS] TEST EXTERNAL PROVIDERS ENDED without doing anything');
    process.exit(err ? -1 : 0);
  });
});