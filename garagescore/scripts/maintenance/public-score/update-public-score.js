process.env.DEBUG = 'garagescore:common:models:public-score';
const app = require('../../../server/server.js');
const dataTypes = require('../../../common/models/data/type/data-types');
const promises = require('../../../common/lib/util/promises');
/** update public score of one or every garages, destroy the former ones */
app.on('booted', async () => {
  async function updateGarage(garageId) {
    await promises.wait((cb) => app.models.PublicScore.updateScore(garageId, dataTypes.MAINTENANCE, cb));
    await promises.wait((cb) => app.models.PublicScore.updateScore(garageId, dataTypes.NEW_VEHICLE_SALE, cb));
    await promises.wait((cb) => app.models.PublicScore.updateScore(garageId, dataTypes.USED_VEHICLE_SALE, cb));
  }
  if (process.argv.length < 3) {
    try {
      console.log(`${new Date()} starting`);
      const garages = await promises.wait((cb) => app.models.Garage.find({}, cb));
      console.log(`${new Date()} updating scores for ${garages.length} garages`);
      for (let i = 0; i < garages.length; i++) {
        const garageId = garages[i].getId().toString();
        await promises.wait((cb) => app.models.PublicScore.destroyAll({ garageId }, cb));
        await updateGarage(garageId);
        console.log(`${new Date()} Processed ${i + 1} / ${garages.length}`);
      }
      console.log(`${new Date()} ending`);
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(-1);
    }
  } else {
    const garageId = process.argv[2];
    await updateGarage(garageId);
    process.exit(-1);
  }
});
