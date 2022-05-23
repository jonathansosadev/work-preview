const { ObjectId } = require('mongodb');
const app = require('../../../server/server');
const fs = require('fs');

const parseArgs = (args) => {
  let garageId = null;
  let billingAccountId = null;
  if (args.length < 3) {
    console.log('Usage : --garageId 5ee8ffbe324a8b0a0cf5d8b6 OU --BAId 5ee8ffbe324a8b0a0cf5d8b6');
    process.exit(0);
  }
  if (args.includes('--BAId')) {
    billingAccountId = new ObjectId(args[args.indexOf('--BAId') + 1]);
  }
  if (args.includes('--garageId')) {
    garageId = new ObjectId(args[args.indexOf('--garageId') + 1]);
  }
  return { garageId, billingAccountId };
};

app.on('booted', async function () {
  try {
    const customersConnector = app.models.Customer.getMongoConnector();
    const garagesConnector = app.models.Garage.getMongoConnector();
    const { garageId, billingAccountId } = parseArgs(process.argv);
    const garageNames = {};
    const where = { unsubscribed: true };
    const limit = 1000;
    let result = 'garageName;fullName;email;phone\n';
    if (garageId) {
      where.garageId = garageId;
    } else if (billingAccountId) {
      const billingAccountConnector = app.models.BillingAccount.getMongoConnector();
      const billingAccount = await billingAccountConnector
        .find({ _id: billingAccountId }, { garageIds: true })
        .toArray();
      if (!billingAccount.length) {
        throw new Error(`BillingAccount ${billingAccountId} does not exist.`);
      }
      if (!billingAccount[0].garageIds || !billingAccount[0].garageIds.length) {
        throw new Error(`BillingAccount ${billingAccountId} has no garageIds.`);
      }
      where.garageId = { $in: billingAccount[0].garageIds };
    }
    let customers = await customersConnector
      .find(where, { garageId: true, email: true, phone: true, fullName: true })
      .sort({ _id: 1 })
      .limit(limit)
      .toArray();
    while (customers.length) {
      for (const customer of customers) {
        if (!garageNames[customer.garageId]) {
          const garage = await garagesConnector.find({ _id: customer.garageId }, { publicDisplayName: true }).toArray();
          garageNames[customer.garageId] = garage[0].publicDisplayName;
        }
        const line = `${garageNames[customer.garageId]};${customer.fullName};${customer.email};${customer.phone}`;
        result += `${line}\n`;
        console.log(line);
      }
      where._id = { $gt: customers[customers.length - 1]._id };
      customers = await customersConnector
        .find(where, { garageId: true, email: true, phone: true, fullName: true })
        .sort({ _id: 1 })
        .limit(limit)
        .toArray();
    }
    fs.writeFileSync('unsubscribedCustomers.txt', result, 'utf8');
    console.log('\ndone');
    process.exit(0);
  } catch (e) {
    console.error(`get-unsubscribed-customers error : ${e}`);
    process.exit(1);
  }
});
