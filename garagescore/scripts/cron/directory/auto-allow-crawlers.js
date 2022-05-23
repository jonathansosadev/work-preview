/**
 * Set hideDirectoryPage=false for garages with enough reviews/rating
 */

const CronRunner = require('../../../common/lib/cron/runner');
const app = require('../../../server/server');
const autoAllowCrawlers = require('../../../common/lib/garagescore/certificate/auto-allow-crawlers');

console.log('Looking for hidden garage we can open to index');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Allow search engine indexing on certificates with enough reviews',
});

app.on('booted', () => {
  runner.execute = async function execute(options, callback) {
    await autoAllowCrawlers.processAllGarages(app);
    callback();
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    console.log('AUTO ALLOW CRAWLER ENDED');
    process.exit(err ? -1 : 0);
  });
});
