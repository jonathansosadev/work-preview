const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');

const _generateAllAlerts = async (n) => {
  try {
    let date = new Date();
    if (date.getDate() !== n && n !== -1) {
      console.log(`${n} is different from today's day (${date.getDate()}), script shouldn't send anything.`);
      return null;
    }
    const fields = { id: true, email: true, unsubscribedMakeSurveys: true, job: true, firstName: true, lastName: true };
    let users = await app.models.User.find({ fields });
    users = users.filter((u) => !u.email.match(/@garagescore\.com|@custeed\.com/));
    let userAmount = 0;
    for (let i = 0; i < users.length; i++) {
      if ((await users[i].isConcernedByMakeSurveys()) && !users[i].unsubscribedMakeSurveys) {
        if (await users[i].sendMakeSurveysEmail()) {
          console.log(`Sent for ${users[i].getId()}`);
          userAmount++;
        } else {
          console.log(`Already sent this month for ${users[i].getId()}`);
        }
      }
    }
    console.log(`Sent for ${userAmount} users.`);
    return null;
  } catch (e) {
    return e;
  }
};

const main = async (n, callback) => {
  const alertGeneration = await _generateAllAlerts(n || 15);
  callback(alertGeneration);
};

app.on('booted', () => {
  if (process.argv.length >= 3 && process.argv[2] === '--force') {
    // running outside of cron
    console.log('[Automatic Bonus alert sending] Running without cronRunner');
    main(-1, (err) => {
      if (err) {
        console.log(err);
      }
      if (err && err.response && err.response.data && err.response.data.message) console.log(err.response.data.message);
      process.exit(err ? -1 : 0);
    });
  } else {
    console.log('[Automatic Bonus alert sending] Running inside cronRunner');
    const runner = new CronRunner({
      frequency: CronRunner.supportedFrequencies.DAILY,
      description: 'Envoi des e-mails pour la modification des scénarios selon les primes',
    });
    runner.execute = (options, callback) => {
      main(null, callback);
    };
    runner.run((err) => {
      err ? console.log(err) : console.log('Envoi des e-mails terminé sans un pépin'); // eslint-disable-line
      process.exit(err ? -1 : 0);
    });
  }
});
