const app = require('../../../server/server');

const intro = '[Automation - Remove bad datas from customer history] :';

const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const customerConnector = app.models.Customer.getMongoConnector();
  const dataConnector = app.models.Data.getMongoConnector();
  let found = 0;
  const where = { leads: { $ne: [] } };
  const fields = {
    projection: {
      history: true,
      _id: true,
      dataIds: true,
      clientId: true,
      email: true,
      phone: true,
      fullName: true,
    },
  };
  const maxCustomers = await customerConnector.countDocuments(where);
  let processed = 0;
  let bulk = [];

  log.info(FED, `${maxCustomers} to process.`);

  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${Math.round((processed / maxCustomers) * 100)}% Done : ${
          maxCustomers - processed
        } customers remaining. ${found} datas removed from dataIds and history.`
      ),
    5 * 1000
  ); // eslint-disable-line max-len

  const limit = 100;
  let customers = await customerConnector.find(where, fields).sort({ _id: 1 }).limit(limit).toArray();
  while (customers.length) {
    const dataIds = [
      ...new Set([
        ...[].concat.apply(
          [],
          customers.map((c) => c.dataIds)
        ),
      ]),
    ];
    const datas = await dataConnector
      .find({ _id: { $in: dataIds } }, { projection: { _id: true, 'service.providedAt': true } })
      .toArray();
    for (const customer of customers) {
      const historyLength = customer.history.length;
      customer.history = customer.history.filter((h) => {
        const data = datas.find((d) => d._id.toString() === h.dataId.toString());
        if (!data) {
          log.info(FED, `Data ${h.dataId.toString()} not found.`);
        }
        return data && data.service && data.service.providedAt;
      });
      if (customer.history.length !== historyLength) {
        const { modifications } = await app.models.Customer.consolidate(customer);
        bulk.push({
          updateOne: {
            filter: { _id: customer._id },
            update: modifications,
          },
        });
        if (bulk.length >= 100) {
          await customerConnector.bulkWrite(bulk);
          bulk = [];
        }
        found += historyLength - customer.history.length;
      }
      processed++;
    }
    where._id = { $gt: customers[customers.length - 1]._id };
    customers = await customerConnector.find(where, fields).sort({ _id: 1 }).limit(limit).toArray();
  }
  if (bulk.length) {
    await customerConnector.bulkWrite(bulk);
    bulk = [];
  }
  clearInterval(interval);
  console.log(`${intro} ${found} datas removed from customers.`);
  console.log('\ndone');
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
