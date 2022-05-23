const app = require('../../../server/server');
const MongoObjectID = require('mongodb').ObjectID;
const { GaragesTest } = require('../../../frontend/utils/enumV2');

// Script to start outside of the data import timespan

app.on('booted', async () => {
  try {
    const directMongoGarage = app.models.Garage.getMongoConnector();
    const where = {
      $or: [
        { status: 'RunningAuto' },
        { _id: new MongoObjectID(GaragesTest.GARAGE_DUPONT) },
        { _id: new MongoObjectID(GaragesTest.AGENT_DUPONT) },
      ],
    };
    const fields = { projection: { _id: true, subscriptions: true, dataFirstDays: true, locale: true } };
    // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
    const max = await directMongoGarage.count(where);
    let campaignsCreated = 0;
    let processed = 0;
    const dateStart = new Date();
    console.log(`${max} garages To Process. Started at ${dateStart}`);
    const garages = await directMongoGarage.find(where, fields).toArray();
    const interval = setInterval(
      () =>
        console.log(
          `${Math.round((processed / max) * 100)}% Done : ${
            max - processed
          } garages remaining. ${campaignsCreated} campaigns created`
        ),
      5 * 1000
    ); // eslint-disable-line max-len
    for (const garage of garages) {
      console.log(`Processing for ${garage._id}`);
      const campaigns = await app.models.AutomationCampaign.initDefaultCampaigns(
        garage._id,
        garage.subscriptions,
        garage.dataFirstDays,
        garage.locale,
        garage.status
      );
      campaignsCreated += campaigns.length;
      processed++;
      console.log(`Processed for ${garage._id} : ${campaigns.length} campaigns created.`);
    }
    clearInterval(interval);
    console.log(
      `100% Done : 0 garages remaining --> ${campaignsCreated} campaigns created. Started at ${dateStart}.Ended at ${new Date()}`
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
