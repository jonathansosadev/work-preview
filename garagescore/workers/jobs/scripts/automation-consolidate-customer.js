const app = require('../../../server/server');
const { ObjectID } = require('mongodb');

module.exports = async (job) => {
  if (!job.payload.customerId) {
    throw new Error(`automation-consolidate-customer :: no dataId in ${JSON.stringify(job)}`);
  }
  const [customer, customer2] = await app.models.Customer.mongoFindByIds([new ObjectID(job.payload.customerId)]);
  if (!customer) {
    throw new Error(
      `automation-consolidate-customer :: no customer with id ${job.payload.customerId} in ${JSON.stringify(job)}`
    );
  }
  if (customer2) {
    throw new Error(
      `automation-consolidate-customer :: found more than one customer with id ${
        job.payload.customerId
      } in ${JSON.stringify(job)}`
    );
  }
  await app.models.Customer.consolidateAndUpdate(customer);
};
