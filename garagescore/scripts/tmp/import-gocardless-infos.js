const unzipper = require('unzipper');
const request = require('request');
const csv = require('csv');

const app = require('../../server/server');

const url = process.argv.slice(2)[0];

let success = 0;
let error = 0;

app.on('booted', async () => {
  try {
    const billingAccounts = await app.models.BillingAccount.find({});
    const body = await new Promise((res, rej) => request({ url, encoding: null }, (e, r, b) => (e ? rej(e) : res(b))));
    const directory = await unzipper.Open.buffer(body);
    const file = directory.files[0];
    const csvString = (await file.buffer()).toString();
    const csvColumnsConf = ['mandateId', 'customerId', 'companyName']; // eslint-disable-line
    const csvConf = {
      delimiter: ',',
      relax: true,
      relax_column_count: true,
      ltrim: true,
      rtrim: true,
      columns: csvColumnsConf,
      from: 2,
    };
    const rows = await new Promise((res, rej) => csv.parse(csvString, csvConf, (e, rs) => (e ? rej(e) : res(rs)))); // eslint-disable-line
    const processedBillingAccounts = [];

    for (const row of rows) {
      const billingAccount = billingAccounts.find((ba) => ba.accountingId === row.companyName);

      if (billingAccount && processedBillingAccounts.includes(billingAccount.id.toString())) {
        console.log(`The BillingAccount ${row.companyName} was found multiple times !`);
        error++;
      } else if (billingAccount) {
        processedBillingAccounts.push(billingAccount.id.toString());
        if (row.mandateId && row.customerId) {
          billingAccount.mandateId = row.mandateId;
          billingAccount.customerId = row.customerId;
          await billingAccount.save();
          success++;
        } else {
          console.log(`The BillingAccount ${row.companyName} was found but is missing mandateId or customerId`);
          error++;
        }
      } else {
        console.log(`Unable to find BillingAccount "${row.companyName}"`);
        error++;
      }
    }
  } catch (e) {
    console.error(e);
  }
  console.log(`Done. ${success} BillingAccounts updated, ${error} errors `);
  process.exit(0);
});
