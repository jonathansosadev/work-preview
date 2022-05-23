const moment = require('moment');

const DataTypes = require('../../../common/models/data/type/data-types');
const app = require('../../../server/server');

app.on('booted', async () => {
  try {
    console.log('[2881 REMOVE EXOGENOUS DATAS] STARTING... PLEASE WAIT...');

    const directMongoData = app.models.Data.getMongoConnector();
    const directMongoGarage = app.models.Garage.getMongoConnector();
    const garages = await directMongoGarage
      .find({}, { projection: { _id: true, exogenousReviewsConfigurations: true, subscriptions: true } })
      .toArray();
    const max = garages.length;
    const start = moment.utc();
    let duration = null;
    let processed = 0;

    for (const garage of garages) {
      console.log(
        `[2881 REMOVE EXOGENOUS DATAS] (${Math.round((processed / max) * 100)}%) - PROCESSING GARAGE ${garage._id}...`
      );

      if (
        !garage.subscriptions ||
        !garage.subscriptions.EReputation ||
        !garage.subscriptions.EReputation.enabled ||
        !garage.exogenousReviewsConfigurations ||
        Object.keys(garage.exogenousReviewsConfigurations).some((key) => {
          return (
            !garage.exogenousReviewsConfigurations[key].token || !garage.exogenousReviewsConfigurations[key].externalId
          );
        })
      ) {
        const selector = { garageId: garage._id.toString(), type: DataTypes.EXOGENOUS_REVIEW };
        let result = null;

        if (
          !garage.subscriptions ||
          !garage.subscriptions.EReputation ||
          !garage.subscriptions.EReputation.enabled ||
          !garage.exogenousReviewsConfigurations
        ) {
          result = await directMongoData.deleteMany(selector);
        } else {
          for (const key of Object.keys(garage.exogenousReviewsConfigurations)) {
            if (
              !garage.exogenousReviewsConfigurations[key].token ||
              !garage.exogenousReviewsConfigurations[key].externalId
            ) {
              selector.$or = selector.$or || [];
              selector.$or.push({ 'source.type': key });
            }
          }
          result = await directMongoData.deleteMany(selector);
        }

        console.log(
          `[2881 REMOVE EXOGENOUS DATAS] (${Math.round((processed / max) * 100)}%)  --> DONE FOR GARAGE ${
            garage._id
          }, ${result.result.n} DATAS REMOVED!`
        );
      } else {
        console.log(
          `[2881 REMOVE EXOGENOUS DATAS] (${Math.round((processed / max) * 100)}%)  --> DONE FOR GARAGE ${
            garage._id
          }, NOTHING TO REMOVE.`
        );
      }

      ++processed;
    }

    duration = moment.duration(moment.utc().valueOf() - start.valueOf());
    console.log(
      `[2806 REMOVE EXOGENOUS DATAS] DONE IN ${duration.hours()} HOURS, ${duration.minutes()} MINUTES, ${duration.seconds()} SECONDS`
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }

  process.exit(0);
});
