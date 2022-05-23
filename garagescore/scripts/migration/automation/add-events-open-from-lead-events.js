const app = require('../../../server/server');

const intro = '[Automation - Add events open from lead events] :';

const { ObjectID } = require('mongodb');
const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');

const { FED, log } = require('../../../common/lib/util/log');

const _parseArgs = (args) => {
  const eventDayStart =
    args.indexOf('--eventDayStart') > -1 ? parseInt(args[args.indexOf('--eventDayStart') + 1]) : null;
  const eventDayEnd = args.indexOf('--eventDayEnd') > -1 ? parseInt(args[args.indexOf('--eventDayEnd') + 1]) : null;
  return { eventDayStart, eventDayEnd };
};

async function exec() {
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  const { eventDayStart, eventDayEnd } = _parseArgs(process.argv);
  if (eventDayStart === null || eventDayEnd === null) {
    log.error(FED, `${intro} : eventDayStart and eventDayEnd needs to be filled.`);
    return;
  }
  log.info(FED, `${intro} : processing from eventDay ${eventDayStart} included to ${eventDayEnd} excluded.`);
  let created = 0;
  let processed = 0;
  const where = { type: AutomationCampaignsEventsType.LEAD, eventDay: { $gte: eventDayStart, $lt: eventDayEnd } };
  const maxBuckets = await aceConnector.count(where);
  log.info(FED, `${intro} : ${maxBuckets} to process.`);

  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${Math.round((processed / maxBuckets) * 100)}% Done : ${
          maxBuckets - processed
        } buckets remaining. ${created} buckets created.`
      ),
    5 * 1000
  ); // eslint-disable-line max-len

  const limit = 100;
  let skip = 0;
  let buckets = await aceConnector.find(where).skip(skip).limit(limit).toArray();
  while (buckets.length) {
    for (const bucket of buckets) {
      bucket.type = AutomationCampaignsEventsType.OPENED;
      bucket._id = new ObjectID();
      await aceConnector.insertOne(bucket);
      created++;
      processed++;
    }
    skip += limit;
    buckets = await aceConnector.find(where).skip(skip).limit(limit).toArray();
  }
  clearInterval(interval);
  log.info(FED, `${intro} : ${created} buckets created.`);
  log.info(FED, `${intro} : done`);
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
