const app = require('../../../server/server');
const MongoObjectID = require('mongodb').ObjectID;

// Script to refresh customers for a single garageId
// arg 1 : garageId (Mandatory)
// arg 2 : --drop -> if --drop is provided, all customers previously created for the garageId will be DELETED !!!!!

const parseArgs = () => {
  const params = {
    garageId: process.argv[2],
    drop: process.argv.includes('--drop'),
  };
  if (!params.garageId) throw new Error('garageId is required.');
  return params;
};

app.on('booted', async () => {
  try {
    const directMongoData = app.models.Data.getMongoConnector();
    const args = parseArgs();
    const where = { garageId: args.garageId };
    const max = await directMongoData.count(where);
    let processed = 0;
    const dateStart = new Date();
    let limit = 500;
    console.log(`${max} datas To process for garage ${args.garageId}. Started at ${dateStart}`);
    if (args.drop) {
      console.log('Dropping previous customers...');
      await app.models.Customer.getMongoConnector().deleteMany({ garageId: new MongoObjectID(args.garageId) });
      console.log('Customers dropped.');
    }
    const interval = setInterval(
      () => console.log(`${Math.round((processed / max) * 100)}% Done : ${max - processed} datas remaining.`),
      5 * 1000
    ); // eslint-disable-line max-len
    let batch = await directMongoData.find(where).sort({ _id: 1 }).limit(limit).toArray();
    while (batch.length) {
      for (const data of batch) {
        await app.models.Customer.addData(data);
        processed++;
      }
      where._id = { $gt: batch[batch.length - 1]._id };
      batch = await directMongoData.find(where).sort({ _id: 1 }).limit(limit).toArray();
    }
    clearInterval(interval);
    console.log(
      `100% Done : 0 datas remaining for garage ${args.garageId}. Started at ${dateStart}.Ended at ${new Date()}`
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
