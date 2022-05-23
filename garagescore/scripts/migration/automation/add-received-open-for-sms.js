const app = require('../../../server/server');

const intro = '[Automation - Add Received and Opened events for sms] :';

const { ObjectID } = require('mongodb');

const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  let created = 0;
  const maxEvents = await aceConnector.count({ type: { $in: ['SENT', 'GDPR_SENT'] }, nsamplesMobile: { $gt: 0 } });
  let processed = 0;

  // First, we clean

  log.info(FED, `CLeaning.`);
  await aceConnector.deleteMany({ type: { $in: ['GDPR_OPENED', 'RECEIVED', 'OPENED'] }, nsamplesMobile: { $gt: 0 } });
  log.info(FED, `Cleaned.`);

  log.info(FED, `${maxEvents} to process.`);

  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${Math.round((processed / maxEvents) * 100)}% Done : ${
          maxEvents - processed
        } events remaining. ${created} buckets created.`
      ),
    5 * 1000
  ); // eslint-disable-line max-len

  const limit = 100;
  let skip = 0;
  let events = await aceConnector
    .find({ type: { $in: ['SENT', 'GDPR_SENT'] }, nsamplesMobile: { $gt: 0 } })
    .skip(skip)
    .limit(limit)
    .toArray();
  while (events.length) {
    for (const event of events) {
      if (event.type === 'GDPR_SENT') {
        event.type = 'GDPR_OPENED';
        event._id = new ObjectID();
        await aceConnector.insertOne(event);
        created++;
      } else {
        event.type = 'RECEIVED';
        event._id = new ObjectID();
        await aceConnector.insertOne(event);
        created++;
        event.type = 'OPENED';
        event._id = new ObjectID();
        await aceConnector.insertOne(event);
        created++;
      }
      processed++;
    }
    skip += limit;
    events = await aceConnector
      .find({
        type: { $in: ['SENT', 'GDPR_SENT'] },
        nsamplesMobile: { $gt: 0 },
      })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
  clearInterval(interval);
  console.log(`${intro} ${created} buckets created.`);
  console.log('\ndone');
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
