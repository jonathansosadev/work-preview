const app = require('../../server/server');

async function _exit() {
  return process.exit(0);
}

app.on('booted', async () => {
  const userJobs = await app.models.UserJob.find({});
  if (!userJobs) {
    console.log('No user jobs found !!');
    return await _exit();
  }

  const confs = userJobs
    .filter(
      (job) =>
        job.defaultUserConfig &&
        job.defaultUserConfig.reportConfigs &&
        job.defaultUserConfig.reportConfigs.monthlySummary
    )
    .reduce((res, job) => {
      res[job.name] = job.defaultUserConfig.reportConfigs.monthlySummary;
      return res;
    }, {});
  let usersToChange = 0;
  let savedUsers = [];
  const users = await app.models.User.find({ where: { job: { inq: Object.keys(confs) } } });
  await Promise.all(
    users.map(
      (user) =>
        new Promise((res, rej) => {
          if (!user.reportConfigs || !user.job || !confs[user.job]) {
            console.log('Skipping: ', user.id.toString(), user.email);
          } else {
            usersToChange++;
            user.reportConfigs.monthlySummary = confs[user.job];
            user.save((err, obj) => {
              if (!err && obj)
                savedUsers.push({ email: obj.email, conf: obj.reportConfigs && obj.reportConfigs.monthlySummary });
              return res();
            });
          }
        })
    )
  );
  console.log(JSON.stringify(savedUsers));
  console.log(usersToChange);
  console.log(savedUsers.length);
  return await _exit();
});
