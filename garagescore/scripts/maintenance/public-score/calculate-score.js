const app = require('../../../server/server.js');
const dataTypes = require('../../../common/models/data/type/data-types');
const promises = require('../../../common/lib/util/promises');

app.on('booted', async () => {
  try {
    console.log(`${new Date()} starting`);
    const garages = await promises.wait((cb) => app.models.Garage.find({}, cb));
    console.log(`${new Date()} updating scores for ${garages.length} garages`);
    for (let i = 0; i < garages.length; i++) {
      await promises.wait((cb) => app.models.PublicScore.destroyAll({ garageId: garages[i].getId() }, cb));
      await promises.wait((cb) => app.models.PublicScore.updateScore(garages[i].getId(), dataTypes.VEHICLE_INSPECTION, cb));
      await promises.wait((cb) => app.models.PublicScore.updateScore(garages[i].getId(), dataTypes.MAINTENANCE, cb));
      await promises.wait((cb) => app.models.PublicScore.updateScore(garages[i].getId(), dataTypes.NEW_VEHICLE_SALE, cb));
      await promises.wait((cb) => app.models.PublicScore.updateScore(garages[i].getId(), dataTypes.USED_VEHICLE_SALE, cb));
      console.log(`${new Date()} Processed ${i + 1} / ${garages.length}`);
    }
    console.log(`${new Date()} ending`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(-1);
  }
});
