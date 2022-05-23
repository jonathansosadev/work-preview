const app = require('../../../server/server');

const intro = '[Automation - Hotfix Send Event] :';

const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  const customerConnector = app.models.Customer.getMongoConnector();
  let customers = {};
  let found = 0;
  const maxEvents = await aceConnector.countDocuments({});
  let processed = 0;
  let bulk = [];

  log.info(FED, `${maxEvents} to process.`);

  log.info(FED, `Fetching customerIds...`);
  await customerConnector.find({}, { projection: { _id: true } }).forEach((c) => {
    customers[c._id.toString()] = true;
  });
  log.info(FED, `customerIds fetched.`);

  log.info(FED, `Fetching events...`);
  const events = await aceConnector
    .find({}, { projection: { _id: true, nsamplesDesktop: true, nsamplesMobile: true, nsamples: true, samples: true } })
    .toArray();
  log.info(FED, `Events fetched.`);

  const interval = setInterval(() => {
    log.info(
      FED,
      `${Math.round((processed / maxEvents) * 100)}% Done : ${
        maxEvents - processed
      } events remaining. ${found} events customerless`
    );
  }, 5 * 1000); // eslint-disable-line max-len

  for (const event of events) {
    let key = event.nsamplesDesktop >= 0 ? 'nsamplesDesktop' : 'nsamplesMobile';
    const baseValuenSamples = event[key];
    // Fetch customers
    event.samples = event.samples.filter((s) => customers[s.customerId.toString()]);
    event.nsamples = event.samples.length;
    event[key] = event.samples.length;
    found += baseValuenSamples - event[key];
    if (event[key] === 0) {
      bulk.push({
        deleteOne: {
          filter: { _id: event._id },
        },
      });
    } else if (baseValuenSamples > event[key]) {
      bulk.push({
        updateOne: {
          filter: { _id: event._id },
          update: {
            $set: {
              nsamples: event.nsamples,
              [key]: event[key],
              samples: event.samples,
            },
          },
        },
      });
      if (bulk.length >= 100) {
        await aceConnector.bulkWrite(bulk);
        bulk = [];
      }
    }
    processed++;
  }
  if (bulk.length) {
    await aceConnector.bulkWrite(bulk);
  }
  clearInterval(interval);
  console.log(`${intro} ${found} buckets converted.`);
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
