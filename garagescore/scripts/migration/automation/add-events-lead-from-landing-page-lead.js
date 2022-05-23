const app = require('../../../server/server');

const intro = '[Automation - Add events LEAD from LANDING_PAGE_LEAD events] :';

const { ObjectID } = require('mongodb');
const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');

const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  let created = 0;
  let processed = 0;
  const where = { type: AutomationCampaignsEventsType.LANDING_PAGE_LEAD };
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
      bucket.type = AutomationCampaignsEventsType.LEAD;
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
