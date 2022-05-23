const app = require('../../../server/server');

const intro = '[Automation - Fix duplicated events] :';

const { FED, log } = require('../../../common/lib/util/log');

const _parseArgs = (args) => {
  const eventType = args.indexOf('--eventType') > -1 ? args[args.indexOf('--eventType') + 1] : null;
  return { eventType };
};

async function exec() {
  console.time('execution_time');
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  const { eventType } = _parseArgs(process.argv);
  if (!eventType) {
    log.error(FED, `${intro} needs argument --eventType (--eventType LEAD), aborting`);
    process.exit(1);
  }
  let duplicates = 0;
  let processed = 0;
  const where = { type: eventType };
  const maxBuckets = await aceConnector.count(where);
  log.info(FED, `${intro} : ${maxBuckets} to process.`);
  let garageIds = await aceConnector
    .aggregate([{ $match: { type: eventType } }, { $group: { _id: '$garageId' } }])
    .toArray();
  garageIds = garageIds.map((g) => g._id);
  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${intro} ${Math.round((processed / maxBuckets) * 100)}% Done : ${
          maxBuckets - processed
        } buckets remaining. ${duplicates} duplicates found.`
      ),
    5 * 1000
  );

  for (const garageId of garageIds) {
    const bulkWrite = [];
    let buckets = await aceConnector.find({ garageId, type: eventType }).toArray();
    buckets.sort((bucketA, bucketB) => bucketA.eventDay - bucketB.eventDay);
    const campaignsInformationsTree = {};
    for (const bucket of buckets) {
      campaignsInformationsTree[bucket.campaignId.toString()] =
        campaignsInformationsTree[bucket.campaignId.toString()] || {};
      campaignsInformationsTree[bucket.campaignId.toString()][bucket.campaignRunDay] =
        campaignsInformationsTree[bucket.campaignId.toString()][bucket.campaignRunDay] || {};
      let cleanSamples = [];
      for (const sample of bucket.samples) {
        if (
          !campaignsInformationsTree[bucket.campaignId.toString()][bucket.campaignRunDay][sample.customerId.toString()]
        ) {
          cleanSamples.push(sample);
          campaignsInformationsTree[bucket.campaignId.toString()][bucket.campaignRunDay][
            sample.customerId.toString()
          ] = true;
        } else {
          duplicates++;
        }
      }
      if (cleanSamples.length === 0) {
        bulkWrite.push({
          deleteOne: {
            filter: {
              _id: bucket._id,
            },
          },
        });
      } else if (cleanSamples.length < bucket.samples.length) {
        bulkWrite.push({
          updateOne: {
            filter: {
              _id: bucket._id,
            },
            update: {
              $set: {
                samples: cleanSamples,
                nsamples: cleanSamples.length,
                ...(bucket.nsamplesDesktop >= 0
                  ? { nsamplesDesktop: cleanSamples.length }
                  : { nsamplesMobile: cleanSamples.length }),
              },
            },
          },
        });
      }
      processed++;
    }
    if (bulkWrite.length) {
      await app.models.AutomationCampaignsEvents.getMongoConnector().bulkWrite(bulkWrite);
    }
  }
  clearInterval(interval);
  console.timeEnd('execution_time');
  log.info(FED, `${intro} : ${duplicates} duplicates removed.`);
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
