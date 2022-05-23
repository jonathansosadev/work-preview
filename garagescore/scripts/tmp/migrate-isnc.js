const SourceTypes = require('../../common/models/data/type/source-types');
const emailAutoCorrect = require('../../common/lib/util/email-auto-correct');

const app = require('../../server/server');

app.on('booted', async () => {
  const directMongoData = app.models.Data.getMongoConnector();
  const where = { 'source.type': SourceTypes.DATAFILE };
  const fields = { projection: { _id: true, customer: true, source: true, campaign: true } };
  const max = 5446108;
  let cursor = null;
  let data = null;
  let interval = null;
  let email = '';
  let newEmailObj = {};
  let processed = 0;
  let updated = 0;

  console.log(`${max} Datas To Process`);
  interval = setInterval(
    () =>
      console.log(
        `${Math.round((processed / max) * 100)}% Done : ${max - processed} Datas Remaining --> ${updated} isNC Migrated`
      ),
    5 * 1000
  ); // eslint-disable-line max-len
  cursor = await directMongoData.find(where, fields);
  // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
  while (await cursor.hasNext()) {
    data = await cursor.next();
    email =
      (data.customer && data.customer.contact && data.customer.contact.email && data.customer.contact.email.value) ||
      (data.customer && data.customer.contact && data.customer.contact.email && data.customer.contact.email.original) ||
      '';
    if (data.customer.contact.email && email && emailAutoCorrect.isNCString(email)) {
      newEmailObj = data.customer.contact.email;
      newEmailObj.isSyntaxOK = true;
      newEmailObj.isNC = true;
      newEmailObj.isEmpty = true;
      await directMongoData.updateOne(
        { _id: data._id },
        {
          $set: {
            'customer.contact.email': newEmailObj,
            'campaign.contactStatus.emailStatus': 'Empty',
            updatedAt: new Date(),
          },
        }
      );
      ++updated;
    }
    ++processed;
  }
  clearInterval(interval);
  console.log(`100% Done : 0 Datas Remaining --> ${updated} isNC Migrated`);
  process.exit(0);
});
