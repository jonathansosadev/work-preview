// External Modules
const Promise = require('es6-promise').Promise;
const moment = require('moment');

// GarageScore Modules
const app = require('../../../server/server');
const fetchFrontEndUserContext = require('../../../common/lib/garagescore/users-access/fetchFrontEndUserContext');

// Local Constants
const argv = process.argv.slice(2);
const authorizedArgv = ['help', 'n', 'userIds', 'userEmails'];
const formattedArgv = {};

function _processArguments() {
  argv.forEach((a) => {
    const name = a.replace('--', '').split('=')[0];
    const values = a.replace('--', '').split('=')[1] ? a.replace('--', '').split('=')[1].split(',') : [];

    if (authorizedArgv.includes(name)) {
      formattedArgv[name] = values;
    } else {
      console.error(`The argument "${a}" is not recognized, use --help for more information`);
      process.exit(1);
    }
  });
  if ('help' in formattedArgv) {
    console.log(
      'This script launch User.prototype.fetchFrontEndUserContext and log the time it took. Possible arguments are:'
    );
    console.log('--help : will display what you are currently reading (^_^)');
    console.log("--n : Number of users for which we'll launch User.prototype.fetchFrontEndUserContext");
    console.log(
      '--usersIds : Specifies 1 or more user that need to be tested by their ids, example: "--userIds=42foo,56Df"'
    );
    console.log(
      '--userEmails : Specifies 1 or more user that need to be tested by their emails, ex: --userEmails=anass@gs.com,js@gs.com'
    );
    console.log(
      'If --userIds and --userEmails arguments are specified we take the union. ex: --userIds=idOfBB --userEmails=fed@gs.com will take bb & fed'
    );
    console.log(
      'if --n is specified and some users are designated as well, the total number of users tested will remain n'
    );
    process.exit(0);
  }
}

async function _fetchUsers(allUsers) {
  if (allUsers) return app.models.User.find({});

  const where = {};
  const whereNot = {};
  const fields = {
    id: true,
    job: true,
    role: true,
    civility: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    mobilePhone: true,
    fax: true,
    address: true,
    city: true,
    postCode: true,
    groupIds: true,
    garageIds: true,
    businessName: true,
    authorization: true,
    allGaragesAlerts: true,
    reportConfigs: true,
    lastCockpitOpenAt: true,
    resetPassword: true,
  };

  if ('userIds' in formattedArgv || 'userEmails' in formattedArgv) {
    where.or = [];
    whereNot.and = [];
    if ('userIds' in formattedArgv) {
      where.or.push({ id: { inq: formattedArgv.userIds } });
      whereNot.or.push({ id: { nin: formattedArgv.userIds } });
    }
    if ('userEmails' in formattedArgv) {
      where.or.push({ email: { inq: formattedArgv.userEmails } });
      whereNot.and.push({ email: { nin: formattedArgv.userEmails } });
    }
  }
  const firstUsersSet = where.or ? await app.models.User.find({ where, fields }) : [];

  const limit = formattedArgv.n ? formattedArgv.n - firstUsersSet.length : 0;
  const remainingUsers = limit > 0 ? await app.models.User.find({ where: whereNot, fields, limit }) : [];

  return [...firstUsersSet, ...remainingUsers];
}

async function _exit(nUsers, duration) {
  // const duration = moment.duration(moment().valueOf() - start.valueOf());
  const getIncludedUsers = () => {
    if (!('userIds' in formattedArgv || 'userEmails' in formattedArgv)) return '';
    const includedUsers = (formattedArgv.userIds || []).concat(formattedArgv.userEmails || []);
    return ` including ${includedUsers.join('; ')}`;
  };
  console.log(`Done Getting user contexts for ${nUsers} User(s)${getIncludedUsers()}
               Time elapsed: ${duration.hours()} Hours, ${duration.minutes()} Minutes, ${duration.seconds()} Seconds, ${duration.milliseconds()} Milliseconds,`);
  return process.exit(0);
}

app.on('booted', async () => {
  const stats = [];
  let processedUsers = 0;
  // Process arguments given by the user
  _processArguments();

  // We fetch garages and users
  console.log('Getting users');
  const users = await _fetchUsers(Object.keys(formattedArgv).length === 0);
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
    if (users.length < 6)
      console.log('\n', user.email, '\n==============================================================');
    const start = moment.utc();
    await fetchFrontEndUserContext(app, user, users.length < 6, true);
    const duration = moment.duration(moment().valueOf() - start.valueOf());
    // if (users.length === 1) console.log(JSON.stringify(context, null, 2));
    // console.log('\n', 'Temps total: ', duration.asMilliseconds(), ' ms');
    processedUsers++;
    stats.push({ id: user.id, email: user.email, duration });
  }
  clearInterval(interval);

  // Sort by ascending durations
  stats.sort((a, b) => a.duration.asMilliseconds() - b.duration.asMilliseconds());
  const bestTime = stats[0];
  const worstTime = stats[stats.length - 1];
  const durations = stats.map((e) => e.duration.asMilliseconds());
  const meanTime = durations.reduce((r, e) => r + e, 0) / durations.length;
  const halfLength = Math.floor(durations.length / 2);
  const medianTime =
    durations.length % 2 ? durations[halfLength] : (durations[halfLength - 1] + durations[halfLength]) / 2;
  const flops = durations.slice(-50).map((d, i) => `${i}: ${d} ms`);

  console.log(`
    Best time : ${bestTime.id} - ${bestTime.email} : ${bestTime.duration.asMilliseconds()} ms
    Worst time : ${worstTime.id} - ${worstTime.email} : ${worstTime.duration.asMilliseconds()} ms
    Mean time : ${meanTime} ms
    Median time : ${medianTime} ms
    Worst times : ${flops.reverse().join(';  ')}
  `);

  return _exit(
    users.length,
    stats.reduce((r, e) => r.add(e.duration), moment.duration(0))
  );
  // Following line launches all users at once and waits
  /*
  const début = moment.utc();
  await Promise.all(users.map((user) => fetchFrontEndUserContext(app, user, true, users.length === 1)));
  const durée = moment.duration(moment().valueOf() - début.valueOf());
  return _exit(users.length, durée);
  */
});
