const app = require('../../../server/server');
const MongoObjectID = require('mongodb').ObjectID;

// Script to start outside of the data import timespan

function getDeepFieldValue(srcObject, fieldName) {
  let result = srcObject;
  const fieldParts = fieldName.split('.');
  for (const fieldPart of fieldParts) {
    if (typeof result === 'undefined') {
      return '';
    }
    result = result[fieldPart];
  }
  return result;
}

app.on('booted', async () => {
  try {
    const directMongoData = app.models.Data.getDataSource().connector.collection(app.models.Data.modelName);
    const directMongoGarage = app.models.Garage.getDataSource().connector.collection(app.models.Garage.modelName);
    const directMongoCustomer = app.models.Customer.getDataSource().connector.collection(app.models.Customer.modelName);
    const where = {};
    const fields = { _id: true, dataIds: true };
    const max = await directMongoCustomer.count({});
    let customersFixed = 0;
    let processed = 0;
    let garagesProcessed = 0;
    const dateStart = new Date();
    let garageIds = await directMongoGarage.find({}, { _id: true }).toArray();
    garageIds = garageIds.map((e) => e._id);

    console.log(`${max} customers to process. ${garageIds.length} garages. Started at ${dateStart}`);
    const interval = setInterval(
      () =>
        console.log(
          `${Math.round((processed / max) * 100)}% Done : ${garageIds.length - garagesProcessed} garages remaining. ${
            max - processed
          } Datas Remaining --> ${customersFixed} customers fixed`
        ),
      5 * 1000
    ); // eslint-disable-line max-len
    for (const garageId of garageIds) {
      where.garageId = garageId;
      const limit = 100;
      let skip = 0;
      const allCustomersFromGarageIdCount = await directMongoCustomer.count(where);
      console.log(`Processing for ${garageId} : ${allCustomersFromGarageIdCount} customers to process`);
      // Looping through the datas and alimenting the customers
      const updateBatch = [];
      while (skip < allCustomersFromGarageIdCount) {
        const customerBatch = await directMongoCustomer
          .aggregate([{ $match: where }, { $project: fields }, { $limit: limit + skip }, { $skip: skip }])
          .toArray();
        skip += limit;
        for (const customer of customerBatch) {
          if (!customer.fullName) {
            let name = null;
            const datas = await directMongoData
              .find({ _id: { $in: customer.dataIds } }, { 'customer.fullName.value': true })
              .toArray();
            for (const data of datas) {
              name = (data && data.customer && data.customer.fullName && data.customer.fullName.value) || null;
            }
            updateBatch.push({
              updateOne: {
                filter: { _id: customer._id },
                update: { $set: { fullName: name } },
              },
            });
          }
          processed++;
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
    console.log(
      `100% Done : 0 customers Remaining --> ${customersFixed} customers fixed. Started at ${dateStart}.Ended at ${new Date()}`
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

// Aggregate try

// const aggregateCustomers = (directMongoData) => {
//   const $match = { shouldSurfaceInStatistics: true };
//   const $project = {
//     garageId: true,
//     type: true,
//
//     count: {
//       $cond: {
//         if: { $and: [
//             { $ne: ['$leadTicket.status', leadTicketStatus.WAITING_FOR_CONTACT] },
//             { $ne: ['$leadTicket.closedForInactivity', true] }
//           ] },
//         then: 1,
//         else: 0
//       }
//     },
//     total: { $literal: 1 }
//   };
// };
