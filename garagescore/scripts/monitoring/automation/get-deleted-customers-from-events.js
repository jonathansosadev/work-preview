const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');

app.on('booted', async function () {
  try {
    const customersConnector = app.models.Customer.getMongoConnector();
    const eventsConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
    let loneCustomerIds = [];
    const alreadyCheckedCustomerIds = {};

    const limit = 100;
    let events = await eventsConnector
      .find({}, { type: true, 'samples.customerId': true })
      .sort({ _id: 1 })
      .limit(limit)
      .toArray();
    while (events.length) {
      let customerIds = [];
      for (const event of events) {
        customerIds = [...new Set([...customerIds, ...event.samples.map((sample) => sample.customerId)])].filter(
          (customerId) => !alreadyCheckedCustomerIds[customerId.toString()]
        );
      }
      for (const customerId of customerIds) {
        alreadyCheckedCustomerIds[customerId.toString()] = true;
      }
      const customers = await customersConnector
        .find({ $or: [{ _id: { $in: customerIds } }, { fusedCustomerIds: { $in: customerIds } }] }, { _id: true })
        .sort({ _id: 1 })
        .toArray();
      loneCustomerIds = [
        ...new Set([
          ...loneCustomerIds,
          ...customerIds
            .filter((customerId) => !customers.find((customer) => customer._id.toString() === customerId.toString()))
            .map((customerId) => customerId.toString()),
        ]),
      ];
      events = await eventsConnector
        .find({ _id: { $gt: events[events.length - 1]._id } }, { type: true, 'samples.customerId': true })
        .sort({ _id: 1 })
        .limit(limit)
        .toArray();
    }
    log.info(FED, `${loneCustomerIds.length} found`);
    for (const lone of loneCustomerIds) {
      log.info(FED, lone);
    }
    log.info(FED, '\ndone');
    process.exit(0);
  } catch (e) {
    log.error(FED, `get-deleted-customers-from-events error : ${e}`);
    process.exit(1);
  }
});
