/*
  Script gathering lone frontdeskusernames and putting them into our factice user

  node scripts/cron/campaigns/gather-lone-frontdeskusernames.js --force
  --force : to force the execution
*/

const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');

const main = async (callback) => {
  try {
    const directMongoData = app.models.Data.getMongoConnector();
    const directMongoUser = app.models.User.getMongoConnector();
    const fakeUser = await app.models.User.findOne({ where: { email: 'collector@garagescore.com' } });
    const allGarages = await app.models.Garage.find({ fields: { id: true } });
    const max = allGarages && allGarages.length;
    let interval = null;
    let processed = 0;
    let gathered = 0;

    // reset
    fakeUser.frontDesk = [];
    await app.models.User.findByIdAndUpdateAttributes(fakeUser.getId(), { frontDesk: [] });

    console.log(`${max} garageIds To Process`);
    interval = setInterval(
      () =>
        console.log(
          `${Math.round((processed / max) * 100)}% garages done : ${
            max - processed
          } garages remaining --> ${gathered} frontdeskusernames gathered`
        ),
      5 * 1000
    ); // eslint-disable-line max-len

    for (const garage of allGarages) {
      const frontDesks = await directMongoData.distinct('service.frontDeskUserName', {
        garageId: garage.getId().toString(),
      });
      const bindedGarageUsers = await directMongoUser
        .find({ 'frontDesk.garageId': garage.getId().toString() }, { projection: { 'frontDesk.$': 1 } })
        .toArray();
      for (const frontDesk of frontDesks) {
        if (frontDesk) {
          let hasAlreadyBeenPaired = false;
          for (const user of bindedGarageUsers) {
            if (
              !hasAlreadyBeenPaired &&
              user.frontDesk &&
              user.frontDesk[0] &&
              user.frontDesk[0].frontDeskNames &&
              user.frontDesk[0].frontDeskNames.includes(frontDesk)
            )
              hasAlreadyBeenPaired = true;
          }
          if (!hasAlreadyBeenPaired) {
            let garageFrontDesk = fakeUser.frontDesk.find((e) => e.garageId === garage.getId().toString());
            if (!garageFrontDesk) {
              garageFrontDesk = {
                garageId: garage.getId().toString(),
                frontDeskNames: [],
              };
              fakeUser.frontDesk.push(garageFrontDesk);
            }
            if (!garageFrontDesk.frontDeskNames.includes(frontDesk)) {
              gathered++;
              garageFrontDesk.frontDeskNames.push(frontDesk);
            }
          }
        }
      }
      processed++;
    }
    await fakeUser.save();
    clearInterval(interval);
    console.log(`100% Done. ${gathered} frontDeskUserNames gathered`);
    callback();
  } catch (e) {
    callback(e);
  }
};

app.on('booted', () => {
  if (process.argv.includes('--force')) {
    // running outside of cron
    console.log('[Gather Lone FrontDeskUserNames] Running without cronRunner');
    main((err) => {
      if (err) {
        console.log(err);
      }
      if (err && err.response && err.response.data && err.response.data.message) console.log(err.response.data.message);
      process.exit(err ? -1 : 0);
    });
  } else {
    console.log('[Gather Lone FrontDeskUserNames] Running inside cronRunner');
    const runner = new CronRunner({
      frequency: CronRunner.supportedFrequencies.DAILY,
      description: "Récupération des noms de services dans l'user factice",
    });
    runner.execute = (options, callback) => {
      main(callback);
    };
    runner.run((err) => {
      err
        ? console.log(err)
        : console.log("Récupération des noms de services dans l'user factice terminé sans un pépin"); // eslint-disable-line
      process.exit(err ? -1 : 0);
    });
  }
});
