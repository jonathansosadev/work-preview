const app = require('../../../server/server');

const intro = '[Automation - Hotfix Delay Sms] :';

const MongoObjectID = require('mongodb').ObjectID;

async function exec() {
  const contactConnector = app.models.Contact.getMongoConnector();
  const jobConnector = app.models.Job.getMongoConnector();
  const sendingDate = new Date();
  sendingDate.setHours(16);
  console.log(`${intro} Getting contact ids`);
  let allContactIds = await contactConnector
    .find({ status: 'Waiting', type: 'AUTOMATION_GDPR_SMS' }, { _id: true })
    .toArray();
  allContactIds = allContactIds.map((e) => e._id.toString());
  console.log(`${intro} ${allContactIds.length} AUTOMATION GDPR SMS contacts found in waiting.`);
  const allJobs = await jobConnector
    .find({ status: 'WAITING', type: 'SEND_CONTACT_LOW_PRIORITY' }, { _id: true, 'payload.contactId': true })
    .toArray();
  console.log(`${intro} ${allJobs.length} AUTOMATION GDPR SMS jobs found in waiting.`);
  let modified = 0;
  for (const job of allJobs) {
    if (allContactIds.includes(job.payload.contactId)) {
      await jobConnector.updateOne(
        { _id: new MongoObjectID(job.payload.contactId) },
        { $set: { scheduledAt: sendingDate.getTime() / (1000 * 60), smsFixed: true } }
      );
      modified++;
    }
  }
  console.log(`${intro} ${modified} jobs modified.`);
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
