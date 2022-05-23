const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

// script oneshoot, delete me when issue #4040 is merge with master
const unsetClientId = async (customerIds) => {
  const customerMongo = app.models.Customer.getMongoConnector();
  return customerMongo.updateMany(
    { _id: { $in: customerIds.map(({ _id }) => ObjectId(_id.toString())) } },
    { $unset: { clientId: '' } }
  );
};

app.on('booted', async () => {
  try {
    console.log('--> Start to remove clientId for all customers...');
    console.time('execution_time');

    const customerMongo = app.models.Customer.getMongoConnector();
    const allCustomers = await customerMongo.find({}).project({ _id: 1 }).toArray();
    const promises = [];
    const limit = 500;
    let skip = 0;
    while (skip < allCustomers.length) {
      const customerIds = allCustomers.slice(skip, skip + limit);
      skip += limit;
      promises.push(() => unsetClientId(customerIds));
    }
    await concurrentpromiseAll(promises, 100);

    console.timeEnd('execution_time');
    console.log('--> Remove clientId for all customers done ✓');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
