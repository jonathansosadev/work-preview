const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');

// Script to start outside of the data import timespan

const _parseArgs = (args) => {
  const onlyConsolidateCustomersWithEvents = args.find((e) => e === '--onlyConsolidateCustomersWithEvents');
  const dateArg = args.find((e) => /--createdFromDate/.test(e));
  let createdFromDate = null;
  if (dateArg) {
    // reverse date --createdFromDate=14/04/2021 -> 2021/04/14
    createdFromDate = dateArg
      .match(/([\d]+)\/([\d]+)\/([\d]+)/)[0]
      .split('/')
      .reverse()
      .join('/');
    createdFromDate = new Date(createdFromDate);
  }
  return { onlyConsolidateCustomersWithEvents, createdFromDate };
};

app.on('booted', async () => {
  try {
    const directMongoGarage = app.models.Garage.getMongoConnector();
    const directMongoAutomationCampaignEvents = app.models.AutomationCampaignsEvents.getMongoConnector();
    const directMongoCustomer = app.models.Customer.getMongoConnector();
    const { onlyConsolidateCustomersWithEvents, createdFromDate } = _parseArgs(process.argv);
    let customersFixed = 0;
    let garagesProcessed = 0;
    const dateStart = createdFromDate ? createdFromDate : new Date();

    let garageIds = onlyConsolidateCustomersWithEvents
      ? await directMongoAutomationCampaignEvents.distinct('garageId')
      : await directMongoGarage.find({}, { _id: true }).toArray();
    garageIds = onlyConsolidateCustomersWithEvents ? garageIds : garageIds.map((e) => e._id);

    log.info(FED, `Processing for ${garageIds.length} garages. Started at ${dateStart}`);
    const interval = setInterval(
      () =>
        log.info(
          FED,
          `${Math.round((garagesProcessed / garageIds.length) * 100)}% Done : ${
            garageIds.length - garagesProcessed
          } garages remaining. ${customersFixed} customers consolidated`
        ),
      5 * 1000
    );
    for (const garageId of garageIds) {
      log.info(FED, `Fetching events for garageId ${garageId}...`);
      const events = await app.models.Customer.getFormattedAutomationCampaignsEventsForConsolidation({ garageId });
      log.info(FED, `${events.length} events fetched.`);

      const where = {};
      const where$AndBaseCondition = [];
      where.garageId = garageId;
      if (createdFromDate) {
        where.createdAt = { $gte: createdFromDate };
      }
      if (onlyConsolidateCustomersWithEvents) {
        if (!events.length) {
          log.info(FED, `${garageId} : No events to process, skipping`);
          continue;
        }
        where$AndBaseCondition.push({
          _id: {
            $in: [
              ...new Set(events.filter((e) => e.garageId.toString() === garageId.toString()).map((e) => e.customerId)),
            ],
          },
        });
        where.$and = [...where$AndBaseCondition];
      }
      const limit = 1000;
      const allCustomersFromGarageIdCount = await directMongoCustomer.countDocuments(where);
      log.info(FED, `Processing for ${garageId} : ${allCustomersFromGarageIdCount} customers to process`);

      // Looping through the datas and alimenting the customers
      let updateBatch = [];
      let customerBatch = ['initialization'];
      while (customerBatch.length) {
        customerBatch = await directMongoCustomer
          .aggregate([{ $match: where }, { $sort: { _id: 1 } }, { $limit: limit }])
          .toArray();
        if (customerBatch.length) {
          where.$and = [...where$AndBaseCondition, { _id: { $gt: customerBatch[customerBatch.length - 1]._id } }];
        }
        for (const customer of customerBatch) {
          const { modifications } = await app.models.Customer.consolidate(
            customer,
            events
              .filter((e) => e.customerId && e.customerId.toString() === customer._id.toString())
              .map((e) => {
                delete e.customerId;
                return e;
              })
          );
          updateBatch.push({
            updateOne: {
              filter: { _id: customer._id },
              update: {
                $set: modifications,
              },
            },
          });
          if (updateBatch.length > 500) {
            await directMongoCustomer.bulkWrite(updateBatch);
            customersFixed += updateBatch.length;
            updateBatch = [];
          }
        }
      }
      // Save the changes in db
      if (updateBatch.length > 0) {
        await directMongoCustomer.bulkWrite(updateBatch);
        customersFixed += updateBatch.length;
      }
      garagesProcessed++;
    }
    clearInterval(interval);
    log.info(
      FED,
      `100% Done : 0 customers Remaining --> ${customersFixed} customers fixed. Started at ${dateStart}.Ended at ${new Date()}`
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
