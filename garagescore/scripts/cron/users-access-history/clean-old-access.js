/**
 * Delete all user access older than the days given in params using User Model
 * Access older than 60 days should be destroy for each user
 */

// Every access older than this number of days will be erased if no parameter is given
const defaultDays = 60;
let days = defaultDays;
process.argv.forEach((val, index) => {
  if (val === '--help') {
    console.log('');
    console.log('* Usage : node clean-old-access.js -days [numberOfDays]');
    console.log('* Delete all access older than the days given in params using User Model');
    console.log('* Access older than 60 days should be destroy for each user');
    console.log('');
    process.exit(0);
  } else if (val === '-days' || val === '-d' || val === '--d') {
    days = Number(process.argv[index + 1]);
    if (!Number.isInteger(days)) {
      console.log('* Usage : node clean-old-access.js -days [numberOfDays]');
      console.log('');
      process.exit(0);
    }
  }
});
console.log('**** Days set to', days, '****');

/** require are here for better performances in case of argv errors */
const CronRunner = require('../../../common/lib/cron/runner');
const app = require('../../../server/server.js');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Suppression des accès > 60 jours sur chaque utilisateur.',
});

app.on('booted', () => {
  runner.execute = (option, done) => {
    console.log(`Deleting old user access started : ${new Date()}`);
    app.models.AccessHistory.cleanAccessOlderThan(days).then((res) => {
      console.log(res && res.length);
      done();
    });
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    console.log('DELETING OLD USER ACCESS ENDED');
    process.exit(err ? -1 : 0);
  });
});
