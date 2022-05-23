const app = require('../../../server/server');

const intro = '[Automation - Add Received and Opened events for sms] :';

const { ObjectID } = require('mongodb');

const { FED, log } = require('../../../common/lib/util/log');
const { ContactTypes } = require('../../../frontend/utils/enumV2.js');
const timeHelper = require('../../../common/lib/util/time-helper');

const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');

async function exec() {
  const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
  const campaignsConnector = app.models.AutomationCampaign.getMongoConnector();
  const contactConnector = app.models.Contact.getMongoConnector();
  let skip = 0;
  let created = 0;
  const where = {
    type: {
      $in: [
        ContactTypes.AUTOMATION_GDPR_SMS,
        ContactTypes.AUTOMATION_GDPR_EMAIL,
        ContactTypes.AUTOMATION_CAMPAIGN_EMAIL,
        ContactTypes.AUTOMATION_CAMPAIGN_SMS,
      ],
    },
  };
  const fields = {
    projection: {
      _id: true,
      payload: true,
      type: true,
    },
  };
  const campaigns = {};
  const maxContacts = await contactConnector.countDocuments(where);
  let processed = 0;

  log.info(FED, `${maxContacts} to process.`);
  log.info(FED, `Getting all campaigns...`);
  let fetchedCampaigns = await campaignsConnector
    .find({}, { projection: { _id: true, type: true, target: true, contactType: true } })
    .toArray();
  for (const campaign of fetchedCampaigns) {
    campaigns[campaign._id.toString()] = {
      type: campaign.type,
      contactType: campaign.contactType,
      target: campaign.target,
    };
  }
  fetchedCampaigns = [];
  log.info(FED, `Campaigns fetched.`);

  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${Math.round((processed / maxContacts) * 100)}% Done : ${
          maxContacts - processed
        } contacts remaining. ${created} events created.`
      ),
    5 * 1000
  ); // eslint-disable-line max-len

  const limit = 1000;
  let contacts = await contactConnector.find(where, fields).limit(limit).toArray();
  while (contacts.length) {
    for (const contact of contacts) {
      const eventType = [ContactTypes.AUTOMATION_GDPR_SMS, ContactTypes.AUTOMATION_GDPR_EMAIL].includes(contact.type)
        ? AutomationCampaignsEventsType.GDPR_SENT
        : AutomationCampaignsEventsType.SENT;
      const eventsFound = await aceConnector
        .find(
          {
            garageId: new ObjectID(contact.payload.garageId),
            campaignId: new ObjectID(contact.payload.campaignId),
            'samples.customerId': new ObjectID(contact.payload.customerId),
            type: eventType,
            campaignType: campaigns[contact.payload.campaignId].type,
            campaignRunDay: contact.payload.campaignRunDay,
          },
          { projection: { _id: true } }
        )
        .toArray();
      if (!eventsFound.length) {
        await app.models.AutomationCampaignsEvents.addLog(
          {
            garageId: new ObjectID(contact.payload.garageId),
            campaignId: new ObjectID(contact.payload.campaignId),
            customerId: new ObjectID(contact.payload.customerId),
            eventType,
            target: campaigns[contact.payload.campaignId].target,
            contactType: campaigns[contact.payload.campaignId].contactType,
            campaignType: campaigns[contact.payload.campaignId].type,
            campaignRunDay: contact.payload.campaignRunDay,
          },
          {
            forceDate: timeHelper.dayNumberToDate(contact.payload.campaignRunDay),
          }
        );
        created++;
      }
      processed++;
    }
    skip += limit;
    contacts = await contactConnector.find(where, fields).limit(limit).skip(skip).toArray();
  }
  clearInterval(interval);
  console.log(`${intro} ${created} events created.`);
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
