const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const gmb = require('../../../common/lib/garagescore/google-my-business/gmb');

const args = process.argv.slice(2);

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Publie les posts Google My Business',
  forceExecution: args.includes('--force'),
});

/**
 * Publish a post on GoogleMyBusiness on MONDAYS, with the global rating and a link to the directory page
 * For every garages with postOnGoogleMyBusiness: true
 *
 * --force : force post outside of cronrunner and even if not monday
 * --test : do not send the post request to gmbapi
 */

app.on('booted', async () => {
  const garageId = args.includes('--garage') ? args[args.indexOf('--garage') + 1] : null;
  const testMode = args.includes('--test');
  const forceMode = args.includes('--force');

  runner.execute = async (option, callback) => {
    if (new Date().getDay() === 1 || forceMode) {
      await main(garageId, testMode);
    }
    callback();
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});

async function main(garageId = null, testMode = false) {
  const query = gmb.generateLoopbackFindQuery(garageId);
  const garages = await app.models.Garage.find(query);

  for (const garage of garages) {
    if (gmb.garageRespectsConditionsToPostOnGmb(garage)) {
      if (testMode) {
        console.log(`Should send post to GMB for ${garage.publicDisplayName}`);
      } else {
        try {
          await gmb.generateTextAndPostOnGmb(app, garage, true, false);
          await garage.updateAttributes({ lastPostOnGoogleMyBusinessAt: new Date() });
          console.log(`[Post GMB / CRON] Just Posted For ${garage.publicDisplayName} @ ${new Date()}`);
        } catch (e) {
          console.error(`[Post GMB / CRON] ERROR @ ${garage.publicDisplayName} : ${e.message || JSON.stringify(e)}`);
        }
      }
    }
  }
}
