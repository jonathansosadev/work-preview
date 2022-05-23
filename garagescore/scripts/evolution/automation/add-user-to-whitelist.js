const app = require('../../../server/server');

app.on('booted', async () => {
  const emailList = process.argv.slice(2);
  let toWhiteList = [];
  for (const email of emailList) {
    const existingUser = await app.models.User.findOne({ where: { email } });
    if (existingUser) toWhiteList.push(email);
  }
  if (toWhiteList.length === 0) {
    console.log('Nothing to add to the whitelist, bye !');
    process.exit(0);
  }
  const currentWhiteList = await new Promise((res, rej) =>
    app.models.Configuration.getAutomationWhitelist((err, whitelist) => (err ? rej(err) : res(whitelist)))
  );
  toWhiteList = toWhiteList.filter((email) => !currentWhiteList.includes(email));
  console.log(`${toWhiteList.length} users will be added to the whiteList`);
  console.log(toWhiteList.join(', '));
  try {
    await new Promise((res, rej) =>
      app.models.Configuration.setAutomationWhitelist([...currentWhiteList, ...toWhiteList], (err, whitelist) =>
        err ? rej(err) : res(whitelist)
      )
    );
  } catch (err) {
    console.error(`Error while updating the whitelist : ${err}`);
    process.exit(1);
  }
  console.log('Whitelist has been updated, bye !');
  process.exit(0);
});
