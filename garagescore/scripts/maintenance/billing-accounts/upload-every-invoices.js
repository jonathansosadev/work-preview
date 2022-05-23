const axios = require('axios');
const aws = require('aws-sdk');
const moment = require('moment');

const app = require('../../../server/server');

app.on('booted', async () => {
  try {
    const billingAccounts = await app.models.BillingAccount.find({});
    const auth = (
      await axios.post('https://app.vosfactures.fr/login.json', {
        login: process.env.VOSFACTURES_LOGIN,
        password: process.env.VOSFACTURES_PASSWORD,
      })
    ).data;
    const invoices = [];
    let interval = null;
    let uploaded = 0;

    for (const ba of billingAccounts) {
      if (ba.invoices && ba.invoices.length) {
        for (const invoice of ba.invoices) {
          invoices.push({ name: ba.name, baId: ba.id.toString(), id: invoice.id, date: invoice.createdAt });
        }
      }
    }

    interval = setInterval(() => console.log(`${Math.round((uploaded / invoices.length) * 100)}% Done`), 5 * 1000);
    console.log(`${invoices.length} Invoice To Upload...`);
    for (const invoice of invoices) {
      const pdf = (
        await axios.get(
          `https://${auth.prefix}.vosfactures.fr/invoices/${invoice.id}.pdf?api_token=${auth.api_token}`,
          { responseType: 'arraybuffer', responseEncoding: 'null' }
        )
      ).data;
      aws.config.region = 'eu-central-1';
      const awsS3Bucket = new aws.S3({ params: { Bucket: 'facturation-automatique' } });
      await new Promise((res) => awsS3Bucket.createBucket(() => res()));
      const billDate = new Date(invoice.date);
      const id = invoice.baId;
      const name = invoice.name.toLowerCase().trim().replace(/\s+/g, '-');
      const year = moment(billDate).year();
      const monthName = moment(billDate).format('MMMM').toLowerCase();
      const month = moment(billDate).format('MM');
      const day = moment(billDate).date();
      const uploadParameters = {
        Key: `${id}/${year}/${month}-${monthName}/facture-${name}-${day}-${month}-${year}.pdf`,
        ACL: 'private',
        ContentType: 'application/pdf',
        Body: pdf,
      };
      await new Promise((res, rej) => awsS3Bucket.upload(uploadParameters, (e) => (e ? rej(e) : res())));
      uploaded++;
    }
    clearInterval(interval);
    console.log('100% Done');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
