const app = require('../../../server/server');

const intro = '[Automation - Hotfix Send Event] :';

const ContactTypes = require('../../../common/models/automation-campaign-channel.type.js');
const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  const acConnector = app.models.AutomationCampaign.getMongoConnector();
  let acTypes = {};
  let found = 0;
  const maxEvents = await aceConnector.count({ type: 'SENT' });
  let processed = 0;

  log.info(FED, `${maxEvents} to process.`);

  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${Math.round((processed / maxEvents) * 100)}% Done : ${
          maxEvents - processed
        } events remaining. ${found} buckets converted.`
      ),
    5 * 1000
  ); // eslint-disable-line max-len

  const limit = 100;
  let events = await aceConnector
    .find({ type: 'SENT' }, { nsamples: true, nsamplesDesktop: true, samples: true, campaignId: true })
    .sort({ _id: 1 })
    .limit(limit)
    .toArray();
  while (events.length) {
    for (const event of events) {
      if (!acTypes[event.campaignId.toString()]) {
        const campaign = await acConnector.findOne({ _id: event.campaignId }, { contactType: true });
        acTypes[event.campaignId.toString()] = campaign.contactType;
      }
      if (acTypes[event.campaignId.toString()] === ContactTypes.MOBILE) {
        await aceConnector.updateOne(
          { _id: event._id },
          {
            $set: {
              nsamplesMobile: event.nsamplesDesktop,
              samples: event.samples.map((e) => {
                e.isMobile = true;
                return e;
              }),
            },
            $unset: {
              nsamplesDesktop: true,
            },
          }
        );
        found++;
      }
      processed++;
    }
    events = await aceConnector
      .find({ _id: { $gt: events[events.length - 1]._id }, type: 'SENT' }, { type: true, 'samples.customerId': true })
      .sort({ _id: 1 })
      .limit(limit)
      .toArray();
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
