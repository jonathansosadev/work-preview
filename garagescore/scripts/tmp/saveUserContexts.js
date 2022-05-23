// External Modules
const moment = require('moment');
const fs = require('fs');

// GarageScore Modules
const app = require('../../server/server');
const fetchFrontEndUserContext = require('../../common/lib/garagescore/users-access/fetchFrontEndUserContext');

async function _exit(nUsers, duration) {
  // const duration = moment.duration(moment().valueOf() - start.valueOf());
  console.log(`Done Getting user contexts for ${nUsers}
               Time elapsed: ${duration.hours()} Hours, ${duration.minutes()} Minutes, ${duration.seconds()} Seconds, ${duration.milliseconds()} Milliseconds,`);
  return process.exit(0);
}

app.on('booted', async () => {
  let processedUsers = 0;
  const start = moment.utc();
  // We fetch garages and users
  console.log('Getting users');
  const users = await app.models.User.find({});
  console.log(
    `Got ${users.length} User(s). Sample emails (limit 20) ${users
      .slice(0, 20)
      .map((u) => u.email)
      .join('; ')}`
  );

  // Launching the function simultaneously
  console.log('Launching fetchFrontEndUserContext');
  const interval = setInterval(() => console.log(`Processed ${processedUsers} out of ${users.length}`), 1000);
  for (const user of users) {
    const context = await fetchFrontEndUserContext(app, user, true);
    fs.writeFileSync(`../../jsUserContexts/${user.id}`, JSON.stringify(context, null, 2));
    processedUsers++;
  }
  clearInterval(interval);

  return await _exit(users.length, moment.duration(moment().valueOf() - start.valueOf()));
});
