const app = require('../../../server/server');
const { ObjectID } = require('mongodb');

/**
 * #ticket 3213
 * THis script convert subscriptions CrossLeads date to ISODate like this:
 * "date" : "2020-08-28T08:18:47.760Z" -> ISODate("2020-08-28T08:18:47.760Z")
 */

app.on('booted', async () => {
  try {
    const mongo = app.models.Garage.getMongoConnector();
    // retrieve garage without CrossLeads ISODate
    const garages = await mongo
      .find({
        'subscriptions.active': true,
      })
      .toArray();

    for (const garage of garages) {
      // format to ISODate
      if (garage.subscriptions && garage.subscriptions.setup && garage.subscriptions.setup.billDate)
        garage.subscriptions.setup.billDate = new Date(garage.subscriptions.setup.billDate);
      if (garage.subscriptions && garage.subscriptions.CrossLeads && garage.subscriptions.CrossLeads.date)
        garage.subscriptions.CrossLeads.date = new Date(garage.subscriptions.CrossLeads.date);
      if (garage.subscriptions && garage.subscriptions.Automation && garage.subscriptions.Automation.date)
        garage.subscriptions.Automation.date = new Date(garage.subscriptions.Automation.date);
      if (garage.subscriptions && garage.subscriptions.dateStart)
        garage.subscriptions.dateStart = new Date(garage.subscriptions.dateStart);
      if (garage.createdAt) garage.createdAt = new Date(garage.createdAt);
      if (garage.updatedAt) garage.updatedAt = new Date(garage.updatedAt);

      const result = await mongo.updateOne(
        {
          _id: ObjectID(garage._id),
        },
        {
          $set: {
            subscriptions: garage.subscriptions,
            createdAt: garage.createdAt,
            updatedAt: garage.updatedAt,
          },
        }
      );

      if (result.modifiedCount) console.log(`update garageId: ${garage._id}`);
    }

    console.log(`check ISODate : ${garages.length} garages`);
    console.log('Script end with success !');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
