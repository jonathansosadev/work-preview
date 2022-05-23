const moment = require('moment');
const mongodb = require('mongodb');

const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const CronRunner = require('../../../common/lib/cron/runner');
const app = require('../../../server/server.js');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.HOURLY,
  description:
    'Génère les statistiques exogènes consolidées par garage pour toutes les périodes affichées sur Cockpit.',
});

app.on('booted', () => {
  runner.execute = async function execute(option, callback) {
    console.log(`/!\\ Generation Started : ${moment().format('DD/MM/YYYY HH:mm:ss')}`);
    const periods = GarageHistoryPeriod.getCockpitAvailablePeriods();

    for (const period of periods) {
      console.log(
        `Generating History With Period : [${period.id}]  Regenerate : Yes  Started At : [${moment().format(
          'DD/MM/YYYY HH:mm:ss'
        )}]`
      );
      const erepPeriod = GarageHistoryPeriod.fromCockpitPeriodToExogenousPeriod(period.id);
      const oldHistories = await app.models.GarageHistory.find({
        where: { periodToken: erepPeriod, frontDesk: 'ALL_USERS' },
      });
      const histories = await app.models.GarageHistory.generateForGaragesAndPeriod(erepPeriod, null);

      for (const history of histories) {
        const oldHistory = oldHistories.find((h) => h.garageId.toString() === history.garageId.toString());
        if (oldHistory) {
          history.id = oldHistory.id;
        } else {
          delete history.id;
        }
        history.garageId =
          typeof history.garageId === 'string' ? new mongodb.ObjectID(history.garageId) : history.garageId;
        await app.models.GarageHistory.upsert(history);
      }
    }
    console.log(`/!\\ Generation Ended : ${moment().format('DD/MM/YYYY HH:mm:ss')}`);
    callback();
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
