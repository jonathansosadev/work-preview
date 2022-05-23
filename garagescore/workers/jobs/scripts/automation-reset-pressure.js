const app = require('../../../server/server');
const MongoObjectID = require('mongodb').ObjectID;

module.exports = async (job) => {
  const customerId = job.payload.customerId;
  const campaignType = job.payload.campaignType;
  if (!customerId) {
    throw new Error(`automation-reset-pressure :: no customerId in ${JSON.stringify(job)}`);
  }
  if (!campaignType) {
    throw new Error(`automation-reset-pressure :: no campaignType in ${JSON.stringify(job)}`);
  }
  let customer = await app.models.Customer.mongoFindByIds([new MongoObjectID(customerId)]);
  if (customer.length !== 1) {
    throw new Error(`automation-reset-pressure :: found ${customer.length} customers for customerId ${customerId}`);
  }
  customer = customer[0];
  if (!customer) throw new Error(`automation-reset-pressure :: no customer for customerId ${customerId}`);
  const key = `hasRecentlyBeenContacted.${campaignType}`;
  await app.models.Customer.findByIdAndUpdateAttributes(customer._id, { [key]: false });
};
