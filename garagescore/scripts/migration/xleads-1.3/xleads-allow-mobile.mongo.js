const app = require('../../../server/server');

app.on('booted', async function () {
  try {
    const garagesConnector = app.models.Garage.getMongoConnector();
    console.log(
      await garagesConnector.updateMany(
        { 'subscriptions.CrossLeads.enabled': { $exists: true } },
        { $set: { 'subscriptions.CrossLeads.restrictMobile': false, 'subscriptions.CrossLeads.minutePrice': 0.15 } } // default price
      )
    );
    console.log('Done with suk et sass');
    process.exit(0);
  } catch (e) {
    console.error(`scripts/migration/xleads-1.3/xleads-allow-mobile.mongo.js error : ${e}`);
    process.exit(1);
  }
});
