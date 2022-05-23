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
    const dateStart = new Date('06/02/2018');
    const dateEnd = new Date('06/14/2018');
    const directMongoGarage = app.models.Garage.getMongoConnector();
    const directMongoCustomer = app.models.Customer.getMongoConnector();
    const max = await directMongoCustomer.count({});
    let conversionsFound = 0;
    let hiddenReprises = 0;
    let processed = 0;
    let garagesProcessed = 0;
    const functionStarted = new Date();
    let garageIds = await directMongoGarage.find({}, { projection: { _id: true } }).toArray();
    // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
    garageIds = garageIds.map((e) => e._id);
    console.log(`${max} customers to process. ${garageIds.length} garages. Started at ${functionStarted}`);
    const interval = setInterval(
      () =>
        console.log(
          `${Math.round((processed / max) * 100)}% Done : ${garageIds.length - garagesProcessed} garages remaining. ${
            max - processed
          } customers Remaining --> ${conversionsFound} conversions found. ${conversionsFound} hidden reprises found.`
        ),
      5 * 1000
    ); // eslint-disable-line max-len
    // We search conversions and reprises per garages
    for (const garageId of garageIds) {
      // We will register every plate's status to find hidden reprises
      const plates = {};
      const customerBatch = await directMongoCustomer
        .aggregate([
          {
            $match: {
              garageId,
              leads: {
                $elemMatch: {
                  declaredAt: {
                    $gte: dateStart,
                    $lt: dateEnd,
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: '$_id',
              garageId: '$garageId',
              leads: {
                $filter: {
                  input: '$leads',
                  as: 'lead',
                  cond: {
                    $and: [{ $gte: ['$$lead.declaredAt', dateStart] }, { $lt: ['$$lead.declaredAt', dateEnd] }],
                  },
                },
              },
              history: '$history',
            },
          },
        ])
        .toArray();
      console.log(`Processing for ${garageId} : ${customerBatch.length} customers to process`);
      for (const customer of customerBatch) {
        // For each customer, we posses its leads history and its history with the garage. We sort them in a chronological order
        const leads = customer.leads || [];
        const history = customer.history || [];
        for (const lead of leads) {
          // For each lead, we will check if we can find a later history item that corresponds to it.
          const conversionHistoryItem = history.find((e) => {
            return (
              e.serviceType === lead.leadType &&
              e.serviceProvidedAt.getTime() > lead.declaredAt.getTime() &&
              !e.alreadyFound
            );
          });
          if (conversionHistoryItem) {
            // If we find it, it means conversion. We tag the historyItem so he doesn't get misused for another conversion
            conversionHistoryItem.alreadyFound = true;
            conversionsFound++;
          }
        }
        for (const historyItem of history) {
          // We get every plate from the history
          if (historyItem.plate) {
            if (!plates[historyItem.plate]) {
              // If the plate doesn't exist in our base yet, we create it
              plates[historyItem] = {
                customerId: customer._id,
                lastSeen: historyItem.serviceProvidedAt.getTime(),
              };
            } else {
              // If it does, we check if the plate had a previous owner. We only check for this case here, we could check if the plate is actually less recent than what we thought, and it still means there is a hidden conversion, we are processing the owners in a non chronological order
              if (
                plates[historyItem.plate].customerId !== customer._id &&
                plates[historyItem.plate].lastSeen < historyItem.serviceProvidedAt.getTime()
              ) {
                hiddenReprises++;
              }
              // This is a reprise too here, even though we found it in the incorrect order
              // if (plates[historyItem.plate].customerId !== customer._id && plates[historyItem.plate].lastSeen > historyItem.serviceProvidedAt.getTime()) {
              //  hiddenReprises++;
              // }
              // We update the plate data if it's more recent
              if (plates[historyItem.plate].lastSeen < historyItem.serviceProvidedAt.getTime()) {
                plates[historyItem.plate].customerId = customer._id;
                plates[historyItem.plate].lastSeen = historyItem.serviceProvidedAt.getTime();
              }
            }
          }
        }
        processed++;
      }
      garagesProcessed++;
    }
    clearInterval(interval);
    console.log(
      `100% Done : 0 customers Remaining --> ${conversionsFound} conversions found, ${hiddenReprises} found. Started at ${functionStarted}.Ended at ${new Date()}`
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
