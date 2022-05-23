const moment = require('moment');

const app = require('../../../server/server');

app.on('booted', async () => {
  try {
    console.log('[2806 FIX DATAS GARAGE-TYPE] STARTING... PLEASE WAIT...');

    const directMongoData = app.models.Data.getMongoConnector();
    const directMongoGarage = app.models.Garage.getMongoConnector();
    const garages = await directMongoGarage.find({}, { projection: { _id: true, type: true } }).toArray();
    const max = garages.length;
    const start = moment.utc();
    let duration = null;
    let processed = 0;

    for (const garage of garages) {
      console.log(
        `[2806 FIX DATAS GARAGE-TYPE] (${Math.round((processed / max) * 100)}%) - PROCESSING GARAGE ${garage._id}...`
      );
      const result = await directMongoData.updateMany(
        { garageId: garage._id.toString(), garageType: { $ne: garage.type } },
        { $set: { garageType: garage.type } }
      );
      console.log(
        `[2806 FIX DATAS GARAGE-TYPE] (${Math.round((processed / max) * 100)}%) - DONE FOR GARAGE ${garage._id}, ${
          result.modifiedCount
        } DATAS UPDATED!`
      );
      ++processed;
    }

    duration = moment.duration(moment.utc().valueOf() - start.valueOf());
    console.log(
      `[2806 FIX DATAS GARAGE-TYPE] DONE IN ${duration.hours()} HOURS, ${duration.minutes()} MINUTES, ${duration.seconds()} SECONDS`
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }

  process.exit(0);
});
